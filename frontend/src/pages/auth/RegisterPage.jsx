import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, UserPlus, Lock, Mail, User, Building, Truck, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Citizen",
        unitName: "",
        hospitalId: ""
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        try {
            const registeredUser = await register(form);
            switch (registeredUser.role) {
                case "Citizen":
                    navigate("/report");
                    break;
                case "Response Team":
                    navigate("/resources");
                    break;
                case "Hospital Admin":
                    navigate("/hospitals");
                    break;
                case "Authority Admin":
                    navigate("/analytics");
                    break;
                default:
                    navigate("/");
                    break;
            }
        } catch (err) {
            setErrorMsg(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div className="brand-icon-wrapper" style={{ margin: '0 auto 12px', width: '48px', height: '48px' }}>
                        <ShieldAlert size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                        Create ResQGrid Account
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Register user account with role-based command privileges
                    </p>
                </div>

                {errorMsg && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#f87171',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                            <input 
                                type="text"
                                placeholder="Commander Rajesh Sharma"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px 12px 10px 36px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                            <input 
                                type="email"
                                placeholder="sharma@ndrf.gov.in"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px 12px 10px 36px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Account Role
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            style={{
                                width: '100%',
                                background: '#0b1120',
                                border: '1px solid #1e293b',
                                color: '#fff',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontSize: '0.88rem'
                            }}
                        >
                            <option value="Citizen">📱 Citizen Reporter</option>
                            <option value="Emergency Operator">🚨 Emergency Operator / Dispatcher</option>
                            <option value="Response Team">🚑 Response Team Lead (Field Unit)</option>
                            <option value="Hospital Admin">🏥 Hospital / Facility Admin</option>
                            <option value="Authority Admin">📊 Authority / System Admin</option>
                        </select>
                    </div>

                    {form.role === "Response Team" && (
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                Unit / Squad Name
                            </label>
                            <input 
                                type="text"
                                placeholder="e.g. NDRF Squad 03 - Water Rescue"
                                value={form.unitName}
                                onChange={(e) => setForm({ ...form, unitName: e.target.value })}
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    {form.role === "Hospital Admin" && (
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                Hospital Facility Name
                            </label>
                            <input 
                                type="text"
                                placeholder="e.g. SSG General Hospital & Trauma Center"
                                value={form.hospitalId}
                                onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                            <input 
                                type="password"
                                placeholder="Create secure password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px 12px 10px 36px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '8px'
                        }}
                    >
                        <UserPlus size={18} />
                        <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Already registered?{" "}
                    <Link to="/login" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
