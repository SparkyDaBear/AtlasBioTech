import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Database } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Search },
    { name: 'Drug Table', href: '/drugs', icon: Database },
  ]

  return (
    <div className="app">
      <header style={{
        background: 'var(--gradient-dark)',
        boxShadow: 'var(--shadow-lg)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
      }}>
        <div style={{ width: '100%', padding: '0 20px' }}>
          <div className="flex justify-between items-center py-5">
            <Link 
              to="/" 
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              style={{ 
                textDecoration: 'none'
              }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}../assets/Atlas_Updated_Logo.webp`}
                alt="Atlas BioTech Logo" 
                style={{ height: '50px', width: 'auto' }}
              />
            </Link>
            
            <nav className="flex gap-3">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      textDecoration: 'none',
                      background: isActive 
                        ? 'var(--gradient-purple)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      color: isActive 
                        ? 'white' 
                        : 'var(--text-on-dark-secondary)',
                      boxShadow: isActive ? 'var(--shadow-lg)' : 'none',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: isActive 
                        ? 'rgba(139, 92, 246, 0.3)' 
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'
                        e.currentTarget.style.color = 'var(--text-on-dark)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.color = 'var(--text-on-dark-secondary)'
                      }
                    }}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer style={{ 
        background: 'var(--dark-surface)',
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        color: 'var(--text-on-dark-secondary)'
      }}>
        <div className="container">
          <div style={{ padding: '60px 0' }}>
            {/* Contact Information */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '40px',
              color: 'var(--text-on-dark)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                marginBottom: '20px',
                color: 'var(--primary-color)'
              }}>
                Atlas Biologics LLC
              </h3>
              <p style={{ marginBottom: '8px', lineHeight: '1.8' }}>
                The Technology Center at Innovation Park
              </p>
              <p style={{ marginBottom: '8px', lineHeight: '1.8' }}>
                200 Innovation Blvd, Suite 260A | State College, PA 16803 | USA
              </p>
              <p style={{ marginBottom: '16px', lineHeight: '1.8' }}>
                (814) 933-8352 | <a href="mailto:info@atlasbio.tech" style={{ 
                  color: 'var(--primary-color)',
                  textDecoration: 'none'
                }}>info@atlasbio.tech</a>
              </p>
              <a 
                href="https://atlasbio.tech/inquiry" 
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  marginTop: '10px',
                  background: 'var(--gradient-purple)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
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
                }}
              >
                CONTACT US
              </a>
            </div>

            {/* Partner Logos */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              flexWrap: 'wrap',
              marginBottom: '40px',
              padding: '20px 0',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <img 
                src={`${import.meta.env.BASE_URL}../assets/NIH_Master_Logo_Vertical_2Color.png`}
                alt="NIH Logo" 
                style={{ height: '60px', width: 'auto', opacity: 0.8 }}
              />
              <img 
                src={`${import.meta.env.BASE_URL}../assets/NSF_Official_logo_Med_Res_600ppi_rectangle.png`}
                alt="NSF Logo" 
                style={{ height: '50px', width: 'auto', opacity: 0.8 }}
              />
              <img 
                src={`${import.meta.env.BASE_URL}../assets/psu-mark-280.png`}
                alt="Penn State Logo" 
                style={{ height: '60px', width: 'auto', opacity: 0.8 }}
              />
              <img 
                src={`${import.meta.env.BASE_URL}../assets/Logo-BFTP_Horizontal-2-color-cropped.png`}
                alt="Ben Franklin Technology Partners Logo" 
                style={{ height: '40px', width: 'auto', opacity: 0.8 }}
              />
            </div>

            {/* Copyright and Legal */}
            <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
              <p style={{ marginBottom: '12px', color: 'var(--text-on-dark)' }}>
                2025 © Atlas Biologics LLC. All Rights Reserved.
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                <a href="https://atlasbio.tech/legal-stuff" style={{ 
                  color: 'var(--text-on-dark-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark-secondary)'}>
                  Legal
                </a>
                <span>|</span>
                <a href="https://atlasbio.tech/terms-and-conditions" style={{ 
                  color: 'var(--text-on-dark-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark-secondary)'}>
                  Terms and Conditions
                </a>
                <span>|</span>
                <a href="https://atlasbio.tech/privacy-policy" style={{ 
                  color: 'var(--text-on-dark-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark-secondary)'}>
                  Privacy Policy
                </a>
              </div>
              <p style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
                Mutation Database Platform - Built by Ian Sitarik, Mesolyte LLC
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout