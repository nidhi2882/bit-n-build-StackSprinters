import React, { useState, useEffect } from "react";
import { X, Sparkles, MapPin, Copy, Truck, CheckCircle2, ShieldCheck, ArrowRightLeft, Send, Clock, AlertTriangle, LifeBuoy } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const IncidentDetailModal = () => {
    const { selectedIncident, setSelectedIncident, resources, assignResource, unassignResource, updateIncidentStatus, updateResourceStatus } = useEmergency();

    const [serviceRequests, setServiceRequests] = useState([]);
    const [activities, setActivities] = useState([]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [serviceForm, setServiceForm] = useState({
        requestedDepartment: "CAT_MED",
        urgency: "HIGH",
        reason: ""
    });

    useEffect(() => {
        if (!selectedIncident) return;

        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        // Fetch Service Requests on this incident
        fetch(`http://localhost:8080/api/incidents/${selectedIncident.id}/service-requests`, { headers })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setServiceRequests(data);
            })
            .catch(err => console.error("Error fetching service requests:", err));

        // Fetch Timeline Activities on this incident
        fetch(`http://localhost:8080/api/incidents/${selectedIncident.id}/activities`, { headers })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setActivities(data);
            })
            .catch(err => console.error("Error fetching activities:", err));
    }, [selectedIncident]);

    if (!selectedIncident) return null;

    const handleCreateServiceRequest = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/incidents/${selectedIncident.id}/service-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(serviceForm)
            });

            if (response.ok) {
                const newReq = await response.json();
                setServiceRequests([newReq, ...serviceRequests]);
                setShowServiceForm(false);
                setServiceForm({ requestedDepartment: "CAT_MED", urgency: "HIGH", reason: "" });
                alert(`Service Request for ${serviceForm.requestedDepartment} transmitted successfully!`);
            } else {
                alert("Failed to create Service Request.");
            }
        } catch (err) {
            console.error("Create service request error:", err);
        }
    };

    const assignedUnits = (resources || []).filter(r => r && ((selectedIncident.assignedResourceIds || []).includes(r.id) || r.assignedIncidentId === selectedIncident.id));
    const reqCaps = selectedIncident.requiredCapabilities || [];

    // AI Recommendation logic
    const recommendedResources = (resources || []).filter(r => {
        if (!r) return false;
        const isAssignedToThis = (selectedIncident.assignedResourceIds || []).includes(r.id);
        if (isAssignedToThis) return false;
        
        const status = (r.status || "").toLowerCase();
        if (status === "maintenance" || status === "unavailable") return false;

        const unitCaps = r.capabilities || [];
        let effectiveCaps = reqCaps;
        if (!effectiveCaps || effectiveCaps.length === 0) {
            const incT = ((selectedIncident.type || "") + " " + (selectedIncident.title || "")).toLowerCase();
            if (incT.includes("fire") || incT.includes("blaze")) effectiveCaps = ["FIRE_ENGINE", "FOAM_TENDER"];
            else if (incT.includes("flood") || incT.includes("water")) effectiveCaps = ["WATER_RESCUE", "INFLATABLE_BOAT"];
            else if (incT.includes("med") || incT.includes("hosp")) effectiveCaps = ["ADVANCED_AMBULANCE", "TRAUMA_TEAM"];
            else if (incT.includes("collapse") || incT.includes("infrastruc")) effectiveCaps = ["SEARCH_DOGS", "CONCRETE_CUTTER"];
            else if (incT.includes("hazmat") || incT.includes("gas") || incT.includes("chemical")) effectiveCaps = ["HAZMAT_SUIT_LEVEL_A", "GAS_DETECTOR"];
            else if (incT.includes("traffic") || incT.includes("crash") || incT.includes("collision")) effectiveCaps = ["TRAFFIC_CONTROL", "EXTRICATION_EQUIPMENT"];
            else if (incT.includes("storm") || incT.includes("utility") || incT.includes("power")) effectiveCaps = ["EMERGENCY_GENERATOR", "POWER_RESTORATION_CREW"];
            else if (incT.includes("rescue") || incT.includes("search") || incT.includes("missing")) effectiveCaps = ["DRONE_THERMAL", "SEARCH_DOGS"];
        }

        const matchedCapsCount = effectiveCaps.filter(c => {
            if (!c) return false;
            const normC = c.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            return unitCaps.some(uc => {
                if (!uc) return false;
                const normUc = uc.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                return normUc === normC || (normUc.length >= 3 && normC.length >= 3 && (normUc.includes(normC) || normC.includes(normUc)));
            });
        }).length;

        const resType = (r.type || r.category || "").toLowerCase();
        const incType = (selectedIncident.type || "").toLowerCase();
        const incTitle = (selectedIncident.title || "").toLowerCase();

        const isCategoryAligned =
            ((incType.includes("fire") || incTitle.includes("fire")) && (resType.includes("fire") || unitCaps.some(uc => (uc || "").toLowerCase().includes("fire")))) ||
            ((incType.includes("flood") || incTitle.includes("flood")) && (resType.includes("water") || unitCaps.some(uc => (uc || "").toLowerCase().includes("water")))) ||
            ((incType.includes("med") || incTitle.includes("med")) && (resType.includes("ambul") || resType.includes("med"))) ||
            ((incType.includes("collapse") || incTitle.includes("collapse")) && (resType.includes("usar") || resType.includes("search"))) ||
            ((incType.includes("hazmat") || incTitle.includes("hazmat") || incTitle.includes("gas")) && resType.includes("hazmat")) ||
            ((incType.includes("traffic") || incTitle.includes("traffic") || incTitle.includes("crash")) && resType.includes("traffic")) ||
            ((incType.includes("storm") || incTitle.includes("storm") || incTitle.includes("utility")) && resType.includes("utility")) ||
            ((incType.includes("rescue") || incTitle.includes("rescue")) && resType.includes("search"));

        return matchedCapsCount > 0 || isCategoryAligned;
    }).map(unit => {
        const unitCaps = unit.capabilities || [];
        let effectiveCaps = reqCaps;
        if (!effectiveCaps || effectiveCaps.length === 0) {
            const incT = ((selectedIncident.type || "") + " " + (selectedIncident.title || "")).toLowerCase();
            if (incT.includes("fire") || incT.includes("blaze")) effectiveCaps = ["FIRE_ENGINE", "FOAM_TENDER"];
            else if (incT.includes("flood") || incT.includes("water")) effectiveCaps = ["WATER_RESCUE", "INFLATABLE_BOAT"];
            else if (incT.includes("med") || incT.includes("hosp")) effectiveCaps = ["ADVANCED_AMBULANCE", "TRAUMA_TEAM"];
        }

        const matchedCapsCount = effectiveCaps.filter(c => {
            if (!c) return false;
            const normC = c.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            return unitCaps.some(uc => {
                if (!uc) return false;
                const normUc = uc.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                return normUc === normC || (normUc.length >= 3 && normC.length >= 3 && (normUc.includes(normC) || normC.includes(normUc)));
            });
        }).length;

        const capabilityScore = effectiveCaps.length > 0 ? (matchedCapsCount / effectiveCaps.length) : 1.0;
        const capPct = Math.round(capabilityScore * 100);
        const distKm = unit.distanceKm != null ? unit.distanceKm : 1.5;
        const distScore = Math.max(0, Math.round(100 - (distKm * 5)));
        const compositeScore = Math.round((0.40 * capPct) + (0.35 * distScore) + (0.15 * 100) + (0.10 * 80));
        const etaMins = unit.etaMins != null ? unit.etaMins : Math.max(2, Math.round(distKm * 3.5));

        return { ...unit, compositeScore, etaMins, distKm, capPct, distScore };
    }).sort((a, b) => b.compositeScore - a.compositeScore);

    return (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <div style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 700, fontFamily: 'monospace' }}>
                            INCIDENT DISPATCH & INTELLIGENCE CENTER • {selectedIncident.id}
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '2px 0 0' }}>
                            {selectedIncident.title || "Emergency Incident"}
                        </h2>
                    </div>

                    <button 
                        onClick={() => setSelectedIncident(null)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {/* Metadata strip */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', background: '#0f172a', padding: '12px 16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                        <span className={`severity-badge severity-${selectedIncident.severity || 3}`}>
                            Severity Level {selectedIncident.severity || 3}
                        </span>
                        <span className={`status-pill ${selectedIncident.status || "Reported"}`}>
                            Status: {selectedIncident.status || "Reported"}
                        </span>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} style={{ color: '#ef4444' }} />
                            <span>{selectedIncident.locationName || "Location details"}</span>
                        </div>

                        {/* Request Additional Service Button */}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setShowServiceForm(!showServiceForm)}
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ArrowRightLeft size={14} />
                                <span>Request Additional Service</span>
                            </button>

                            {selectedIncident.status !== "Resolved" && selectedIncident.status !== "Cancelled" && (
                                <button
                                    onClick={() => updateIncidentStatus(selectedIncident.id, "Resolved")}
                                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    ✓ Resolve Incident
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Inline Request Additional Service Form */}
                    {showServiceForm && (
                        <form onSubmit={handleCreateServiceRequest} style={{ background: '#0b1120', border: '1px solid #6366f1', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <LifeBuoy size={16} color="#818cf8" />
                                <span>Request Cross-Department Assistance for {selectedIncident.id}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Target Department</label>
                                    <select
                                        value={serviceForm.requestedDepartment}
                                        onChange={e => setServiceForm({ ...serviceForm, requestedDepartment: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginTop: '4px' }}
                                    >
                                        <option value="CAT_MED">🚑 Medical & EMS Command</option>
                                        <option value="CAT_FIRE">🔥 Fire & Rescue Station</option>
                                        <option value="CAT_FLOOD">🌊 Flood & Water Rescue</option>
                                        <option value="CAT_SECURITY">🛡️ Police & Safety</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Urgency Level</label>
                                    <select
                                        value={serviceForm.urgency}
                                        onChange={e => setServiceForm({ ...serviceForm, urgency: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginTop: '4px' }}
                                    >
                                         <option value="CRITICAL">🚨 CRITICAL (Auto-Escalates &gt; 5m)</option>
                                        <option value="HIGH">⚡ HIGH Urgency</option>
                                        <option value="NORMAL">🔵 NORMAL Support</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Reason / Assistance Needed</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Flood with 3 hypothermic injuries needing medical triage..."
                                    value={serviceForm.reason}
                                    onChange={e => setServiceForm({ ...serviceForm, reason: e.target.value })}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginTop: '4px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button type="button" onClick={() => setShowServiceForm(false)} style={{ padding: '6px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ padding: '6px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
                                    Transmit Service Request
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Service Requests Raised on This Incident */}
                    {serviceRequests.length > 0 && (
                        <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ArrowRightLeft size={16} color="#818cf8" />
                                <span>Cross-Department Service Requests Raised ({serviceRequests.length})</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {serviceRequests.map(sr => (
                                    <div key={sr.id} style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 800, color: '#fff' }}>
                                                {sr.requestedByDepartment} ➔ {sr.requestedDepartment}
                                            </span>
                                            <span style={{
                                                background: sr.status === "ACCEPTED" ? '#10b981' : sr.status === "DECLINED" ? '#ef4444' : '#f59e0b',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.72rem',
                                                fontWeight: 800
                                            }}>
                                                {sr.status} (Urgency: {sr.urgency})
                                            </span>
                                        </div>
                                        <div>Reason: {sr.reason}</div>
                                        {sr.assignedUnitId && <div style={{ color: '#60a5fa', marginTop: '2px' }}>Assigned Unit: <strong>{sr.assignedUnitId}</strong></div>}
                                        {sr.declineReason && <div style={{ color: '#fca5a5', marginTop: '2px' }}>Decline Reason: <strong>{sr.declineReason}</strong></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Incident Activity Timeline */}
                    {activities.length > 0 && (
                        <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} color="#38bdf8" />
                                <span>Incident Activity History & Dispatch Timeline</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                                {activities.map((act, i) => (
                                    <div key={i} style={{ fontSize: '0.78rem', background: '#0f172a', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b', color: '#cbd5e1' }}>
                                        <span style={{ color: '#94a3b8', fontWeight: 700, marginRight: '6px' }}>
                                            {act.createdAt ? new Date(act.createdAt).toLocaleTimeString() : "Just now"} • [{act.actor || "SYSTEM"}]:
                                        </span>
                                        {act.activityText}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Intelligence Card */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(15,23,42,0.9) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#c084fc', fontWeight: 800, fontSize: '0.9rem' }}>
                            <Sparkles size={18} />
                            <span>AI Emergency Intelligence & Severity Estimation</span>
                            <span style={{ fontSize: '0.72rem', background: '#a855f7', color: '#fff', padding: '1px 8px', borderRadius: '999px', marginLeft: 'auto' }}>
                                Confidence: {selectedIncident.aiConfidence != null ? (selectedIncident.aiConfidence * 100).toFixed(0) : 85}%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                            {selectedIncident.aiSummary || selectedIncident.description || "AI Telemetry and Severity Analysis active."}
                        </p>
                    </div>

                    {/* Assigned Units Section */}
                    <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={18} style={{ color: '#10b981' }} />
                            <span>Currently Assigned Units ({assignedUnits.length})</span>
                        </h3>

                        {assignedUnits.length === 0 ? (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem' }}>
                                ⚠️ No response unit currently assigned to this incident. Select a recommended unit below to dispatch.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {assignedUnits.map(unit => (
                                    <div key={unit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{unit.name}</div>
                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                <span>{unit.type || unit.category || "Emergency Unit"}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => unassignResource(selectedIncident.id, unit.id)}
                                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                            Recall / Unassign
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Resource Recommendation Engine */}
                    <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={18} style={{ color: '#a855f7' }} />
                            <span>Multi-Factor Composite Score Resource Rankings</span>
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {recommendedResources.map(unit => (
                                <div key={unit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '12px 16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                                    <div>
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{unit.name}</span>
                                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                                            Composite Score: <strong>{unit.compositeScore}/100</strong> • Distance: {unit.distKm} km (ETA ~{unit.etaMins}m)
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => assignResource(selectedIncident.id, unit.id)}
                                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Dispatch Unit
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetailModal;
