import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
      setIsLoaded(true)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            })

            // ตรวจสอบ response status ก่อน
            if (!response.ok) {
                try {
                    const errorData = await response.json()
                    setError(errorData.error || 'Login failed')
                } catch (e) {
                    // ถ้า Backend ส่ง error ที่ไม่ใช่ JSON format
                    setError(`Login failed (Status: ${response.status})`)
                }
                setLoading(false)
                return
            }

            // Parse response JSON
            let data
            try {
                data = await response.json()
            } catch (e) {
                setError('Invalid response from server')
                setLoading(false)
                return
            }

            // เก็บ Token ลงใน localStorage
            if (data.token) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                setLoading(false)
                navigate('/')
            } else {
                setError('No token received from server')
                setLoading(false)
            }
        } catch (err) {
            setError(err.message || 'An error occurred during login')
            setLoading(false)
        }
    }

    if (!isLoaded) return null

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
            {isLoggedIn ? <LoginNavbar /> : <Navbar />}
            <main className="flex flex-col items-center justify-center px-6 py-20">
                <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
                    <div className="text-center space-y-6 mb-10">
                        <h1 className="text-3xl font-black tracking-tight">Login</h1>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="text-left space-y-2">
                                <label className="text-sm font-bold text-slate-400 ml-1">Username/Email</label>
                                <input
                                    type="text"
                                    placeholder="Username/email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-bold text-slate-400">Password</label>
                                    <Link to="/forgot" className="text-xs text-blue-400 hover:text-blue-300">Forgot?</Link>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95 mt-4"
                            >
                                {loading ? 'LOGGING IN...' : 'LOGIN'}
                            </button>
                        </form>
                        <p className="mt-8 text-center text-sm font-medium">
                            <span className="text-slate-500">Don't have an account </span>
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}