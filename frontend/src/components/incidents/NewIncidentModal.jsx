import React, { useState } from "react";
import { X, AlertTriangle, Send, Sparkles, MapPin } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const NewIncidentModal = () => {
    const { isNewIncidentModalOpen, setIsNewIncidentModalOpen, addNewIncident, setSelectedIncident } = useEmergency();
    const [formData, setFormData] = useState({
        type: "Flood",
        title: "",
        description: "",
        severity: 4,
        locationName: "Subhanpura Sector 2, Vadodara",
        lat: "22.3120",
        lng: "73.1750"
    });

    if (!isNewIncidentModalOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const created = addNewIncident(formData);
        setIsNewIncidentModalOpen(false);
        setSelectedIncident(created);
    };

    return (
        <div className="modal-overlay" onClick={() => setIsNewIncidentModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#ef4444', padding: '6px', borderRadius: '8px', color: '#fff' }}>
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                                Report New Emergency Incident
                            </h2>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                Triggers instant AI severity scoring & duplicate report matching
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsNewIncidentModalOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                Emergency Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                style={{
                                    width: '100%',
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem'
                                }}
                            >
                                <option value="Flood">🌊 Flood / Water Rescue</option>
                                <option value="Fire">🔥 Structure / Industrial Fire</option>
                                <option value="Hazardous">☣️ Chemical / Toxic Hazard</option>
                                <option value="Accident">🚗 Highway Collision</option>
                                <option value="Medical">🚑 Medical Emergency</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                                Estimated Severity (1 - 5)
                            </label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                style={{
                                    width: '100%',
                                    background: '#0f172a',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '0.88rem'
                                }}
                            >
                                <option value="5">Level 5 (Critical - Life Threatening)</option>
                                <option value="4">Level 4 (High - Rapid Spread)</option>
                                <option value="3">Level 3 (Medium - Moderate Impact)</option>
                                <option value="2">Level 2 (Low - Localized)</option>
                                <option value="1">Level 1 (Minor)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Incident Title / Headline
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g. Roof Collapse during heavy rain near Market"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                background: '#0f172a',
                                border: '1px solid #1e293b',
                                color: '#fff',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '0.88rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Location Description
                        </label>
                        <input 
                            type="text"
                            placeholder="e.g. Subhanpura Ward 4, Vadodara"
                            value={formData.locationName}
                            onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                background: '#0f172a',
                                border: '1px solid #1e293b',
                                color: '#fff',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '0.88rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                            Detailed Situation Report
                        </label>
                        <textarea 
                            rows={3}
                            placeholder="Provide details: casualties, water level, hazards, resource requirements..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                background: '#0f172a',
                                border: '1px solid #1e293b',
                                color: '#fff',
                                padding: '10px',
                                borderRadius: '8px',
                                fontSize: '0.88rem',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#e9d5ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} style={{ color: '#a855f7' }} />
                        <span>AI pipeline will automatically perform semantic duplicate matching & resource ranking.</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <button 
                            type="button"
                            onClick={() => setIsNewIncidentModalOpen(false)}
                            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Send size={15} />
                            <span>Submit Report</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewIncidentModal;
