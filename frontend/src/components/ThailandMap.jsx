import { useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"

const geoUrl = "https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json"

export default function ThailandMap({ onSelectProvince, currentWeather, lang, provinces }) {
  const [hoverInfo, setHoverInfo] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [selectedID, setSelectedID] = useState(null)

  const getProvinceData = (geo) => {
  const geoName = geo.properties.name || geo.properties.NAME_1;
  const cleanName = geoName.replace(" Metropolis", "").replace("Phra Nakhon Si Ayutthaya", "Ayutthaya");
  
  if (!provinces || provinces.length === 0) return { en: cleanName, th: cleanName };

  const found = provinces.find(p => 
    p.name.toLowerCase() === cleanName.toLowerCase() || 
    (p.name_en && p.name_en.toLowerCase().replace(/\s+/g, '') === cleanName.toLowerCase().replace(/\s+/g, ''))
  );

  return found ? { en: found.name_en, th: found.name } : { en: cleanName, th: cleanName };
}

  return (
    <div className="relative w-full h-full bg-[#0f172a] flex justify-center items-center rounded-2xl overflow-hidden"
         onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 2600, center: [100.9925, 13.5] }}
        className="w-full h-[700px]"
      >
        <ZoomableGroup center={[100.9925, 13.5]} zoom={1} minZoom={1} maxZoom={8}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const data = getProvinceData(geo)
                const isSelected = selectedID === geo.rsmKey || (currentWeather && (data.en === currentWeather.rawName || data.th === currentWeather.name))
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className={`stroke-[#1e293b] stroke-[0.5px] outline-none transition-all duration-300 cursor-pointer ${
                      isSelected ? 'fill-cyan-500' : 'fill-[#1e293b] hover:fill-blue-500'
                    }`}
                    onClick={() => {
                       onSelectProvince(data.th, data.en)
                       setSelectedID(geo.rsmKey)
                    }}
                    onMouseEnter={() => setHoverInfo(lang === 'th' ? data.th : data.en)}
                    onMouseLeave={() => setHoverInfo(null)}
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {hoverInfo && (
        <div className="fixed z-[200] bg-cyan-500 text-white px-3 py-1 rounded-md text-xs font-bold pointer-events-none transform -translate-x-1/2 -translate-y-[120%] shadow-xl"
             style={{ top: mousePos.y, left: mousePos.x }}>
          {hoverInfo}
        </div>
      )}
    </div>
  )
}