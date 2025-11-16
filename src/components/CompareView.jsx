import React, { useState } from 'react'
import { Plus, X, GitCompare } from 'lucide-react'
import GlobalSearch from './GlobalSearch'

const CompareView = () => {
  const [selectedVariants, setSelectedVariants] = useState([])
  const [isAddingVariant, setIsAddingVariant] = useState(false)

  const addVariant = (variant) => {
    if (selectedVariants.length < 4 && !selectedVariants.find(v => v.id === variant.id)) {
      setSelectedVariants([...selectedVariants, variant])
    }
    setIsAddingVariant(false)
  }

  const removeVariant = (variantId) => {
    setSelectedVariants(selectedVariants.filter(v => v.id !== variantId))
  }

  // Mock comparison data
  const getComparisonData = (variant) => {
    const mockData = {
      ic50_values: [
        { drug: 'Imatinib', ic50: Math.random() * 1000 + 100, fold_change: Math.random() * 50 + 5 },
        { drug: 'Dasatinib', ic50: Math.random() * 50 + 5, fold_change: Math.random() * 25 + 2 },
        { drug: 'Nilotinib', ic50: Math.random() * 80 + 10, fold_change: Math.random() * 30 + 3 }
      ]
    }
    return mockData
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Compare Variants
        </h1>
        <p className="text-gray-600 mb-6">
          Compare IC50 values and resistance profiles across multiple variants.
        </p>
      </div>

      {/* Add Variant Section */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Selected Variants</h2>
          {selectedVariants.length < 4 && (
            <button
              onClick={() => setIsAddingVariant(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add Variant
            </button>
          )}
        </div>

        {isAddingVariant && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="mb-2 text-sm font-medium text-gray-700">
              Search for a variant to compare:
            </div>
            <GlobalSearch onSelect={addVariant} />
            <button
              onClick={() => setIsAddingVariant(false)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        {selectedVariants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No variants selected. Add variants to start comparing.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedVariants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center gap-2 bg-primary text-white px-3 py-1 rounded-full"
              >
                <span className="text-sm font-medium">{variant.title}</span>
                <button
                  onClick={() => removeVariant(variant.id)}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {selectedVariants.length >= 2 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <GitCompare size={20} />
            <h2 className="text-xl font-semibold">Comparison Results</h2>
          </div>

          <div className="compare-container">
            {selectedVariants.map((variant) => {
              const comparisonData = getComparisonData(variant)
              return (
                <div key={variant.id} className="variant-comparison">
                  <h3 className="text-lg font-semibold mb-3">{variant.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{variant.subtitle}</p>
                  
                  <div className="space-y-3">
                    {comparisonData.ic50_values.map((result, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{result.drug}</div>
                          <div className="text-sm text-gray-500">
                            IC50: {result.ic50.toFixed(1)} nM
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{result.fold_change.toFixed(1)}×</div>
                          <div className="text-xs text-gray-500">fold change</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div>Average resistance: {(
                        comparisonData.ic50_values.reduce((sum, r) => sum + r.fold_change, 0) / 
                        comparisonData.ic50_values.length
                      ).toFixed(1)}× fold change</div>
                      <div className="mt-1">
                        Most resistant to: {comparisonData.ic50_values.reduce((max, r) => 
                          r.fold_change > max.fold_change ? r : max
                        ).drug}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Table */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Summary Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-2 font-medium">Drug</th>
                    {selectedVariants.map(variant => (
                      <th key={variant.id} className="text-left p-2 font-medium">
                        {variant.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Imatinib', 'Dasatinib', 'Nilotinib'].map(drug => (
                    <tr key={drug} className="border-b border-gray-100">
                      <td className="p-2 font-medium">{drug}</td>
                      {selectedVariants.map(variant => {
                        const data = getComparisonData(variant)
                        const drugData = data.ic50_values.find(d => d.drug === drug)
                        return (
                          <td key={variant.id} className="p-2">
                            <div>{drugData?.fold_change.toFixed(1)}× fold change</div>
                            <div className="text-xs text-gray-500">
                              IC50: {drugData?.ic50.toFixed(1)} nM
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompareView