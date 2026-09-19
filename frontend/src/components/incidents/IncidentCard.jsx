import React from "react";
import { MapPin, Clock, Copy, Sparkles, Truck, ShieldAlert, ArrowRight } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const IncidentCard = ({ incident }) => {
    const { setSelectedIncident, resources } = useEmergency();

    const assignedUnits = resources.filter(r => (incident.assignedResourceIds || []).includes(r.id));

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`severity-badge severity-${incident.severity}`}>
                        <span className="pulse-dot"></span>
                        Level {incident.severity}
                    </span>
                    <span className={`status-pill ${incident.status}`}>
                        {incident.status}
                    </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{incident.reportedAt}</span>
                </div>
            </div>

            {/* Title & Code */}
            <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace' }}>
                    {incident.id} • {incident.type}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '2px 0 4px' }}>
                    {incident.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} style={{ color: '#ef4444' }} />
                    <span>{incident.locationName}</span>
                </div>
            </div>

            {/* Duplicate badge & AI summary preview */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                {incident.duplicateCount > 0 && (
                    <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#93c5fd',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Copy size={11} />
                        <span>{incident.duplicateCount} Duplicate Reports Consolidated</span>
                    </span>
                )}

                <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(168, 85, 247, 0.15)',
                    color: '#e9d5ff',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <Sparkles size={11} />
                    <span>AI Confidence {(incident.aiConfidence * 100).toFixed(0)}%</span>
                </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                {incident.description}
            </p>

            {/* Assigned units tag list */}
            {assignedUnits.length > 0 && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} style={{ color: '#10b981' }} />
                    <span>Assigned: </span>
                    <strong style={{ color: '#e2e8f0' }}>
                        {assignedUnits.map(u => u.name).join(", ")}
                    </strong>
                </div>
            )}

            {/* Bottom action */}
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => setSelectedIncident(incident)}
                    style={{
                        background: incident.status === "Reported" ? '#ef4444' : '#1e293b',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span>{incident.assignedResourceIds?.length > 0 ? "View Dispatch Details" : "Dispatch & AI Analysis"}</span>
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default IncidentCard;
