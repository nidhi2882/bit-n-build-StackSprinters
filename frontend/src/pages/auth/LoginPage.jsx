import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, LogIn, Lock, Mail, UserCheck } from "lucide-react";
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form);
            navigate("/");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                {/* Logo & Title */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div className="brand-icon-wrapper" style={{ margin: '0 auto 12px', width: '48px', height: '48px' }}>
                        <ShieldAlert size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                        ResQGrid Login
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Emergency Response & Resource Coordination Platform
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Role selector for demo convenience */}
                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Select Access Role
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
                                placeholder="operator@resqgrid.org"
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
                                placeholder="••••••••"
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
                            marginTop: '8px'
                        }}
                    >
                        <LogIn size={18} />
                        <span>{loading ? "Authenticating..." : "Sign In to ResQGrid"}</span>
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>
                        Register Here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
