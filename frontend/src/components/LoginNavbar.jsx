import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function LoginNavbar() {
  // State สำหรับเก็บข้อมูลผู้ใช้
  const [user, setUser] = useState(null)
  // State สำหรับตรวจสอบว่า component ได้โหลดแล้ว (ป้องกัน hydration mismatch)
  const [isLoaded, setIsLoaded] = useState(false)

  // useEffect ตรวจสอบ localStorage เพื่อดึงข้อมูลผู้ใช้ที่ล็อกอิน
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        // Parse JSON ข้อมูลผู้ใช้จาก localStorage
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse user data:', error)
        setUser(null)
      }
    }

    setIsLoaded(true)
  }, [])

  return (
    <nav className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
    
    {/* 1. ส่วน Logo: ให้ชิดซ้าย */}
    <div className="flex items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-xl">☁️</span>
        </div>
        <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          WeatherTH API
        </span>
      </Link>
    </div>

    {/* 2. ส่วน Menu: ใช้ absolute เพื่อบังคับให้อยู่กึ่งกลางหน้าจอเสมอ */}
    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-bold text-slate-400">
      <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
      <Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
      <Link to="/apikey" className="hover:text-blue-400 transition-colors">API Key</Link>
      <Link to="/api-demo" className="hover:text-blue-400 transition-colors">API Demo</Link>
      <Link to="/docs" className="hover:text-blue-400 transition-colors">Documentation</Link>
    </div>

    {/* 3. ส่วนฝั่งขวา: User หรือ ปุ่ม Login */}
    <div className="flex items-center gap-4">
      {isLoaded && user ? (
        <Link 
          to="/profile"
          className="text-white hover:text-red-400 font-bold transition-colors"
        >
          {user.username}
        </Link>
      ) : (
        /* กรณีไม่ได้ login ให้แสดงแบบรูปขวาที่คุณต้องการ */
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-400 hover:text-white font-bold text-sm">Login</Link>
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all">
            Get Started
          </Link>
        </div>
      )}
    </div>

  </div>
</nav>
  )
}