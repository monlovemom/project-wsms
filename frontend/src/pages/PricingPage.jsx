import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'
import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import "../Pricing.css"

const API_BASE_URL = 'http://localhost:8080/api'

export default function PricingPage() {
    const navigate = useNavigate()
    const [selected, setSelected] = useState("pro")
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [currentPlanKey, setCurrentPlanKey] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)

        const fetchProfilePlan = async () => {
            if (!token) return
            try {
                const response = await fetch(`${API_BASE_URL}/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!response.ok) return
                const user = await response.json()
                const planKey = normalizePlanKey(user.plan_name)
                setCurrentPlanKey(planKey)
                if (planKey) {
                    setSelected(planKey)
                }
            } catch (err) {
                console.error('Failed to load profile plan:', err)
            }
        }

        fetchProfilePlan()
    }, [])

    const normalizePlanKey = (planName) => {
        if (!planName) return null
        const normalized = String(planName).toLowerCase()
        if (normalized === 'free') return 'free'
        if (normalized === 'pro') return 'pro'
        if (normalized === 'enterprise' || normalized === 'premium') return 'enterprise'
        return null
    }

    const getPlanId = (planKey) => {
        if (planKey === 'free') return 1
        if (planKey === 'pro') return 2
        return 3
    }

    const handleSubscribe = async (plan) => {
        setError('')
        setSuccess('')

        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        if (plan.key === currentPlanKey) {
            setSuccess('คุณใช้งานแพ็คเกจนี้อยู่แล้ว')
            return
        }

        const confirmMessage = `ยืนยันสมัครแพ็คเกจ ${plan.name} ใช่หรือไม่?`
        if (!window.confirm(confirmMessage)) {
            return
        }

        try {
            setIsSubmitting(true)
            const response = await fetch(`${API_BASE_URL}/plan`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan_id: getPlanId(plan.key) })
            })

            if (!response.ok) {
                const payload = await response.json().catch(() => null)
                setError(payload?.error || 'ไม่สามารถอัพเดทแพ็คเกจได้')
                return
            }

            const payload = await response.json().catch(() => null)
            setCurrentPlanKey(plan.key)
            setSelected(plan.key)
            if (payload?.user) {
                localStorage.setItem('user', JSON.stringify(payload.user))
            }
            setSuccess('สมัครแพ็คเกจสำเร็จแล้ว')
        } catch (err) {
            console.error('Failed to update plan:', err)
            setError('เกิดข้อผิดพลาดในการสมัครแพ็คเกจ')
        } finally {
            setIsSubmitting(false)
        }
    }

    const plans = [
        {
            key: "free",
            name: "Free",
            price: "฿0",
            desc: "ฟรีตลอด",
            features: [
                "1000 requests / เดือน",
                "ข้อมูล current weather",
                "Community support",
                "Basic Support",
            ],
            disabled: ["Forecast 7 วัน"],
            button: "เริ่มต้นฟรี",
        },
        {
            key: "pro",
            name: "Pro",
            price: "฿299",
            desc: "/ เดือน",
            features: [
                "30,000 requests / เดือน",
                "Current + Forecast 7 วัน",
                "Email support",     
            ],
            disabled: ["Webhook alerts"],
            button: "สมัครเลย",
        },
        {
            key: "enterprise",
            name: "Premium",
            price: "฿599",
            desc: "/ เดือน",
            features: [
                "150,000 requests / เดือน",
                "Priority support 24/7",
                "Webhook alerts",
                "SLA 99.99%",
            ],
            disabled: [],
            button: "สมัครเลย",
        },
    ];

    return (
        <div Navbar={Navbar} className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
            {isLoggedIn ? <LoginNavbar /> : <Navbar />}
            <div className="pricing-page">

                <div className="pricing-container">
                    <h1 className="pricing-title">เลือกแพ็คเกจที่เหมาะกับคุณ</h1>
                    <p className="pricing-sub">เริ่มต้นฟรี อัปเกรดเมื่อพร้อม</p>

                    <div className="pricing-grid">
                        {plans.map((plan) => {
                            const isCurrentPlan = plan.key === currentPlanKey
                            const isLoading = isSubmitting && selected === plan.key

                            return (
                            <div
                                key={plan.key}
                                onClick={() => setSelected(plan.key)}
                                className={`pricing-card ${selected === plan.key ? "active" : ""
                                    }`}
                            >
                                {plan.key === "pro" && (
                                    <div className="badge">ยอดนิยม</div>
                                )}

                                <h2 className="plan-name">{plan.name}</h2>
                                <div className="price">{plan.price}</div>
                                <div className="desc">{plan.desc}</div>

                                <ul>
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="active-text">✔ {f}</li>
                                    ))}
                                    {plan.disabled.map((f, i) => (
                                        <li key={i} className="disabled">✖ {f}</li>
                                    ))}
                                </ul>

                                <button
                                    className={`pricing-btn ${isCurrentPlan ? 'pricing-btn-current' : ''}`}
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        handleSubscribe(plan)
                                    }}
                                    disabled={isSubmitting || isCurrentPlan}
                                >
                                    {isLoading ? 'กำลังดำเนินการ...' : (isCurrentPlan ? 'ใช้งานอยู่' : plan.button)}
                                </button>
                                {isCurrentPlan && (
                                    <div className="current-plan-text">แพ็คเกจที่ใช้งานอยู่</div>
                                )}
                            </div>
                            )
                        })}
                    </div>

                    {error && (
                        <div className="note" role="alert">{error}</div>
                    )}
                    {success && (
                        <div className="note">{success}</div>
                    )}
                </div>
            </div>
        </div>
    );
}