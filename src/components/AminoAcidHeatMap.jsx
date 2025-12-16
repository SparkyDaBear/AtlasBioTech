import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import './AminoAcidHeatMap.css';

const AminoAcidHeatMap = ({ proteinId, hoveredResidue, onResidueHover, initialDrug }) => {
  const svgRef = useRef();
  const navigate = useNavigate();
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDose, setSelectedDose] = useState('low');
  const [selectedDrug, setSelectedDrug] = useState(initialDrug || 'Imatinib'); // Use initialDrug if provided
  const [availableDrugs, setAvailableDrugs] = useState([
    { name: 'Imatinib', fda_approved: true, approval_date: '2001-05-10' },
    { name: 'Hollyniacine', fda_approved: false, approval_date: null }
  ]);

  // Map concentration to dose labels for better UX
  const getConcentrationForDose = (dose) => {
    switch (dose) {
      case 'low': return '5 µM';
      case 'medium': return '30 µM';
      case 'high': return '100 µM';
      default: return '5 µM';
    }
  };

  // Load heat map data
  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '';
        const response = await fetch(`${baseUrl}data/v1.0/heatmap_data.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load heat map data: ${response.status}`);
        }
        
        const data = await response.json();
        setHeatmapData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading heat map data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadHeatmapData();
  }, []);

  // Update selected drug when initialDrug changes
  useEffect(() => {
    if (initialDrug && availableDrugs.some(d => d.name === initialDrug)) {
      setSelectedDrug(initialDrug);
    }
  }, [initialDrug, availableDrugs]);

  // Create the 2D matrix heat map visualization
  useEffect(() => {
    if (!heatmapData || loading || error || !heatmapData.matrices || !heatmapData.positions) return;

    // Get the matrix for the selected drug
    const currentMatrix = heatmapData.matrices[selectedDrug];
    if (!currentMatrix) {
      console.error(`No matrix data found for drug: ${selectedDrug}`);
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Dimensions and margins
    const margin = { top: 80, right: 150, bottom: 100, left: 100 };
    const containerWidth = Math.min(1400, window.innerWidth - 40);
    const containerHeight = 600;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Set up SVG
    svg
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get data
    const positions = heatmapData.positions.sort((a, b) => a - b);
    const aminoAcids = heatmapData.metadata.amino_acids;

    // Filter to show reasonable number of positions for visibility
    const maxPositions = 100;
    const positionStep = Math.max(1, Math.floor(positions.length / maxPositions));
    const displayPositions = positions.filter((_, i) => i % positionStep === 0);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(displayPositions)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(aminoAcids)
      .range([0, height])
      .padding(0.05);

    // Get all non-null values for color scale (for the selected dose and drug)
    const allValues = [];
    Object.values(currentMatrix).forEach(posData => {
      Object.values(posData).forEach(aaData => {
        if (aaData[selectedDose] && aaData[selectedDose].value !== null && aaData[selectedDose].value !== undefined) {
          allValues.push(aaData[selectedDose].value);
        }
      });
    });

    // Create color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain(d3.extent(allValues));

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'heatmap-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 4px 8px rgba(0,0,0,0.3)');

    // Get all std values to create a scale for uncertainty visualization
    const allStdValues = [];
    Object.values(currentMatrix).forEach(posData => {
      Object.values(posData).forEach(aaData => {
        if (aaData[selectedDose] && aaData[selectedDose].std !== null && aaData[selectedDose].std !== undefined) {
          allStdValues.push(aaData[selectedDose].std);
        }
      });
    });

    // Create uncertainty scale for border width (higher std = thicker border)
    const uncertaintyScale = d3.scaleLinear()
      .domain([0, d3.max(allStdValues) || 1])
      .range([0.5, 3]);

    // Create matrix cells
    displayPositions.forEach(position => {
      aminoAcids.forEach(aa => {
        const positionStr = position.toString(); // Convert to string for matrix lookup
        const cellData = currentMatrix[positionStr] && currentMatrix[positionStr][aa];
        const doseData = cellData ? cellData[selectedDose] : null;
        const value = doseData ? doseData.value : null;
        const std = doseData ? doseData.std : null;

        // Calculate border properties based on uncertainty
        const uncertaintyBorderWidth = std !== null ? uncertaintyScale(std) : 0.5;
        const uncertaintyBorderColor = std !== null && std > (d3.mean(allStdValues) || 0) ? "#ff6b6b" : "#fff";

        const cell = g.append("rect")
          .attr("x", xScale(position))
          .attr("y", yScale(aa))
          .attr("width", xScale.bandwidth())
          .attr("height", yScale.bandwidth())
          .attr("fill", value !== null ? colorScale(value) : "#f5f5f5")
          .attr("stroke", uncertaintyBorderColor)
          .attr("stroke-width", uncertaintyBorderWidth)
          .style("cursor", value !== null ? "pointer" : "default")
          .on("mouseover", function(event) {
            if (value !== null) {
              d3.select(this)
                .attr("stroke", "#333")
                .attr("stroke-width", 2);

              const refAa = cellData.ref_aa || '?';
              const variant = `${refAa}${position}${aa}`;
              const doseLabel = selectedDose.charAt(0).toUpperCase() + selectedDose.slice(1);
              
              // Notify parent component about residue hover
              if (onResidueHover) {
                onResidueHover({ position, aminoAcid: aa, variant });
              }
              
              // Add uncertainty indication to tooltip
              const uncertaintyText = std !== null ? 
                (std > (d3.mean(allStdValues) || 0) ? 
                  '<br/><span style="color: #ff6b6b;">⚠️ High uncertainty</span>' : 
                  '<br/><span style="color: #90EE90;">✓ Low uncertainty</span>') : '';
              
              const tooltipContent = `
                <div style="max-width: 200px;">
                  <strong>Position ${position}</strong><br/>
                  <strong>Variant:</strong> ${variant}<br/>
                  <strong>Dose:</strong> ${doseLabel}<br/>
                  <strong>Mean netGR:</strong> ${value.toFixed(3)}<br/>
                  <strong>Count:</strong> ${doseData.count}<br/>
                  ${doseData.std ? `<strong>Std Dev:</strong> ${doseData.std.toFixed(3)}<br/>` : ''}
                  ${uncertaintyText}
                  <em style="color: #ccc;">Click to view variant</em>
                </div>
              `;

              tooltip.transition()
                .duration(200)
                .style('opacity', 1);
              
              tooltip.html(tooltipContent)
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 15) + 'px');
            }
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("stroke", uncertaintyBorderColor)
              .attr("stroke-width", uncertaintyBorderWidth);

            // Clear residue hover
            if (onResidueHover) {
              onResidueHover(null);
            }

            tooltip.transition()
              .duration(300)
              .style('opacity', 0);
          })
          .on("click", function() {
            if (value !== null && heatmapData.variant_lookup) {
              const lookupKey = `${position}_${aa}`;
              const variantInfo = heatmapData.variant_lookup[lookupKey];
              
              if (variantInfo) {
                const gene = heatmapData.metadata.gene;
                navigate(`/variant/${gene}/${variantInfo.id}`);
              }
            }
          });
      });
    });

    // Add X axis (positions)
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickValues(displayPositions.filter((_, i) => i % Math.max(1, Math.floor(displayPositions.length / 15)) === 0))
      );
    
    xAxis.selectAll("text")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis (amino acids)
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "11px")
      .style("font-family", "monospace");

    // Add axis labels
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + 70})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Protein Position (N → C terminus)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Amino Acid Substitution");

    // Add title
    svg.append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(`${heatmapData.metadata.gene} - Position vs Amino Acid Heat Map`);

    // Add subtitle
    svg.append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "#666")
      .text(`Mean netGR (${selectedDose.charAt(0).toUpperCase() + selectedDose.slice(1)} Dose) - ${heatmapData.metadata.drug} Response`);

    // Add data summary
    svg.append("text")
      .attr("x", containerWidth / 2)
      .attr("y", 70)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#888")
      .text(`Showing ${displayPositions.length} positions (${displayPositions[0]}-${displayPositions[displayPositions.length-1]}) × ${aminoAcids.length} amino acids`);

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 15;
    const legendX = containerWidth - margin.right + 20;
    const legendY = margin.top + 50;

    // Create gradient definition
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = (i / numStops) * 100;
      const value = d3.min(allValues) + (d3.max(allValues) - d3.min(allValues)) * (i / numStops);
      gradient.append("stop")
        .attr("offset", `${offset}%`)
        .attr("stop-color", colorScale(value));
    }

    // Add legend rectangle
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#heatmap-gradient)")
      .style("stroke", "#ccc")
      .style("stroke-width", 1);

    // Add legend scale
    const legendScale = d3.scaleLinear()
      .domain(d3.extent(allValues))
      .range([legendX, legendX + legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".2f"));

    svg.append("g")
      .attr("transform", `translate(0,${legendY + legendHeight})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px");

    // Add legend title
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY - 8)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Mean netGR");

    // Add uncertainty legend
    const uncertaintyLegendY = legendY + legendHeight + 60;
    
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", uncertaintyLegendY)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Uncertainty Indicators");

    // Low uncertainty example
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", uncertaintyLegendY + 10)
      .attr("width", 20)
      .attr("height", 15)
      .attr("fill", colorScale(d3.mean(allValues) || 0))
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);

    svg.append("text")
      .attr("x", legendX + 25)
      .attr("y", uncertaintyLegendY + 22)
      .style("font-size", "10px")
      .style("fill", "#333")
      .text("Low uncertainty (thin border)");

    // High uncertainty example
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", uncertaintyLegendY + 30)
      .attr("width", 20)
      .attr("height", 15)
      .attr("fill", colorScale(d3.mean(allValues) || 0))
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 2.5);

    svg.append("text")
      .attr("x", legendX + 25)
      .attr("y", uncertaintyLegendY + 42)
      .style("font-size", "10px")
      .style("fill", "#333")
      .text("High uncertainty (thick red border)");

    // Add instructions
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", uncertaintyLegendY + 65)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#666")
      .text("Click cells to view variants");

    // Cleanup tooltip on component unmount
    return () => {
      d3.select('body').selectAll('.heatmap-tooltip').remove();
    };
    
  }, [heatmapData, loading, error, navigate, selectedDose, selectedDrug]);

  // Cleanup effect for tooltips
  useEffect(() => {
    return () => {
      d3.select('body').selectAll('.heatmap-tooltip').remove();
    };
  }, []);

  if (loading) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-loading">
          <div className="loading-spinner"></div>
          <p>Loading position vs amino acid heat map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-error">
          <h3>Error Loading Heat Map</h3>
          <p>{error}</p>
          <p className="error-details">
            Make sure the heat map data has been generated with the position vs amino acid matrix structure.
          </p>
        </div>
      </div>
    );
  }

  if (!heatmapData || !heatmapData.matrices) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-error">
          <h3>No Heat Map Data</h3>
          <p>The heat map data is not available or in an unexpected format.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2>Position vs Amino Acid Heat Map</h2>
        <p className="heatmap-description">
          Interactive 2D heat map showing {selectedDrug} response patterns 
          across protein positions and amino acid substitutions. Each cell represents the mean 
          netGR value for a specific position-substitution combination at the selected concentration.
        </p>
        
        {/* Current Drug Display */}
        <div className="current-drug" style={{ marginBottom: '1rem' }}>
          <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>Drug:</span>
          <span style={{ 
            color: '#28a745',
            background: '#f8f9fa',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #e9ecef',
            fontWeight: 'bold'
          }}>
            {selectedDrug} {availableDrugs.find(d => d.name === selectedDrug)?.fda_approved ? '✓ FDA Approved' : '(Investigational)'}
          </span>
        </div>

        {/* Drug Selection Controls */}
        <div className="drug-controls" style={{ marginBottom: '1rem' }}>
          <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>Select Drug:</span>
          {availableDrugs.map((drug) => (
            <button
              key={drug.name}
              onClick={() => setSelectedDrug(drug.name)}
              style={{
                padding: '0.5rem 1rem',
                margin: '0 0.25rem',
                border: '2px solid #28a745',
                borderRadius: '0.25rem',
                backgroundColor: selectedDrug === drug.name ? '#28a745' : 'white',
                color: selectedDrug === drug.name ? 'white' : '#28a745',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedDrug !== drug.name) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDrug !== drug.name) {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              {drug.name}
            </button>
          ))}
        </div>

        {/* Concentration Toggle Controls */}
        <div className="dose-controls" style={{ marginBottom: '1rem' }}>
          <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>Concentration:</span>
          {['low', 'medium', 'high'].map((dose) => (
            <button
              key={dose}
              onClick={() => setSelectedDose(dose)}
              style={{
                padding: '0.5rem 1rem',
                margin: '0 0.25rem',
                border: '2px solid #007bff',
                borderRadius: '0.25rem',
                backgroundColor: selectedDose === dose ? '#007bff' : 'white',
                color: selectedDose === dose ? 'white' : '#007bff',
                cursor: 'pointer',
                fontWeight: 'bold',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedDose !== dose) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedDose !== dose) {
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              {dose} ({getConcentrationForDose(dose)})
            </button>
          ))}
        </div>
        
        <div className="heatmap-stats">
          <span className="stat">
            <strong>{heatmapData?.metadata.total_variants}</strong> variants analyzed
          </span>
          <span className="stat">
            <strong>{heatmapData?.positions?.length}</strong> positions
          </span>
          <span className="stat">
            <strong>{heatmapData?.metadata.amino_acids?.length}</strong> amino acids
          </span>
          <span className="stat">
            Gene: <strong>{heatmapData?.metadata.gene}</strong>
          </span>
          <span className="stat">
            Drug: <strong style={{ color: '#28a745' }}>{selectedDrug}</strong>
          </span>
          <span className="stat">
            Concentration: <strong style={{ color: '#007bff' }}>{getConcentrationForDose(selectedDose)}</strong>
          </span>
        </div>
      </div>
      <div className="heatmap-visualization">
        <svg ref={svgRef}></svg>
      </div>
      <div className="heatmap-footer">
        <p className="heatmap-note">
          Heat map shows mean network growth rate (netGR) values for {selectedDrug} at {getConcentrationForDose(selectedDose)} across protein positions 
          (N-terminus to C-terminus) and amino acid substitutions. Border thickness and color indicate measurement 
          uncertainty (standard deviation across replicates). Use the concentration buttons above to switch between 
          different drug concentrations. Click on colored cells to view specific variant details.
        </p>
      </div>
    </div>
  );
};

export default AminoAcidHeatMap;