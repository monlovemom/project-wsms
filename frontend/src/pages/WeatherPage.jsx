import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ThailandMap from '../components/ThailandMap'
import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'

export default function WeatherPage() {
  const [lang, setLang] = useState("th")
  const [unit, setUnit] = useState("C")
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [currentTime, setCurrentTime] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasTested, setHasTested] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/provinces')
        if (response.ok) {
          const data = await response.json()
          setProvinces(data)
        }
      } catch (error) {
        console.error("API error")
      }
    }
    fetchProvinces()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString(lang === "th" ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [lang])

  const convertTemp = (tempC) => {
    return unit === "F" ? Math.round((tempC * 9 / 5) + 32) : tempC
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.length > 0 && provinces.length > 0) {
      const filtered = provinces.filter(p => (lang === "th" ? p.name : p.name_en).toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }

  const handleSelect = (nameTH, nameEN) => {
    const displayName = lang === "th" ? nameTH : nameEN
    setSearchTerm(displayName)
    setSuggestions([])
    setHasTested(false)
    setWeatherData({ nameTH, nameEN, isPending: true })
  }

  const runDemoTest = async () => {
    if (!weatherData) return
    setIsProcessing(true)
    const provinceToFetch = lang === "th" ? weatherData.nameTH : weatherData.nameEN
    const encodedProvince = encodeURIComponent(provinceToFetch)

    try {
      const response = await fetch(`/api/public/weather?province=${encodedProvince}&lang=${lang}`)
      const result = await response.json()
      if (response.ok && result.status === "ok") {
        setWeatherData({
          ...weatherData,
          temp: result.data.temperature,
          condition: result.data.condition,
          icon: result.data.icon || "🌡️",
          isPending: false,
          rawData: result
        })
        setHasTested(true)
      } else {
        alert("❌ ไม่พบข้อมูล")
      }
    } catch (error) {
      alert("⚠️ เชื่อมต่อไม่ได้")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (hasTested) {
      runDemoTest()
    }
  }, [lang])

  const displayData = weatherData ? {
    ...weatherData,
    name: lang === "th" ? weatherData.nameTH : weatherData.nameEN,
    temp: weatherData.isPending ? "--" : convertTemp(weatherData.temp),
    high: weatherData.isPending ? "--" : convertTemp(weatherData.temp + 2),
    low: weatherData.isPending ? "--" : convertTemp(weatherData.temp - 3),
    unit: unit
  } : null

  if (!isLoaded) return null

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
      {isLoggedIn ? <LoginNavbar /> : <Navbar />}
      <div className="max-w-7xl mx-auto p-8 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex gap-4 items-center relative shadow-2xl">
            <div className="flex-grow relative">
              <input type="text" placeholder={lang === "th" ? "ค้นหาจังหวัด..." : "Search province..."} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white" value={searchTerm} onChange={handleSearch} />
              {suggestions.length > 0 && (
                <ul className="absolute z-[120] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {suggestions.map(p => (
                    <li key={p.id} className="p-3 hover:bg-blue-600 cursor-pointer border-b border-slate-700" onClick={() => handleSelect(p.name, p.name_en)}>
                      {lang === "th" ? p.name : p.name_en}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1">
              <button onClick={() => setLang("th")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${lang === "th" ? "bg-blue-600 text-white" : "text-slate-500"}`}>TH</button>
              <button onClick={() => setLang("en")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${lang === "en" ? "bg-blue-600 text-white" : "text-slate-500"}`}>EN</button>
              <button onClick={() => setUnit("C")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${unit === "C" ? "bg-cyan-600 text-white" : "text-slate-500"}`}>°C</button>
              <button onClick={() => setUnit("F")} className={`px-3 py-1.5 rounded-md text-xs font-bold ${unit === "F" ? "bg-cyan-600 text-white" : "text-slate-500"}`}>°F</button>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-4 min-h-[700px] relative shadow-2xl">
            <ThailandMap onSelectProvince={(th, en) => handleSelect(th, en)} currentWeather={weatherData} lang={lang} provinces={provinces} />
          </div>
        </div>
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl min-h-[400px] flex flex-col justify-between">
            {displayData ? (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white">{displayData.name}</h3>
                    <p className="text-slate-500 font-mono text-xs">{currentTime}</p>
                  </div>
                  {hasTested && <span className="text-6xl">{displayData.icon}</span>}
                </div>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-7xl font-black text-white">{displayData.temp}°</span>
                  <span className="text-2xl text-slate-500 font-bold mb-2">{displayData.unit}</span>
                </div>
                {hasTested && (
                  <div className="mb-8">
                    <p className="text-xl font-bold text-white mb-6">{displayData.condition}</p>
                    <div className="flex gap-8 text-sm text-slate-400 font-bold">
                      <p>{lang === "th" ? "สูงสุด" : "High"}: <span className="text-white text-base font-normal">{displayData.high}°</span></p>
                      <p>{lang === "th" ? "ต่ำสุด" : "Low"}: <span className="text-white text-base font-normal">{displayData.low}°</span></p>
                    </div>
                  </div>
                )}
                <button onClick={runDemoTest} disabled={isProcessing} className="w-full py-4 rounded-2xl font-black text-white bg-cyan-600 hover:bg-cyan-500 mt-auto">
                  {isProcessing ? "..." : (lang === "th" ? "ทดลองยิง API" : "FETCH API")}
                </button>
              </div>
            ) : (
              <p className="text-center text-slate-600 mt-20">{lang === "th" ? "เลือกจังหวัดบนแผนที่" : "Select a province"}</p>
            )}
          </div>
          {hasTested && weatherData && (
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 animate-in slide-in-from-bottom-4">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">ENDPOINT URL</p>
              <div className="bg-black/40 p-3 rounded-xl text-[10px] font-mono text-blue-300 break-all mb-4 border border-white/5">
                GET /api/public/weather?province={encodeURIComponent(lang === "th" ? weatherData.nameTH : weatherData.nameEN)}&lang={lang}
              </div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">RESPONSE JSON</p>
              <pre className="bg-black/40 p-4 rounded-xl text-[10px] font-mono text-green-400 h-40 overflow-y-auto border border-white/5">
                {JSON.stringify(weatherData.rawData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}