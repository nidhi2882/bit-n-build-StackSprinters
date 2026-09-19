import React from "react";
import { 
    AlertTriangle, 
    Truck, 
    Hospital, 
    Copy, 
    Activity, 
    Filter, 
    Search,
    MapPin,
    Radio,
    PhoneCall,
    Cpu,
    Zap,
    GitMerge
} from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";
import MapView from "../components/map/MapView";
import IncidentCard from "../components/incidents/IncidentCard";
import AlertBanner from "../components/layout/AlertBanner";
import IncidentDetailModal from "../components/incidents/IncidentDetailModal";
import NewIncidentModal from "../components/incidents/NewIncidentModal";
import AICopilotDrawer from "../components/ai/AICopilotDrawer";
import CallCenterIngestionModal from "../components/modals/CallCenterIngestionModal";
import DuplicateReviewModal from "../components/modals/DuplicateReviewModal";
import IoTSensorSimulator from "../components/common/IoTSensorSimulator";

function CommandCenter() {
    const [callCenterModalOpen, setCallCenterModalOpen] = React.useState(false);
    const [duplicateModalOpen, setDuplicateModalOpen] = React.useState(false);
    const { 
        incidents, 
        resources, 
        hospitals, 
        filterType, 
        setFilterType, 
        filterSeverity, 
        setFilterSeverity,
        searchTerm,
        setSearchTerm,
        addNewIncident
    } = useEmergency();

    // Calculate metrics
    const totalActiveIncidents = incidents.filter(i => i.status !== "Resolved").length;
    const criticalIncidents = incidents.filter(i => i.severity >= 4 && i.status !== "Resolved").length;
    const availableUnits = resources.filter(r => r.status === "Available").length;
    const totalDuplicatesConsolidated = incidents.reduce((acc, curr) => acc + (curr.duplicateCount || 0), 0);

    // Filter incidents
    const filteredIncidents = incidents.filter(incident => {
        const matchesType = filterType === "ALL" || incident.type.toUpperCase() === filterType.toUpperCase();
        const matchesSeverity = filterSeverity === "ALL" || incident.severity.toString() === filterSeverity;
        const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              incident.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              incident.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSeverity && matchesSearch;
    });

    return (
        <div className="command-center-container">
            {/* Top Critical Alert Banner */}
            <AlertBanner />

            {/* Top Stat Metrics Bar */}
            <div className="stats-row">
                <div className="stat-card" style={{ borderColor: criticalIncidents > 0 ? 'rgba(239, 68, 68, 0.4)' : '#1e293b' }}>
                    <div>
                        <div className="stat-lbl">Active Emergency Incidents</div>
                        <div className="stat-val" style={{ color: criticalIncidents > 0 ? '#ef4444' : '#fff' }}>
                            {totalActiveIncidents}
                        </div>
                    </div>
                    <AlertTriangle size={24} style={{ color: criticalIncidents > 0 ? '#ef4444' : '#64748b' }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Critical Severity (4-5)</div>
                        <div className="stat-val" style={{ color: '#f97316' }}>
                            {criticalIncidents}
                        </div>
                    </div>
                    <Activity size={24} style={{ color: '#f97316' }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Available Response Units</div>
                        <div className="stat-val" style={{ color: '#10b981' }}>
                            {availableUnits} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {resources.length}</span>
                        </div>
                    </div>
                    <Truck size={24} style={{ color: '#10b981' }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Duplicate Reports Consolidated</div>
                        <div className="stat-val" style={{ color: '#3b82f6' }}>
                            {totalDuplicatesConsolidated}
                        </div>
                    </div>
                    <Copy size={24} style={{ color: '#3b82f6' }} />
                </div>
            </div>

            {/* Ingestion & AI Status Action Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", border: "1px solid #1e293b", padding: "10px 16px", borderRadius: "10px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#a7f3d0", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 10px", borderRadius: "6px" }}>
                        <Cpu size={14} style={{ color: "#10b981" }} />
                        <span>AI Microservice: <strong>FastAPI v1 (NLP + Hard Floor Severity)</strong> Online</span>
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        Degraded Fallback: <strong>Armed</strong>
                    </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setDuplicateModalOpen(true)}
                        style={{
                            background: "#0f172a",
                            border: "1px solid #3b82f6",
                            color: "#93c5fd",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
                        <GitMerge size={15} style={{ color: '#3b82f6' }} />
                        <span>Duplicate Review Queue</span>
                    </button>

                    <button
                        onClick={() => setCallCenterModalOpen(true)}
                        style={{
                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            border: "none",
                            color: "#fff",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)"
                        }}
                    >
                        <PhoneCall size={15} />
                        <span>112 / 911 Call Intake (Rapid Dispatch)</span>
                    </button>
                </div>
            </div>

            {/* Main Split Grid: Interactive Geospatial Map (Left) + Live Incident Feed (Right) */}
            <div className="main-split-grid">
                {/* Left: Map View */}
                <div className="map-card-wrapper">
                    <div className="map-header">
                        <div className="map-title">
                            <MapPin size={18} style={{ color: '#ef4444' }} />
                            <span>Geospatial Command Center • Live GIS Feed</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                            <span>Live Markers: Incidents, Units & Hospitals</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '520px' }}>
                        <MapView height="560px" />
                    </div>
                </div>

                {/* Right: Active Incidents Stream */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '620px', overflowY: 'auto' }}>
                    {/* Filter controls */}
                    <div className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Filter size={16} style={{ color: '#3b82f6' }} />
                                <span>Live Incident Dispatch Stream</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{filteredIncidents.length} Records</span>
                        </div>

                        {/* Search input */}
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }} />
                            <input 
                                type="text"
                                placeholder="Search by title, location or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: '#0b1120',
                                    border: '1px solid #1e293b',
                                    color: '#fff',
                                    padding: '6px 10px 6px 32px',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Filter pills */}
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                            {["ALL", "FLOOD", "FIRE", "HAZARDOUS", "ACCIDENT", "MEDICAL"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    style={{
                                        background: filterType === type ? '#3b82f6' : '#1e293b',
                                        color: filterType === type ? '#fff' : '#94a3b8',
                                        border: 'none',
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Incidents Card List */}
                    {filteredIncidents.length === 0 ? (
                        <div className="card" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                            No incidents matching the current filter.
                        </div>
                    ) : (
                        filteredIncidents.map(incident => (
                            <IncidentCard key={incident.id} incident={incident} />
                        ))
                    )}
                </div>
            </div>

            {/* IoT & Telemetry Sensor Simulator (Phase 3 Webhook Ingestion) */}
            <IoTSensorSimulator onSensorIncidentTriggered={(inc) => addNewIncident(inc)} />

            {/* Modals & Drawers */}
            <CallCenterIngestionModal 
                isOpen={callCenterModalOpen} 
                onClose={() => setCallCenterModalOpen(false)} 
                onIncidentCreated={(inc) => addNewIncident(inc)}
            />
            <DuplicateReviewModal
                isOpen={duplicateModalOpen}
                onClose={() => setDuplicateModalOpen(false)}
            />
            <IncidentDetailModal />
            <NewIncidentModal />
            <AICopilotDrawer />
        </div>
    );
}

export default CommandCenter;