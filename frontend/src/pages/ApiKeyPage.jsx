import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'

export default function ApiKeyPage() {
  const [keys, setKeys] = useState([
    { id: 1, name: 'Main Project', token: 'wth_live_5f3k29x8m10pqr7z2v5n', created: '2026-04-10' },
    { id: 2, name: 'Development', token: 'wth_live_a7b2c9d1e4f5g6h7i8j9', created: '2026-04-15' }
  ])
  const [copiedId, setCopiedId] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setIsLoaded(true)
  }, [])

  const currentPlan = {
    name: "Starter Plan",
    limit: 1000,
    used: 750,
    today: 124,
    rateLimit: "10 ครั้ง / นาที",
    canExport: false
  }

  const history = [40, 65, 30, 85, 45, 90, 60]

  const recentRequests = [
    { id: 1, method: 'GET', endpoint: '/v2/current?province=Bangkok', status: 200, time: '2 นาทีที่แล้ว' },
    { id: 2, method: 'GET', endpoint: '/v2/current?province=Chiang%20Mai', status: 200, time: '15 นาทีที่แล้ว' },
    { id: 3, method: 'GET', endpoint: '/v2/current?province=Phuket', status: 429, time: '1 ชั่วโมงที่แล้ว' },
    { id: 4, method: 'GET', endpoint: '/v2/current?province=Khon%20Kaen', status: 200, time: '3 ชั่วโมงที่แล้ว' },
    { id: 5, method: 'GET', endpoint: '/v2/current?province=Chonburi', status: 200, time: '5 ชั่วโมงที่แล้ว' }
  ]

  const handleCopy = (token, id) => {
    navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const generateKey = () => {
    if (keys.length >= 3) {
      alert("แพ็กเกจ Starter จำกัดสูงสุด 3 กุญแจ")
      return
    }
    const newId = Date.now()
    const randomToken = "wth_live_" + Math.random().toString(36).substring(2, 15)
    setKeys([...keys, { id: newId, name: `กุญแจที่ ${keys.length + 1}`, token: randomToken, created: new Date().toISOString().split('T')[0] }])
  }

  const removeKey = (id) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบกุญแจนี้? โปรแกรมที่ใช้กุญแจนี้จะหยุดทำงานทันที")) {
      setKeys(keys.filter(k => k.id !== id))
    }
  }

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
      {isLoggedIn ? <LoginNavbar /> : <Navbar />}
      <main className="max-w-7xl mx-auto p-8">
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
                      <h3 className="text-white font-bold text-lg">{item.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">สร้างเมื่อ: {item.created}</p>
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
                      {item.token}
                    </div>
                    <button 
                      onClick={() => handleCopy(item.token, item.id)}
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
                  title={!currentPlan.canExport ? "สงวนสิทธิ์สำหรับแพ็กเกจ Silver ขึ้นไป" : ""}
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
                    {recentRequests.map((req) => (
                      <tr key={req.id} className="border-b border-slate-800/50 group hover:bg-white/5">
                        <td className="py-4 px-2 font-black text-blue-400">{req.method}</td>
                        <td className="py-4 font-mono text-xs text-slate-300">{req.endpoint}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black ${req.status === 200 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {req.status === 429 ? '429 (LIMIT)' : req.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-500 text-xs">{req.time}</td>
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
                  <span className="flex items-center gap-1">🔑 กุญแจ: {keys.length} / 3</span>
                  <span className="flex items-center gap-1">⚡ ความเร็ว: {currentPlan.rateLimit}</span>
                </div>
                <div className="text-right text-[10px] text-blue-200/70 font-bold">
                  รีเซ็ตใน 12 วัน
                </div>

              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">กราฟ 7 วันย้อนหลัง</h2>
              <div className="h-40 flex items-end gap-2 px-2">
                {history.map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-blue-600/20 group-hover:bg-blue-600/40 border-t-2 border-blue-500 transition-all rounded-t-lg" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">วันที่ {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}