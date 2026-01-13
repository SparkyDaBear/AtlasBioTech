import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import './AminoAcidHeatMap.css';

const AminoAcidHeatMap = ({ proteinId, hoveredResidue, onResidueHover, initialDrug }) => {
  const svgRef = useRef();
  const navigate = useNavigate();
  const scrollPosRef = useRef(0); // Persist scroll position across re-renders
  const onResidueHoverRef = useRef(onResidueHover); // Stable ref to avoid render loop
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConcentration, setSelectedConcentration] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(initialDrug || 'Imatinib'); // Use initialDrug if provided
  const [availableDrugs, setAvailableDrugs] = useState([
    { name: 'Imatinib', fda_approved: true, approval_date: '2001-05-10' },
    { name: 'Hollyniacine', fda_approved: false, approval_date: null }
  ]);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onResidueHoverRef.current = onResidueHover;
  }, [onResidueHover]);

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
        // Set initial concentration to first available concentration
        if (data.metadata && data.metadata.concentrations && data.metadata.concentrations.length > 0) {
          setSelectedConcentration(data.metadata.concentrations[0]);
        }
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
    if (!heatmapData || loading || error || !heatmapData.matrices || !heatmapData.positions || !selectedConcentration) return;

    // Get the matrix for the selected drug
    const currentMatrix = heatmapData.matrices[selectedDrug];
    if (!currentMatrix) {
      console.error(`No matrix data found for drug: ${selectedDrug}`);
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render
    
    // Clean up any existing tooltips from previous renders
    d3.selectAll('.heatmap-tooltip').remove();

    // Dimensions and margins - use full screen width
    const margin = { top: 80, right: 400, bottom: 120, left: 100 };
    const containerWidth = window.innerWidth - 40; // Full width with minimal padding
    const containerHeight = 700; // Increased to accommodate scroll bar and labels
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

    // Scrolling configuration - show 100 positions at a time
    const maxVisiblePositions = 100;
    const cellWidth = width / Math.min(maxVisiblePositions, positions.length);
    const totalWidth = cellWidth * positions.length;
    
    // Create a clipping path for scrollable content
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'heatmap-clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    // Create scrollable container
    const scrollContainer = g.append('g')
      .attr('clip-path', 'url(#heatmap-clip)');
    
    const contentGroup = scrollContainer.append('g');

    // Create scales
    const xScale = d3.scaleBand()
      .domain(positions)
      .range([0, totalWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(aminoAcids)
      .range([0, height])
      .padding(0.05);

    // Get all non-null values for color scale across ALL concentrations for this drug
    // This ensures color scale is consistent regardless of selected concentration
    const allValues = [];
    const concentrations = heatmapData.metadata.concentrations || [];
    Object.values(currentMatrix).forEach(posData => {
      Object.values(posData).forEach(aaData => {
        // Include values from all concentrations
        concentrations.forEach(conc => {
          if (aaData[conc] && aaData[conc].value !== null && aaData[conc].value !== undefined) {
            allValues.push(aaData[conc].value);
          }
        });
      });
    });

    // Create color scale - consistent for all doses of this drug
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateViridis)
      .domain(d3.extent(allValues));

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'heatmap-tooltip')
      .style('opacity', 0)
      .style('position', 'fixed') // Changed from 'absolute' to 'fixed' to avoid scroll issues
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '10000') // Increased z-index
      .style('box-shadow', '0 4px 8px rgba(0,0,0,0.3)');

    // Get all std values to create a scale for uncertainty visualization
    const allStdValues = [];
    Object.values(currentMatrix).forEach(posData => {
      Object.values(posData).forEach(aaData => {
        if (aaData[selectedConcentration] && aaData[selectedConcentration].std !== null && aaData[selectedConcentration].std !== undefined) {
          allStdValues.push(aaData[selectedConcentration].std);
        }
      });
    });

    // Create uncertainty scale for border width (higher std = thicker border)
    const uncertaintyScale = d3.scaleLinear()
      .domain([0, d3.max(allStdValues) || 1])
      .range([0.5, 3]);

    // Create matrix cells
    positions.forEach(position => {
      aminoAcids.forEach(aa => {
        const positionStr = position.toString();
        const cellData = currentMatrix[positionStr] && currentMatrix[positionStr][aa];
        const concentrationData = cellData ? cellData[selectedConcentration] : null;
        const value = concentrationData ? concentrationData.value : null;
        const std = concentrationData ? concentrationData.std : null;

        // Calculate border properties based on uncertainty
        const uncertaintyBorderWidth = std !== null ? uncertaintyScale(std) : 0.5;
        const uncertaintyBorderColor = std !== null && std > (d3.mean(allStdValues) || 0) ? "#ff6b6b" : "#fff";

        const cell = contentGroup.append("rect")
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
              const unit = heatmapData.metadata.concentration_unit || 'nM';
              
              // Notify parent component about residue hover using ref to avoid render loop
              if (onResidueHoverRef.current) {
                onResidueHoverRef.current({ position, aminoAcid: aa, variant });
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
                  <strong>Concentration:</strong> ${selectedConcentration} ${unit}<br/>
                  <strong>Mean netGR:</strong> ${value.toFixed(3)}<br/>
                  <strong>Count:</strong> ${concentrationData.count}<br/>
                  ${concentrationData.std ? `<strong>Std Dev:</strong> ${concentrationData.std.toFixed(3)}<br/>` : ''}
                  ${uncertaintyText}
                  <em style="color: #ccc;">Click to view variant</em>
                </div>
              `;

              tooltip.interrupt().transition()
                .duration(200)
                .style('opacity', 1);
              
              tooltip.html(tooltipContent)
                .style('left', (event.clientX + 15) + 'px')
                .style('top', (event.clientY - 15) + 'px');
            }
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("stroke", uncertaintyBorderColor)
              .attr("stroke-width", uncertaintyBorderWidth);

            // Clear residue hover using ref to avoid render loop
            if (onResidueHoverRef.current) {
              onResidueHoverRef.current(null);
            }

            tooltip.interrupt().transition()
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

    // Calculate visible range helper
    const getVisibleRange = (scrollPos) => {
      const startIndex = Math.floor((scrollPos / totalWidth) * positions.length);
      const endIndex = Math.min(positions.length - 1, Math.ceil(((scrollPos + width) / totalWidth) * positions.length));
      return { startIndex, endIndex, positions: positions.slice(startIndex, endIndex + 1) };
    };

    // Create scale for the fixed bottom axis showing visible positions
    const visibleXScale = d3.scaleBand()
      .range([0, width])
      .padding(0.05);

    // Add fixed X axis at the bottom (updates with scroll)
    const fixedXAxis = g.append("g")
      .attr("transform", `translate(0,${height})`);
    
    // Function to update the fixed x-axis
    const updateFixedXAxis = (scrollPos) => {
      const visibleRange = getVisibleRange(scrollPos);
      visibleXScale.domain(visibleRange.positions);
      
      fixedXAxis.selectAll("*").remove();
      
      const tickInterval = Math.max(1, Math.ceil(visibleRange.positions.length / 15));
      fixedXAxis.call(d3.axisBottom(visibleXScale)
        .tickValues(visibleRange.positions.filter((_, i) => i % tickInterval === 0))
      );
      
      fixedXAxis.selectAll("text")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    };
    
    // Initialize the fixed x-axis
    updateFixedXAxis(0);

    // Add Y axis (amino acids) - fixed on the left
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "11px")
      .style("font-family", "monospace");

    // Add scroll controls if needed
    if (totalWidth > width) {
      let isDragging = false;
      
      // Add scroll bar - positioned lower to avoid overlap with x-axis labels
      const scrollBar = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${containerHeight - 50})`);
      
      scrollBar.append('rect')
        .attr('width', width)
        .attr('height', 10)
        .attr('fill', '#e0e0e0')
        .attr('rx', 5);
      
      const thumbWidth = (width / totalWidth) * width;
      const scrollThumb = scrollBar.append('rect')
        .attr('width', thumbWidth)
        .attr('height', 10)
        .attr('fill', '#007bff')
        .attr('rx', 5)
        .attr('cursor', 'grab');

      // Add position indicator - positioned below scroll bar
      const positionIndicator = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${containerHeight - 30})`);
      
      const positionText = positionIndicator.append('text')
        .attr('x', width / 2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', '#666');
      
      // Centralized update function that persists scroll position
      const updateScroll = (newScrollPos) => {
        const maxScroll = totalWidth - width;
        const clamped = Math.max(0, Math.min(maxScroll, newScrollPos));
        scrollPosRef.current = clamped;
        
        // Update content position
        contentGroup.attr('transform', `translate(${-clamped}, 0)`);
        
        // Update thumb position - map scroll range to track width
        const trackWidth = width - thumbWidth;
        const thumbX = (clamped / maxScroll) * trackWidth;
        scrollThumb.attr('x', thumbX);
        
        // Update axis and indicator
        updateFixedXAxis(clamped);
        
        const range = getVisibleRange(clamped);
        const startPos = positions[range.startIndex];
        const endPos = positions[range.endIndex];
        positionText.text(`Viewing positions ${startPos}-${endPos} of ${positions[0]}-${positions[positions.length-1]}`);
      };
      
      // Initialize to last known scroll position (NOT zero)
      updateScroll(scrollPosRef.current);
      
      // Add drag behavior to scroll thumb
      const drag = d3.drag()
        .on('start', function() {
          isDragging = true;
          d3.select(this).style('cursor', 'grabbing');
        })
        .on('drag', function(event) {
          const trackWidth = width - thumbWidth;
          let newX = Math.max(0, Math.min(trackWidth, event.x));
          let newScrollPos = (newX / trackWidth) * (totalWidth - width);
          updateScroll(newScrollPos);
        })
        .on('end', function() {
          isDragging = false;
          d3.select(this).style('cursor', 'grab');
        });
      
      scrollThumb.call(drag);
      
      // Mouse wheel scrolling - clean up previous listener and attach new one
      svg.on('wheel.scroll', null);
      svg.on('wheel.scroll', function(event) {
        if (isDragging) return;
        event.preventDefault();
        event.stopPropagation();
        updateScroll(scrollPosRef.current + event.deltaY);
      }, { passive: false });
    }

    // Add axis labels
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + 60})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Protein Position (N → C terminus)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -90) // add 10px more left padding
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Amino Acid Substitution");

    // Calculate the visual center of the heatmap (excluding legend area)
    const heatmapVisualCenter = margin.left + (width / 2);

    // Add title
    svg.append("text")
      .attr("x", heatmapVisualCenter)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text(`${heatmapData.metadata.gene} - Position vs Amino Acid Heat Map`);

    // Add subtitle
    const unit = heatmapData.metadata.concentration_unit || 'nM';
    svg.append("text")
      .attr("x", heatmapVisualCenter)
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "#666")
      .text(`Mean netGR (${selectedConcentration} ${unit}) - ${selectedDrug} Response`);

    // Add data summary
    svg.append("text")
      .attr("x", heatmapVisualCenter)
      .attr("y", 70)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#888")
      .text(`Showing ${positions.length} positions (${positions[0]}-${positions[positions.length-1]}) × ${aminoAcids.length} amino acids${totalWidth > width ? ' - Scroll to navigate' : ''}`);

    // Add color legend - VERTICAL
    const legendWidth = 20;
    const legendHeight = 200;
    const legendX = containerWidth - margin.right + 60;
    const legendY = margin.top + 50;

    // Create gradient definition for vertical orientation
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")  // Start at bottom
      .attr("x2", "0%")
      .attr("y2", "0%");   // End at top

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

    // Add legend scale - vertical axis on the right
    const legendScale = d3.scaleLinear()
      .domain(d3.extent(allValues))
      .range([legendY + legendHeight, legendY]);  // Reversed for bottom-to-top

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".2f"));

    svg.append("g")
      .attr("transform", `translate(${legendX + legendWidth},0)`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px");

    // Add legend title - rotated vertically
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY - 12)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Mean netGR");

    // Add uncertainty legend
    const uncertaintyLegendY = legendY + legendHeight + 30;
    
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", uncertaintyLegendY)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Uncertainty");

    // Low uncertainty example
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", uncertaintyLegendY + 8)
      .attr("width", legendWidth)
      .attr("height", 15)
      .attr("fill", colorScale(d3.mean(allValues) || 0))
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);

    svg.append("text")
      .attr("x", legendX + legendWidth + 5)
      .attr("y", uncertaintyLegendY + 18)
      .style("font-size", "9px")
      .style("fill", "#333")
      .text("Low");

    // High uncertainty example
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", uncertaintyLegendY + 28)
      .attr("width", legendWidth)
      .attr("height", 15)
      .attr("fill", colorScale(d3.mean(allValues) || 0))
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 2.5);

    svg.append("text")
      .attr("x", legendX + legendWidth + 5)
      .attr("y", uncertaintyLegendY + 38)
      .style("font-size", "9px")
      .style("fill", "#333")
      .text("High");

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
    
  }, [heatmapData, loading, error, navigate, selectedConcentration, selectedDrug]);

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
    <>
      {/* Inline Layout: Controls on left, Heatmap on right */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '2rem',
        width: '100%',
        margin: '0 auto'
      }}>
        
        {/* Controls Panel - Left Side */}
        <div className="heatmap-controls-panel" style={{ 
          flex: '0 0 350px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          position: 'sticky',
          top: '20px',
          alignSelf: 'flex-start'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem' }}>Heatmap Controls</h3>
          
          {/* Drug Selection Controls */}
          <div className="drug-controls" style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '0.95rem' }}>Drug:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableDrugs.map((drug) => (
                <button
                  key={drug.name}
                  onClick={() => setSelectedDrug(drug.name)}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '2px solid #28a745',
                    borderRadius: '0.375rem',
                    backgroundColor: selectedDrug === drug.name ? '#28a745' : 'white',
                    color: selectedDrug === drug.name ? 'white' : '#28a745',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
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
                  <span>{drug.name}</span>
                  {drug.fda_approved && <span style={{ fontSize: '0.85rem' }}>✓ FDA</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Concentration Toggle Controls */}
          <div className="dose-controls" style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '0.95rem' }}>Concentration:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {heatmapData?.metadata?.concentrations?.map((conc) => {
                const unit = heatmapData.metadata.concentration_unit || 'nM';
                return (
                  <button
                    key={conc}
                    onClick={() => setSelectedConcentration(conc)}
                    style={{
                      padding: '0.75rem 1rem',
                      border: '2px solid #007bff',
                      borderRadius: '0.375rem',
                      backgroundColor: selectedConcentration === conc ? '#007bff' : 'white',
                      color: selectedConcentration === conc ? 'white' : '#007bff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedConcentration !== conc) {
                        e.target.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedConcentration !== conc) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {conc} {unit}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Stats */}
          <div style={{ 
            borderTop: '1px solid #e9ecef', 
            paddingTop: '1rem',
            fontSize: '0.875rem',
            color: '#6c757d'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{heatmapData?.metadata.total_variants}</strong> variants
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{heatmapData?.positions?.length}</strong> positions
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              Gene: <strong>{heatmapData?.metadata.gene}</strong>
            </div>
          </div>
        </div>

        {/* Heatmap Visualization Panel - Right Side */}
        <div className="heatmap-visualization-panel" style={{
          flex: '1',
          minWidth: 0,
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          overflow: 'visible'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: '0 0 0.5rem 0' }}>Position vs Amino Acid Heat Map</h2>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.95rem' }}>
              Interactive 2D heat map showing {selectedDrug} response patterns 
              across protein positions and amino acid substitutions at {selectedConcentration} {heatmapData?.metadata?.concentration_unit || 'nM'}.
            </p>
          </div>
          
          <div className="heatmap-visualization">
            <svg ref={svgRef}></svg>
          </div>
          
          <div className="heatmap-footer">
            <p className="heatmap-note">
              Heat map shows mean network growth rate (netGR) values for {selectedDrug} at {selectedConcentration} {heatmapData?.metadata?.concentration_unit || 'nM'} across protein positions 
              (N-terminus to C-terminus) and amino acid substitutions. Border thickness and color indicate measurement 
              uncertainty (standard deviation across replicates). {heatmapData?.positions?.length > 100 ? 'Use mouse wheel to scroll horizontally through positions. ' : ''}Click on colored cells to view specific variant details.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AminoAcidHeatMap;