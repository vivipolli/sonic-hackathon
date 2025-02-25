import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWeb3Auth } from "@web3auth/modal-react-hooks";

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const { isConnected, logout } = useWeb3Auth();

    const isActive = (path) => location.pathname === path

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    return (
        <header className="bg-sky-100 shadow-md">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo e Nome */}
                    <Link to="/" className="flex items-center space-x-2">
                        <svg className="w-8 h-8 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z M12 6V18 M6 12H18" />
                        </svg>
                        <span className="text-xl font-semibold text-sky-800">BehavAI</span>
                    </Link>

                    {/* Menu de Navegação */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`transition-colors ${isActive('/') ? 'text-sky-600' : 'text-sky-800 hover:text-sky-600'}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/habits"
                            className={`transition-colors ${isActive('/habits') ? 'text-sky-600' : 'text-sky-800 hover:text-sky-600'}`}
                        >
                            Habits Tracker
                        </Link>

                        {/* Botão de Logout (visível apenas quando logado) */}
                        {isConnected && (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-white bg-sky-600 hover:bg-sky-700 transition-colors rounded-lg"
                            >
                                Logout
                            </button>
                        )}
                    </div>

                    {/* Menu Mobile (Hamburguer) */}
                    <button
                        className="md:hidden text-sky-800"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Menu Mobile (Dropdown) */}
                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
                    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-lg">
                        <Link
                            to="/"
                            className={`transition-colors ${isActive('/') ? 'text-sky-600' : 'text-sky-800 hover:text-sky-600'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/habits"
                            className={`transition-colors ${isActive('/habits') ? 'text-sky-600' : 'text-sky-800 hover:text-sky-600'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Habits Tracker
                        </Link>
                        <a href="#" className="text-sky-800 hover:text-sky-600 transition-colors">Especialidades</a>
                        <a href="#" className="text-sky-800 hover:text-sky-600 transition-colors">Contato</a>

                        {/* Botão de Logout no menu mobile (visível apenas quando logado) */}
                        {isConnected && (
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-white bg-sky-600 hover:bg-sky-700 transition-colors rounded-lg"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
} 