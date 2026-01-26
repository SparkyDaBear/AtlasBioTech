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
  const [selectedResidues, setSelectedResidues] = useState([]);

  // Handle residue selection toggle
  const handleResidueSelect = (selection) => {
    setSelectedResidues(prev => {
      // Check if this residue is already selected
      const index = prev.findIndex(
        r => r.position === selection.position && r.chain === selection.chain
      );
      
      if (index >= 0) {
        // Already selected - remove it
        return prev.filter((_, i) => i !== index);
      } else {
        // Not selected - add it
        return [...prev, selection];
      }
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedResidues([]);
  };

  // Debug logging for selected residue changes
  useEffect(() => {
    console.log('ProteinPage - selectedResidues changed:', selectedResidues);
  }, [selectedResidues]);

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
    <div style={{ minHeight: '100vh' }}>
      {/* Header - Full Width */}
      <div style={{
        background: 'linear-gradient(135deg, var(--dark-surface) 0%, var(--dark-elevated) 100%)',
        borderBottom: '2px solid var(--primary-color)',
        padding: '2.5rem 20px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Breadcrumb Navigation */}
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.95rem',
            marginBottom: '1.5rem'
          }}>
            <Link 
              to="/" 
              style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.7'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Home
            </Link>
            <span style={{ color: 'var(--text-on-dark-secondary)' }}>/</span>
            <span style={{ color: 'var(--text-on-dark)' }}>{proteinData?.protein_name || proteinId}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              {/* Main Protein Name */}
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'var(--text-on-dark)',
                marginBottom: '0.75rem',
                lineHeight: '1.2'
              }}>
                {proteinData?.protein_name || proteinId}
              </h1>
              
              {/* Official Name */}
              {proteinData?.official_name && proteinData.official_name !== proteinData.protein_name && (
                <p style={{
                  color: 'var(--text-on-dark-secondary)',
                  fontSize: '1.1rem',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Official name:</span> {proteinData.official_name}
                </p>
              )}
            </div>

            {/* Protein ID Badge */}
            <div style={{
              background: 'var(--dark-elevated)',
              border: '2px solid var(--primary-color)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              textAlign: 'center',
              minWidth: '180px'
            }}>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-on-dark-secondary)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600'
              }}>
                Protein ID
              </p>
              <p style={{ 
                fontFamily: 'monospace', 
                fontSize: '1.25rem', 
                fontWeight: '700',
                color: 'var(--primary-color)'
              }}>
                {proteinId}
              </p>
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
          <div style={{
            background: 'var(--dark-surface)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--primary-color)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: 'var(--text-on-dark)',
              marginBottom: '1rem'
            }}>
              3D Structure
            </h2>
            <p style={{
              color: 'var(--text-on-dark-secondary)',
              marginBottom: '1rem',
              fontSize: '1.05rem'
            }}>
              Interactive visualization of {proteinData?.protein_name || proteinId} structure.
              {selectedResidues.length > 0 && (
                <span style={{ marginLeft: '8px' }}>
                  <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                    {selectedResidues.length} residue{selectedResidues.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={clearSelections}
                    style={{
                      marginLeft: '8px',
                      padding: '4px 12px',
                      fontSize: '0.875rem',
                      background: 'var(--gradient-gold)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.opacity = '0.8'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    Clear All
                  </button>
                </span>
              )}
            </p>
            <ProteinInteractiveView 
              proteinData={proteinData} 
              proteinId={proteinId} 
              hoveredResidue={hoveredResidue}
              selectedResidues={selectedResidues}
              onResidueHover={setHoveredResidue}
            />
            
            {/* Protein Sequence Viewer */}
            {heatmapData && (
              <ProteinSequenceViewer
                proteinId={proteinId}
                heatmapData={heatmapData}
                selectedResidues={selectedResidues}
                onResidueSelect={handleResidueSelect}
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