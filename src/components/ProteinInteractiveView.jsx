import React, { useState, useEffect, useRef } from 'react';

const ProteinInteractiveView = ({ proteinData, proteinId, hoveredResidue, selectedResidues, onResidueHover }) => {
  const pdbViewerRef = useRef(null);
  const stageRef = useRef(null);
  const structureComponentRef = useRef(null);
  const highlightRepresentationRef = useRef(null);
  const selectedRepresentationsRef = useRef([]);
  const selectedChainRepresentationsRef = useRef([]);
  const nglRef = useRef(null);
  const [structureLoaded, setStructureLoaded] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(false);
  const [error, setError] = useState(null);

  // Initialize NGL Viewer
  useEffect(() => {
    const initNGLViewer = async () => {
      if (!pdbViewerRef.current || stageRef.current) return;

      try {
        setLoadingStructure(true);
        setError(null);
        
        console.log('Loading NGL...');
        
        // Dynamic import to handle potential issues with ES modules
        const NGL = await import('ngl');
        console.log('NGL imported successfully:', NGL);
        nglRef.current = NGL;
        
        // Create NGL Stage
        const stage = new NGL.Stage(pdbViewerRef.current, {
          backgroundColor: 'white'
        });
        stageRef.current = stage;
        console.log('Stage created:', stage);

        // Load the PDB structure
        const baseUrl = import.meta.env.BASE_URL || '';
        const structureUrl = `${baseUrl}data/v1.0/BCR-ABL.pdb`;
        console.log('Loading structure from:', structureUrl);
        
        const structureComponent = await stage.loadFile(structureUrl);
        structureComponentRef.current = structureComponent;
        console.log('Structure loaded:', structureComponent);
        
        // Add cartoon representation
        structureComponent.addRepresentation('cartoon', {
          color: 'chainname',
          opacity: 0.8
        });
        
        // Auto-view the structure
        stage.autoView();
        
        setStructureLoaded(true);
        setLoadingStructure(false);
        console.log('NGL Viewer initialized successfully');
      } catch (error) {
        console.error('Failed to initialize NGL viewer:', error);
        setError(error.message);
        setLoadingStructure(false);
      }
    };

    initNGLViewer();

    // Cleanup
    return () => {
      if (highlightRepresentationRef.current && structureComponentRef.current) {
        structureComponentRef.current.removeRepresentation(highlightRepresentationRef.current);
      }
      selectedRepresentationsRef.current.forEach(rep => {
        if (rep && structureComponentRef.current) {
          structureComponentRef.current.removeRepresentation(rep);
        }
      });
      selectedChainRepresentationsRef.current.forEach(rep => {
        if (rep && structureComponentRef.current) {
          structureComponentRef.current.removeRepresentation(rep);
        }
      });
      if (stageRef.current) {
        stageRef.current.dispose();
        stageRef.current = null;
        structureComponentRef.current = null;
        highlightRepresentationRef.current = null;
        selectedRepresentationsRef.current = [];
        selectedChainRepresentationsRef.current = [];
      }
    };
  }, []);

  // Handle residue highlighting (hover)
  useEffect(() => {
    if (!structureComponentRef.current || !structureLoaded) return;

    // Clear previous highlight
    if (highlightRepresentationRef.current) {
      structureComponentRef.current.removeRepresentation(highlightRepresentationRef.current);
      highlightRepresentationRef.current = null;
    }

    // Add new highlight if residue is hovered
    if (hoveredResidue) {
      const { position } = hoveredResidue;
      
      try {
        // Create selection string for the residue position
        const selectionString = `${position}`;
        
        // Add ball+stick representation for the highlighted residue
        highlightRepresentationRef.current = structureComponentRef.current.addRepresentation('ball+stick', {
          sele: selectionString,
          color: '#ff6b6b',
          scale: 1.5,
          opacity: 1.0
        });
        
        console.log(`Highlighting hovered residue at position ${position}`);
      } catch (error) {
        console.warn('Failed to highlight residue:', error);
      }
    }
  }, [hoveredResidue, structureLoaded]);

  // Handle selected residue highlighting (from sequence viewer)
  useEffect(() => {
    console.log('Selection effect triggered:', { selectedResidues, structureLoaded });
    
    if (!structureComponentRef.current || !structureLoaded || !nglRef.current) {
      console.log('Structure not ready yet');
      return;
    }

    // Clear all previous selection highlights
    selectedRepresentationsRef.current.forEach(rep => {
      if (rep) {
        structureComponentRef.current.removeRepresentation(rep);
      }
    });
    selectedRepresentationsRef.current = [];
    
    selectedChainRepresentationsRef.current.forEach(rep => {
      if (rep) {
        structureComponentRef.current.removeRepresentation(rep);
      }
    });
    selectedChainRepresentationsRef.current = [];

    // Add new selection highlights for all selected residues
    if (selectedResidues && selectedResidues.length > 0) {
      try {
        // Group selections by chain
        const chainGroups = {};
        selectedResidues.forEach(sel => {
          if (!chainGroups[sel.chain]) {
            chainGroups[sel.chain] = [];
          }
          chainGroups[sel.chain].push(sel.position);
        });

        // Highlight each chain that has selections
        Object.keys(chainGroups).forEach(chain => {
          const chainSelectionString = `:${chain}`;
          
          console.log(`Highlighting chain ${chain} in grey`);
          
          const chainRep = structureComponentRef.current.addRepresentation('cartoon', {
            sele: chainSelectionString,
            color: '#9ca3af',
            opacity: 0.7
          });
          selectedChainRepresentationsRef.current.push(chainRep);
        });

        // Highlight each selected residue in red spacefill
        selectedResidues.forEach(selection => {
          const residueSelectionString = `${selection.position}:${selection.chain}`;
          
          console.log(`Highlighting residue: ${residueSelectionString}`);
          
          const residueRep = structureComponentRef.current.addRepresentation('spacefill', {
            sele: residueSelectionString,
            color: '#ef4444',  // Red
            scale: 1.0,
            opacity: 1.0
          });
          selectedRepresentationsRef.current.push(residueRep);
        });
        
        console.log(`Successfully highlighted ${selectedResidues.length} residue(s)`);
        
        // Zoom to show all selected residues
        if (selectedResidues.length === 1) {
          // Single selection - zoom to that residue
          const sel = selectedResidues[0];
          const residueSelectionString = `${sel.position}:${sel.chain}`;
          try {
            structureComponentRef.current.autoView(residueSelectionString, 1000);
          } catch (zoomError) {
            console.warn('Zoom failed:', zoomError);
          }
        } else {
          // Multiple selections - show all selected residues
          const allSelectionString = selectedResidues
            .map(sel => `${sel.position}:${sel.chain}`)
            .join(' or ');
          try {
            structureComponentRef.current.autoView(allSelectionString, 1000);
          } catch (zoomError) {
            console.warn('Zoom failed:', zoomError);
          }
        }
      } catch (error) {
        console.error('Failed to highlight selected residues:', error);
        console.error('Selections were:', selectedResidues);
      }
    }
  }, [selectedResidues, structureLoaded]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${structureLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="text-sm text-gray-600">
            {structureLoaded ? 'AlphaFold Structure Loaded' : 'Loading Structure...'}
          </span>
        </div>
      </div>
      
      {/* NGL Viewer Container */}
      <div className="relative">
        {loadingStructure && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {proteinData?.protein_name || proteinId} structure...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 rounded-lg">
            <div className="text-center">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 font-semibold mb-2">Failed to load structure</p>
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div 
          ref={pdbViewerRef} 
          style={{ width: '100%', height: '400px' }}
          className="border rounded-lg bg-gray-100"
        ></div>
      </div>

      {/* Structure Controls */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-start'
      }}>
        <button 
          onClick={() => {
            if (stageRef.current) {
              stageRef.current.autoView();
            }
          }}
          style={{
            padding: '8px 16px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
          title="Auto View"
        >
          Home
        </button>
        <button 
          onClick={() => {
            if (stageRef.current) {
              stageRef.current.toggleFullscreen();
            }
          }}
          style={{
            padding: '8px 16px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
          title="Fullscreen"
        >
          Fullscreen
        </button>
        <button 
          onClick={() => {
            const baseUrl = import.meta.env.BASE_URL || '';
            window.open(`${baseUrl}data/v1.0/BCR-ABL.pdb`, '_blank');
          }}
          style={{
            padding: '8px 16px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.8'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
          title="Download PDB"
        >
          Download PDB
        </button>
      </div>

      {/* Structure Information */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'var(--dark-elevated)',
        borderRadius: '8px',
        border: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          fontSize: '0.95rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-on-dark-secondary)' }}>Viewer:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500', color: 'var(--primary-color)' }}>NGL Viewer</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-on-dark-secondary)' }}>Protein:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500', color: 'var(--text-on-dark)' }}>{proteinData?.protein_name || proteinId}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-on-dark-secondary)' }}>Source:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500', color: 'var(--secondary-color)' }}>AlphaFold Prediction</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-on-dark-secondary)' }}>Representations:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500', color: 'var(--text-on-dark)' }}>Cartoon + Surface</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProteinInteractiveView;