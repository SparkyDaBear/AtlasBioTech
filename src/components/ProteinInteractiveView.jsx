import React, { useState } from 'react';

const ProteinInteractiveView = ({ proteinData, proteinId }) => {
  const [selectedDrug, setSelectedDrug] = useState('');
  const [selectedConcentration, setSelectedConcentration] = useState('');

  const mockDrugs = [
    'Imatinib',
    'Dasatinib', 
    'Nilotinib',
    'Bosutinib',
    'Ponatinib'
  ];

  const mockConcentrations = [
    '0.1 µM',
    '1 µM',
    '10 µM',
    '100 µM'
  ];

  return (
    <div className="space-y-8">
      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Interactive Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="drug-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Drug
            </label>
            <select
              id="drug-select"
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a drug...</option>
              {mockDrugs.map((drug) => (
                <option key={drug} value={drug}>
                  {drug}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="concentration-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Concentration
            </label>
            <select
              id="concentration-select"
              value={selectedConcentration}
              onChange={(e) => setSelectedConcentration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a concentration...</option>
              {mockConcentrations.map((conc) => (
                <option key={conc} value={conc}>
                  {conc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* AlphaFold Structure Viewer */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              3D Protein Structure
            </h3>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">AlphaFold Predicted</span>
            </div>
          </div>
          
          {/* Structure Viewer Placeholder */}
          <div className="relative">
            <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧬</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  3D Structure Viewer
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Interactive {proteinData?.protein_name || proteinId} structure from AlphaFold
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Rotate: Click and drag</p>
                  <p>• Zoom: Mouse wheel</p>
                  <p>• Select residues: Click on structure</p>
                </div>
              </div>
            </div>
            
            {/* Structure Controls */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-1">
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs transition-colors">
                🏠
              </button>
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs transition-colors">
                🔍
              </button>
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs transition-colors">
                🎨
              </button>
            </div>
          </div>

          {/* Structure Information */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Confidence Score:</span>
                <span className="ml-2 font-medium text-green-600">High (95.2%)</span>
              </div>
              <div>
                <span className="text-gray-600">Resolution:</span>
                <span className="ml-2 font-medium">0.5 Å</span>
              </div>
              <div>
                <span className="text-gray-600">Method:</span>
                <span className="ml-2 font-medium">AI Prediction</span>
              </div>
              <div>
                <span className="text-gray-600">Source:</span>
                <span className="ml-2 font-medium">AlphaFold DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* IC50 Plot */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Drug Response Analysis
            </h3>
            {selectedDrug && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {selectedDrug}
              </span>
            )}
          </div>
          
          {/* IC50 Plot Placeholder */}
          <div className="w-full h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                IC₅₀ Dose-Response Plot
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                {selectedDrug 
                  ? `Showing ${selectedDrug} response data`
                  : 'Select a drug to view dose-response curves'
                }
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <p>• X-axis: Drug concentration (log scale)</p>
                <p>• Y-axis: Cell viability (%)</p>
                <p>• Data points: Individual measurements</p>
              </div>
            </div>
          </div>

          {/* Plot Information */}
          {selectedDrug && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">IC₅₀:</span>
                  <span className="ml-2 font-medium text-blue-600">2.3 ± 0.4 µM</span>
                </div>
                <div>
                  <span className="text-gray-600">Hill Slope:</span>
                  <span className="ml-2 font-medium">-1.2</span>
                </div>
                <div>
                  <span className="text-gray-600">R²:</span>
                  <span className="ml-2 font-medium">0.96</span>
                </div>
                <div>
                  <span className="text-gray-600">n replicates:</span>
                  <span className="ml-2 font-medium">3</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mutation Effects Panel */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Mutation Effects on Drug Response
        </h3>
        
        {selectedDrug && selectedConcentration ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resistance Mutations */}
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-3">
                Resistance Mutations
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">T315I</span>
                  <span className="text-sm text-red-600">95% resistance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">F317L</span>
                  <span className="text-sm text-red-600">78% resistance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">Y253H</span>
                  <span className="text-sm text-red-600">65% resistance</span>
                </div>
              </div>
            </div>

            {/* Sensitizing Mutations */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">
                Sensitizing Mutations
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">L248R</span>
                  <span className="text-sm text-green-600">40% more sensitive</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">E255V</span>
                  <span className="text-sm text-green-600">25% more sensitive</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">M351T</span>
                  <span className="text-sm text-green-600">15% more sensitive</span>
                </div>
              </div>
            </div>

            {/* Neutral Mutations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Neutral Mutations
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">A380T</span>
                  <span className="text-sm text-gray-600">No effect</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">K285R</span>
                  <span className="text-sm text-gray-600">No effect</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">S417A</span>
                  <span className="text-sm text-gray-600">No effect</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Select both a drug and concentration to view mutation effects
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProteinInteractiveView;