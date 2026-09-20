import React, { useState } from "react";
import { Hospital, HeartPulse, Activity, Save, ShieldAlert, Phone, Ambulance, MapPin, AlertCircle } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

function HospitalDashboard() {
    const { hospitals, incidents, resources, updateHospitalCapacity } = useEmergency();
    const { user } = useAuth();

    // Filter incidents to medical / CAT_MED only
    const medicalIncidents = incidents.filter(i => 
        (i.type || "").toLowerCase().includes("med") || 
        (i.title || "").toLowerCase().includes("med") || 
        (i.title || "").toLowerCase().includes("casualty") ||
        (i.description || "").toLowerCase().includes("injured")
    );

    const activeAmbulances = resources.filter(r => 
        (r.type || "").toLowerCase().includes("ambulance") || 
        (r.type || "").toLowerCase().includes("medical")
    );

    // Default to SSG General Hospital (HOSP-001) or first
    const myHospital = hospitals.find(h => h.id === "HOSP-001") || hospitals[0];

    const [traumaOccupied, setTraumaOccupied] = useState(myHospital.traumaBedsOccupied);
    const [icuOccupied, setIcuOccupied] = useState(myHospital.icuBedsOccupied);
    const [bayStatus, setBayStatus] = useState(myHospital.ambulanceBayStatus);
    const [savedMsg, setSavedMsg] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        updateHospitalCapacity(myHospital.id, parseInt(traumaOccupied), parseInt(icuOccupied), bayStatus);
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
    };

    return (
        <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', borderColor: '#a855f7', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#a855f7', color: '#fff', padding: '10px', borderRadius: '10px' }}>
                            <Hospital size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#e9d5ff', fontWeight: 700, textTransform: 'uppercase' }}>
                                MEDICAL FACILITY & ER TELEMETRY DASHBOARD • {user?.hospitalId || myHospital.id}
                            </div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                                {myHospital.name}
                            </h1>
                        </div>
                    </div>

                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                        Status: {myHospital.status}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Live Telemetry Editor */}
                <form onSubmit={handleSave} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HeartPulse size={20} style={{ color: '#ef4444' }} />
                        <span>Real-Time Bed & Telemetry Controls</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Trauma Beds */}
                        <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                Trauma Beds Occupied (Total: {myHospital.traumaBedsTotal})
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input 
                                    type="number"
                                    min={0}
                                    max={myHospital.traumaBedsTotal}
                                    value={traumaOccupied}
                                    onChange={(e) => setTraumaOccupied(e.target.value)}
                                    style={{ width: '80px', background: '#0b1120', border: '1px solid #3b82f6', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}
                                />
                                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                                    {myHospital.traumaBedsTotal - traumaOccupied} Beds Free
                                </div>
                            </div>
                        </div>

                        {/* ICU Beds */}
                        <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                ICU Beds Occupied (Total: {myHospital.icuBedsTotal})
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input 
                                    type="number"
                                    min={0}
                                    max={myHospital.icuBedsTotal}
                                    value={icuOccupied}
                                    onChange={(e) => setIcuOccupied(e.target.value)}
                                    style={{ width: '80px', background: '#0b1120', border: '1px solid #a855f7', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}
                                />
                                <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700 }}>
                                    {myHospital.icuBedsTotal - icuOccupied} ICU Free
                                </div>
                            </div>
                        </div>

                        {/* Ambulance Bay Status */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                ER Ambulance Bay Status
                            </label>
                            <select
                                value={bayStatus}
                                onChange={(e) => setBayStatus(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem'
                                }}
                            >
                                <option value="Open">🟢 Open - Receiving Ambulances</option>
                                <option value="Busy (Diversion Warn)">🟡 Busy - High Volume Diversion Warning</option>
                                <option value="Closed / Divert">🔴 Full Diversion - Redirect Incoming</option>
                            </select>
                        </div>
                    </div>

                    {savedMsg && (
                        <div style={{ padding: '8px', background: 'rgba(16,185,129,0.2)', color: '#a7f3d0', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}>
                            ✓ Telemetry updated and broadcast to EMS routing engine!
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Save size={16} />
                        <span>Save & Broadcast Hospital Telemetry</span>
                    </button>
                </form>

                {/* Department Scoped Medical Emergency Feed */}
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Ambulance size={20} style={{ color: '#10b981' }} />
                            <span>Incoming Medical Emergencies & Ambulances</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#a7f3d0', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                            {medicalIncidents.length} Active
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
                        {medicalIncidents.length > 0 ? (
                            medicalIncidents.map((inc) => (
                                <div key={inc.id} style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span className={`severity-badge severity-${inc.severity}`}>
                                            Level {inc.severity} Medical
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{inc.reportedAt || "Active"}</span>
                                    </div>
                                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', marginBottom: '4px' }}>
                                        {inc.title}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} color="#10b981" />
                                        <span>{inc.locationName}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.85rem' }}>
                                No active medical emergency dispatches currently routed.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HospitalDashboard;
