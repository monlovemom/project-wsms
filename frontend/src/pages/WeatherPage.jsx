import { useState, useEffect } from 'react'
import ThailandMap from '../components/ThailandMap'
import { provinces } from '../data/provinces'

export default function WeatherPage() {
  const [lang, setLang] = useState("th")
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [currentTime, setCurrentTime] = useState("")
  const [credits, setCredits] = useState(1000)
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
    const temps = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
    const baseTemp = temps[rawName.length % 8]
    const conditionsTH = ["ท้องฟ้าโปร่ง", "มีเมฆบางส่วน", "ฝนตกเล็กน้อย", "เมฆมาก"]
    const conditionsEN = ["Clear Sky", "Partly Cloudy", "Light Rain", "Cloudy"]
    const idx = rawName.length % 4

    setWeatherData({
      name: displayName,
      rawName: rawName,
      temp: baseTemp,
      condition: lang === "th" ? conditionsTH[idx] : conditionsEN[idx],
      icon: ["☀️", "⛅", "🌦️", "☁️"][idx],
      humidity: 65 + (rawName.length % 10),
      windSpeed: 10 + (rawName.length % 5),
      high: baseTemp + 3,
      low: baseTemp - 2
    })
  }

  const runDemoTest = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setHasTested(true)
      setIsProcessing(false)
    }, 600)
  }

  const handleCopy = () => {
    const url = `https://api.weatherth.com/v2/current?province=${weatherData?.rawName}&key=wth_live_a8f3k29x...`
    navigator.clipboard.writeText(url)
    alert(lang === "th" ? "คัดลอก URL เรียบร้อย!" : "URL Copied!")
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto flex gap-6">
        
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
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button onClick={() => setLang("th")} className={`px-4 py-2 rounded-lg font-bold transition-all ${lang === "th" ? "bg-blue-600 text-white" : "text-slate-500"}`}>TH</button>
              <button onClick={() => setLang("en")} className={`px-4 py-2 rounded-lg font-bold transition-all ${lang === "en" ? "bg-blue-600 text-white" : "text-slate-500"}`}>EN</button>
            </div>
          </div>
          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-4 min-h-[700px] relative shadow-2xl">
            <ThailandMap onSelectProvince={(name, raw) => { setHasTested(false); updateWeatherData(name, raw); }} currentWeather={weatherData} lang={lang} />
          </div>
        </div>

        <div className="w-1/3 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-2xl relative border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">API Credits</h2>
                <p className="text-blue-200 text-[10px] uppercase font-bold tracking-widest mt-1">Current Plan: Basic</p>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono text-white">{credits.toLocaleString()} / 1,000</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] w-full"></div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-2xl min-h-[400px] flex flex-col justify-between">
            {weatherData ? (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white">{weatherData.name}</h3>
                    <p className="text-slate-500 font-mono text-xs">{currentTime} - CURRENT API</p>
                  </div>
                  {hasTested && <span className="text-6xl">{weatherData.icon}</span>}
                </div>

                <div className="flex items-end gap-2 mb-8">
                  <span className="text-7xl font-black text-white">{weatherData.temp}°</span>
                  <span className="text-2xl text-slate-500 font-bold mb-2">C</span>
                </div>

                {hasTested && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <p className="text-xl font-bold text-white mb-4">{weatherData.condition}</p>
                    <div className="grid grid-cols-2 gap-3 mb-6 text-white font-mono text-sm">
                      <span>H: {weatherData.high}°C</span>
                      <span>L: {weatherData.low}°C</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={runDemoTest} 
                  disabled={isProcessing || hasTested} 
                  className={`w-full py-4 rounded-2xl font-black text-white transition-all ${hasTested ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-cyan-600 hover:bg-cyan-500 shadow-lg active:scale-95'}`}
                >
                  {isProcessing ? 'PROCESSING...' : hasTested ? '✓ DATA UNLOCKED' : 'RUN CURRENT TEST'}
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <p className="font-medium text-center">เลือกจังหวัดบนแผนที่<br/>เพื่อจำลองการเรียก API</p>
              </div>
            )}
          </div>

          {hasTested && (
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-inner animate-in slide-in-from-bottom-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Endpoint URL</span>
                <button onClick={handleCopy} className="text-blue-400 text-[10px] font-bold hover:underline">COPY</button>
              </div>
              <div className="bg-black/40 p-3 rounded-xl text-[10px] font-mono text-blue-300 break-all mb-4 border border-white/5 uppercase">
                {`GET /v2/current?province=${weatherData.rawName}&key=wth_live_...`}
              </div>
              <pre className="bg-black/40 p-4 rounded-xl text-[10px] font-mono text-green-400 h-40 overflow-y-auto border border-white/5 thin-scrollbar">
                {JSON.stringify({ status: "success", data: weatherData }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}