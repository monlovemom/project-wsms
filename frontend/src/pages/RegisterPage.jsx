import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // ตรวจสอบว่าข้อมูลไม่ว่าง
        if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
            return setError('กรุณากรอกข้อมูลให้ครบทุกช่อง')
        }

        // ตรวจสอบว่ารหัสผ่านตรงกันไหม
        if (formData.password !== formData.confirmPassword) {
            return setError('รหัสผ่านไม่ตรงกัน')
        }

        // ตรวจสอบความยาวรหัสผ่าน
        if (formData.password.length < 6) {
            return setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
        }

        setLoading(true)

        try {
            // Try proxy path first, then explicit localhost endpoints as fallback.
            const registerEndpoints = ['/register', 'http://localhost/register', 'http://127.0.0.1/register']
            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
            }

            let response = null
            let lastNetworkError = null

            for (const endpoint of registerEndpoints) {
                try {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify(payload),
                    })
                    break
                } catch (networkErr) {
                    lastNetworkError = networkErr
                }
            }

            if (!response) {
                throw new Error(lastNetworkError?.message || 'Failed to connect to backend')
            }

            console.log('📊 Response Status:', response.status)
            console.log('📋 Response Headers:', Object.fromEntries(response.headers))

            const contentType = response.headers.get('content-type')
            let data = {}
            let responseText = ''

            // Parse response body ตามประเภท Content-Type
            if (contentType && contentType.includes('application/json')) {
                data = await response.json()
                console.log('✅ JSON Response:', data)
            } else {
                responseText = await response.text()
                console.log('⚠️ Non-JSON Response (text):', responseText)
                console.log('📌 Content-Type:', contentType)
                data = { error: responseText || `Backend response error (Status: ${response.status})` }
            }

            // ถ้า response ไม่ 2xx (ไม่สำเร็จ)
            if (!response.ok) {
                const errorMsg = data.error || `สมัครสมาชิกล้มเหลว (Status: ${response.status})`
                throw new Error(errorMsg)
            }

            // ✅ สำเร็จ HTTP 201 - แสดง success message และ navigate ไปหน้า Login
            alert('🎉 สมัครสมาชิกสำเร็จ!\nกรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านของคุณ')
            navigate('/login')
        } catch (err) {
            console.error('❌ Register error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
            <Navbar />
            <main className="flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black tracking-tight mb-2">Create Account</h1>
                        <p className="text-slate-400 text-sm">เริ่มต้นใช้งาน WeatherTH API ได้ฟรี</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-xs font-bold text-center">
                            ⚠️ {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-400 ml-1">Username</label>
                            <input
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="ตั้งชื่อผู้ใช้"
                                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-400 ml-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-400 ml-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-400 ml-1">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-[#020617] border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 active:scale-95 mt-4"
                        >
                            {loading ? 'CREATING...' : 'SIGN UP'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    )
}