import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ProteinOverview from './ProteinOverview';
import ProteinInteractiveView from './ProteinInteractiveView';
import ProteinSequenceViewer from './ProteinSequenceViewer';
import AminoAcidHeatMap from './AminoAcidHeatMap';

const ProteinPage = () => {
  const { proteinId } = useParams();
  const [searchParams] = useSearchParams();
  const [proteinData, setProteinData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredResidue, setHoveredResidue] = useState(null);
  const [selectedResidue, setSelectedResidue] = useState(null);

  // Debug logging for selected residue changes
  useEffect(() => {
    console.log('ProteinPage - selectedResidue changed:', selectedResidue);
  }, [selectedResidue]);

  // Get drug from URL parameter
  const drugFromUrl = searchParams.get('drug');

  useEffect(() => {
    const loadProteinData = async () => {
      try {
        setLoading(true);
        // Load protein metadata
        const baseUrl = import.meta.env.BASE_URL || '';
        const response = await fetch(`${baseUrl}data/v1.0/protein_metadata.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Get protein data by ID (data is keyed by protein ID)
        const protein = data[proteinId];
        if (!protein) {
          throw new Error(`Protein ${proteinId} not found`);
        }
        
        setProteinData(protein);
        
        // Load heatmap data for sequence viewer
        const heatmapResponse = await fetch(`${baseUrl}data/v1.0/heatmap_data.json`);
        if (heatmapResponse.ok) {
          const heatmapJson = await heatmapResponse.json();
          setHeatmapData(heatmapJson);
        }
      } catch (err) {
        console.error('Error loading protein data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (proteinId) {
      loadProteinData();
    }
  }, [proteinId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading protein data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full Width */}
      <div className="bg-white shadow-sm">
        <div style={{ width: '100%', padding: '1.5rem 20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <span>/</span>
                <span className="text-gray-900">{proteinData?.protein_name || proteinId}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">
                {proteinData?.protein_name || proteinId}
              </h1>
              {proteinData?.official_name && proteinData.official_name !== proteinData.protein_name && (
                <p className="text-gray-600 mt-1">
                  Official name: {proteinData.official_name}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Protein ID</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{proteinId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div style={{ width: '100%', padding: '2rem 0' }}>
        {/* Overview Section */}
        <section style={{ padding: '0 20px', marginBottom: '3rem' }}>
          <ProteinOverview proteinData={proteinData} proteinId={proteinId} />
        </section>
        
        {/* 3D Structure Section */}
        <section style={{ padding: '0 20px', marginBottom: '3rem' }}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3D Structure
            </h2>
            <p className="text-gray-600 mb-4">
              Interactive visualization of {proteinData?.protein_name || proteinId} structure.
              {selectedResidue && <span className="ml-2 text-blue-600 font-semibold">Highlighting chain {selectedResidue.chain}, residue {selectedResidue.position}</span>}
            </p>
            <ProteinInteractiveView 
              proteinData={proteinData} 
              proteinId={proteinId} 
              hoveredResidue={hoveredResidue}
              selectedResidue={selectedResidue}
              onResidueHover={setHoveredResidue}
            />
            
            {/* Protein Sequence Viewer */}
            {heatmapData && (
              <ProteinSequenceViewer
                proteinId={proteinId}
                heatmapData={heatmapData}
                selectedResidue={selectedResidue}
                onResidueSelect={setSelectedResidue}
              />
            )}
          </div>
        </section>
      </div>
        
      {/* Heat Map Section - Full Width with separate panels */}
      <section style={{ width: '100%', padding: '0', marginBottom: '3rem' }}>
        <AminoAcidHeatMap 
          proteinId={proteinId} 
          hoveredResidue={hoveredResidue}
          onResidueHover={setHoveredResidue}
          initialDrug={drugFromUrl}
        />
      </section>
    </div>
  );
};

export default ProteinPage;