import Navbar from '../components/Navbar'
import LoginNavbar from '../components/LoginNavbar'
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../Pricing.css";

export default function PricingPage() {
    const [plans, setPlans] = useState([]);
    const [selected, setSelected] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        setIsLoggedIn(!!token)
        
        if (userData) {
            try { setUser(JSON.parse(userData)) } catch (e) {}
        }

        fetch('/api/plans')
            .then(res => res.json())
            .then(data => {
                if(data.plans) {
                    setPlans(data.plans);
                    const proPlan = data.plans.find(p => p.plan_name.toLowerCase() === 'pro');
                    if(proPlan) setSelected(proPlan.plan_name);
                }
            })
            .catch(err => console.error("Failed to load plans", err));
    }, [])

    const handleChangePlan = async (planName, planId) => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (user && user.plan_name && user.plan_name.toLowerCase() === planName.toLowerCase()) {
            return;
        }

        if (!confirm(`คุณต้องการเปลี่ยนเป็นแพ็กเกจ ${planName.toUpperCase()} ใช่หรือไม่?`)) return;

        setLoadingPlan(planName);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/plan', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: planId })
            });

            if (response.ok) {
                const data = await response.json();
                alert(`เปลี่ยนเป็นแพ็กเกจ ${planName.toUpperCase()} สำเร็จ!`);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
            } else {
                const errData = await response.json();
                alert(`เกิดข้อผิดพลาด: ${errData.error}`);
            }
        } catch (error) {
            alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setLoadingPlan(null);
        }
    };

    const buildFeaturesList = (plan) => {
        const active = [];
        const disabled = [];
        
        if (plan.req_per_month === -1) {
            active.push("Unlimited requests / เดือน");
        } else if (plan.req_per_month > 1000) {
            active.push(`${plan.req_per_month.toLocaleString()} requests / เดือน`);
        } else {
            active.push(`${plan.req_per_day.toLocaleString()} requests / วัน`);
        }

        active.push(`ความเร็วสูงสุด ${plan.req_per_minute} req/นาที`);
        active.push(`ค้นหาสูงสุด ${plan.req_per_day} ผลลัพธ์`);
        
        if(plan.has_usage_dashboard) active.push("ใช้งาน Dashboard ได้");
        
        if(plan.has_data_export) active.push("Export Data (CSV/JSON)");
        else disabled.push("Export Data (CSV/JSON)");

        active.push(`Support: ${plan.support_level}`);

        if(plan.sla_guarantee !== 'None') active.push(`SLA Guarantee ${plan.sla_guarantee}`);
        else disabled.push("SLA Guarantee");

        return { active, disabled };
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 pb-20">
            {isLoggedIn ? <LoginNavbar /> : <Navbar />}
            <div className="pricing-page">
                <div className="pricing-container mt-12">
                    <h1 className="pricing-title text-4xl font-black mb-2 text-center">เลือกแพ็กเกจที่เหมาะกับคุณ</h1>
                    <p className="pricing-sub text-slate-400 text-center mb-12">เริ่มต้นฟรี อัปเกรดเมื่อพร้อม</p>

                    {plans.length === 0 ? (
                        <div className="text-center text-slate-500 py-20">กำลังโหลดข้อมูลแพ็กเกจ...</div>
                    ) : (
                        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                            {plans.map((plan) => {
                                const isCurrentPlan = user && user.plan_name && user.plan_name.toLowerCase() === plan.plan_name.toLowerCase();
                                const { active, disabled } = buildFeaturesList(plan);
                                const displayName = plan.plan_name.toUpperCase();
                                
                                return (
                                <div
                                    key={plan.id}
                                    onClick={() => setSelected(plan.plan_name)}
                                    className={`pricing-card relative bg-slate-900/50 border p-8 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col ${
                                        selected === plan.plan_name ? "border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transform -translate-y-2" : "border-slate-800 hover:border-slate-600"
                                    }`}
                                >
                                    {plan.plan_name.toLowerCase() === "pro" && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">ยอดนิยม</div>
                                    )}

                                    <h2 className="plan-name text-2xl font-black text-white mb-2">{displayName}</h2>
                                    <div className="price text-5xl font-black text-white mb-2">฿{plan.price}</div>
                                    <div className="desc text-slate-400 text-sm font-medium mb-8 pb-8 border-b border-slate-800">
                                        {plan.price === 0 ? "ฟรีตลอดการใช้งาน" : "/ เดือน"}
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {active.map((f, i) => (
                                            <li key={`a-${i}`} className="active-text flex items-center gap-3 text-sm font-medium text-slate-300"><span className="text-green-500">✔</span> {f}</li>
                                        ))}
                                        {disabled.map((f, i) => (
                                            <li key={`d-${i}`} className="disabled flex items-center gap-3 text-sm font-medium text-slate-600 line-through"><span className="text-slate-700">✖</span> {f}</li>
                                        ))}
                                    </ul>

                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleChangePlan(plan.plan_name, plan.id);
                                        }}
                                        disabled={isCurrentPlan || loadingPlan !== null}
                                        className={`w-full py-4 rounded-xl font-black transition-all ${
                                            isCurrentPlan 
                                                ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default" 
                                                : selected === plan.plan_name
                                                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                                    : "bg-slate-800 hover:bg-slate-700 text-white"
                                        }`}
                                    >
                                        {loadingPlan === plan.plan_name ? "กำลังดำเนินการ..." : isCurrentPlan ? "แพ็กเกจปัจจุบัน" : (plan.price === 0 ? "กลับไปใช้ฟรี" : "สมัครเลย")}
                                    </button>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}