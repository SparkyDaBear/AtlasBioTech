import React, { useState, useEffect } from 'react';
import './ProteinSequenceViewer.css';

const ProteinSequenceViewer = ({ proteinId, onResidueSelect, selectedResidues, heatmapData }) => {
  const [sequence, setSequence] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState(null);
  const [selectedChain, setSelectedChain] = useState('A');
  const [availableChains, setAvailableChains] = useState(['A', 'B', 'C', 'D']);

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
      // Pass both position and chain to parent
      const selection = {
        position: residue.position,
        chain: selectedChain
      };
      console.log('Residue clicked:', selection);
      onResidueSelect(selection);
    }
  };

  if (!sequence) {
    return (
      <div className="sequence-viewer-loading">
        <p>Loading protein sequence...</p>
      </div>
    );
  }

  // Group sequence into lines of 100 residues (PDB-style)
  const residuesPerLine = 100;
  const sequenceLines = [];
  for (let i = 0; i < sequence.length; i += residuesPerLine) {
    sequenceLines.push(sequence.slice(i, i + residuesPerLine));
  }

  return (
    <div className="protein-sequence-viewer">
      <div className="sequence-header">
        <div className="sequence-header-content">
          <h3 className="sequence-title">Sequence of {proteinId}</h3>
          <div className="chain-selector">
            <label htmlFor="chain-select" className="chain-label">Chain:</label>
            <select 
              id="chain-select"
              value={selectedChain} 
              onChange={(e) => setSelectedChain(e.target.value)}
              className="chain-select"
            >
              {availableChains.map(chain => (
                <option key={chain} value={chain}>{chain}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="sequence-container">
        {sequenceLines.map((line, lineIndex) => {
          const startPos = line[0].position;
          
          return (
            <div key={lineIndex} className="sequence-line">
              {/* Position number at start of line */}
              <div className="sequence-position-label">{startPos}</div>
              
              {/* Residues - break into groups of 10 */}
              <div className="sequence-residues">
                {line.map((residue, idx) => {
                  const isSelected = selectedResidues?.some(
                    r => r.position === residue.position && r.chain === selectedChain
                  );
                  const isHovered = hoveredPosition === residue.position;
                  const needsSpace = idx > 0 && idx % 10 === 0;
                  
                  return (
                    <React.Fragment key={idx}>
                      {needsSpace && <span className="residue-spacer"> </span>}
                      <span
                        className={`residue ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                        onClick={() => handleResidueClick(residue)}
                        onMouseEnter={() => setHoveredPosition(residue.position)}
                        onMouseLeave={() => setHoveredPosition(null)}
                        title={`${residue.aminoAcid}${residue.position}`}
                      >
                        {residue.aminoAcid}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProteinSequenceViewer;
