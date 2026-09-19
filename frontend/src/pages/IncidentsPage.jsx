import React from "react";
import { AlertTriangle, Filter, Search, PlusCircle, Copy, Sparkles } from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";
import IncidentCard from "../components/incidents/IncidentCard";
import IncidentDetailModal from "../components/incidents/IncidentDetailModal";
import NewIncidentModal from "../components/incidents/NewIncidentModal";

function IncidentsPage() {
    const { 
        incidents, 
        filterType, 
        setFilterType, 
        filterSeverity, 
        setFilterSeverity, 
        searchTerm, 
        setSearchTerm,
        setIsNewIncidentModalOpen 
    } = useEmergency();

    const filtered = incidents.filter(incident => {
        const matchesType = filterType === "ALL" || incident.type.toUpperCase() === filterType.toUpperCase();
        const matchesSeverity = filterSeverity === "ALL" || incident.severity.toString() === filterSeverity;
        const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              incident.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              incident.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSeverity && matchesSearch;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, textAlign: 'left' }}>
                        Emergency Incident Directory & Triage
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Real-time incident management, severity classification, duplicate consolidation & unit assignment
                    </p>
                </div>

                <button 
                    onClick={() => setIsNewIncidentModalOpen(true)}
                    className="btn-report-emergency"
                >
                    <PlusCircle size={18} />
                    <span>+ Create New Incident</span>
                </button>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="card" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                    <input 
                        type="text"
                        placeholder="Search incident by code, title or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            background: '#0b1120',
                            border: '1px solid #1e293b',
                            color: '#fff',
                            padding: '8px 12px 8px 36px',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Type:</span>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ background: '#0b1120', border: '1px solid #1e293b', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">All Types</option>
                        <option value="FLOOD">Flood</option>
                        <option value="FIRE">Fire</option>
                        <option value="HAZARDOUS">Hazardous</option>
                        <option value="ACCIDENT">Accident</option>
                        <option value="MEDICAL">Medical</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Severity:</span>
                    <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        style={{ background: '#0b1120', border: '1px solid #1e293b', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">All Severities</option>
                        <option value="5">Level 5 (Critical)</option>
                        <option value="4">Level 4 (High)</option>
                        <option value="3">Level 3 (Medium)</option>
                        <option value="2">Level 2 (Low)</option>
                    </select>
                </div>
            </div>

            {/* Incident Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                {filtered.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b', background: '#0f172a', borderRadius: '12px' }}>
                        No emergency incidents found matching criteria.
                    </div>
                ) : (
                    filtered.map(incident => (
                        <IncidentCard key={incident.id} incident={incident} />
                    ))
                )}
            </div>

            <IncidentDetailModal />
            <NewIncidentModal />
        </div>
    );
}

export default IncidentsPage;
