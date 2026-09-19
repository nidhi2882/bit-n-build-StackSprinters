import React from "react";
import { X, Sparkles, MapPin, Copy, Truck, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const IncidentDetailModal = () => {
    const { selectedIncident, setSelectedIncident, resources, assignResource, unassignResource } = useEmergency();

    if (!selectedIncident) return null;

    const assignedUnits = resources.filter(r => (selectedIncident.assignedResourceIds || []).includes(r.id));
    
    // AI Recommendation logic: filter eligible resources by type/category or capabilities
    const recommendedResources = resources.filter(r => {
        const isAssigned = (selectedIncident.assignedResourceIds || []).includes(r.id);
        if (isAssigned) return false;
        
        // Capability or category match
        const matchesCategory = r.category.toLowerCase() === selectedIncident.type.toLowerCase();
        const matchesCapability = selectedIncident.requiredCapabilities.some(cap => r.capabilities.includes(cap));
        
        return matchesCategory || matchesCapability || r.status === "Available";
    }).sort((a, b) => a.distanceKm - b.distanceKm); // sort nearest first

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
                            {selectedIncident.title}
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
                        <span className={`severity-badge severity-${selectedIncident.severity}`}>
                            Severity Level {selectedIncident.severity}
                        </span>
                        <span className={`status-pill ${selectedIncident.status}`}>
                            Status: {selectedIncident.status}
                        </span>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} style={{ color: '#ef4444' }} />
                            <span>{selectedIncident.locationName}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginLeft: 'auto' }}>
                            Reported by: <strong>{selectedIncident.reporterRole}</strong>
                        </div>
                    </div>

                    {/* AI Intelligence Card */}
                    <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(15,23,42,0.9) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#c084fc', fontWeight: 800, fontSize: '0.9rem' }}>
                            <Sparkles size={18} />
                            <span>AI Emergency Intelligence & Severity Estimation</span>
                            <span style={{ fontSize: '0.72rem', background: '#a855f7', color: '#fff', padding: '1px 8px', borderRadius: '999px', marginLeft: 'auto' }}>
                                Confidence: {(selectedIncident.aiConfidence * 100).toFixed(0)}%
                            </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                            {selectedIncident.aiSummary}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Required Capabilities:</span>
                            {selectedIncident.requiredCapabilities.map((cap, i) => (
                                <span key={i} style={{ fontSize: '0.72rem', background: '#1e293b', border: '1px solid #334155', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px' }}>
                                    ✓ {cap}
                                </span>
                            ))}
                        </div>
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
                                            <strong style={{ color: '#f8fafc' }}>[{rep.source}]</strong> {rep.text}
                                        </div>
                                        <div style={{ color: '#64748b' }}>{rep.time}</div>
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
                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{unit.type} • Status: <span style={{ color: '#93c5fd' }}>{unit.status}</span></div>
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
                            <span>AI Recommended Eligible Units (Distance & Capability Ranked)</span>
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {recommendedResources.map(unit => (
                                <div key={unit.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '12px 16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{unit.name}</span>
                                            <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                                                {unit.distanceKm} km away (ETA ~{unit.etaMins}m)
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                                            Capabilities: {unit.capabilities.join(", ")}
                                        </div>
                                    </div>

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
                                            gap: '6px'
                                        }}
                                    >
                                        <CheckCircle2 size={15} />
                                        <span>Dispatch Unit</span>
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
