import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './components/HomePage'
import DrugTable from './components/DrugTable'
import VariantCard from './components/VariantCard'
import ProteinPage from './components/ProteinPage'
import ContactUs from './components/ContactUs'
import Documentation from './components/Documentation'
import './css/App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/protein/:proteinId" element={<ProteinPage />} />
        <Route path="/variant/:gene/:id" element={<VariantCard />} />
        <Route path="/drugs" element={<DrugTable />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/docs" element={<Documentation />} />
      </Routes>
    </Layout>
  )
}

export default App