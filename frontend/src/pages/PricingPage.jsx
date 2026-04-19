import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'
import { useState, useEffect } from "react";
import "../Pricing.css";

export default function PricingPage() {

    const [selected, setSelected] = useState("Pro");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
    }, [])

    const plans = [
        {
            name: "Free",
            price: "฿0",
            desc: "ฟรีตลอด",
            features: [
                "100 requests / วัน",
                "ข้อมูล current weather",
                "Community support",
            ],
            disabled: ["Forecast 7 วัน", "Priority support"],
            button: "เริ่มต้นฟรี",
        },
        {
            name: "Pro",
            price: "฿299",
            desc: "/ เดือน",
            features: [
                "10,000 requests / เดือน",
                "Current + Forecast 7 วัน",
                "Email support",
                "Dashboard analytics",
            ],
            disabled: ["Webhook alerts"],
            button: "สมัครเลย",
        },
        {
            name: "Premium",
            price: "฿999",
            desc: "/ เดือน",
            features: [
                "Unlimited requests",
                "ทุก endpoint",
                "Priority support 24/7",
                "Webhook alerts",
                "SLA 99.99%",
            ],
            disabled: [],
            button: "อัปเกรด",
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
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                onClick={() => setSelected(plan.name)}
                                className={`pricing-card ${selected === plan.name ? "active" : ""
                                    }`}
                            >
                                {plan.name === "Pro" && (
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

                                <button className="pricing-btn">{plan.button}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}