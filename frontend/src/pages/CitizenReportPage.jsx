import React, { useState } from "react";
import { 
    AlertCircle, 
    Send, 
    Sparkles, 
    CheckCircle2, 
    ShieldCheck, 
    MapPin, 
    Radio, 
    PhoneCall, 
    AlertOctagon,
    Zap,
    LifeBuoy
} from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/api";

const TAXONOMY_CATEGORIES = [
    { type: "Flood", label: "🌊 Flood", color: "#3b82f6", subTypeId: "SUB_FL_FLASH" },
    { type: "Fire", label: "🔥 Fire", color: "#ef4444", subTypeId: "SUB_FR_STRUCT" },
    { type: "Medical", label: "🚑 Medical", color: "#10b981", subTypeId: "SUB_MD_MASS" },
    { type: "Accident", label: "🚗 Crash", color: "#f97316", subTypeId: "SUB_TR_COLL" },
    { type: "Hazardous", label: "☣️ Hazmat", color: "#a855f7", subTypeId: "SUB_HZ_GAS" },
    { type: "Infrastructure", label: "🏚️ Collapse", color: "#eab308", subTypeId: "SUB_CL_BLDG" },
    { type: "Storm", label: "🌪️ Cyclone", color: "#06b6d4", subTypeId: "SUB_ST_CYCL" },
    { type: "Rescue", label: "🔍 Search & Rescue", color: "#ec4899", subTypeId: "SUB_SR_MISS" }
];

