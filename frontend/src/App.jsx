import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import WeatherPage from './pages/WeatherPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WeatherPage />} />
        <Route path="/login" element={<div>หน้า Login (รอสร้าง)</div>} />
        <Route path="/admin" element={<div>หน้า Admin (รอสร้าง)</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App