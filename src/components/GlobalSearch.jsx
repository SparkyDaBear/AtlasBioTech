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
    fetch(`/AtlasBioTech/data/v1.0/search_index.json`)
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
          url: `/protein/${gene.symbol}`
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
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'var(--dark-surface)',
          border: '1px solid var(--primary-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 50,
          maxHeight: '384px',
          overflowY: 'auto'
        }}>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: index < suggestions.length - 1 ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--dark-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.125rem' }}>{getTypeIcon(suggestion.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text-on-dark)', marginBottom: '2px' }}>{suggestion.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-on-dark-secondary)' }}>{suggestion.subtitle}</div>
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--primary-color)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600'
              }}>
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