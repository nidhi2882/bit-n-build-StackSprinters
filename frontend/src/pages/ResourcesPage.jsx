import React, { useState } from "react";
import { Truck, ShieldCheck, Filter, Search, CheckCircle2, Clock } from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";
import ResourceCard from "../components/resources/ResourceCard";
import IncidentDetailModal from "../components/incidents/IncidentDetailModal";

function ResourcesPage() {
    const { resources } = useEmergency();
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredResources = resources.filter(res => {
        const matchesCategory = categoryFilter === "ALL" || res.category.toUpperCase() === categoryFilter.toUpperCase();
        const matchesStatus = statusFilter === "ALL" || res.status.toUpperCase() === statusFilter.toUpperCase();
        return matchesCategory && matchesStatus;
    });

    const availableCount = resources.filter(r => r.status === "Available").length;
    const enRouteCount = resources.filter(r => r.status === "En-Route").length;
    const onSiteCount = resources.filter(r => r.status === "On-Site").length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, textAlign: 'left' }}>
                        Emergency Resource & Response Fleet Directory
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Track rescue teams, boats, fire tenders, ambulances, hazmat squads & equipment readiness
                    </p>
                </div>
            </div>

            {/* Status Summary Bar */}
            <div className="stats-row">
                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Available Units</div>
                        <div className="stat-val" style={{ color: '#10b981' }}>{availableCount}</div>
                    </div>
                    <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                </div>
                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">En-Route Dispatched</div>
                        <div className="stat-val" style={{ color: '#3b82f6' }}>{enRouteCount}</div>
                    </div>
                    <Clock size={24} style={{ color: '#3b82f6' }} />
                </div>
                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">On-Site Operating</div>
                        <div className="stat-val" style={{ color: '#06b6d4' }}>{onSiteCount}</div>
                    </div>
                    <Truck size={24} style={{ color: '#06b6d4' }} />
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="card" style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Category:</span>
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ background: '#0b1120', border: '1px solid #1e293b', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">All Categories</option>
                        <option value="Flood">Flood / Water Rescue</option>
                        <option value="Fire">Fire Engines</option>
                        <option value="Medical">Ambulance & Medical</option>
                        <option value="Hazardous">Hazmat Squads</option>
                        <option value="Accident">Highway Rescue</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Status:</span>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ background: '#0b1120', border: '1px solid #1e293b', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="En-Route">En-Route</option>
                        <option value="On-Site">On-Site</option>
                        <option value="Standby">Standby</option>
                    </select>
                </div>
            </div>

            {/* Resource Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredResources.map(res => (
                    <ResourceCard key={res.id} resource={res} />
                ))}
            </div>

            <IncidentDetailModal />
        </div>
    );
}

export default ResourcesPage;
