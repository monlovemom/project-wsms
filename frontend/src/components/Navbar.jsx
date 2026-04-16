import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xl">☁️</span>
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              WeatherTH API
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
          <Link to="/apikey" className="hover:text-blue-400 transition-colors">API Key</Link>
          <Link to="/api-demo" className="hover:text-blue-400 transition-colors">API Demo</Link>
          <Link to="/docs" className="hover:text-blue-400 transition-colors">Documentation</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors px-4">Login</Link>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}