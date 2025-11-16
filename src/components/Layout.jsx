import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Dna, Database, GitCompare } from 'lucide-react'

const Layout = ({ children }) => {
  const location = useLocation()

  const navigation = [
    { name: 'Home', href: '/', icon: Search },
    { name: 'Drug Table', href: '/drugs', icon: Database },
    { name: 'Compare', href: '/compare', icon: GitCompare },
  ]

  return (
    <div className="app">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <Dna size={28} />
              Atlas BioTech
            </Link>
            
            <nav className="flex gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {children}
        </div>
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