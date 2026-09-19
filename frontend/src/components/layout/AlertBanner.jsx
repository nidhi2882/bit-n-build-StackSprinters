import React from "react";
import { AlertOctagon, X, ChevronRight } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const AlertBanner = () => {
    const { alerts, dismissAlert, setSelectedIncident, incidents } = useEmergency();

    if (!alerts || alerts.length === 0) return null;

    const currentAlert = alerts[0]; // Display top alert

    const handleActionClick = () => {
        if (currentAlert.incidentId) {
            const targetInc = incidents.find(i => i.id === currentAlert.incidentId);
            if (targetInc) {
                setSelectedIncident(targetInc);
            }
        }
    };

    return (
        <div className="alert-banner">
            <div className="alert-banner-left">
                <AlertOctagon size={20} className="alert-icon" />
                <div>
                    <div className="alert-title">
                        [{currentAlert.type}] {currentAlert.title}
                    </div>
                    <div className="alert-desc">
                        {currentAlert.message}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentAlert.actionRequired && (
                    <button className="alert-action-btn" onClick={handleActionClick}>
                        <span>{currentAlert.actionRequired}</span>
                        <ChevronRight size={14} style={{ display: 'inline', marginLeft: 4 }} />
                    </button>
                )}

                <button 
                    onClick={() => dismissAlert(currentAlert.id)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
                    title="Dismiss Alert"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default AlertBanner;
