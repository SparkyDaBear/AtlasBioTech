import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

const GlobalSearch = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchIndex, setSearchIndex] = useState(null)
  const inputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    // Load search index
    fetch(`${import.meta.env.BASE_URL}data/v1.0/search_index.json`)
      .then(res => res.json())
      .then(data => setSearchIndex(data))
      .catch(err => console.error('Error loading search index:', err))
  }, [])

  const handleSearch = (searchQuery) => {
    if (!searchIndex || !searchQuery.trim()) {
      setSuggestions([])
      return
    }

    const query = searchQuery.toLowerCase()
    const results = []

    // Search genes
    searchIndex.genes.forEach(gene => {
      if (gene.symbol.toLowerCase().includes(query) || 
          gene.name.toLowerCase().includes(query)) {
        results.push({
          type: 'gene',
          id: gene.symbol,
          title: gene.symbol,
          subtitle: gene.name,
          url: `/variant/${gene.symbol}/WT`
        })
      }
    })

    // Search drugs
    searchIndex.drugs.forEach(drug => {
      if (drug.name.toLowerCase().includes(query) ||
          (drug.synonyms && drug.synonyms.some(syn => syn.toLowerCase().includes(query)))) {
        results.push({
          type: 'drug',
          id: drug.name,
          title: drug.name,
          subtitle: `FDA Status: ${drug.fda_status}`,
          url: `/drugs?filter=${encodeURIComponent(drug.name)}`
        })
      }
    })

    // Search variants
    searchIndex.variants.forEach(variant => {
      if (variant.gene.toLowerCase().includes(query) ||
          variant.variant_string.toLowerCase().includes(query) ||
          variant.protein_change.toLowerCase().includes(query)) {
        results.push({
          type: 'variant',
          id: `${variant.gene}_${variant.variant_string}`,
          title: `${variant.gene} ${variant.variant_string}`,
          subtitle: variant.protein_change,
          url: `/variant/${variant.gene}/${encodeURIComponent(variant.variant_string)}`
        })
      }
    })

    setSuggestions(results.slice(0, 10)) // Limit to 10 results
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    handleSearch(value)
  }

  const handleSuggestionClick = (suggestion) => {
    navigate(suggestion.url)
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0])
    }
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current.focus()
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'gene': return '🧬'
      case 'drug': return '💊'
      case 'variant': return '🔬'
      default: return '🔍'
    }
  }

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="search-icon" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search genes (EGFR), variants (p.L858R), or drugs (Imatinib)..."
          className="search-input"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{suggestion.title}</div>
                <div className="text-sm text-gray-500">{suggestion.subtitle}</div>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                {suggestion.type}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close suggestions */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default GlobalSearch