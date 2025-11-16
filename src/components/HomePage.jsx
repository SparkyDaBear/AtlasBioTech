import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Database, Microscope } from 'lucide-react'
import GlobalSearch from './GlobalSearch'

const HomePage = () => {
  const [stats, setStats] = useState({
    total_genes: 0,
    total_drugs: 0,
    total_variants: 0
  })

  useEffect(() => {
    // Load search index to get stats
    fetch('/data/v1.0/search_index.json')
      .then(res => res.json())
      .then(data => setStats(data.stats))
      .catch(err => console.error('Error loading stats:', err))
  }, [])

  const features = [
    {
      icon: Search,
      title: 'Global Search',
      description: 'Search by gene symbol, variant notation (e.g., EGFR p.L858R), or drug name',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'IC50 Analysis',
      description: 'View dose-response curves, IC50 values, and drug resistance patterns',
      color: 'text-green-600'
    },
    {
      icon: Microscope,
      title: '3D Structures',
      description: 'Explore protein structures with mutation highlighting using Mol* viewer',
      color: 'text-purple-600'
    },
    {
      icon: Database,
      title: 'Comprehensive Data',
      description: 'FDA approved drugs, variants, and mutational resistance profiles',
      color: 'text-orange-600'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Mutation Database Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Interactive platform for querying mutational data, viewing IC50 summaries, 
          and exploring 3D protein structures for drug resistance variants
        </p>
        
        <GlobalSearch />
      </div>

      {/* Stats Section */}
      <div className="grid grid-3 gap-6 mb-12">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {stats.total_genes.toLocaleString()}
          </div>
          <div className="text-gray-600">Genes</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {stats.total_drugs.toLocaleString()}
          </div>
          <div className="text-gray-600">Drugs</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {stats.total_variants.toLocaleString()}
          </div>
          <div className="text-gray-600">Variants</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-2 gap-8 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="card">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-gray-100 ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Quick Actions
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/drugs" className="btn btn-primary">
            Browse FDA Approved Drugs
          </Link>
          <Link to="/compare" className="btn btn-secondary">
            Compare Variants
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage