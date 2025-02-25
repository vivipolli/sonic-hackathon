import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Web3AuthProvider, useWeb3Auth } from "@web3auth/modal-react-hooks";

import './App.css'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { HabitsPage } from './pages/HabitsPage'
import Login from './pages/Login'
import web3AuthContextConfig from "./web3authContext";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isConnected, isLoading } = useWeb3Auth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isConnected) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const { isConnected } = useWeb3Auth();

  return (
    <Router>
      {isConnected && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute>
            <HabitsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <AppContent />
    </Web3AuthProvider>
  )
}

export default App
