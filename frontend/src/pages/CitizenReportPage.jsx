import React, { useState } from "react";
import { AlertCircle, Send, Sparkles, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";
import { useNavigate } from "react-router-dom";

function CitizenReportPage() {
    const { addNewIncident, setSelectedIncident } = useEmergency();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        type: "Flood",
        title: "",
        description: "",
        locationName: "Subhanpura Krishna Temple, Vadodara",
        severity: 4
    });

    const [submittedIncident, setSubmittedIncident] = useState(null);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const created = addNewIncident(form);
        setSubmittedIncident(created);
    };

    return (
        <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
                <span className="brand-badge" style={{ marginBottom: '8px', display: 'inline-block' }}>Citizen Emergency Portal</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '4px 0 8px' }}>
                    Report an Emergency Incident
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Your report is instantly analyzed by ResQGrid AI for severity classification, duplicate matching, and nearest resource recommendation.
                </p>
            </div>

            {submittedIncident ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', width: '60px', height: '60px', borderRadius: '50%', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                        Emergency Report Received!
                    </h2>
                    <div style={{ fontSize: '0.88rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 700 }}>
                        Incident ID: {submittedIncident.id}
                    </div>

                    <div style={{ margin: '20px 0', background: '#0f172a', padding: '16px', borderRadius: '10px', textAlign: 'left', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                            <Sparkles size={16} />
                            <span>Instant AI Analysis Results:</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                            {submittedIncident.aiSummary}
                        </p>
                        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                            ✓ Operators notified. Nearest rescue units evaluated for immediate dispatch.
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={() => setSubmittedIncident(null)}
                            style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Report Another Emergency
                        </button>
                        <button
                            onClick={() => {
                                setSelectedIncident(submittedIncident);
                                navigate("/");
                            }}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            View on Live Command Center Map
                        </button>
                    </div>
                </div>
            ) : (
                <form className="card" onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '8px' }}>
                            Emergency Category
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            {[
                                { type: "Flood", label: "🌊 Flood", color: "#3b82f6" },
                                { type: "Fire", label: "🔥 Fire", color: "#ef4444" },
                                { type: "Hazardous", label: "☣️ Gas Leak", color: "#a855f7" },
                                { type: "Accident", label: "🚗 Crash", color: "#f97316" },
                                { type: "Medical", label: "🚑 Medical", color: "#10b981" }
                            ].map((item) => (
                                <button
                                    type="button"
                                    key={item.type}
                                    onClick={() => setForm({ ...form, type: item.type })}
                                    style={{
                                        background: form.type === item.type ? item.color : '#0f172a',
                                        color: '#fff',
                                        border: `1px solid ${form.type === item.type ? item.color : '#1e293b'}`,
                                        padding: '12px 10px',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        textAlign: 'center'
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                            What is happening? (Headline)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Water rapidly rising, families trapped on rooftops"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                background: '#0b1120',
                                border: '1px solid #1e293b',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                            Location Address / Landmarks
                        </label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#ef4444' }} />
                            <input
                                type="text"
                                placeholder="Enter street, landmark or village name..."
                                value={form.locationName}
                                onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px 14px 10px 36px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                            Description & Special Requirements
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe trapped people, injuries, fire intensity, or needed equipment..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                background: '#0b1120',
                                border: '1px solid #1e293b',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(59,130,246,0.3)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.82rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={20} style={{ color: '#a855f7' }} />
                        <span>AI Duplicate Detection active: Multiple citizen reports for the same incident will automatically consolidate into one operational picture.</span>
                    </div>

                    <button
                        type="submit"
                        className="btn-report-emergency"
                        style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '10px' }}
                    >
                        <Send size={18} />
                        <span>Submit Emergency Report Now</span>
                    </button>
                </form>
            )}
        </div>
    );
}

export default CitizenReportPage;
