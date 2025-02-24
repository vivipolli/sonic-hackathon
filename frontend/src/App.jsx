import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { HabitsPage } from './pages/HabitsPage'

function App() {

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/habits" element={<HabitsPage />} />
      </Routes>
    </Router>
  )
}

export default App