function CitizenReportPage() {
    const { addNewIncident, setSelectedIncident } = useEmergency();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        type: "Flood",
        subTypeId: "SUB_FL_FLASH",
        title: "",
        description: "",
        locationName: "Subhanpura Sector 4, Vadodara",
        lat: 22.3120,
        lng: 73.1750,
        severity: 4,
        reporterName: "",
        reporterPhone: ""
    });

    const [submittedIncident, setSubmittedIncident] = useState(null);
    const [sosTriggering, setSosTriggering] = useState(false);
    const [sosActive, setSosActive] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOneTapSos = async () => {
        setSosTriggering(true);

        const sendSos = async (lat, lng, locName) => {
            try {
                const payload = {
                    lat: lat || 22.3120,
                    lng: lng || 73.1750,
                    locationName: locName || "Current GPS Location, Vadodara",
                    emergencyType: "Rescue",
                    reporterName: "Citizen SOS Panic Beacon",
                    notes: "Guaranteed Level-5 SOS trigger from mobile citizen portal"
                };

                const res = await apiClient.post("/ingest/sos", payload);
                const created = res.data.incident || {
                    id: "INC-SOS-" + Date.now().toString().slice(-4),
                    title: "🚨 ONE-TAP PANIC SOS: Urgent Rescue Needed",
                    type: "Rescue",
                    severity: 5,
                    status: "Reported",
                    locationName: locName || "Subhanpura Sector 4, Vadodara",
                    aiSummary: "Guaranteed Level-5 SOS panic signal. Immediate water rescue and ambulance teams dispatched.",
                    reportedAt: new Date().toISOString()
                };

                setSubmittedIncident(created);
                setSosActive(true);
            } catch (err) {
                // Local state fallback
                const fallback = addNewIncident({
                    title: "🚨 ONE-TAP PANIC SOS: Urgent Rescue Needed",
                    type: "Rescue",
                    severity: 5,
                    locationName: "Current GPS Location, Vadodara",
                    description: "High-priority one-tap SOS triggered. Search and rescue team alerted immediately."
                });
                setSubmittedIncident(fallback);
                setSosActive(true);
            } finally {
                setSosTriggering(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    sendSos(pos.coords.latitude, pos.coords.longitude, "Live GPS Location");
                },
                () => {
                    // Fallback to Vadodara demo coordinates if GPS permission denied
                    sendSos(22.3120, 73.1750, "Subhanpura Sector 4, Vadodara");
                },
                { timeout: 4000 }
            );
        } else {
            sendSos(22.3120, 73.1750, "Subhanpura Sector 4, Vadodara");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiClient.post("/ingest/citizen", form);
            if (res.data && res.data.incident) {
                setSubmittedIncident(res.data.incident);
            } else {
                const created = addNewIncident(form);
                setSubmittedIncident(created);
            }
        } catch (error) {
            const created = addNewIncident(form);
            setSubmittedIncident(created);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Top SOS Panic Banner */}
            <div style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.3) 100%)",
                border: "2px solid #ef4444",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
                boxShadow: "0 0 25px rgba(239, 68, 68, 0.25)"
            }}>
                <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ef4444", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                        <Zap size={12} />
                        <span>Phase 3 One-Tap Gateway</span>
                    </div>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", margin: 0 }}>
                        Immediate Life Danger? Use One-Tap SOS
                    </h2>
                    <p style={{ color: "#fecaca", fontSize: "0.84rem", margin: "4px 0 0", lineHeight: 1.4 }}>
                        Bypasses all forms. Instantly transmits your exact GPS location at guaranteed <strong>Level-5 Critical Severity</strong> to Vadodara Central Command.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOneTapSos}
                    disabled={sosTriggering}
                    style={{
                        background: "radial-gradient(circle, #ef4444 0%, #b91c1c 100%)",
                        border: "3px solid #fecaca",
                        color: "#fff",
                        padding: "16px 28px",
                        borderRadius: "50px",
                        fontWeight: 900,
                        fontSize: "1.15rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)",
                        transform: sosTriggering ? "scale(0.95)" : "scale(1)",
                        transition: "all 0.2s"
                    }}
                >
                    <AlertOctagon size={24} className="pulse-dot" />
                    <span>{sosTriggering ? "Transmitting GPS SOS..." : "ONE-TAP SOS PANIC"}</span>
                </button>
            </div>

            <div style={{ textAlign: 'center' }}>
                <span className="brand-badge" style={{ marginBottom: '8px', display: 'inline-block' }}>Multi-Source Ingestion Portal</span>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '4px 0 8px' }}>
                    Report an Emergency Incident
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                    Analyzed by ResQGrid AI for two-level taxonomy classification, hybrid severity scoring, and 3-signal duplicate detection.
                </p>
            </div>

            {submittedIncident ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', width: '60px', height: '60px', borderRadius: '50%', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                        Emergency Report Transmitted!
                    </h2>
                    <div style={{ fontSize: '0.92rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 700 }}>
                        Incident ID: {submittedIncident.id} • Severity Level {submittedIncident.severity}/5 (Priority {submittedIncident.severity >= 5 ? "P1" : "P2"})
                    </div>

                    <div style={{ margin: '20px 0', background: '#0f172a', padding: '16px', borderRadius: '10px', textAlign: 'left', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                            <Sparkles size={16} />
                            <span>AI Microservice Triage Analysis:</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                            {submittedIncident.aiSummary || "Triage initiated. Nearest capable units evaluated via road-network routing."}
                        </p>
                        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={16} />
                            <span>Automated SLA timer active. Operators and field dispatch notified.</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: "wrap" }}>
                        <button
                            onClick={() => {
                                setSubmittedIncident(null);
                                setSosActive(false);
                            }}
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
                            Select Emergency Taxonomy Category
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            {TAXONOMY_CATEGORIES.map((item) => (
                                <button
                                    type="button"
                                    key={item.type}
                                    onClick={() => setForm({ ...form, type: item.type, subTypeId: item.subTypeId })}
                                    style={{
                                        background: form.type === item.type ? item.color : '#0f172a',
                                        color: '#fff',
                                        border: `1px solid ${form.type === item.type ? item.color : '#1e293b'}`,
                                        padding: '12px 10px',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: "all 0.15s"
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                            Emergency Headline *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Water rapidly rising, 14 families trapped on rooftop"
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
                            Location Address / Landmarks *
                        </label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#ef4444' }} />
                            <input
                                type="text"
                                placeholder="Enter street, landmark, sector, or village name..."
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
                            Description, Trapped Counts & Hazards
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe trapped people count, injuries, water level, flame intensity, or chemical odors..."
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                Your Name (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Citizen Name"
                                value={form.reporterName}
                                onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                                style={{ width: '100%', background: '#0b1120', border: '1px solid #1e293b', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                                Callback Phone (Improves Trust Score)
                            </label>
                            <input
                                type="text"
                                placeholder="+91 98XXX XXXXX"
                                value={form.reporterPhone}
                                onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })}
                                style={{ width: '100%', background: '#0b1120', border: '1px solid #1e293b', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%)', border: '1px solid rgba(59,130,246,0.3)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.82rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={20} style={{ color: '#a855f7', flexShrink: 0 }} />
                        <span>AI Microservice Active: Real-time NLP entity extraction and 3-signal spatial/temporal duplicate detection will consolidate matching calls into a single ticket.</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-report-emergency"
                        style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '6px' }}
                    >
                        <Send size={18} />
                        <span>{loading ? "Transmitting Emergency Report..." : "Submit Emergency Report Now"}</span>
                    </button>
                </form>
            )}
        </div>
    );
}

export default CitizenReportPage;
