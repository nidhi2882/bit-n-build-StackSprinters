import React from "react";
import { Truck, ShieldCheck, MapPin, Phone, UserCheck, AlertCircle } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const ResourceCard = ({ resource }) => {
    const { incidents, setSelectedIncident, updateResourceStatus } = useEmergency();

    const assignedIncident = incidents.find(i => i.id === resource.assignedIncidentId);

    const currentDisplayStatus = resource.status === "On-Site" ? "On-Scene" : resource.status;

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace' }}>
                    {resource.id} • {resource.type}
                </div>
                <span className={`status-pill ${currentDisplayStatus}`}>
                    {currentDisplayStatus}
                </span>
            </div>

            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '2px 0 4px' }}>
                    {resource.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Lead: <strong style={{ color: '#e2e8f0' }}>{resource.unitLead}</strong>
                </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: '#0f172a', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div><strong>Capacity:</strong> {resource.capacity}</div>
                <div><strong>Contact:</strong> {resource.contact}</div>
                <div><strong>Base Distance:</strong> {resource.distanceKm} km</div>
            </div>

            <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                    OPERATIONAL CAPABILITIES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {resource.capabilities.map((cap, i) => (
                        <span key={i} style={{ fontSize: '0.72rem', background: '#1e293b', color: '#93c5fd', padding: '2px 6px', borderRadius: '4px', border: '1px solid #334155' }}>
                            {cap}
                        </span>
                    ))}
                </div>
            </div>

            {/* Manual Status Override Control for Operators */}
            <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Status Override:</span>
                <select
                    value={currentDisplayStatus}
                    onChange={(e) => updateResourceStatus(resource.id, e.target.value)}
                    style={{
                        background: '#0b1120',
                        border: '1px solid #334155',
                        color: '#60a5fa',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    <option value="Available">🟢 Available</option>
                    <option value="En-Route">🔵 En-Route</option>
                    <option value="On-Scene">🌊 On-Scene</option>
                    <option value="Returning">🔄 Returning</option>
                </select>
            </div>

            {assignedIncident && (
                <div style={{ paddingTop: '6px', borderTop: '1px dashed #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.78rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} />
                        <span>Assigned to {assignedIncident.id}</span>
                    </div>
                    <button 
                        onClick={() => setSelectedIncident(assignedIncident)}
                        style={{ background: '#1e293b', color: '#60a5fa', border: '1px solid #334155', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                        View Assignment
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResourceCard;
