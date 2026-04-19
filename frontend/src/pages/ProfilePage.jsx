import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginNavbar from '../components/LoginNavbar'

export default function ProfilePage() {
  // State สำหรับเก็บข้อมูลโปรไฟล์ของผู้ใช้
  const [user, setUser] = useState(null)
  // State สำหรับจัดการสถานะการโหลดข้อมูล
  const [loading, setLoading] = useState(true)
  // State สำหรับแสดงข้อผิดพลาด
  const [error, setError] = useState('')
  // Hook สำหรับนำทางผู้ใช้ไปหน้าอื่นๆ
  const navigate = useNavigate()

  // useEffect ดึงข้อมูลโปรไฟล์จาก API เมื่อ Component ถูกเรียกใช้งาน
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ดึง Token จาก localStorage
        const token = localStorage.getItem('token')

        // ถ้าไม่มี Token ให้ Redirect ไปหน้า Login
        if (!token) {
          navigate('/login')
          return
        }

        // ทำการ request ไปยัง API /api/me พร้อมส่ง Authorization Header
        const response = await fetch('/api/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // ส่ง Token ใน Header Authorization โดยใช้รูปแบบ "Bearer <token>"
            'Authorization': `Bearer ${token}`,
          },
        })

        // ตรวจสอบสถานะ Response
        // ถ้า Response ไม่สำเร็จ (ไม่ใช่ 2xx) ให้จัดการข้อผิดพลาด
        if (!response.ok) {
          // ถ้าเป็นข้อผิดพลาด 401 (Unauthorized) หรือ Token หมดอายุ ให้ Redirect ไปหน้า Login
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
            return
          }

          // ดึงข้อมูล error จาก response body
          try {
            const errorData = await response.json()
            setError(errorData.error || 'Failed to fetch profile')
          } catch (e) {
            setError(`Failed to fetch profile (Status: ${response.status})`)
          }
          setLoading(false)
          return
        }

        // Parse JSON data จาก response
        const data = await response.json()

        // เก็บข้อมูลผู้ใช้ใน State
        setUser(data)
        setLoading(false)
      } catch (err) {
        // จัดการข้อผิดพลาดในการ fetch
        setError(err.message || 'An error occurred while fetching profile')
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  // ฟังก์ชัน Logout ลบค่าจาก localStorage และนำผู้ใช้กลับไปหน้า Login
  const handleLogout = () => {
    // ลบ Token และข้อมูลผู้ใช้จาก localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // นำทางไปหน้า Login
    navigate('/login')
  }

  // ฟังก์ชันสำหรับแปลง ISO datetime เป็นรูปแบบวันที่ไทย
  // เช่น 2025-03-20T10:30:00Z เป็น "20 มีนาคม 2568"
  const formatThaiDate = (dateString) => {
    const date = new Date(dateString)

    // ชื่อเดือนภาษาไทย (มีนาคม, เมษายน, ...)
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    // ดึงวันที่, เดือน, และปี
    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    // ปี พุทธศักราช = ปี คริสต์ศักราช + 543
    const year = date.getFullYear() + 543

    return `${day} ${month} ${year}`
  }

  // ถ้าข้อมูลยังกำลังโหลด ให้แสดง Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
        <LoginNavbar />
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  // ถ้ามีข้อผิดพลาด ให้แสดงข้อความ Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
        <LoginNavbar />
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="text-center space-y-6">
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-6 rounded-2xl max-w-md mx-auto">
              <p className="font-semibold">{error}</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all"
            >
              Back to Login
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ถ้าไม่มีข้อมูลผู้ใช้ ให้แสดงข้อความไม่พบ
  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
        <LoginNavbar />
        <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 flex items-center justify-center">
          <p className="text-slate-400">User data not found</p>
        </main>
      </div>
    )
  }

  // ส่วน UI หลักของ ProfilePage
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
      <LoginNavbar />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32">
        {/* ส่วนบน (Header): แสดงชื่อ Username ตัวใหญ่และ Badge ของ Role/Plan */}
        <div className="space-y-6 mb-12">
          {/* ส่วนที่ 1: ชื่อ Username และ Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* ชื่อ Username แบบตัวใหญ่ */}
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
                {user.username}
              </h1>

              
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 hover:-translate-y-1 active:scale-95"
            >
              Logout
            </button>
          </div>

          {/* ส่วนที่ 2: Badges สำหรับ Plan */}
          <div className="flex flex-wrap gap-3">
            {/* Badge Plan Name */}
            <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-full text-sm font-bold uppercase tracking-wide">
              {user.plan_name}
            </div>
          </div>
        </div>

        {/* ส่วนข้อมูล (Information Grid): แสดง Email และวันที่สมัคร */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Email */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
            <div className="space-y-3">
              {/* Label ของ Field */}
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Email Address</p>
              {/* Value */}
              <p className="text-2xl font-black text-white break-all">{user.email}</p>
            </div>
          </div>

          {/* Card: วันที่สมัคร */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
            <div className="space-y-3">
              {/* Label ของ Field */}
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Member Since</p>
              {/* Value: วันที่ฟอร์แมตเป็นไทย */}
              <p className="text-2xl font-black text-white">{formatThaiDate(user.created_at)}</p>
            </div>
          </div>

          {/* Card: Account Status Detail */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
            <div className="space-y-3">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Account Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-2xl font-black text-white">
                  {user.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
