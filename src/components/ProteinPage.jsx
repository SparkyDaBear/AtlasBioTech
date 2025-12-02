import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProteinOverview from './ProteinOverview';
import ProteinInteractiveView from './ProteinInteractiveView';
import AminoAcidHeatMap from './AminoAcidHeatMap';

const ProteinPage = () => {
  const { proteinId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [proteinData, setProteinData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'interactive', label: 'Interactive View', icon: '🧬' },
    { id: 'heatmap', label: 'Interactive Heat Map', icon: '🔥' }
  ];

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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
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

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <ProteinOverview proteinData={proteinData} proteinId={proteinId} />
        )}
        
        {activeTab === 'interactive' && (
          <ProteinInteractiveView proteinData={proteinData} proteinId={proteinId} />
        )}
        
        {activeTab === 'heatmap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Interactive Heat Map
              </h2>
              <p className="text-gray-600 mb-6">
                Explore mutation effects across {proteinData?.protein_name || proteinId} 
                with concentration-dependent drug response data.
              </p>
            </div>
            <AminoAcidHeatMap proteinId={proteinId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProteinPage;