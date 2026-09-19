import React from "react";
import { X, Sparkles, MapPin, Copy, Truck, CheckCircle2, ShieldCheck } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const IncidentDetailModal = () => {
    const { selectedIncident, setSelectedIncident, resources, assignResource, unassignResource, updateIncidentStatus, updateResourceStatus } = useEmergency();

    if (!selectedIncident) return null;

    const assignedUnits = (resources || []).filter(r => r && ((selectedIncident.assignedResourceIds || []).includes(r.id) || r.assignedIncidentId === selectedIncident.id));
    
    const reqCaps = selectedIncident.requiredCapabilities || [];

    // AI Recommendation logic: Filter and rank relevant resources for the incident
    const recommendedResources = (resources || []).filter(r => {
        if (!r) return false;
        
        // Exclude units already assigned to THIS incident or unavailable
        const isAssignedToThis = (selectedIncident.assignedResourceIds || []).includes(r.id);
        if (isAssignedToThis) return false;
        
        const status = (r.status || "").toLowerCase();
        if (status === "maintenance" || status === "unavailable") return false;

        const unitCaps = r.capabilities || [];

        // Effective required capabilities resolution
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

        // Exclude completely irrelevant units (0 matched capabilities AND no category alignment)
        return matchedCapsCount > 0 || isCategoryAligned;
    }).map(unit => {
        const unitCaps = unit.capabilities || [];
        
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

        // Intelligent capability matching (exact + normalized substring)
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
        const loadScore = (unit.status || "").toLowerCase() === "available" ? 100 : 60;
        
        const resType = (unit.type || unit.category || "").toLowerCase();
        const incType = (selectedIncident.type || "").toLowerCase();
        const incTitle = (selectedIncident.title || "").toLowerCase();

        const isFireIncident = incType.includes("fire") || incTitle.includes("fire") || incTitle.includes("blaze") || incTitle.includes("smoke");
        const isFireUnit = resType.includes("fire") || unitCaps.some(uc => (uc || "").toLowerCase().includes("fire"));

        const hospScore = ((incType.includes("med") || incType.includes("hosp")) && resType.includes("ambul")) ? 100 :
                          (isFireIncident && isFireUnit) ? 100 :
                          (incType.length > 0 && resType.includes(incType)) ? 100 : 60;
        
        const capContr = 0.40 * capPct;
        const distContr = 0.35 * distScore;
        const loadContr = 0.15 * loadScore;
        const hospContr = 0.10 * hospScore;
        
        const compositeScore = Math.round(capContr + distContr + loadContr + hospContr);
        const etaMins = unit.etaMins != null ? unit.etaMins : Math.max(2, Math.round(distKm * 3.5));

        return {
            ...unit,
            capabilityScore,
            capPct,
            distKm,
            distScore,
            loadScore,
            hospScore,
            capContr,
            distContr,
            loadContr,
            hospContr,
            compositeScore,
            etaMins
        };
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

                        {/* Action buttons for Operator */}
                        {selectedIncident.status !== "Resolved" && selectedIncident.status !== "Cancelled" && (
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => updateIncidentStatus(selectedIncident.id, "Resolved")}
                                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    ✓ Resolve Incident
                                </button>
                                <button
                                    onClick={() => updateIncidentStatus(selectedIncident.id, "Cancelled")}
                                    style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    ✕ Cancel Incident (Override)
                                </button>
                            </div>
                        )}
                    </div>

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
                        {reqCaps.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Required Capabilities:</span>
                                {reqCaps.map((cap, i) => (
                                    <span key={i} style={{ fontSize: '0.72rem', background: '#1e293b', border: '1px solid #334155', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px' }}>
                                        ✓ {cap}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Duplicate Consolidation Section */}
                    {selectedIncident.duplicateReports && selectedIncident.duplicateReports.length > 0 && (
                        <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700, fontSize: '0.88rem', marginBottom: '10px' }}>
                                <Copy size={16} />
                                <span>Duplicate Reports Consolidated ({selectedIncident.duplicateReports.length})</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {selectedIncident.duplicateReports.map((rep, idx) => (
                                    <div key={idx} style={{ fontSize: '0.8rem', background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <strong style={{ color: '#f8fafc' }}>[{rep.source || "Report"}]</strong> {rep.text}
                                        </div>
                                        <div style={{ color: '#64748b' }}>{rep.time || "Just now"}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                                <span>•</span>
                                                <span>Status:</span>
                                                <select
                                                    value={unit.status === "On-Site" ? "On-Scene" : unit.status}
                                                    onChange={(e) => updateResourceStatus(unit.id, e.target.value)}
                                                    style={{
                                                        background: '#0b1120',
                                                        border: '1px solid #334155',
                                                        color: '#60a5fa',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="En-Route">🔵 En-Route</option>
                                                    <option value="On-Scene">🌊 On-Scene</option>
                                                    <option value="Returning">🔄 Returning</option>
                                                    <option value="Available">🟢 Available</option>
                                                </select>
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

                    {/* AI Resource Recommendation Engine (4-Factor Composite Algorithm) */}
                    <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={18} style={{ color: '#a855f7' }} />
                            <span>Multi-Factor Composite Score Resource Rankings</span>
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {recommendedResources.length === 0 ? (
                                <div style={{ padding: '16px', background: '#0b1120', border: '1px solid #1e293b', borderRadius: '8px', color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>
                                    No available units matching required capabilities or proximity filters.
                                </div>
                            ) : (
                                recommendedResources.map(unit => {
                                    const unitCaps = unit.capabilities || [];
                                    const matchedCapsCount = reqCaps.filter(c => c && unitCaps.some(uc => uc && uc.toLowerCase() === c.toLowerCase())).length;
                                    const capPct = reqCaps.length > 0
                                        ? Math.round((matchedCapsCount / reqCaps.length) * 100)
                                        : 100;
                                    const distKm = unit.distanceKm != null ? unit.distanceKm : 1.5;
                                    const distScore = Math.max(0, Math.round(100 - (distKm * 5)));
                                    const compositeScore = Math.round((0.40 * capPct) + (0.35 * distScore) + (0.15 * 100) + (0.10 * 80));
                                    const etaMins = unit.etaMins != null ? unit.etaMins : Math.max(2, Math.round(distKm * 3.5));

                                    return (
                                        <div key={unit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '12px 16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{unit.name}</span>
                                                    <span style={{ fontSize: '0.72rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '1px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                                        Composite Score: {compositeScore}/100
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                                                        {distKm} km away (ETA ~{etaMins}m)
                                                    </span>
                                                </div>

                                                {/* Score Breakdown Pills */}
                                                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', fontSize: '0.7rem' }}>
                                                    <span style={{ color: '#93c5fd', background: '#0b1120', padding: '1px 6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                                                        🎯 Capabilities: {capPct}% Match
                                                    </span>
                                                    <span style={{ color: '#86efac', background: '#0b1120', padding: '1px 6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                                                        📍 Distance: {distScore}/100
                                                    </span>
                                                    <span style={{ color: unit.assignedIncidentId ? '#fca5a5' : '#86efac', background: '#0b1120', padding: '1px 6px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                                                        ⚡ Unit Status: {unit.status || "Available"} {unit.assignedIncidentId ? `(Assigned to ${unit.assignedIncidentId})` : ""}
                                                    </span>
                                                </div>
                                            </div>

                                            {unit.assignedIncidentId ? (
                                                <span style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 700, padding: '6px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginLeft: '10px', whiteSpace: 'nowrap' }}>
                                                    Assigned to {unit.assignedIncidentId}
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => assignResource(selectedIncident.id, unit.id)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        marginLeft: '10px'
                                                    }}
                                                >
                                                    <CheckCircle2 size={15} />
                                                    <span>Dispatch Unit</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentDetailModal;
