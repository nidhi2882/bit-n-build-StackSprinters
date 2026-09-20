import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, LogIn, Lock, Mail, AlertTriangle, Key } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
        role: "Emergency Operator"
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const demoAccounts = [
        { role: "Emergency Operator", label: "🚨 Operator", email: "operator@resqgrid.gov", pass: "operator123" },
        { role: "Authority Admin", label: "📊 Authority", email: "authority@vadodara.gov", pass: "authority123" },
        { role: "Response Team", label: "🚑 NDRF Field", email: "responder@ndrf.gov", pass: "responder123" },
        { role: "Hospital Admin", label: "🏥 Hospital", email: "hospital@ssg.org", pass: "hospital123" },
        { role: "Citizen", label: "📱 Citizen", email: "citizen@resqgrid.org", pass: "citizen123" }
    ];

    const fillDemo = (account) => {
        setForm({
            email: account.email,
            password: account.pass,
            role: account.role
        });
        setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");
        try {
            await login(form);
            navigate("/");
        } catch (err) {
            setErrorMsg(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                {/* Logo & Title */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div className="brand-icon-wrapper" style={{ margin: '0 auto 12px', width: '48px', height: '48px' }}>
                        <ShieldAlert size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                        ResQGrid Secure Login
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Emergency Response & Resource Coordination Platform
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Access Role Scope
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
                            <option value="Emergency Operator">🚨 Emergency Operator / Dispatcher</option>
                            <option value="Citizen">📱 Citizen Reporter</option>
                            <option value="Response Team">🚑 Response Team Lead (Field Unit)</option>
                            <option value="Hospital Admin">🏥 Hospital / Facility Admin</option>
                            <option value="Authority Admin">📊 Authority / System Admin</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                            <input 
                                type="email"
                                placeholder="name@resqgrid.gov"
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
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                            <input 
                                type="password"
                                placeholder="Enter password"
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
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
                            marginTop: '4px'
                        }}
                    >
                        <LogIn size={18} />
                        <span>{loading ? "Authenticating..." : "Sign In with Credentials"}</span>
                    </button>
                </form>

                {/* Seeded credentials helper box */}
                <div style={{
                    marginTop: '24px',
                    padding: '14px',
                    background: '#0b1120',
                    border: '1px solid #1e293b',
                    borderRadius: '10px'
                }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Key size={14} color="#60a5fa" />
                        <span>Quick-Fill Seeded Admin Accounts</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {demoAccounts.map((acc) => (
                            <button
                                key={acc.email}
                                type="button"
                                onClick={() => fillDemo(acc)}
                                style={{
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    color: '#cbd5e1',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {acc.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>
                        Register New Account
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
