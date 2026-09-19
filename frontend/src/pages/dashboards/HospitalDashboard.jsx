import React, { useState } from "react";
import { Hospital, HeartPulse, Activity, Save, ShieldAlert, Phone } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

function HospitalDashboard() {
    const { hospitals, updateHospitalCapacity } = useEmergency();
    const { user } = useAuth();

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
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', borderColor: '#a855f7', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#a855f7', color: '#fff', padding: '10px', borderRadius: '10px' }}>
                            <Hospital size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#e9d5ff', fontWeight: 700, textTransform: 'uppercase' }}>
                                MEDICAL FACILITY DASHBOARD • {user?.hospitalId || myHospital.id}
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

            {/* Live Telemetry Editor */}
            <form onSubmit={handleSave} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartPulse size={20} style={{ color: '#ef4444' }} />
                    <span>Real-Time Bed & Telemetry Management</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Trauma Beds */}
                    <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                            Trauma Beds Occupied (Total: {myHospital.traumaBedsTotal})
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                                type="number"
                                min={0}
                                max={myHospital.traumaBedsTotal}
                                value={traumaOccupied}
                                onChange={(e) => setTraumaOccupied(e.target.value)}
                                style={{ width: '80px', background: '#0b1120', border: '1px solid #3b82f6', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                            />
                            <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                                {myHospital.traumaBedsTotal - traumaOccupied} Beds Free
                            </div>
                        </div>
                    </div>

                    {/* ICU Beds */}
                    <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                            ICU Beds Occupied (Total: {myHospital.icuBedsTotal})
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                                type="number"
                                min={0}
                                max={myHospital.icuBedsTotal}
                                value={icuOccupied}
                                onChange={(e) => setIcuOccupied(e.target.value)}
                                style={{ width: '80px', background: '#0b1120', border: '1px solid #a855f7', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                            />
                            <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700 }}>
                                {myHospital.icuBedsTotal - icuOccupied} ICU Free
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ambulance Bay Status */}
                <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                        Ambulance Bay Routing Status
                    </label>
                    <select
                        value={bayStatus}
                        onChange={(e) => setBayStatus(e.target.value)}
                        style={{
                            width: '100%',
                            background: '#0b1120',
                            border: '1px solid #1e293b',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}
                    >
                        <option value="Open">🟢 Open - Receiving Ambulances</option>
                        <option value="Busy (Diversion Warn)">🟡 Busy - High Volume Diversion Warning</option>
                        <option value="Closed / Divert">🔴 Full Diversion - Redirect to SSG General</option>
                    </select>
                </div>

                {savedMsg && (
                    <div style={{ padding: '10px', background: 'rgba(16,185,129,0.2)', color: '#a7f3d0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                        ✓ Medical facility telemetry updated & broadcasted to emergency operators!
                    </div>
                )}

                <button
                    type="submit"
                    style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Save size={18} />
                    <span>Save & Telecast Hospital Capacity</span>
                </button>
            </form>
        </div>
    );
}

export default HospitalDashboard;
