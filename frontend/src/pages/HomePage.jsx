import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setIsLoaded(true)
  }, [])

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
      {isLoggedIn ? <LoginNavbar /> : <Navbar />}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1]">
            RESTFUL <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
              Weather API Thailand
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed">
            ยินดีต้อนรับเข้าสู่ Weather API Thailand
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/apikey" className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-blue-600/20 hover:-translate-y-1 active:scale-95">
              Get API Key
            </Link>
            <Link to="/api-demo" className="w-full sm:w-auto px-10 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black text-lg transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-2">
              <span>▶</span> API Playground
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-32 max-w-4xl mx-auto">
          {[
            { label: "77 Provinces", sub: "Fully Covered", icon: "📍" },
            { label: "99.9%", sub: "Service Uptime", icon: "🛡️" }
          ].map((item, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:border-blue-500/50 transition-all group text-center">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-2xl font-black text-white">{item.label}</h3>
              <p className="text-slate-500 text-sm font-medium">{item.sub}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}