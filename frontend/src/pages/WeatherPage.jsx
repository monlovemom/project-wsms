import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ThailandMap from '../components/ThailandMap'
import Navbar from '../components/Navbar'
import { provinces } from '../data/provinces'

export default function WeatherPage() {
  const [lang, setLang] = useState("th")
  const [unit, setUnit] = useState("C")
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [currentTime, setCurrentTime] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasTested, setHasTested] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString(lang === "th" ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [lang])

  useEffect(() => {
    if (weatherData) {
      const p = provinces.find(item => item.en === weatherData.rawName)
      if (p) {
        updateWeatherData(p[lang], p.en)
      }
    }
  }, [lang])

  const convertTemp = (tempC) => {
    if (unit === "F") {
      return Math.round((tempC * 9 / 5) + 32)
    }
    return tempC
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.length > 0) {
      const filtered = provinces.filter(p => p[lang].toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered.slice(0, 5))
    } else { setSuggestions([]) }
  }

  const handleSelect = (p) => {
    setSearchTerm(p[lang]); setSuggestions([]); setHasTested(false);
    updateWeatherData(p[lang], p.en)
  }

  const updateWeatherData = (displayName, rawName) => {
    const p = provinces.find(item => item.en === rawName)
    if (!p) return
    const conditionsTH = ["ท้องฟ้าโปร่ง", "มีเมฆบางส่วน", "ฝนตกเล็กน้อย", "เมฆมาก"]
    const conditionsEN = ["Clear Sky", "Partly Cloudy", "Light Rain", "Cloudy"]
    const icons = ["☀️", "⛅", "🌦️", "☁️"]
    setWeatherData({
      name: displayName,
      rawName: p.en,
      temp: p.baseTemp,
      condition: lang === "th" ? conditionsTH[p.condIdx] : conditionsEN[p.condIdx],
      icon: icons[p.condIdx],
      high: p.baseTemp + 2,
      low: p.baseTemp - 2
    })
  }

  const runDemoTest = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setHasTested(true)
      setIsProcessing(false)
    }, 600)
  }

  const displayData = weatherData ? {
    ...weatherData,
    temp: convertTemp(weatherData.temp),
    high: convertTemp(weatherData.high),
    low: convertTemp(weatherData.low),
    unit: unit
  } : null

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 flex gap-6">
        <div className="w-2/3 space-y-4">
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex gap-4 items-center relative shadow-2xl">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder={lang === "th" ? "ค้นหาจังหวัด..." : "Search province..."}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white"
                value={searchTerm}
                onChange={handleSearch}
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-[120] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {suggestions.map(p => (
                    <li key={p.id} className="p-3 hover:bg-blue-600 cursor-pointer border-b border-slate-700 last:border-none" onClick={() => handleSelect(p)}>{p[lang]}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1">
              <div className="flex bg-black/20 rounded-lg p-1">
                <button onClick={() => setLang("th")} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${lang === "th" ? "bg-blue-600 text-white" : "text-slate-500"}`}>TH</button>
                <button onClick={() => setLang("en")} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${lang === "en" ? "bg-blue-600 text-white" : "text-slate-500"}`}>EN</button>
              </div>
              <div className="flex bg-black/20 rounded-lg p-1">
                <button onClick={() => setUnit("C")} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${unit === "C" ? "bg-cyan-600 text-white" : "text-slate-500"}`}>°C</button>
                <button onClick={() => setUnit("F")} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${unit === "F" ? "bg-cyan-600 text-white" : "text-slate-500"}`}>°F</button>
              </div>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-4 min-h-[700px] relative shadow-2xl">
            <ThailandMap onSelectProvince={(name, raw) => { setHasTested(false); updateWeatherData(name, raw); }} currentWeather={weatherData} lang={lang} />
          </div>
        </div>
        <div className="w-1/3 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-2xl relative border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">{lang === "th" ? "ระดับ: เริ่มต้น" : "Starter Plan"}</h2>
                <p className="text-blue-200 text-[10px] uppercase font-bold tracking-widest mt-1">{lang === "th" ? "พร้อมใช้งานฟรี" : "Available for Free"}</p>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-tighter">
                {lang === "th" ? "โหมดทดสอบ" : "API Demo Mode"}
              </div>
            </div>
            <Link
              to="/apikey"
              className="block w-full text-center py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black text-white transition-all border border-white/10"
            >
              {lang === "th" ? "ไปจัดการ API Key ของฉัน" : "MANAGE MY API KEY"}
            </Link>
          </div>
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl min-h-[400px] flex flex-col justify-between">
            {displayData ? (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white">{displayData.name}</h3>
                    <p className="text-slate-500 font-mono text-xs">{currentTime} - {lang === "th" ? "ข้อมูลปัจจุบัน" : "CURRENT API"}</p>
                  </div>
                  {hasTested && <span className="text-6xl">{displayData.icon}</span>}
                </div>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-7xl font-black text-white">{displayData.temp}°</span>
                  <span className="text-2xl text-slate-500 font-bold mb-2">{displayData.unit}</span>
                </div>
                {hasTested && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <p className="text-xl font-bold text-white mb-4">{displayData.condition}</p>
                    <div className="grid grid-cols-2 gap-3 mb-6 text-white font-mono text-sm">
                      <span>{lang === "th" ? "สูงสุด" : "High"}: {displayData.high}°{displayData.unit}</span>
                      <span>{lang === "th" ? "ต่ำสุด" : "Low"}: {displayData.low}°{displayData.unit}</span>
                    </div>
                  </div>
                )}
                <button onClick={runDemoTest} disabled={isProcessing || hasTested} className={`w-full py-4 rounded-2xl font-black text-white transition-all ${hasTested ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg active:scale-95'}`}>
                  {isProcessing ? (lang === "th" ? "กำลังประมวลผล..." : "PROCESSING...") : hasTested ? (lang === "th" ? "✓ ปลดล็อกข้อมูลแล้ว" : "✓ DATA UNLOCKED") : (lang === "th" ? "จำลองการเรียก API" : "RUN CURRENT TEST")}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <p className="font-medium text-center">{lang === "th" ? "เลือกจังหวัดบนแผนที่เพื่อจำลองการเรียก API" : "Select a province on the map to simulate API request"}</p>
              </div>
            )}
          </div>
          {hasTested && (
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-inner animate-in slide-in-from-bottom-6">
              <div className="mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Endpoint URL</span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl text-[10px] font-mono text-blue-300 break-all mb-4 border border-white/5 uppercase leading-relaxed">
                {`GET /v2/current?province=${displayData.rawName}&unit=${unit.toLowerCase()}&key=wth_live_...`}
              </div>
              <pre className="bg-black/40 p-4 rounded-xl text-[10px] font-mono text-green-400 h-40 overflow-y-auto border border-white/5 thin-scrollbar uppercase">
                {JSON.stringify({ status: "success", data: displayData }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}