import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DoseResponsePlot = ({ data, selectedDrugs = ['Imatinib'], variantData = null, width = 600, height = 400 }) => {
  const svgRef = useRef(null);

  // Function to convert netgr to relative viability (same as 4PL fitting)
  const convertToViability = (netgr, netgr_nodrug, t_assay = 72) => {
    return Math.exp(netgr * t_assay) / Math.exp(netgr_nodrug * t_assay);
  };

  useEffect(() => {
    // Clear previous plot
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    if (!data || !data.length) {
      // Show "no data" message
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .style('font-size', '14px')
        .text('No dose-response data available');
      return;
    }

    // Set up dimensions and margins
    const margin = { top: 20, right: 80, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Process data: calculate mean and 95% CI for each concentration and drug
    // Convert netGR to relative viability for consistency with 4PL fits
    const processedData = [];
    
    selectedDrugs.forEach(drug => {
      const drugData = data.filter(d => d.Drug === drug);
      
      // Group by concentration
      const concentrations = [...new Set(drugData.map(d => +d.conc))].sort((a, b) => a - b);
      
      // Get baseline netgr_nodrug (max netgr_obs for this drug)
      const allNetGRs = drugData.map(d => +d.netgr_obs);
      const netgr_nodrug = Math.max(...allNetGRs);
      
      concentrations.forEach(conc => {
        const concData = drugData.filter(d => +d.conc === conc);
        const netgrValues = concData.map(d => +d.netgr_obs);
        
        // Convert to viability
        const viabilityValues = netgrValues.map(netgr => convertToViability(netgr, netgr_nodrug));
        
        if (viabilityValues.length > 0) {
          const mean = d3.mean(viabilityValues);
          const std = d3.deviation(viabilityValues) || 0;
          const n = viabilityValues.length;
          
          // 95% CI calculation (assuming normal distribution)
          // For small n, use t-distribution critical value (approximation)
          const tCritical = n <= 2 ? 12.706 : 2.262; // t-values for df=1,2
          const marginError = tCritical * (std / Math.sqrt(n));
          
          processedData.push({
            drug,
            concentration: conc,
            mean,
            lower: mean - marginError,
            upper: mean + marginError,
            std,
            n
          });
        }
      });
    });

    if (processedData.length === 0) return;

    // Set up scales with 10% padding on both axes
    const xExtent = d3.extent(processedData, d => d.concentration);
    // For log scale, padding is multiplicative (e.g., 10% = factor of 1.1)
    const xPaddingFactor = 0.9; // Shrinks the range by 10% on each side
    const xScale = d3.scaleLog()
      .domain([xExtent[0] / (1 / xPaddingFactor), xExtent[1] / xPaddingFactor])
      .range([0, innerWidth]);

    // Calculate y-axis extent including error bars (upper and lower bounds)
    const allYValues = processedData.flatMap(d => [d.lower, d.upper]);
    const yExtent = d3.extent(allYValues);
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .nice()
      .range([innerHeight, 0]);

    // Color scale for different drugs
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(selectedDrugs);

    // Create axes with better tick spacing
    const concentrations = [...new Set(processedData.map(d => d.concentration))].sort((a, b) => a - b);
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d} nM`)
      .tickValues(concentrations); // Use actual concentration values as ticks
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format('.3f'));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 45)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Concentration (nM)');

    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Relative Viability');

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.concentration))
      .y(d => yScale(d.mean))
      .curve(d3.curveMonotoneX);

    // Group data by drug
    const drugGroups = d3.group(processedData, d => d.drug);

    // Draw lines and points for each drug
    drugGroups.forEach((drugData, drug) => {
      const color = colorScale(drug);
      
      // Draw measured data line connecting points
      g.append('path')
        .datum(drugData)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,3')
        .attr('opacity', 0.6)
        .attr('d', line);

      // Draw 4PL fitted curve if available
      if (variantData && variantData.ic50_values) {
        const drugCurveFit = variantData.ic50_values.find(d => d.drug === drug);
        if (drugCurveFit && drugCurveFit.curve_fit && drugCurveFit.curve_fit.success) {
          const fittedCurve = drugCurveFit.curve_fit.fitted_curve;
          if (fittedCurve && fittedCurve.doses && fittedCurve.responses) {
            // Create smooth fitted curve line
            const fittedLine = d3.line()
              .x((d, i) => xScale(fittedCurve.doses[i]))
              .y((d, i) => yScale(fittedCurve.responses[i]))
              .curve(d3.curveMonotoneX);
            
            // Draw the fitted curve as a smooth solid line
            g.append('path')
              .datum(fittedCurve.responses)
              .attr('fill', 'none')
              .attr('stroke', color)
              .attr('stroke-width', 2.5)
              .attr('opacity', 0.8)
              .attr('d', fittedLine)
              .style('pointer-events', 'none'); // Don't interfere with hover events
          }
        }
      }

      // Draw error bars
      g.selectAll(`.error-bar-${drug.replace(/\s+/g, '')}`)
        .data(drugData)
        .enter()
        .append('g')
        .attr('class', `error-bar-${drug.replace(/\s+/g, '')}`)
        .each(function(d) {
          const errorBar = d3.select(this);
          const x = xScale(d.concentration);
          const yMean = yScale(d.mean);
          const yLower = yScale(d.lower);
          const yUpper = yScale(d.upper);
          
          // Vertical line for error bar
          errorBar.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', yLower)
            .attr('y2', yUpper)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);
          
          // Top cap
          errorBar.append('line')
            .attr('x1', x - 3)
            .attr('x2', x + 3)
            .attr('y1', yUpper)
            .attr('y2', yUpper)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);
          
          // Bottom cap
          errorBar.append('line')
            .attr('x1', x - 3)
            .attr('x2', x + 3)
            .attr('y1', yLower)
            .attr('y2', yLower)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);
        });

      // Draw points
      g.selectAll(`.point-${drug.replace(/\s+/g, '')}`)
        .data(drugData)
        .enter()
        .append('circle')
        .attr('class', `point-${drug.replace(/\s+/g, '')}`)
        .attr('cx', d => xScale(d.concentration))
        .attr('cy', d => yScale(d.mean))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5);
    });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

    selectedDrugs.forEach((drug, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 40})`);
      
      // Drug name
      legendRow.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(drug);
      
      // 4PL fitted curve (solid line)
      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 12)
        .attr('y2', 12)
        .attr('stroke', colorScale(drug))
        .attr('stroke-width', 2.5)
        .attr('opacity', 0.8);
      
      legendRow.append('text')
        .attr('x', 25)
        .attr('y', 15)
        .style('font-size', '10px')
        .text('4PL fit');
      
      // Measured data (dashed line)
      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 25)
        .attr('y2', 25)
        .attr('stroke', colorScale(drug))
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,3')
        .attr('opacity', 0.6);
      
      legendRow.append('text')
        .attr('x', 25)
        .attr('y', 28)
        .style('font-size', '10px')
        .text('Measured');
    });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Dose-Response Curve with 95% CI and 4PL Fit');

  }, [data, selectedDrugs, variantData, width, height]);

  return (
    <div className="dose-response-plot">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default DoseResponsePlot;