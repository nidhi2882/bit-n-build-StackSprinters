import React from "react";
import { Hospital, Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";
import HospitalCard from "../components/hospitals/HospitalCard";

function HospitalsPage() {
    const { hospitals } = useEmergency();

    const totalTraumaBedsFree = hospitals.reduce((acc, h) => acc + (h.traumaBedsTotal - h.traumaBedsOccupied), 0);
    const totalICUBedsFree = hospitals.reduce((acc, h) => acc + (h.icuBedsTotal - h.icuBedsOccupied), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, textAlign: 'left' }}>
                    Emergency Medical Facility Network
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Real-time hospital capacity monitoring, ICU/Trauma bed availability, and blood bank status
                </p>
            </div>

            {/* Summary Stat bar */}
            <div className="stats-row">
                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Total Trauma Beds Free</div>
                        <div className="stat-val" style={{ color: '#10b981' }}>{totalTraumaBedsFree}</div>
                    </div>
                    <HeartPulse size={24} style={{ color: '#10b981' }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Total ICU Beds Free</div>
                        <div className="stat-val" style={{ color: '#3b82f6' }}>{totalICUBedsFree}</div>
                    </div>
                    <Activity size={24} style={{ color: '#3b82f6' }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Connected Hospitals</div>
                        <div className="stat-val" style={{ color: '#a855f7' }}>{hospitals.length}</div>
                    </div>
                    <Hospital size={24} style={{ color: '#a855f7' }} />
                </div>
            </div>

            {/* Hospital Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {hospitals.map(hosp => (
                    <HospitalCard key={hosp.id} hospital={hosp} />
                ))}
            </div>
        </div>
    );
}

export default HospitalsPage;
