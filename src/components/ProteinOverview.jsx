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
    <div className="space-y-8">
      {/* Clinical Significance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Clinical Significance
        </h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {clinical_significance}
          </p>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Protein Description
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}

      {/* Functional Description */}
      {functional_description && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Function
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {functional_description}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Structural Domains */}
        {structural_domains.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Structural Domains
            </h3>
            <div className="space-y-4">
              {structural_domains.map((domain, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">
                    {domain.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Residues: {domain.residues}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {domain.function}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drug Resistance Information */}
        {drug_resistance && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Drug Resistance
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {drug_resistance}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Therapeutic Agents */}
      {therapeutic_agents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            FDA Approved Therapeutic Agents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {therapeutic_agents.map((agent, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    FDA Approved
                  </span>
                </div>
                
                {agent.type && (
                  <p className="text-sm text-gray-600 mb-2">
                    Type: {agent.type}
                  </p>
                )}
                
                <p className="text-sm text-gray-700 mb-3">
                  {agent.mechanism}
                </p>
                
                <div className="space-y-1 text-xs text-gray-500">
                  <p><strong>Approval:</strong> {agent.fda_approval}</p>
                  <p><strong>Clinical Use:</strong> {agent.clinical_use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Links */}
      {Object.keys(external_links).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            External Database Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {external_links.uniprot && (
              <a
                href={external_links.uniprot}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold text-sm">UP</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">UniProt</h4>
                  <p className="text-xs text-gray-500">Protein sequence & annotation</p>
                </div>
              </a>
            )}
            
            {external_links.pdb && (
              <a
                href={external_links.pdb}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-sm">PDB</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Protein Data Bank</h4>
                  <p className="text-xs text-gray-500">3D structure data</p>
                </div>
              </a>
            )}
            
            {external_links.alphafold && (
              <a
                href={external_links.alphafold}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-sm">AF</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">AlphaFold</h4>
                  <p className="text-xs text-gray-500">AI predicted structure</p>
                </div>
              </a>
            )}
            
            {external_links.ncbi && (
              <a
                href={external_links.ncbi}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 font-bold text-sm">NCBI</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">NCBI Gene</h4>
                  <p className="text-xs text-gray-500">Gene information</p>
                </div>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProteinOverview;