import React from 'react';

const ProteinOverview = ({ proteinData, proteinId }) => {
  if (!proteinData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading protein information...</p>
      </div>
    );
  }

  const {
    protein_name,
    official_name,
    description,
    function: functional_description,
    clinical_significance,
    structural_domains = [],
    therapeutic_agents = [],
    external_links = {},
    drug_resistance
  } = proteinData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
      
      <div className="space-y-6">
        {/* Clinical Significance */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Clinical Significance
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {clinical_significance}
          </p>
        </div>

        {/* Description */}
        {description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Function */}
        {functional_description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Function
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {functional_description}
            </p>
          </div>
        )}

        {/* Structural Domains */}
        {structural_domains.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Key Domains
            </h3>
            <div className="space-y-2">
              {structural_domains.slice(0, 3).map((domain, index) => (
                <div key={index} className="border-l-2 border-blue-400 pl-3 py-1">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {domain.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {domain.residues}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drug Resistance */}
        {drug_resistance && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Drug Resistance
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {drug_resistance}
            </p>
          </div>
        )}

        {/* Top Therapeutic Agents */}
        {therapeutic_agents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              FDA Approved Agents
            </h3>
            <div className="space-y-2">
              {therapeutic_agents.slice(0, 3).map((agent, index) => (
                <div key={index} className="border border-gray-200 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">{agent.name}</h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      Approved
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{agent.mechanism}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        {Object.keys(external_links).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Database Links
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {external_links.uniprot && (
                <a
                  href={external_links.uniprot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 border border-gray-200 rounded hover:border-blue-300 transition-colors"
                >
                  <span className="w-6 h-6 bg-blue-100 rounded text-blue-600 text-xs font-bold flex items-center justify-center mr-2">UP</span>
                  <span className="text-sm text-gray-700">UniProt</span>
                </a>
              )}
              
              {external_links.alphafold && (
                <a
                  href={external_links.alphafold}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 border border-gray-200 rounded hover:border-purple-300 transition-colors"
                >
                  <span className="w-6 h-6 bg-purple-100 rounded text-purple-600 text-xs font-bold flex items-center justify-center mr-2">AF</span>
                  <span className="text-sm text-gray-700">AlphaFold</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProteinOverview;