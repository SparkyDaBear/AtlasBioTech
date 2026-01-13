import React, { useState, useEffect } from 'react';
import './ProteinSequenceViewer.css';

const ProteinSequenceViewer = ({ proteinId, onResidueSelect, selectedResidue, heatmapData }) => {
  const [sequence, setSequence] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState(null);

  useEffect(() => {
    // Generate sequence from heatmap data
    if (heatmapData && heatmapData.positions) {
      const positions = heatmapData.positions.sort((a, b) => a - b);
      const sequenceData = [];
      
      // Get reference amino acids for each position from the heatmap data
      const matrices = heatmapData.matrices;
      const firstDrug = Object.keys(matrices)[0];
      
      positions.forEach(pos => {
        const posData = matrices[firstDrug][pos.toString()];
        if (posData) {
          // Find the reference amino acid (the one with ref_aa property)
          let refAa = null;
          for (const [aa, data] of Object.entries(posData)) {
            if (data.ref_aa) {
              refAa = data.ref_aa;
              break;
            }
          }
          
          sequenceData.push({
            position: pos,
            aminoAcid: refAa || '?',
            index: sequenceData.length
          });
        }
      });
      
      setSequence(sequenceData);
    }
  }, [heatmapData]);

  const handleResidueClick = (residue) => {
    if (onResidueSelect) {
      onResidueSelect(residue.position);
    }
  };

  if (!sequence) {
    return (
      <div className="sequence-viewer-loading">
        <p>Loading protein sequence...</p>
      </div>
    );
  }

  // Group sequence into lines of 50 residues for better readability
  const linesPerGroup = 50;
  const sequenceLines = [];
  for (let i = 0; i < sequence.length; i += linesPerGroup) {
    sequenceLines.push(sequence.slice(i, i + linesPerGroup));
  }

  return (
    <div className="protein-sequence-viewer">
      <div className="sequence-header">
        <h3 className="sequence-title">Protein Sequence</h3>
        <p className="sequence-subtitle">
          Click on any residue to highlight it in the 3D structure above
        </p>
        {selectedResidue && (
          <div className="selected-residue-info">
            <strong>Selected:</strong> Position {selectedResidue}
          </div>
        )}
      </div>

      <div className="sequence-container">
        {sequenceLines.map((line, lineIndex) => {
          const startPos = line[0].position;
          const endPos = line[line.length - 1].position;
          
          return (
            <div key={lineIndex} className="sequence-line-group">
              <div className="sequence-line-header">
                <span className="sequence-range">
                  {startPos} - {endPos}
                </span>
              </div>
              
              <div className="sequence-line">
                {line.map((residue, idx) => {
                  const isSelected = selectedResidue === residue.position;
                  const isHovered = hoveredPosition === residue.position;
                  
                  return (
                    <div
                      key={idx}
                      className={`residue ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                      onClick={() => handleResidueClick(residue)}
                      onMouseEnter={() => setHoveredPosition(residue.position)}
                      onMouseLeave={() => setHoveredPosition(null)}
                      title={`${residue.aminoAcid}${residue.position}`}
                    >
                      <span className="residue-aa">{residue.aminoAcid}</span>
                      <span className="residue-pos">{residue.position}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Every 10 residues, add tick marks */}
              <div className="sequence-ruler">
                {line.map((residue, idx) => {
                  if (idx % 10 === 0) {
                    return (
                      <span key={idx} className="ruler-tick">
                        |
                      </span>
                    );
                  }
                  return <span key={idx} className="ruler-space"> </span>;
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sequence-legend">
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Selected residue</span>
        </div>
        <div className="legend-item">
          <div className="legend-box hovered"></div>
          <span>Hover to preview</span>
        </div>
      </div>
    </div>
  );
};

export default ProteinSequenceViewer;
