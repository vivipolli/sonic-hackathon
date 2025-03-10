import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useWeb3Auth } from "@web3auth/modal-react-hooks";
import logo from '../assets/logo.png'

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const { isConnected, logout } = useWeb3Auth();
    const navigate = useNavigate()

    const isActive = (path) => location.pathname === path

    const handleLogout = async () => {
        try {
            if (isConnected) {
                await logout()
            }
            navigate('/login')
        } catch (error) {
            console.error('Error during logout:', error)
        }
    }

    return (
        <header className="bg-sky-100 shadow-md">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="BehavAI Logo" className="w-20 h-16 object-cover" />
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/form"
                            className={`transition-colors ${isActive('/form') ? 'text-[#f06315] font-bold' : 'text-sky-600 hover:text-[#f06315]'}`}
                        >
                            Form
                        </Link>
                        <Link
                            to="/habits"
                            className={`transition-colors ${isActive('/habits') ? 'text-[#f06315] font-bold' : 'text-sky-600 hover:text-[#f06315]'}`}
                        >
                            Interventions
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-white bg-sky-600 hover:bg-sky-700 transition-colors rounded-lg"
                        >
                            Logout
                        </button>
                    </div>

                    <button
                        className="md:hidden text-sky-800"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
                    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-lg">
                        <Link
                            to="/form"
                            className={`transition-colors ${isActive('/form') ? 'text-[#f06315] font-bold' : 'text-sky-800 hover:text-[#f06315]'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Form
                        </Link>
                        <Link
                            to="/habits"
                            className={`transition-colors ${isActive('/habits') ? 'text-[#f06315] font-bold' : 'text-sky-800 hover:text-[#f06315]'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Interventions
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-white bg-sky-600 hover:bg-sky-700 transition-colors rounded-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    )
} 