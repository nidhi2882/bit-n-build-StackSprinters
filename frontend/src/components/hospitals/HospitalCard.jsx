import React from "react";
import { Hospital, Activity, Phone, MapPin, ShieldAlert } from "lucide-react";

const HospitalCard = ({ hospital }) => {
    const traumaFree = hospital.traumaBedsTotal - hospital.traumaBedsOccupied;
    const icuFree = hospital.icuBedsTotal - hospital.icuBedsOccupied;

    const getStatusColor = (status) => {
        if (status === "Optimal") return "#10b981";
        if (status === "Near Capacity") return "#f97316";
        return "#ef4444";
    };

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', padding: '6px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.4)' }}>
                        <Hospital size={18} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                            {hospital.name}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} style={{ color: '#ef4444' }} />
                            <span>{hospital.address}</span>
                        </div>
                    </div>
                </div>

                <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: `${getStatusColor(hospital.status)}20`,
                    color: getStatusColor(hospital.status),
                    border: `1px solid ${getStatusColor(hospital.status)}50`
                }}>
                    {hospital.status}
                </span>
            </div>

            {/* Capacity Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Trauma Beds Free</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: traumaFree > 5 ? '#10b981' : '#ef4444' }}>
                        {traumaFree} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {hospital.traumaBedsTotal}</span>
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ICU Beds Free</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: icuFree > 2 ? '#3b82f6' : '#ef4444' }}>
                        {icuFree} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {hospital.icuBedsTotal}</span>
                    </div>
                </div>
            </div>

            {/* Supplementary Info */}
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Oxygen Tank Capacity:</span>
                    <strong style={{ color: '#60a5fa' }}>{hospital.oxygenSupplyPct}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Burn Unit Capacity:</span>
                    <strong style={{ color: '#e2e8f0' }}>{hospital.burnUnitBeds} Beds</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ambulance Bay:</span>
                    <strong style={{ color: hospital.ambulanceBayStatus === "Open" ? '#10b981' : '#f97316' }}>{hospital.ambulanceBayStatus}</strong>
                </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} />
                    <span>{hospital.contact}</span>
                </div>
                <button style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}>
                    Notify Dispatch
                </button>
            </div>
        </div>
    );
};

export default HospitalCard;
