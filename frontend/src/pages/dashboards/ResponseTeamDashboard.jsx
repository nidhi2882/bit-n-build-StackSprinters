import React from "react";
import { Truck, CheckCircle2, Navigation, Radio, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

function ResponseTeamDashboard() {
    const { resources, incidents, updateResourceStatus, updateIncidentStatus } = useEmergency();
    const { user } = useAuth();

    // Default to NDRF Squad 03 or first assigned resource
    const myUnit = resources.find(r => r.id === "RES-001") || resources[0];
    const assignedIncident = incidents.find(i => i.id === myUnit?.assignedIncidentId) || incidents[0];

    const handleStatusChange = (newStatus) => {
        if (myUnit) {
            updateResourceStatus(myUnit.id, newStatus);
        }
    };

    const handleCompleteMission = () => {
        if (!myUnit || !assignedIncident) return;
        const normStatus = (myUnit.status || "").toLowerCase();
        if (!normStatus.includes("site") && !normStatus.includes("scene") && !normStatus.includes("return")) {
            alert(`Cannot resolve mission: Unit '${myUnit.name}' is currently '${myUnit.status}'. Field unit must arrive On-Scene before resolving mission.`);
            return;
        }
        updateIncidentStatus(assignedIncident.id, "Resolved");
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#3b82f6', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#3b82f6', color: '#fff', padding: '10px', borderRadius: '10px' }}>
                            <Truck size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>
                                FIELD UNIT DASHBOARD • {user?.unitName || myUnit.name}
                            </div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                                Unit ID: {myUnit.id} ({myUnit.type})
                            </h1>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Unit Readiness:</span>
                        <span className={`status-pill ${myUnit.status}`}>
                            {myUnit.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Status Action Controls */}
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Radio size={18} style={{ color: '#10b981' }} />
                    <span>Update Field Unit Deployment Status</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <button
                        onClick={() => handleStatusChange("Available")}
                        style={{
                            background: myUnit.status === "Available" ? '#10b981' : '#0f172a',
                            color: '#fff',
                            border: `1px solid ${myUnit.status === "Available" ? '#10b981' : '#1e293b'}`,
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        🟢 Available
                    </button>

                    <button
                        onClick={() => handleStatusChange("En-Route")}
                        style={{
                            background: myUnit.status === "En-Route" ? '#3b82f6' : '#0f172a',
                            color: '#fff',
                            border: `1px solid ${myUnit.status === "En-Route" ? '#3b82f6' : '#1e293b'}`,
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        🔵 En-Route
                    </button>

                    <button
                        onClick={() => handleStatusChange("On-Scene")}
                        style={{
                            background: (myUnit.status === "On-Scene" || myUnit.status === "On-Site") ? '#06b6d4' : '#0f172a',
                            color: '#fff',
                            border: `1px solid ${(myUnit.status === "On-Scene" || myUnit.status === "On-Site") ? '#06b6d4' : '#1e293b'}`,
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        🌊 On-Scene
                    </button>

                    <button
                        onClick={() => handleStatusChange("Returning")}
                        style={{
                            background: myUnit.status === "Returning" ? '#f59e0b' : '#0f172a',
                            color: '#fff',
                            border: `1px solid ${myUnit.status === "Returning" ? '#f59e0b' : '#1e293b'}`,
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Returning
                    </button>

                    <button
                        onClick={handleCompleteMission}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            gridColumn: 'span 2'
                        }}
                    >
                        ✅ Complete Mission & Resolve Incident
                    </button>
                </div>
            </div>

            {/* Current Active Mission Details */}
            {assignedIncident ? (
                <div className="card" style={{ padding: '24px', borderColor: '#ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span className={`severity-badge severity-${assignedIncident.severity}`}>
                            Mission Level {assignedIncident.severity}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Reported {assignedIncident.reportedAt}
                        </span>
                    </div>

                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                        {assignedIncident.title}
                    </h2>
                    <div style={{ fontSize: '0.85rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                        <MapPin size={15} />
                        <span>{assignedIncident.locationName}</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '16px', background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
                        {assignedIncident.description}
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Navigation size={16} />
                            <span>GPS Navigation to Site</span>
                        </button>
                        <button style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertTriangle size={16} />
                            <span>Request Backup Equipment</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No active mission currently assigned. Unit on standby.
                </div>
            )}
        </div>
    );
}

export default ResponseTeamDashboard;
