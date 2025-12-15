import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import Calculator from './pages/Calculator'
import BankStatement from './pages/BankStatement'
import AIChat from './pages/AIChat'
import Config from './pages/Config'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/bank-statement" element={<BankStatement />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/config" element={<Config />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App

