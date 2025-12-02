import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Download } from 'lucide-react'
import StructureViewer from './StructureViewer'
import DoseResponsePlot from './DoseResponsePlot'

const VariantCard = () => {
  const { gene, id } = useParams()
  const [variantData, setVariantData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDrugs, setSelectedDrugs] = useState([])

  useEffect(() => {
    // Load variant data
    const loadVariantData = async () => {
      try {
        setLoading(true)
        // URL decode the gene parameter in case it's encoded
        const decodedGene = decodeURIComponent(gene)
        const decodedId = decodeURIComponent(id)
        // Load variant data from the correct file path  
        const fileName = `${decodedGene}_${decodedId}.json`
        const response = await fetch(`/AtlasBioTech/data/v1.0/variants/${fileName}`)
        if (!response.ok) {
          throw new Error('Variant not found')
        }
        const data = await response.json()
        setVariantData(data)
        // Initialize selectedDrugs with available drugs
        setSelectedDrugs(data.drugs_tested || [])
      } catch (err) {
        // For now, always use mock data when variant files aren't available
        console.log(`Variant file not found for ${gene}/${id}, using mock data`)
        setVariantData({
          gene: gene,
          variant_string: id,
          protein_change: `p.${id}`,
          transcript_id: 'ENST00000275493',
          position: 858,
          consequence: 'missense_variant',
          drugs_tested: ['Imatinib', 'Dasatinib', 'Nilotinib'],
          model_system: 'Ba/F3 cells',
          ic50_values: [
            { 
              drug: 'Imatinib', 
              ic50: 1250, 
              ic50_wt: 45, 
              fold_change: 27.8, 
              confidence_interval: [980, 1520],
              dose_response_data: {
                doses: [5, 30, 100],
                responses_rep1: [0.85, 0.45, 0.15],
                responses_rep2: [0.82, 0.42, 0.12]
              }
            },
            { 
              drug: 'Dasatinib', 
              ic50: 15.2, 
              ic50_wt: 0.8, 
              fold_change: 19.0, 
              confidence_interval: [12.1, 18.3],
              dose_response_data: {
                doses: [5, 30, 100],
                responses_rep1: [0.75, 0.35, 0.08],
                responses_rep2: [0.73, 0.32, 0.10]
              }
            },
            { 
              drug: 'Nilotinib', 
              ic50: 28.5, 
              ic50_wt: 2.1, 
              fold_change: 13.6, 
              confidence_interval: [22.4, 34.6],
              dose_response_data: {
                doses: [5, 30, 100],
                responses_rep1: [0.88, 0.55, 0.25],
                responses_rep2: [0.85, 0.52, 0.22]
              }
            }
          ],
          replicate_count: 3,
          qc_flags: [],
          publication_doi: '10.1038/example.2024',
          plots: [
            { drug: 'Imatinib', plot_url: '/data/v1.0/assets/plots/EGFR_L858R_Imatinib.svg' },
            { drug: 'Dasatinib', plot_url: '/data/v1.0/assets/plots/EGFR_L858R_Dasatinib.svg' }
          ],
          pdb_structure: {
            pdb_id: '1M17',
            chain: 'A',
            residue_number: 858,
            pocket_residues: [790, 793, 829, 831, 858]
          }
        })
        // Initialize selectedDrugs with mock data drugs
        setSelectedDrugs(['Imatinib', 'Dasatinib', 'Nilotinib'])
      } finally {
        setLoading(false)
      }
    }

    loadVariantData()
  }, [gene, id])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Loading variant data...</div>
      </div>
    )
  }

  if (!variantData) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-red-600">
          Error: Variant not found
        </div>
        <Link to="/" className="btn btn-primary mt-4">
          <ArrowLeft size={16} />
          Back to Search
        </Link>
      </div>
    )
  }

  // Prepare data for dose-response plot
  const preparePlotData = () => {
    if (!variantData || !variantData.ic50_values) {
      return [];
    }
    
    const plotData = [];
    
    variantData.ic50_values.forEach(drugResult => {
      const { drug, dose_response_data } = drugResult;
      
      if (dose_response_data && dose_response_data.doses) {
        const { doses, responses_rep1, responses_rep2 } = dose_response_data;
        
        doses.forEach((concentration, index) => {
          const rep1 = responses_rep1[index];
          const rep2 = responses_rep2[index];
          
          // Add individual data points for statistical calculations
          if (rep1 !== undefined) {
            plotData.push({
              conc: concentration,
              netgr_obs: rep1,
              Drug: drug,
              rep: 1
            });
          }
          
          if (rep2 !== undefined) {
            plotData.push({
              conc: concentration,
              netgr_obs: rep2,
              Drug: drug,
              rep: 2
            });
          }
        });
      }
    });
    
    return plotData;
  };

  const plotData = preparePlotData();

  return (
    <div className="variant-card">
      <div className="variant-header">
        <div className="flex-1">
          <h1 className="variant-title">
            {variantData.gene} {variantData.variant_string}
          </h1>
          <p className="variant-subtitle">
            {variantData.protein_change} • {variantData.consequence.replace('_', ' ')}
          </p>
        </div>
        <div className="flex gap-2">

          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </div>

      <div className="grid grid-2 gap-6">
        {/* Metadata */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Variant Metadata</h2>
          <div className="metadata-grid">
            <div className="metadata-item">
              <div className="metadata-label">Transcript</div>
              <div className="metadata-value">{variantData.transcript_id}</div>
            </div>
            <div className="metadata-item">
              <div className="metadata-label">Position</div>
              <div className="metadata-value">{variantData.position}</div>
            </div>
            <div className="metadata-item">
              <div className="metadata-label">Model System</div>
              <div className="metadata-value">{variantData.model_system}</div>
            </div>
            <div className="metadata-item">
              <div className="metadata-label">Replicates</div>
              <div className="metadata-value">{variantData.replicate_count}</div>
            </div>
          </div>
        </div>

        {/* IC50 Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">IC50 Summary</h2>
          
          {/* Drug Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select drugs to display:
            </label>
            <div className="flex flex-wrap gap-2">
              {variantData.drugs_tested.map(drug => (
                <label key={drug} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedDrugs.includes(drug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDrugs([...selectedDrugs, drug]);
                      } else {
                        setSelectedDrugs(selectedDrugs.filter(d => d !== drug));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{drug}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Dose-Response Plot */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Dose-Response Analysis</h3>
            
            <div className="text-sm text-gray-600 mb-4">
              <p>Plot Data Points: {plotData.length}</p>
              <p>Selected Drugs: {selectedDrugs.join(', ') || 'None'}</p>
              <p>Available Drugs: {variantData?.drugs_tested?.join(', ') || 'None'}</p>
            </div>
            
            {plotData.length > 0 && selectedDrugs.length > 0 ? (
              <DoseResponsePlot 
                data={plotData} 
                selectedDrugs={selectedDrugs}
                width={600}
                height={400}
              />
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800">
                  {plotData.length === 0 && "No dose-response data available"}
                  {selectedDrugs.length === 0 && "No drugs selected"}
                </p>
              </div>
            )}
          </div>
          
          {/* IC50 Values Table */}
          <div className="space-y-3">
            {variantData.ic50_values.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{result.drug}</div>
                  <div className="text-sm text-gray-500">
                    IC50: {result.ic50?.toFixed(2) || 'N/A'} nM (WT: {result.ic50_wt?.toFixed(2) || 'N/A'} nM)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{result.fold_change?.toFixed(1) || 'N/A'}×</div>
                  <div className="text-xs text-gray-500">fold change</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Structure */}
      {variantData.pdb_structure && (
        <div className="card mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">3D Structure</h2>
            <div className="text-sm text-gray-500">
              PDB: {variantData.pdb_structure.pdb_id} | Chain: {variantData.pdb_structure.chain}
            </div>
          </div>
          <StructureViewer structure={variantData.pdb_structure} />
        </div>
      )}

      {/* Dose-Response Plots */}
      {variantData.plots && variantData.plots.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Dose-Response Curves</h2>
          <div className="plots-gallery">
            {variantData.plots.map((plot, index) => (
              <div key={index} className="plot-card">
                <img
                  src={plot.plot_url}
                  alt={`Dose-response curve for ${plot.drug}`}
                  className="plot-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'
                  }}
                />
                <div className="plot-info">
                  <div className="plot-title">{plot.drug}</div>
                  <div className="plot-meta">Dose-response curve</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links and Downloads */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
        <div className="flex flex-wrap gap-3">
          {variantData.publication_doi && (
            <a
              href={`https://doi.org/${variantData.publication_doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <ExternalLink size={16} />
              View Publication
            </a>
          )}
          <button className="btn btn-secondary">
            <Download size={16} />
            Download Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default VariantCard