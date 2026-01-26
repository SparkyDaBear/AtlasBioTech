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
    <div className="card" style={{
      background: 'var(--dark-surface)',
      border: '1px solid var(--primary-color)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: '800', 
        color: 'var(--text-on-dark)', 
        marginBottom: '30px'
      }}>
        Overview
      </h2>
      
      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Clinical Significance */}
        <div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            color: 'var(--primary-color)', 
            marginBottom: '12px'
          }}>
            Clinical Significance
          </h3>
          <p style={{ 
            color: 'var(--text-on-dark-secondary)', 
            fontSize: '1.05rem', 
            lineHeight: '1.8'
          }}>
            {clinical_significance}
          </p>
        </div>

        {/* Description */}
        {description && (
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--primary-color)', 
              marginBottom: '12px'
            }}>
              Description
            </h3>
            <p style={{ 
              color: 'var(--text-on-dark-secondary)', 
              fontSize: '1.05rem', 
              lineHeight: '1.8'
            }}>
              {description}
            </p>
          </div>
        )}

        {/* Function */}
        {functional_description && (
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--primary-color)', 
              marginBottom: '12px'
            }}>
              Function
            </h3>
            <p style={{ 
              color: 'var(--text-on-dark-secondary)', 
              fontSize: '1.05rem', 
              lineHeight: '1.8'
            }}>
              {functional_description}
            </p>
          </div>
        )}

        {/* Structural Domains */}
        {structural_domains.length > 0 && (
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--primary-color)', 
              marginBottom: '15px'
            }}>
              Key Domains
            </h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {structural_domains.slice(0, 3).map((domain, index) => (
                <div 
                  key={index} 
                  style={{
                    borderLeft: '3px solid',
                    borderColor: index % 2 === 0 ? 'var(--primary-color)' : 'var(--secondary-color)',
                    paddingLeft: '15px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    background: 'var(--dark-elevated)',
                    borderRadius: '0 8px 8px 0'
                  }}
                >
                  <h4 style={{ 
                    fontWeight: '600', 
                    color: 'var(--text-on-dark)', 
                    fontSize: '1rem',
                    marginBottom: '4px'
                  }}>
                    {domain.name}
                  </h4>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-on-dark-secondary)'
                  }}>
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
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--primary-color)', 
              marginBottom: '12px'
            }}>
              Drug Resistance
            </h3>
            <p style={{ 
              color: 'var(--text-on-dark-secondary)', 
              fontSize: '1.05rem', 
              lineHeight: '1.8'
            }}>
              {drug_resistance}
            </p>
          </div>
        )}

        {/* Top Therapeutic Agents */}
        {therapeutic_agents.length > 0 && (
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--primary-color)', 
              marginBottom: '15px'
            }}>
              FDA Approved Agents
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {therapeutic_agents.slice(0, 6).map((agent, index) => {
                const agentName = typeof agent === 'string' ? agent : agent.name || agent;
                const fdaUrl = `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=BasicSearch.process&searchterm=${encodeURIComponent(agentName)}`;
                return (
                  <li key={index} style={{ fontSize: '1.05rem' }}>
                    <a 
                      href={fdaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--primary-color)',
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {agentName} ↗
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* External Links */}
        {external_links && Object.keys(external_links).length > 0 && (
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: 'var(--primary-color)', 
              marginBottom: '15px'
            }}>
              External Resources
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Object.entries(external_links).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    background: 'var(--dark-elevated)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: 'var(--primary-color)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}
                >
                  {name} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProteinOverview;