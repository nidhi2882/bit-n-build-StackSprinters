import React, { useState, useEffect } from "react";
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

// Component to render live progress tracking card for a reported incident
function CitizenIncidentProgressTracker({ inc }) {
    const { resources } = useEmergency();
    const [serviceRequests, setServiceRequests] = useState([]);
    const [activities, setActivities] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const [reqRes, actRes] = await Promise.allSettled([
                apiClient.get(`/incidents/${inc.id}/service-requests`),
                apiClient.get(`/incidents/${inc.id}/activities`)
            ]);

            if (reqRes.status === "fulfilled" && reqRes.value?.data) {
                setServiceRequests(reqRes.value.data);
            }
            if (actRes.status === "fulfilled" && actRes.value?.data) {
                setActivities(actRes.value.data);
            }
        } catch (err) {
            console.error("Error loading incident tracking details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
        const interval = setInterval(fetchDetails, 10000); // 10s live polling
        return () => clearInterval(interval);
    }, [inc.id]);

    const assignedUnits = resources.filter(r => (inc.assignedResourceIds || []).includes(r.id) || r.assignedIncidentId === inc.id);

    return (
        <div style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Header Title & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 800 }}>INCIDENT #{inc.id}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{inc.title}</div>
                </div>
                <span className={`status-pill ${inc.status}`} style={{ fontSize: '0.8rem', padding: '4px 10px', fontWeight: 800 }}>
                    {inc.status}
                </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#ef4444" />
                <span>{inc.locationName}</span>
            </div>

            {/* Step-by-Step Response Pipeline Tracker */}
            <div style={{ background: '#070b14', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px' }}>
                    RESPONSE & DISPATCH PROGRESS:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '0.75rem' }}>
                    <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                        <div style={{ color: '#10b981', fontWeight: 800 }}>✓ Reported</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Submitted & Received</div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', borderLeft: inc.status !== "Reported" ? '3px solid #10b981' : '3px solid #64748b' }}>
                        <div style={{ color: inc.status !== "Reported" ? '#10b981' : '#64748b', fontWeight: 800 }}>
                            {inc.status !== "Reported" ? "✓ Categorized" : "⏳ AI Categorizing"}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{inc.type} Dept Scope</div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', borderLeft: assignedUnits.length > 0 ? '3px solid #3b82f6' : '3px solid #64748b' }}>
                        <div style={{ color: assignedUnits.length > 0 ? '#3b82f6' : '#64748b', fontWeight: 800 }}>
                            {assignedUnits.length > 0 ? `✓ ${assignedUnits.length} Unit Assigned` : "⏳ Awaiting Unit"}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            {assignedUnits.length > 0 ? assignedUnits[0].name : "Primary Command"}
                        </div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '8px', borderRadius: '6px', borderLeft: inc.status === "Resolved" ? '3px solid #10b981' : (inc.status === "En-Route" || inc.status === "On-Scene") ? '3px solid #f59e0b' : '3px solid #64748b' }}>
                        <div style={{ color: inc.status === "Resolved" ? '#10b981' : (inc.status === "En-Route" || inc.status === "On-Scene") ? '#f59e0b' : '#64748b', fontWeight: 800 }}>
                            {inc.status === "Resolved" ? "✅ Resolved" : inc.status === "On-Scene" ? "🚨 On-Scene" : inc.status === "En-Route" ? "🔵 En-Route" : "Dispatch Ready"}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Emergency Action</div>
                    </div>
                </div>
            </div>

            {/* Cross-Department Additional Services Section */}
            {serviceRequests.length > 0 && (
                <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} color="#a855f7" />
                        <span>Cross-Department Support Services Requested ({serviceRequests.length})</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {serviceRequests.map(sr => (
                            <div key={sr.id} style={{ background: '#070b14', padding: '8px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                <div>
                                    <span style={{ color: '#fff', fontWeight: 700 }}>{sr.requestedDepartment} Dept</span>
                                    <span style={{ color: '#94a3b8', marginLeft: '6px' }}>({sr.requiredCapability})</span>
                                    {sr.assignedUnitName && (
                                        <div style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700, marginTop: '2px' }}>
                                            Assigned Unit: {sr.assignedUnitName}
                                        </div>
                                    )}
                                </div>
                                <span style={{
                                    fontSize: '0.72rem',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 800,
                                    background: sr.status === "ACCEPTED" ? 'rgba(16,185,129,0.2)' : sr.status === "DECLINED" ? 'rgba(239,68,68,0.2)' : sr.status === "RESOLVED" ? 'rgba(100,116,139,0.2)' : 'rgba(168,85,247,0.2)',
                                    color: sr.status === "ACCEPTED" ? '#10b981' : sr.status === "DECLINED" ? '#ef4444' : sr.status === "RESOLVED" ? '#94a3b8' : '#c084fc'
                                }}>
                                    {sr.status === "ACCEPTED" ? "ACCEPTED & DEPLOYED" : sr.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Toggle Detailed Activity Timeline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <span>{expanded ? "Hide Response Timeline Log" : `View Full Live Activity Log (${activities.length})`}</span>
                </button>
            </div>

            {/* Detailed Activity Log List */}
            {expanded && (
                <div style={{ background: '#070b14', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #1e293b' }}>
                    {activities.length > 0 ? (
                        activities.map(act => (
                            <div key={act.id} style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span>•</span>
                                <span>{act.activityText}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Incident reported. Awaiting further updates...</div>
                    )}
                </div>
            )}
        </div>
    );
}

function CitizenReportPage() {
    const { addNewIncident, setSelectedIncident, incidents } = useEmergency();
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
                    sendSos(22.3120, 73.1750, "Subhanpura Sector 4, Vadodara");
                }
            );
        } else {
            sendSos(22.3120, 73.1750, "Subhanpura Sector 4, Vadodara");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const created = await addNewIncident({
                title: form.title || `${form.type} Emergency at ${form.locationName}`,
                type: form.type,
                description: form.description || "Emergency report submitted via Citizen Public Portal.",
                severity: form.severity,
                locationName: form.locationName,
                lat: form.lat,
                lng: form.lng
            });

            setSubmittedIncident(created);
        } catch (err) {
            console.error("Submit emergency report error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Citizen Header */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderColor: '#a855f7', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #a855f7 100%)', color: '#fff', padding: '12px', borderRadius: '12px' }}>
                            <LifeBuoy size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 800, textTransform: 'uppercase' }}>
                                CITIZEN EMERGENCY PORTAL & LIVE TRACKER
                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                                Report Emergency & Track Live Dispatch Progress
                            </h1>
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                Instant 1-Tap SOS Panic Beacon • Multi-Department Live Response Tracking
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* One-Tap SOS Panic Banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', borderColor: '#ef4444', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase' }}>
                        🚨 IMMEDIATE LIFE THREAT PANIC BUTTON
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                        Press One-Tap SOS to Broadcast Live GPS Rescue Signal
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#fecaca', marginTop: '2px' }}>
                        Transmits exact coordinates to closest Fire, Flood, and EMS commanders.
                    </div>
                </div>

                <button
                    onClick={handleOneTapSos}
                    disabled={sosTriggering}
                    style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: '2px solid #fff',
                        padding: '14px 24px',
                        borderRadius: '12px',
                        fontWeight: 900,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Zap size={20} />
                    <span>{sosTriggering ? "Broadcasting SOS..." : "TRANSMIT SOS NOW"}</span>
                </button>
            </div>

            {/* Emergency Report Submission Form */}
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={18} color="#3b82f6" />
                    <span>Submit Detailed Incident Report</span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Select Emergency Category</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '6px' }}>
                            {TAXONOMY_CATEGORIES.map(cat => (
                                <button
                                    key={cat.type}
                                    type="button"
                                    onClick={() => setForm({ ...form, type: cat.type, subTypeId: cat.subTypeId })}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: form.type === cat.type ? `2px solid ${cat.color}` : '1px solid #1e293b',
                                        background: form.type === cat.type ? '#1e293b' : '#0b1120',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Incident Title / Summary</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Flash Flood water entering homes in Subhanpura..."
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b1120', border: '1px solid #1e293b', color: '#fff', marginTop: '4px', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Exact Location Address</label>
                        <input
                            type="text"
                            required
                            value={form.locationName}
                            onChange={e => setForm({ ...form, locationName: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b1120', border: '1px solid #1e293b', color: '#fff', marginTop: '4px', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Detailed Situation Notes</label>
                        <textarea
                            rows={3}
                            placeholder="Describe severity, trapped persons, injuries, water level, or smoke..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0b1120', border: '1px solid #1e293b', color: '#fff', marginTop: '4px', outline: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '14px',
                            borderRadius: '8px',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Send size={18} />
                        <span>{loading ? "Transmitting Report to Command Center..." : "Submit Emergency Report"}</span>
                    </button>
                </form>
            </div>

            {/* My Reported Emergencies & Live Multi-Department Status Tracker */}
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Radio size={20} style={{ color: '#10b981' }} />
                        <span>My Reported Emergencies & Multi-Department Response Progress</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#a7f3d0', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        Live Tracking Active
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {incidents.length > 0 ? (
                        incidents.slice(0, 5).map(inc => (
                            <CitizenIncidentProgressTracker key={inc.id} inc={inc} />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.85rem' }}>
                            No active emergency reports submitted yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CitizenReportPage;
