import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GlobalSearch from './GlobalSearch'

const HomePage = () => {
  const [stats, setStats] = useState({
    total_genes: 0,
    total_drugs: 0,
    total_variants: 0
  })

  useEffect(() => {
    // Load search index to get stats
    fetch(`${import.meta.env.BASE_URL}data/v1.0/search_index.json`)
      .then(res => res.json())
      .then(data => setStats(data.stats))
      .catch(err => console.error('Error loading stats:', err))
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'var(--gradient-dark)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        padding: '100px 20px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '30px',
            color: 'var(--text-on-dark)',
            letterSpacing: '-0.02em'
          }}>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              WE BUILD
            </span>
            <span style={{ display: 'block' }}>
              MUTATION LIBRARIES
            </span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.5rem)',
            color: 'var(--text-on-dark-secondary)',
            marginBottom: '50px',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Interactive platform for querying mutational data, viewing IC50 summaries, 
            and exploring 3D protein structures for drug resistance variants
          </p>
          
          <GlobalSearch />
        </div>
      </div>

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        {/* Stats Section */}
        <div className="grid grid-3 gap-6 mb-12">
          <div className="card" style={{
            textAlign: 'center',
            background: 'var(--gradient-purple)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: 'var(--shadow-xl)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 92, 246, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '10px'
            }}>
              {stats.total_genes.toLocaleString()}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>Genes</div>
          </div>
          <div className="card" style={{
            textAlign: 'center',
            background: 'var(--gradient-gold)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: 'var(--shadow-xl)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(245, 158, 11, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '10px'
            }}>
              {stats.total_drugs.toLocaleString()}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>Drugs</div>
          </div>
          <div className="card" style={{
            textAlign: 'center',
            background: 'var(--gradient-purple)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: 'var(--shadow-xl)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 92, 246, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '10px'
            }}>
              {stats.total_variants.toLocaleString()}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>Variants</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{
          textAlign: 'center',
          background: 'var(--dark-surface)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--text-on-dark)',
            marginBottom: '30px'
          }}>
            Get Started
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/protein/BCR-ABL" className="btn btn-primary" style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'var(--gradient-purple)',
              border: 'none',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: 'var(--shadow-lg)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}>
              Explore BCR-ABL
            </Link>
            <Link to="/drugs" className="btn btn-secondary" style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'var(--gradient-gold)',
              border: 'none',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: 'var(--shadow-lg)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
            }}>
              Browse Drug Database
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage