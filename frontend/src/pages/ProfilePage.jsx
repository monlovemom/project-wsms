import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LoginNavbar from '../components/LoginNavbar'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [allPlans, setAllPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/login')
          return
        }

        const userRes = await fetch('/api/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (!userRes.ok) {
          if (userRes.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            navigate('/login')
            return
          }
          throw new Error('Failed to fetch profile')
        }
        const userData = await userRes.json()
        setUser(userData)

        const plansRes = await fetch('/api/plans')
        if (plansRes.ok) {
          const plansData = await plansRes.json()
          setAllPlans(plansData.plans || [])
        }

        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const formatThaiDate = (dateString) => {
    const date = new Date(dateString)
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
  }

  const handleCancelPlan = async () => {
    if(!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกแพ็กเกจปัจจุบัน? สิทธิพิเศษของคุณจะกลับไปเป็นแพ็กเกจฟรีทันที")) return;
    
    setIsProcessing(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/plan', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: 1 })
      });

      if (response.ok) {
        const data = await response.json();
        alert("ยกเลิกแพ็กเกจเรียบร้อยแล้ว คุณกำลังใช้งานแพ็กเกจ Free");
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        alert("เกิดข้อผิดพลาดในการยกเลิกแพ็กเกจ");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsProcessing(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-[#020617]"><LoginNavbar /><div className="pt-24 text-center text-white">Loading...</div></div>
  if (error) return <div className="min-h-screen bg-[#020617]"><LoginNavbar /><div className="pt-24 text-center text-red-500">{error}</div></div>
  if (!user) return null

  const currentPlanData = allPlans.find(p => p.plan_name.toLowerCase() === user.plan_name.toLowerCase());
  const isFreePlan = user.plan_name.toLowerCase() === 'free';

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
      <LoginNavbar />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-32">
        <div className="space-y-6 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter">{user.username}</h1>
            </div>
            <button onClick={handleLogout} className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95">
              Logout
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-full text-sm font-bold uppercase tracking-wide">
              {user.plan_name} PLAN
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
            <div className="space-y-3">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Email Address</p>
              <p className="text-2xl font-black text-white break-all">{user.email}</p>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all group">
            <div className="space-y-3">
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Member Since</p>
              <p className="text-2xl font-black text-white">{formatThaiDate(user.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden shadow-2xl mt-12">
          <h2 className="text-2xl font-black text-white mb-6 border-b border-slate-800 pb-4">สิทธิพิเศษแพ็กเกจ</h2>
          
          {currentPlanData ? (
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b border-slate-800/50 pb-3">
                <span className="text-slate-400">แพ็กเกจปัจจุบัน</span>
                <span className="font-bold text-cyan-400 uppercase">{currentPlanData.plan_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-3">
                <span className="text-slate-400">โควตารายเดือน</span>
                <span className="font-bold text-white">{currentPlanData.req_per_month === -1 ? 'ไม่จำกัด (Unlimited)' : `${currentPlanData.req_per_month.toLocaleString()} ครั้ง`}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-3">
                <span className="text-slate-400">ความเร็วการเรียก API</span>
                <span className="font-bold text-white">{currentPlanData.req_per_minute} ครั้ง / นาที</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-3">
                <span className="text-slate-400">การส่งออกข้อมูล (Export)</span>
                <span className="font-bold text-white">{currentPlanData.has_data_export ? '✅ รองรับ' : '❌ ไม่รองรับ'}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-slate-400">ระดับการช่วยเหลือ (Support)</span>
                <span className="font-bold text-white">{currentPlanData.support_level}</span>
              </div>
            </div>
          ) : (
             <div className="text-slate-500 mb-8">กำลังดึงข้อมูลแพ็กเกจ...</div>
          )}

          <div className="flex gap-4">
            {isFreePlan ? (
              <Link to="/pricing" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all w-full text-center">
                อัปเกรดแพ็กเกจ
              </Link>
            ) : (
              <>
                <button onClick={handleCancelPlan} disabled={isProcessing} className="bg-slate-800 hover:bg-red-900/50 text-red-400 border border-red-900/30 px-6 py-3 rounded-xl font-bold transition-all flex-1">
                  {isProcessing ? "กำลังดำเนินการ..." : "ยกเลิกแพ็กเกจ"}
                </button>
                <Link to="/pricing" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex-1 text-center">
                  เปลี่ยนแพ็กเกจ
                </Link>
              </>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}