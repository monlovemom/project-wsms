import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'

const API_BASE_URL = 'http://localhost:8080/api'

const normalizeApiKeys = (payload) => {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.api_keys)) return payload.api_keys
  return []
}

const normalizeRecentRequests = (payload) => {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  return []
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('th-TH')
}

const formatTimeAgo = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  const diffMS = Date.now() - date.getTime()
  if (diffMS < 0) return '-'

  const minutes = Math.floor(diffMS / 60000)
  if (minutes < 1) return 'เมื่อสักครู่'
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`

  const days = Math.floor(hours / 24)
  return `${days} วันที่แล้ว`
}

export default function ApiKeyPage() {
  const [keys, setKeys] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Dashboard data from API
  const [quotaData, setQuotaData] = useState(null)
  const [userPlan, setUserPlan] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])

  // Fetch data from backend
  const fetchData = async (token) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch API Keys
      const keysRes = await fetch(`${API_BASE_URL}/api-key`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (keysRes.ok) {
        const keysData = await keysRes.json()
        setKeys(normalizeApiKeys(keysData))
      }

      // Fetch Usage Quota
      const quotaRes = await fetch(`${API_BASE_URL}/usage-quota`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (quotaRes.ok) {
        const quota = await quotaRes.json()
        setQuotaData(quota)
      } else {
        setQuotaData(null)
      }

      // Fetch User Info (for plan details)
      const userRes = await fetch(`${API_BASE_URL}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (userRes.ok) {
        const user = await userRes.json()
        setUserPlan(user)
      }

      // Fetch recent API usage logs
      const recentRes = await fetch(`${API_BASE_URL}/usage-recent?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (recentRes.ok) {
        const recentData = await recentRes.json()
        setRecentRequests(normalizeRecentRequests(recentData))
      } else {
        setRecentRequests([])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setIsLoaded(true)
    
    if (token) {
      fetchData(token)
    }
  }, [])

  // Compute current plan data
  const currentPlan = {
    name: userPlan?.plan_name || "Starter Plan",
    limit: userPlan?.req_per_month || 1000,
    used: quotaData?.used_this_month || 0,
    today: quotaData?.used_today || 0,
    rateLimit: userPlan?.req_per_minute ? `${userPlan.req_per_minute} ครั้ง / นาที` : "10 ครั้ง / นาที",
    canExport: userPlan?.plan_id >= 2 // Plan ID 2+ = Silver/Premium
  }

  const usagePercent = currentPlan.limit > 0
    ? Math.min(100, Math.round((currentPlan.used / currentPlan.limit) * 100))
    : 0

  const donutRadius = 58
  const donutStroke = 12
  const donutCircumference = 2 * Math.PI * donutRadius
  const donutOffset = donutCircumference * (1 - usagePercent / 100)

  const handleCopy = (token, id) => {
    navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const generateKey = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('กรุณาเข้าสู่ระบบ')
      return
    }

    if (keys.length >= 5) {
      setError('สร้างได้สูงสุด 5 กุญแจ')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `กุญแจที่ ${keys.length + 1}`
        })
      })

      if (response.ok) {
        const newKey = await response.json()
        setKeys(prev => [...prev, newKey])
        setError(null)
      } else {
        setError('ไม่สามารถสร้างกุญแจได้')
      }
    } catch (err) {
      console.error('Error creating key:', err)
      setError('เกิดข้อผิดพลาด')
    }
  }

  const removeKey = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกุญแจนี้? โปรแกรมที่ใช้กุญแจนี้จะหยุดทำงานทันที")) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setError('กรุณาเข้าสู่ระบบ')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api-key/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setKeys(prev => prev.filter(k => k.id !== id))
        setError(null)
      } else {
        setError('ไม่สามารถลบกุญแจได้')
      }
    } catch (err) {
      console.error('Error deleting key:', err)
      setError('เกิดข้อผิดพลาด')
    }
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
      {isLoggedIn ? <LoginNavbar /> : <Navbar />}
      <main className="max-w-7xl mx-auto p-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-400">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {!loading && (
          <>
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">จัดการ API Key</h1>
            <p className="text-slate-500 font-medium">ดูสถิติการใช้งานและจัดการรหัสผ่าน (Token) ของคุณ</p>
          </div>
          <button 
            onClick={generateKey}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            + สร้างกุญแจใหม่
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ใช้งานวันนี้</p>
                <h3 className="text-3xl font-black text-white">{currentPlan.today} <span className="text-sm text-slate-500 font-medium">ครั้ง</span></h3>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">เครดิตคงเหลือ (ทุกกุญแจรวมกัน)</p>
                <h3 className="text-3xl font-black text-blue-400">{currentPlan.limit - currentPlan.used} <span className="text-sm text-slate-500 font-medium">ครั้ง</span></h3>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white px-2">กุญแจที่ใช้งานอยู่</h2>
              {keys.map((item) => (
                <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 shadow-xl group transition-all hover:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{item.name || `กุญแจ #${item.id}`}</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">สร้างเมื่อ: {formatDate(item.created_at || item.created)}</p>
                    </div>
                    <button 
                      onClick={() => removeKey(item.id)}
                      className="text-slate-600 hover:text-red-500 transition-colors text-xs font-black uppercase tracking-widest"
                    >
                      ลบกุญแจ
                    </button>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex-grow bg-black/40 border border-slate-700 p-4 rounded-2xl font-mono text-xs text-blue-400 break-all select-all">
                      {item.key || item.token}
                    </div>
                    <button 
                      onClick={() => handleCopy(item.key || item.token || '', item.id)}
                      className={`px-6 py-4 rounded-2xl font-black text-xs transition-all whitespace-nowrap ${copiedId === item.id ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {copiedId === item.id ? "ก๊อปปี้แล้ว" : "คัดลอก"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">ประวัติการใช้งานล่าสุด</h2>
                <button 
                  className={`text-xs font-bold px-4 py-2 rounded-lg border ${currentPlan.canExport ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-slate-700 text-slate-600 cursor-not-allowed'}`}
                  title={!currentPlan.canExport ? "สงวนสิทธิ์สำหรับแพ็กเกจ Pro ขึ้นไป" : ""}
                >
                  📥 Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
                      <th className="pb-4 px-2">Method</th>
                      <th className="pb-4">Endpoint</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">เวลา</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {recentRequests.length === 0 && (
                      <tr>
                        <td className="py-6 px-2 text-slate-500" colSpan={4}>ยังไม่มีประวัติการใช้งาน</td>
                      </tr>
                    )}
                    {recentRequests.map((req) => (
                      <tr key={req.id} className="border-b border-slate-800/50 group hover:bg-white/5">
                        <td className="py-4 px-2 font-black text-blue-400">{req.method || '-'}</td>
                        <td className="py-4 font-mono text-xs text-slate-300">{req.endpoint || '-'}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black ${req.status_code >= 200 && req.status_code < 300 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {req.status_code === 429 ? '429 (LIMIT)' : (req.status_code || '-')}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-500 text-xs">{formatTimeAgo(req.requested_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 shadow-2xl border border-white/10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">{currentPlan.name}</h3>
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mt-1">โควตารวม (Shared Quota)</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🎁</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-blue-100 uppercase tracking-widest">
                  <span>ใช้งานไปแล้ว</span>
                  <span>{currentPlan.used} / {currentPlan.limit} ครั้ง</span>
                </div>
                <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] transition-all duration-1000" 
                    style={{ width: `${(currentPlan.used / currentPlan.limit) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-[10px] text-blue-200 font-bold mt-4 pt-4 border-t border-blue-400/20">
                  <span className="flex items-center gap-1">🔑 กุญแจ: {keys.length} / 5</span>
                  <span className="flex items-center gap-1">⚡ ความเร็ว: {currentPlan.rateLimit}</span>
                </div>
                <div className="text-right text-[10px] text-blue-200/70 font-bold">
                  รีเซ็ตใน 12 วัน
                </div>

              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">การใช้งานโควตาเดือนนี้</h2>
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      fill="none"
                      stroke="rgba(59, 130, 246, 0.2)"
                      strokeWidth={donutStroke}
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth={donutStroke}
                      strokeLinecap="round"
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={donutOffset}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white leading-none">{usagePercent}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Used</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-semibold">
                  ใช้ไปแล้ว {currentPlan.used} จาก {currentPlan.limit} ครั้ง
                </p>
              </div>
            </div>
          </aside>
        </div>
          </>
        )}
      </main>
    </div>
  )
}