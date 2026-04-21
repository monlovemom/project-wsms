import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'
import { Link } from 'react-router-dom'

export default function ApiKeyPage() {
  const [keys, setKeys] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [plans, setPlans] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    setIsLoggedIn(!!token)
    setIsLoaded(true)

    if (token) {
      if (userData) {
        try { setUser(JSON.parse(userData)) } catch (e) {}
      }

      const headers = { 'Authorization': `Bearer ${token}` }
      
      fetch('/api/me', { headers }).then(res => res.json()).then(data => setUser(data)).catch(() => {})
      
      fetch('/api/dashboard-stats', { headers })
        .then(res => { if(!res.ok) throw new Error(); return res.json(); })
        .then(data => setDashboard(data)).catch(() => {})

      fetch('/api/api-key', { headers })
        .then(res => { if(!res.ok) throw new Error(); return res.json(); })
        .then(data => setKeys(data.api_keys || [])).catch(() => {})

      fetch('/api/plans').then(res => res.json()).then(data => setPlans(data.plans || [])).catch(()=>{})
    }
  }, [])

  const planName = dashboard?.plan_name || user?.plan_name || "Free";
  const planNameUpper = planName.toUpperCase();
  const currentPlanSpec = plans.find(p => p.plan_name.toLowerCase() === planName.toLowerCase());
  
  const isMonthly = dashboard?.req_per_month > 0;
  const isUnlimited = dashboard?.req_per_month === -1;
  
  const limit = isMonthly ? dashboard?.req_per_month : (dashboard?.req_per_day || 0);
  const used = isMonthly ? (dashboard?.used_this_month || 0) : (dashboard?.used_today || 0);
  const remaining = isUnlimited ? "ไม่จำกัด" : Math.max(0, limit - used);
  
  const unitText = isMonthly ? "ต่อเดือน" : "ต่อวัน";

  const handleCopy = (token, id) => {
    navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const generateKey = async () => {
    if (keys.length >= 5) {
      alert("จำกัดสูงสุด 5 กุญแจตามนโยบายระบบ"); return;
    }
    const token = localStorage.getItem('token')
    const response = await fetch('/api/api-key', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `กุญแจที่ ${keys.length + 1}` })
    })
    
    if (response.ok) {
      const newKey = await response.json()
      setKeys([newKey, ...keys])
    }
  }

  const removeKey = async (id) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบกุญแจนี้? โปรแกรมที่ใช้กุญแจนี้จะหยุดทำงานทันที")) {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/api-key/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if (response.ok) setKeys(keys.filter(k => k.id !== id))
    }
  }

  if (!isLoaded) return null
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6">
          <h1 className="text-4xl font-black mb-4">กรุณาล็อกอินก่อนใช้งาน</h1>
          <Link to="/login" className="bg-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all">ไปที่หน้า Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
      <LoginNavbar />
      <main className="max-w-7xl mx-auto p-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">จัดการ API Key</h1>
            <p className="text-slate-500 font-medium">จัดการรหัสผ่าน (Token) สำหรับเข้าถึง API</p>
          </div>
          <button onClick={generateKey} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            + สร้างกุญแจใหม่
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ใช้งานวันนี้</p>
                <h3 className="text-3xl font-black text-white">{dashboard?.used_today || 0} <span className="text-sm text-slate-500 font-medium">ครั้ง</span></h3>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">เครดิตคงเหลือ ({unitText})</p>
                <h3 className="text-3xl font-black text-blue-400">
                    {typeof remaining === 'number' ? remaining.toLocaleString() : remaining} 
                    {typeof remaining === 'number' && <span className="text-sm text-slate-500 font-medium ml-2">ครั้ง</span>}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white px-2">กุญแจที่ใช้งานอยู่ ({keys.length}/5)</h2>
              {keys.length > 0 ? keys.map((item) => (
                <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 shadow-xl group transition-all hover:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{item.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">สร้างเมื่อ: {new Date(item.created_at).toLocaleDateString('th-TH')}</p>
                    </div>
                    <button onClick={() => removeKey(item.id)} className="text-slate-600 hover:text-red-500 transition-colors text-xs font-black uppercase tracking-widest">ลบกุญแจ</button>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex-grow bg-black/40 border border-slate-700 p-4 rounded-2xl font-mono text-xs text-blue-400 break-all select-all">
                      {item.key}
                    </div>
                    <button onClick={() => handleCopy(item.key, item.id)} className={`px-6 py-4 rounded-2xl font-black text-xs transition-all whitespace-nowrap ${copiedId === item.id ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                      {copiedId === item.id ? "ก๊อปปี้แล้ว" : "คัดลอก"}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 border border-dashed border-slate-700 rounded-[2rem]"><p className="text-slate-500">คุณยังไม่มีกุญแจ API</p></div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 shadow-2xl border border-white/10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{planNameUpper} PLAN</h3>
                  <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mt-1">รายละเอียดโควตา</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📊</div>
              </div>
              <div className="space-y-4 text-sm font-medium text-blue-100">
                <div className="flex justify-between border-b border-blue-500/30 pb-2">
                    <span>ใช้ไปแล้ว ({unitText})</span>
                    <span className="text-white font-bold">{used.toLocaleString()} {isUnlimited ? '' : `/ ${limit.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between border-b border-blue-500/30 pb-2">
                    <span>ใช้ไปแล้ว (วันนี้)</span>
                    <span className="text-white font-bold">{dashboard?.used_today || 0} ครั้ง</span>
                </div>
                <div className="flex justify-between border-b border-blue-500/30 pb-2">
                    <span>ความเร็วสูงสุด (Rate Limit)</span>
                    <span className="text-white font-bold">{currentPlanSpec ? `${currentPlanSpec.req_per_minute} ครั้ง/นาที` : '-'}</span>
                </div>
                <div className="flex justify-between pt-2">
                    <span>จำนวนกุญแจ API</span>
                    <span className="text-white font-bold">{keys.length} / 5</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}