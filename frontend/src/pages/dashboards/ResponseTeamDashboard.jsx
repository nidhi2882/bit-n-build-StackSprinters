import React, { useState } from "react";
import { Truck, Navigation, Radio, MapPin, AlertTriangle, CheckCircle, ShieldAlert, Send, PhoneCall } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

function ResponseTeamDashboard() {
    const { resources, incidents, alerts, updateResourceStatus, updateIncidentStatus } = useEmergency();
    const { user } = useAuth();

    const [fieldNote, setFieldNote] = useState("");
    const [notesList, setNotesList] = useState([
        { time: "10 mins ago", text: "Unit dispatched. Traffic clear along Highway 48." }
    ]);

    const unitId = user?.unitId || "RES-001";
    const myUnit = resources.find(r => r.id === unitId) || resources[0];

    // Response Team sees ONLY incidents assigned to their unit
    const assignedIncidents = incidents.filter(i => 
        (i.assignedResourceIds && i.assignedResourceIds.includes(unitId)) ||
        (i.assignedResourceIds && i.assignedResourceIds.includes(myUnit?.id))
    );

    const activeMission = assignedIncidents.find(i => i.status !== "Resolved") || assignedIncidents[0];

    const handleStatusChange = (newStatus) => {
        if (myUnit) {
            updateResourceStatus(myUnit.id, newStatus);
        }
    };

    const handleCompleteMission = () => {
        if (!myUnit || !activeMission) return;
        const normStatus = (myUnit.status || "").toLowerCase();
        if (!normStatus.includes("site") && !normStatus.includes("scene") && !normStatus.includes("return")) {
            alert(`Cannot resolve mission: Unit '${myUnit.name}' is currently '${myUnit.status}'. Squad must arrive On-Scene before resolving mission.`);
            return;
        }
        updateIncidentStatus(activeMission.id, "Resolved");
    };

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!fieldNote.trim()) return;
        setNotesList([{ time: "Just now", text: fieldNote }, ...notesList]);
        setFieldNote("");
    };

    const handleRequestBackup = () => {
        alert(`Backup request & escalation transmitted to Department Admin for Unit ${myUnit?.id || unitId}!`);
    };

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Field Responder Mobile Header Banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderColor: '#3b82f6', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#3b82f6', color: '#fff', padding: '12px', borderRadius: '12px', fontSize: '1.4rem' }}>
                            <Truck size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase' }}>
                                FIELD RESPONDER SQUAD CONSOLE
                            </div>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                                {user?.name || myUnit?.name || "NDRF Squad Unit 01"}
                            </h1>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                Unit ID: <strong style={{ color: '#60a5fa' }}>{myUnit?.id || unitId}</strong> • Status: <strong style={{ color: '#10b981' }}>{myUnit?.status || "Available"}</strong>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleRequestBackup}
                        style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                        }}
                    >
                        <AlertTriangle size={16} />
                        <span>REQUEST BACKUP</span>
                    </button>
                </div>
            </div>

            {/* Big Prominent Deployment Status Buttons for Quick Touch on Phone */}
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                    LIVE SQUAD DEPLOYMENT STATUS (ONE-TAP)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <button
                        onClick={() => handleStatusChange("Available")}
                        style={{
                            background: myUnit?.status === "Available" ? '#10b981' : '#0f172a',
                            color: '#fff',
                            border: `2px solid ${myUnit?.status === "Available" ? '#10b981' : '#1e293b'}`,
                            padding: '16px 12px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        🟢 Available
                    </button>

                    <button
                        onClick={() => handleStatusChange("En-Route")}
                        style={{
                            background: myUnit?.status === "En-Route" ? '#3b82f6' : '#0f172a',
                            color: '#fff',
                            border: `2px solid ${myUnit?.status === "En-Route" ? '#3b82f6' : '#1e293b'}`,
                            padding: '16px 12px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        🔵 En-Route
                    </button>

                    <button
                        onClick={() => handleStatusChange("On-Scene")}
                        style={{
                            background: (myUnit?.status === "On-Scene" || myUnit?.status === "On-Site") ? '#06b6d4' : '#0f172a',
                            color: '#fff',
                            border: `2px solid ${(myUnit?.status === "On-Scene" || myUnit?.status === "On-Site") ? '#06b6d4' : '#1e293b'}`,
                            padding: '16px 12px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }}
                    >
                        ⚡ On-Scene
                    </button>

                    <button
                        onClick={handleCompleteMission}
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '16px 12px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            gridColumn: 'span 2'
                        }}
                    >
                        ✅ RESOLVE MISSION
                    </button>
                </div>
            </div>

            {/* Currently Assigned Mission Card */}
            {activeMission ? (
                <div className="card" style={{ padding: '24px', borderColor: '#3b82f6', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className={`severity-badge severity-${activeMission.severity}`}>
                            Level {activeMission.severity} Mission
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Mission ID: <strong style={{ color: '#fff' }}>{activeMission.id}</strong>
                        </span>
                    </div>

                    <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                        {activeMission.title}
                    </h2>

                    <div style={{ fontSize: '0.9rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} />
                        <span>{activeMission.locationName}</span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, background: '#0f172a', padding: '14px', borderRadius: '10px', margin: 0 }}>
                        {activeMission.description}
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Navigation size={16} />
                            <span>LAUNCH GPS NAVIGATION</span>
                        </button>
                        <button style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <PhoneCall size={16} />
                            <span>Call Dispatch</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    No active incident assigned to your unit ({unitId}). Squad is currently on standby.
                </div>
            )}

            {/* Field Notes & Dispatch Updates */}
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>
                    FIELD NOTES & DISPATCH AUDIT LOG
                </div>

                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        value={fieldNote}
                        onChange={e => setFieldNote(e.target.value)}
                        placeholder="Type field updates or observations..."
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid #1e293b', color: '#fff', outline: 'none' }}
                    />
                    <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Send size={14} />
                        <span>Add Note</span>
                    </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notesList.map((n, idx) => (
                        <div key={idx} style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '10px 12px', borderRadius: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginRight: '8px' }}>{n.time}:</span>
                            {n.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ResponseTeamDashboard;
