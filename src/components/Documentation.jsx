import React from 'react'
import { Database, TrendingUp, Microscope, FileText, GitBranch, BarChart } from 'lucide-react'

const Documentation = () => {
  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'var(--gradient-dark)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: '900',
            lineHeight: '1.2',
            marginBottom: '20px',
            color: 'var(--text-on-dark)',
            letterSpacing: '-0.02em'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Documentation
            </span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-on-dark-secondary)',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Learn about the data processing pipeline, biological theory, and methodology behind the mutation database platform.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        {/* Overview */}
        <section style={{ marginBottom: '60px' }}>
          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                padding: '12px',
                background: 'var(--gradient-purple)',
                borderRadius: '12px'
              }}>
                <FileText size={32} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-on-dark)', marginBottom: '15px' }}>
                  Overview
                </h2>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                  This platform presents deep mutational scanning (DMS) data for drug resistance mutations in cancer-related proteins. 
                  The data is generated through high-throughput functional assays in BaF3 cells, measuring the proliferation response 
                  to various drug concentrations. Each variant is characterized by its IC50 value, representing the drug concentration 
                  needed to inhibit cell growth by 50%.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Deep Mutational Scanning */}
        <section style={{ marginBottom: '60px' }}>
          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                padding: '12px',
                background: 'var(--gradient-gold)',
                borderRadius: '12px'
              }}>
                <Microscope size={32} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-on-dark)', marginBottom: '15px' }}>
                  Deep Mutational Scanning (DMS)
                </h2>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '20px' }}>
                  Deep mutational scanning is a powerful technique that allows systematic investigation of protein function across 
                  thousands of variants simultaneously. In this study:
                </p>
                <ul style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '12px' }}>
                    <strong style={{ color: 'var(--text-on-dark)' }}>Comprehensive coverage:</strong> Every possible single amino acid substitution 
                    is generated at each position in the target protein
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    <strong style={{ color: 'var(--text-on-dark)' }}>Pooled screening:</strong> All variants are tested simultaneously in a single experiment, 
                    dramatically increasing throughput
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    <strong style={{ color: 'var(--text-on-dark)' }}>Quantitative readout:</strong> Next-generation sequencing quantifies the relative abundance 
                    of each variant under different drug concentrations
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    <strong style={{ color: 'var(--text-on-dark)' }}>Functional context:</strong> Measurements are performed in living cells, capturing the 
                    biological complexity of drug-protein interactions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* IC50 and Dose-Response Curves */}
        <section style={{ marginBottom: '60px' }}>
          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                padding: '12px',
                background: 'var(--gradient-purple)',
                borderRadius: '12px'
              }}>
                <TrendingUp size={32} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-on-dark)', marginBottom: '15px' }}>
                  IC50 and Dose-Response Curves
                </h2>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '20px' }}>
                  The IC50 (half-maximal inhibitory concentration) is the gold standard metric for quantifying drug potency. 
                  It represents the concentration of drug required to inhibit a biological process by 50%.
                </p>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-on-dark)', marginTop: '30px', marginBottom: '15px' }}>
                  4-Parameter Logistic (4PL) Model
                </h3>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '15px' }}>
                  Dose-response curves are fit using the 4PL equation, which models the sigmoidal relationship between drug 
                  concentration and cellular response:
                </p>
                <div style={{
                  background: 'var(--dark-elevated)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  marginBottom: '20px',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  color: 'var(--primary-color)',
                  textAlign: 'center'
                }}>
                  y = d + (a - d) / (1 + (x / c)^b)
                </div>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '10px' }}>
                  Where:
                </p>
                <ul style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-on-dark)' }}>y</strong> = response (cell viability/proliferation)</li>
                  <li style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-on-dark)' }}>x</strong> = drug concentration</li>
                  <li style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-on-dark)' }}>a</strong> = minimum response (lower asymptote)</li>
                  <li style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-on-dark)' }}>d</strong> = maximum response (upper asymptote)</li>
                  <li style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-on-dark)' }}>c</strong> = IC50 value (inflection point)</li>
                  <li style={{ marginBottom: '10px' }}><strong style={{ color: 'var(--text-on-dark)' }}>b</strong> = Hill slope (steepness of curve)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Data Processing Pipeline */}
        <section style={{ marginBottom: '60px' }}>
          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                padding: '12px',
                background: 'var(--gradient-gold)',
                borderRadius: '12px'
              }}>
                <GitBranch size={32} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-on-dark)', marginBottom: '15px' }}>
                  Data Processing Pipeline
                </h2>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '25px' }}>
                  The raw DMS data undergoes a multi-step processing pipeline to generate the final database:
                </p>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                  {[
                    {
                      step: '1',
                      title: 'Data Loading & Validation',
                      description: 'Raw qDMS data is loaded from CSV format and validated for completeness. Missing values are handled appropriately, and data integrity checks are performed.'
                    },
                    {
                      step: '2',
                      title: '4PL Curve Fitting',
                      description: 'For each variant and drug combination, dose-response curves are fit using the lmfit library with the 4-parameter logistic model. The fitting algorithm optimizes parameters to minimize residuals.'
                    },
                    {
                      step: '3',
                      title: 'IC50 Calculation',
                      description: 'IC50 values are extracted from the fitted curves. Quality metrics including R² values and fitting confidence intervals are computed to assess reliability.'
                    },
                    {
                      step: '4',
                      title: 'Heatmap Generation',
                      description: 'Position-wise heatmap data is aggregated to visualize mutational landscapes. Amino acid substitution effects are summarized across the protein sequence.'
                    },
                    {
                      step: '5',
                      title: 'Search Index Construction',
                      description: 'A comprehensive search index is built to enable fast lookups by gene symbol, variant notation, and drug name. Statistics are computed for the overview dashboard.'
                    },
                    {
                      step: '6',
                      title: 'JSON Export',
                      description: 'Individual variant data files are generated in JSON format for efficient web delivery. Each file contains complete dose-response information and metadata.'
                    }
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      gap: '20px',
                      padding: '20px',
                      background: 'var(--dark-elevated)',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: idx % 2 === 0 ? 'var(--gradient-purple)' : 'var(--gradient-gold)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '900',
                        color: 'white',
                        flexShrink: 0
                      }}>
                        {item.step}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-on-dark)', marginBottom: '8px' }}>
                          {item.title}
                        </h3>
                        <p style={{ color: 'var(--text-on-dark-secondary)', lineHeight: '1.7' }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experimental Details */}
        <section style={{ marginBottom: '60px' }}>
          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                padding: '12px',
                background: 'var(--gradient-purple)',
                borderRadius: '12px'
              }}>
                <Database size={32} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-on-dark)', marginBottom: '15px' }}>
                  Experimental Details
                </h2>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-on-dark)', marginTop: '20px', marginBottom: '12px' }}>
                  Cell Line
                </h3>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '20px' }}>
                  <strong style={{ color: 'var(--text-on-dark)' }}>BaF3 cells</strong> are a murine pro-B cell line that requires interleukin-3 (IL-3) 
                  for growth. When transformed with oncogenic kinases like BCR-ABL, they become IL-3 independent, making them an ideal 
                  model system for studying kinase activity and drug sensitivity.
                </p>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-on-dark)', marginTop: '20px', marginBottom: '12px' }}>
                  Drug Concentrations
                </h3>
                <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '15px' }}>
                  Cells are exposed to a range of drug concentrations to capture the full dose-response relationship. 
                  Typical concentrations tested:
                </p>
                <ul style={{ color: 'var(--text-on-dark-secondary)', fontSize: '1.05rem', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>0 nM (control, no drug)</li>
                  <li style={{ marginBottom: '8px' }}>300 nM (low concentration)</li>
                  <li style={{ marginBottom: '8px' }}>600 nM (medium concentration)</li>
                  <li style={{ marginBottom: '8px' }}>1200 nM (high concentration)</li>
                </ul>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-on-dark)', marginTop: '30px', marginBottom: '12px' }}>
                  Data Statistics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  <div style={{
                    padding: '20px',
                    background: 'var(--gradient-purple)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
                      4,923
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                      Variants Tested
                    </div>
                  </div>
                  <div style={{
                    padding: '20px',
                    background: 'var(--gradient-gold)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '8px' }}>
                      39,384
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                      Total Measurements
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technologies Used */}
        <section>
          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '20px' }}>
              <div style={{
                padding: '12px',
                background: 'var(--gradient-gold)',
                borderRadius: '12px'
              }}>
                <BarChart size={32} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-on-dark)', marginBottom: '15px' }}>
                  Technologies & Tools
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '25px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '10px' }}>
                      Backend Pipeline
                    </h3>
                    <ul style={{ color: 'var(--text-on-dark-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                      <li>Python 3.12</li>
                      <li>pandas (data manipulation)</li>
                      <li>numpy (numerical computing)</li>
                      <li>scipy (statistical analysis)</li>
                      <li>lmfit (curve fitting)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary-color)', marginBottom: '10px' }}>
                      Frontend Platform
                    </h3>
                    <ul style={{ color: 'var(--text-on-dark-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                      <li>React 18</li>
                      <li>Vite (build tool)</li>
                      <li>D3.js (visualizations)</li>
                      <li>NGL Viewer (3D structures)</li>
                      <li>AG-Grid (data tables)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Documentation
