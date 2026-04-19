import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
// import WeatherPage from './pages/WeatherPage'
// import ApiKeyPage from './pages/ApiKeyPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import Pricing from "./pages/PricingPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/apikey" element={<ApiKeyPage />} />
        <Route path="/api-demo" element={<WeatherPage />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  )
}

export default App