import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Dna, Database } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Search },
    { name: 'Drug Table', href: '/drugs', icon: Database },
  ]

  return (
    <div className="app">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div style={{ width: '100%', padding: '0 20px' }}>
          <div className="flex justify-between items-center py-4">
            <Link 
              to="/" 
              className="flex items-center gap-3 text-2xl font-bold text-white hover:text-blue-100 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              <Dna size={32} className="text-blue-200" />
              <span className="tracking-tight">Atlas BioTech</span>
            </Link>
            
            <nav className="flex gap-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-md'
                        : 'text-white hover:bg-blue-700 hover:shadow-md'
                    }`}
                    style={{ textDecoration: 'none' }}
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

      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container">
          <div className="py-6 text-center text-sm text-gray-600">
            <p>© 2025 Atlas BioTech - Mutation Database Platform</p>
            <p className="mt-1">Built by Ian Sitarik - Mesolyte LLC</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout