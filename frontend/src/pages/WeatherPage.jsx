import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ThailandMap from '../components/ThailandMap'
import Navbar from '../components/Navbar'

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

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/provinces')
        if (response.ok) {
          const data = await response.json()
          setProvinces(data)
        }
      } catch (error) {
        console.error("API /api/provinces not available yet")
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
      const filtered = provinces.filter(p => p[lang].toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered.slice(0, 5))
    } else { 
      setSuggestions([]) 
    }
  }

  const handleSelect = (displayName, rawName) => {
    setSearchTerm(displayName)
    setSuggestions([])
    setHasTested(false)
    setWeatherData({ name: displayName, rawName: rawName, isPending: true })
  }

  const runDemoTest = async () => {
    if (!weatherData || !weatherData.rawName) return
    setIsProcessing(true)
    const encodedProvince = encodeURIComponent(weatherData.name)

    try {
      const response = await fetch(`/api/public/weather?province=${encodedProvince}`)
      const result = await response.json()
      if (response.ok && result.status === "ok") {
        setWeatherData({
          name: result.province,
          rawName: weatherData.rawName,
          temp: result.data.temperature,
          condition: result.data.condition,
          icon: result.data.icon || "🌡️",
          isPending: false,
          rawData: result
        })
        setHasTested(true)
      } else {
        alert(lang === "th" ? `❌ ไม่พบข้อมูล "${weatherData.name}"` : `❌ Data not found for "${weatherData.name}"`)
      }
    } catch (error) {
      alert(lang === "th" ? "⚠️ เชื่อมต่อ Backend ไม่ได้" : "⚠️ Connection failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const displayData = weatherData ? {
    ...weatherData,
    temp: weatherData.isPending ? "--" : convertTemp(weatherData.temp),
    unit: unit
  } : null

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex gap-4 items-center relative shadow-2xl">
            <div className="flex-grow relative">
              <input type="text" placeholder={lang === "th" ? "ค้นหาจังหวัด..." : "Search province..."} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white" value={searchTerm} onChange={handleSearch} />
              {suggestions.length > 0 && (
                <ul className="absolute z-[120] w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                  {suggestions.map(p => (
                    <li key={p.id} className="p-3 hover:bg-blue-600 cursor-pointer border-b border-slate-700" onClick={() => handleSelect(p[lang], p.en)}>
                      {p[lang]}
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
            <ThailandMap onSelectProvince={(name, raw) => handleSelect(name, raw)} currentWeather={weatherData} lang={lang} provinces={provinces} />
          </div>
        </div>
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 min-h-[400px] flex flex-col justify-between">
            {displayData ? (
              <div className="flex flex-col h-full">
                <h3 className="text-3xl font-black text-white mb-6">{displayData.name}</h3>
                <div className="flex items-end gap-2 mb-8">
                  <span className="text-7xl font-black text-white">{displayData.temp}°</span>
                  <span className="text-2xl text-slate-500 font-bold mb-2">{displayData.unit}</span>
                </div>
                <button onClick={runDemoTest} disabled={isProcessing} className="w-full py-4 rounded-2xl font-black text-white bg-cyan-600 hover:bg-cyan-500">
                  {isProcessing ? "..." : (lang === "th" ? "ทดลองยิง API" : "FETCH API")}
                </button>
              </div>
            ) : (
              <p className="text-center text-slate-600">เลือกจังหวัดบนแผนที่</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}