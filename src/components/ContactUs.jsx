import React, { useState } from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    newsletter: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, this would send the data to a backend
    console.log('Form submitted:', formData)
    alert('Thank you for your inquiry! We will get back to you soon.')
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      company: '',
      subject: '',
      message: '',
      newsletter: false
    })
  }

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
              Contact Us
            </span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-on-dark-secondary)',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Have questions about our mutation database? Get in touch with our team.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          {/* Contact Information Cards */}
          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--gradient-purple)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Mail size={28} color="white" />
            </div>
            <h3 style={{ color: 'var(--text-on-dark)', marginBottom: '10px', fontSize: '1.25rem', fontWeight: '700' }}>Email</h3>
            <a href="mailto:info@atlasbio.tech" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '1rem' }}>
              info@atlasbio.tech
            </a>
          </div>

          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--gradient-gold)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Phone size={28} color="white" />
            </div>
            <h3 style={{ color: 'var(--text-on-dark)', marginBottom: '10px', fontSize: '1.25rem', fontWeight: '700' }}>Phone</h3>
            <a href="tel:+18149338352" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '1rem' }}>
              (814) 933-8352
            </a>
          </div>

          <div className="card" style={{
            background: 'var(--dark-surface)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--gradient-purple)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <MapPin size={28} color="white" />
            </div>
            <h3 style={{ color: 'var(--text-on-dark)', marginBottom: '10px', fontSize: '1.25rem', fontWeight: '700' }}>Address</h3>
            <p style={{ color: 'var(--text-on-dark-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              The Technology Center at Innovation Park<br />
              200 Innovation Blvd, Suite 260A<br />
              State College, PA 16803, USA
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card" style={{
          background: 'var(--dark-surface)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--text-on-dark)',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Send us a message
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-on-dark)', marginBottom: '8px', fontWeight: '600' }}>
                  First Name <span style={{ color: 'var(--secondary-color)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'var(--dark-elevated)',
                    color: 'var(--text-on-dark)',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-on-dark)', marginBottom: '8px', fontWeight: '600' }}>
                  Last Name <span style={{ color: 'var(--secondary-color)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'var(--dark-elevated)',
                    color: 'var(--text-on-dark)',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-on-dark)', marginBottom: '8px', fontWeight: '600' }}>
                Email <span style={{ color: 'var(--secondary-color)' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'var(--dark-elevated)',
                  color: 'var(--text-on-dark)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-on-dark-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                Sign up for news and updates
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-on-dark)', marginBottom: '8px', fontWeight: '600' }}>
                Company/Organization <span style={{ color: 'var(--secondary-color)' }}>*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'var(--dark-elevated)',
                  color: 'var(--text-on-dark)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-on-dark)', marginBottom: '8px', fontWeight: '600' }}>
                Subject <span style={{ color: 'var(--secondary-color)' }}>*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'var(--dark-elevated)',
                  color: 'var(--text-on-dark)',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', color: 'var(--text-on-dark)', marginBottom: '8px', fontWeight: '600' }}>
                Message <span style={{ color: 'var(--secondary-color)' }}>*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'var(--dark-elevated)',
                  color: 'var(--text-on-dark)',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--gradient-purple)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
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
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactUs
