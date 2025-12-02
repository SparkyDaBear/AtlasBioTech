import React, { useState, useEffect, useRef } from 'react';

const ProteinInteractiveView = ({ proteinData, proteinId }) => {
  const pdbViewerRef = useRef(null);
  const stageRef = useRef(null);
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
      if (stageRef.current) {
        stageRef.current.dispose();
        stageRef.current = null;
      }
    };
  }, []);

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
        
        {/* Structure Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-1">
          <button 
            onClick={() => {
              if (stageRef.current) {
                stageRef.current.autoView();
              }
            }}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs transition-colors"
            title="Auto View"
          >
            🏠
          </button>
          <button 
            onClick={() => {
              if (stageRef.current) {
                stageRef.current.toggleFullscreen();
              }
            }}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs transition-colors"
            title="Fullscreen"
          >
            🎯
          </button>
          <button 
            onClick={() => {
              const baseUrl = import.meta.env.BASE_URL || '';
              window.open(`${baseUrl}data/v1.0/BCR-ABL.pdb`, '_blank');
            }}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs transition-colors"
            title="Download PDB"
          >
            💾
          </button>
        </div>
      </div>

      {/* Structure Information */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Viewer:</span>
            <span className="ml-2 font-medium text-blue-600">NGL Viewer</span>
          </div>
          <div>
            <span className="text-gray-600">Protein:</span>
            <span className="ml-2 font-medium">{proteinData?.protein_name || proteinId}</span>
          </div>
          <div>
            <span className="text-gray-600">Source:</span>
            <span className="ml-2 font-medium text-green-600">AlphaFold Prediction</span>
          </div>
          <div>
            <span className="text-gray-600">Representations:</span>
            <span className="ml-2 font-medium">Cartoon + Surface</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProteinInteractiveView;