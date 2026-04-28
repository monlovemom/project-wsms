import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'

const baseUrl = 'http://localhost:8080'

const endpoints = [
  {
    path: '/api/public/weather',
    description: 'ดึงข้อมูลอากาศแบบสาธารณะด้วยชื่อจังหวัด (จำกัดการยิงต่อ IP)',
    example: `${baseUrl}/api/public/weather?province=Bangkok&lang=th`,
    auth: 'public',
  },
  {
    path: '/api/weather',
    description: 'ดึงข้อมูลอากาศแบบเต็ม (ต้องใช้ x-api-key)',
    example: `${baseUrl}/api/weather?province=กรุงเทพมหานคร&lang=th`,
    auth: 'api-key',
  },
  {
    path: '/api/provinces',
    description: 'ดึงรายชื่อจังหวัดที่รองรับเพื่อใช้ทำ autocomplete หรือ dropdown',
    example: `${baseUrl}/api/provinces`,
    auth: 'public',
  },
  {
    path: '/api/api-key',
    description: 'ดู API Key ของผู้ใช้ที่ล็อกอินแล้ว',
    example: `${baseUrl}/api/api-key`,
    auth: 'bearer',
  },
  {
    path: '/api/usage-quota',
    description: 'ตรวจสอบโควตาการใช้งานของบัญชี',
    example: `${baseUrl}/api/usage-quota`,
    auth: 'bearer',
  },
]

const codeSamples = {
  publicCurl: `curl -X GET "${baseUrl}/api/public/weather?province=Bangkok&lang=th"`,
  keyCurl: `curl -H "x-api-key: YOUR_KEY" "${baseUrl}/api/weather?province=กรุงเทพมหานคร&lang=th"`,
  js: `const res = await fetch('/api/public/weather?province=Bangkok&lang=th')
const data = await res.json()
console.log(data)`,
}

export default function DocsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setIsLoaded(true)
  }, [])

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      {isLoggedIn ? <LoginNavbar /> : <Navbar />}

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-20 space-y-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/70 px-6 py-10 md:px-10 md:py-14 shadow-2xl shadow-blue-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.16),_transparent_32%)]" />
          <div className="relative max-w-3xl space-y-6">
            <p className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Documentation
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
              คู่มือใช้งาน WeatherTH API
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-slate-400 max-w-2xl">
              หน้านี้สรุปวิธีเริ่มต้น, endpoint สำคัญ, ตัวอย่าง request และจุดที่ต้องรู้ก่อนเอา API ไปต่อกับโปรเจกต์จริง
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/apikey" className="inline-flex justify-center rounded-2xl bg-blue-600 px-6 py-3 font-black text-white transition-all hover:bg-blue-500 active:scale-95">
                ไปที่ API Key
              </Link>
              <Link to="/api-demo" className="inline-flex justify-center rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-3 font-black text-slate-100 transition-all hover:border-cyan-500/40 hover:bg-slate-900 active:scale-95">
                เปิด API Demo
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Base URL', value: baseUrl, desc: 'ใช้เป็นรากของทุก request ในเครื่อง local' },
            { title: 'Auth', value: 'Bearer token', desc: 'บาง endpoint ต้องส่ง token ผ่าน Authorization header' },
            { title: 'Format', value: 'JSON', desc: 'response ส่วนใหญ่คืนข้อมูลในรูปแบบ JSON' },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-black/10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.title}</p>
              <h2 className="mt-3 text-2xl font-black text-white">{item.value}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Getting Started</p>
                <h2 className="mt-2 text-3xl font-black text-white">เริ่มต้นใช้งานใน 3 ขั้น</h2>
              </div>
              <div className="hidden sm:block rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                Ready to call
              </div>
            </div>

            <ol className="space-y-4">
              {[
                'สร้างบัญชีและเข้าใช้งานเพื่อรับ token',
                'เปิดหน้า API Key เพื่อสร้างหรือจัดการกุญแจ',
                'เรียก endpoint /api/public/weather ด้วย province ที่ต้องการ',
              ].map((step, index) => (
                <li key={step} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-black text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-slate-300">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Quick Example</p>
            <h2 className="mt-2 text-3xl font-black text-white">ตัวอย่าง request</h2>

            <div className="mt-6 space-y-4">
              <div>
                <p className="mb-2 text-sm font-bold text-slate-400">cURL (Public)</p>
                <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-black/40 p-4 text-sm text-cyan-200">
                  <code>{codeSamples.publicCurl}</code>
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-slate-400">cURL (API Key)</p>
                <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-black/40 p-4 text-sm text-blue-200">
                  <code>{codeSamples.keyCurl}</code>
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-slate-400">JavaScript</p>
                <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-black/40 p-4 text-sm text-green-300">
                  <code>{codeSamples.js}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Endpoints</p>
              <h2 className="mt-2 text-3xl font-black text-white">Endpoint สำคัญ</h2>
            </div>
            <p className="text-sm text-slate-500">บาง endpoint ใช้งานได้เฉพาะบัญชีที่ล็อกอิน</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.6fr_1.4fr] gap-0 border-b border-slate-800 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              <div className="px-5 py-4">Endpoint</div>
              <div className="px-5 py-4 border-x border-slate-800">รายละเอียด</div>
              <div className="px-5 py-4">ตัวอย่าง URL</div>
            </div>
            {endpoints.map((item) => (
              <div key={item.path} className="grid grid-cols-1 md:grid-cols-[0.9fr_1.6fr_1.4fr] border-b border-slate-800 last:border-b-0">
                <div className="px-5 py-5">
                  <p className="text-sm font-black text-white">{item.path}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {item.auth === 'public' && 'Public'}
                    {item.auth === 'api-key' && 'x-api-key required'}
                    {item.auth === 'bearer' && 'Bearer token required'}
                  </p>
                </div>
                <div className="px-5 py-5 border-x border-slate-800 text-sm text-slate-400">
                  {item.description}
                </div>
                <div className="px-5 py-5">
                  <code className="text-xs text-cyan-200 break-all">{item.example}</code>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}