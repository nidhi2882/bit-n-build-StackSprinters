import React, { useState, useEffect } from "react";
import { incidentService } from "../../services/incidentService";
import { resourceService } from "../../services/resourceService";
import { serviceRequestService } from "../../services/serviceRequestService";
import TacticalHeader from "../../components/layout/TacticalHeader";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import IncidentDetailDrawer from "../../components/incidents/IncidentDetailDrawer";
import NewServiceRequestModal from "../../components/modals/NewServiceRequestModal";
import TacticalCommandMap from "../../components/gis/TacticalCommandMap";
import socketService from "../../services/socketService";

export default function SuperAdminDashboard() {
    const [incidents, setIncidents] = useState([]);
    const [units, setUnits] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [mutualAidIncident, setMutualAidIncident] = useState(null);
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [viewMode, setViewMode] = useState("split"); // "split" | "map" | "table"
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [incData, unitData, reqData] = await Promise.all([
                incidentService.getIncidents(),
                resourceService.getResources(),
                serviceRequestService.getAllRequests(),
            ]);
            setIncidents(incData || []);
            setUnits(unitData || []);
            setRequests(reqData || []);
        } catch (err) {
            console.error("Failed to load Super Admin dashboard telemetry", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // 10s live CAD polling
        return () => clearInterval(interval);
    }, []);

    // Keep the open detail drawer synced with freshly polled data for real-time status.
    useEffect(() => {
        if (!selectedIncident) return;
        const fresh = incidents.find((i) => i.id === selectedIncident.id);
        if (fresh && fresh.status !== selectedIncident.status) {
            setSelectedIncident(fresh);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [incidents]);

    const filteredIncidents = incidents.filter((inc) => {
        if (filterCategory === "ALL") return true;
        const cat = (inc.category || inc.type || "").toUpperCase();
        return cat === filterCategory;
    });

    const activeCount = incidents.filter(i => i.status !== "Resolved").length;
    const criticalCount = incidents.filter(i => (i.severity >= 4 || i.urgency === "CRITICAL") && i.status !== "Resolved").length;
    const availableUnitsCount = units.filter(u => u.status === "Available").length;
    const pendingRequestsCount = requests.filter(r => r.status === "PENDING").length;

    const getStatusBadge = (st) => {
        const s = (st || "Reported").toLowerCase();
        if (s.includes("resolve")) {
            return <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-xs font-bold font-code-tabular">Resolved</span>;
        }
        if (s.includes("arrive") || s.includes("scene")) {
            return <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-xs font-bold font-code-tabular">On-Scene</span>;
        }
        if (s.includes("route")) {
            return <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface text-xs font-bold font-code-tabular">En Route</span>;
        }
        if (s.includes("assign")) {
            return <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold font-code-tabular">Assigned</span>;
        }
        return <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-xs font-bold font-code-tabular animate-pulse">Reported</span>;
    };

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-64">
                <TacticalHeader
                    activeIncidentCount={activeCount}
                    onOpenDispatchModal={() => setSelectedIncident(incidents[0] || null)}
                />

                <main className="w-full pt-16 min-h-screen px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* 1. Situation Banner */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                            <div className="flex items-center gap-space-md">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-container text-on-primary-container shadow-sm">
                                    <span className="material-symbols-outlined text-2xl">local_police</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-space-xs">
                                        <span className="font-headline-md text-headline-md text-on-surface font-bold">
                                            Super Admin Tactical Command
                                        </span>
                                        <span className="px-space-xs py-space-2xs bg-secondary-container text-on-secondary-container font-label-xs text-label-xs rounded font-bold uppercase tracking-wider">
                                            DEFCON 2 OPS
                                        </span>
                                    </div>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        Metro Dispatch Sector Alpha • Real-time 9-department synchronized telemetric telemetry feeds active
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-space-sm flex-wrap">
                                <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-low rounded-lg">
                                    <span className="h-2 w-2 rounded-full bg-secondary animate-ping"></span>
                                    <span className="font-code-tabular text-label-xs text-on-surface font-semibold">
                                        CAD SYNC ACTIVE
                                    </span>
                                </div>
                                <button
                                    onClick={loadData}
                                    className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md transition-colors shadow-sm"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-lg">refresh</span>
                                    <span>Sync Grid</span>
                                </button>
                                <button
                                    onClick={() => alert("Mass Metro Alert broadcast dispatched across all municipal cellular towers.")}
                                    className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-error hover:bg-error/90 text-on-error rounded-lg font-label-md text-label-md shadow-sm transition-all"
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-lg">campaign</span>
                                    <span>Mass Metro Alert</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. Stat Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
                            {/* Card 1: Active */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Active Incidents
                                    </span>
                                    <div className="flex items-center gap-space-2xs bg-error/10 px-space-xs py-space-2xs rounded-full">
                                        <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse"></span>
                                        <span className="font-label-xs text-label-xs text-error font-bold">LIVE</span>
                                    </div>
                                </div>
                                <div className="my-space-xs flex items-baseline gap-space-xs">
                                    <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none font-code-tabular">
                                        {activeCount}
                                    </span>
                                    <span className="font-label-sm text-label-sm text-error font-bold flex items-center">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +3/hr
                                    </span>
                                </div>
                                <div className="font-label-xs text-label-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
                                    Across 9 Department Sectors
                                </div>
                            </div>

                            {/* Card 2: Critical */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Critical Incidents
                                    </span>
                                    <span className="px-space-xs py-space-2xs bg-error-container text-on-error-container font-label-xs text-label-xs rounded-full font-bold uppercase">
                                        CRITICAL
                                    </span>
                                </div>
                                <div className="my-space-xs flex items-baseline gap-space-xs">
                                    <span className="font-display-lg text-display-lg text-error font-bold leading-none font-code-tabular">
                                        {criticalCount}
                                    </span>
                                    <span className="font-label-xs text-label-xs text-on-surface-variant">Max Severity</span>
                                </div>
                                <div className="font-label-xs text-label-xs text-error font-semibold pt-2 border-t border-surface-container-high flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    <span>Prioritized Dispatch</span>
                                </div>
                            </div>

                            {/* Card 3: Avg Response Time */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Avg Response Time
                                    </span>
                                    <span className="material-symbols-outlined text-secondary text-lg">timer</span>
                                </div>
                                <div className="my-space-xs flex items-baseline gap-space-xs">
                                    <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none font-code-tabular">
                                        4m 12s
                                    </span>
                                </div>
                                <div className="font-label-xs text-label-xs text-secondary font-semibold pt-2 border-t border-surface-container-high flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">arrow_downward</span>
                                    <span>-48s vs Target (5m)</span>
                                </div>
                            </div>

                            {/* Card 4: Units Available */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Units Available
                                    </span>
                                    <span className="font-code-tabular text-label-xs font-bold text-on-surface">
                                        {availableUnitsCount} / {units.length}
                                    </span>
                                </div>
                                <div className="my-space-xs flex items-baseline gap-space-xs">
                                    <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none font-code-tabular">
                                        {units.length > 0 ? Math.round((availableUnitsCount / units.length) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="font-label-xs text-label-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
                                    Ready for Instant Dispatch
                                </div>
                            </div>

                            {/* Card 5: Service Requests */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Mutual Aid Requests
                                    </span>
                                    <span className="material-symbols-outlined text-tertiary text-lg">swap_horiz</span>
                                </div>
                                <div className="my-space-xs flex items-baseline gap-space-xs">
                                    <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none font-code-tabular">
                                        {pendingRequestsCount}
                                    </span>
                                    <span className="font-label-xs text-label-xs text-secondary font-bold">Pending</span>
                                </div>
                                <div className="font-label-xs text-label-xs text-tertiary font-semibold pt-2 border-t border-surface-container-high">
                                    Cross-Agency Escalations
                                </div>
                            </div>
                        </div>

                        {/* 3. Category Filter Chips & View Mode Switcher */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {["ALL", "FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE"].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                            filterCategory === cat
                                                ? "bg-primary text-on-primary shadow-sm"
                                                : "bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-surface-container-high"
                                        }`}
                                    >
                                        {cat === "ALL" ? "All Departments" : cat}
                                    </button>
                                ))}
                            </div>

                            {/* View Switcher */}
                            <div className="flex items-center gap-1 bg-surface-container-lowest border border-surface-container-high p-1 rounded-lg self-end sm:self-auto">
                                <button
                                    onClick={() => setViewMode("split")}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                        viewMode === "split" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">dashboard</span>
                                    Split View
                                </button>
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                        viewMode === "map" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">map</span>
                                    Vector Map
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                        viewMode === "table" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">table_rows</span>
                                    CAD Feed
                                </button>
                            </div>
                        </div>

                        {/* Tactical GIS Vector Radar Map (Phase 7) */}
                        {(viewMode === "split" || viewMode === "map") && (
                            <TacticalCommandMap
                                incidents={filteredIncidents}
                                units={units}
                                selectedIncident={selectedIncident}
                                onSelectIncident={(inc) => setSelectedIncident(inc)}
                            />
                        )}

                        {/* 4. Live CAD Operations Feed Table */}
                        {(viewMode === "split" || viewMode === "table") && (
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                            <div className="p-space-md border-b border-surface-container-high flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                                        Central Operations CAD Feed
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-code-tabular font-bold">
                                        {filteredIncidents.length} active
                                    </span>
                                </div>
                                <span className="font-label-xs text-label-xs text-on-surface-variant font-code-tabular">
                                    Click any row to open Tactical Detail Drawer
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-body-sm font-body-sm">
                                    <thead className="bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider border-b border-surface-container-high">
                                        <tr>
                                            <th className="p-3">CAD ID</th>
                                            <th className="p-3">Category</th>
                                            <th className="p-3">Incident Title & Location</th>
                                            <th className="p-3">Severity</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Assigned Unit</th>
                                            <th className="p-3">Reported Time</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-high">
                                        {filteredIncidents.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                                                    No incidents match selected department category.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredIncidents.map((inc) => (
                                                <tr
                                                    key={inc.id}
                                                    onClick={() => setSelectedIncident(inc)}
                                                    className="hover:bg-surface-container-low/80 cursor-pointer transition-colors"
                                                >
                                                    <td className="p-3 font-code-tabular font-bold text-primary">
                                                        {inc.id}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-code-tabular text-xs font-semibold">
                                                            {inc.category || inc.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-on-surface">{inc.title}</div>
                                                        <div className="text-xs text-on-surface-variant truncate max-w-md">
                                                            {inc.locationName || "Sector Coordinates"}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`font-code-tabular font-bold ${
                                                                inc.severity >= 4 ? "text-error" : "text-secondary"
                                                            }`}
                                                        >
                                                            P{inc.severity || 3}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        {getStatusBadge(inc.status)}
                                                    </td>
                                                    <td className="p-3 font-code-tabular text-xs">
                                                        {inc.assignedUnitId || "None"}
                                                    </td>
                                                    <td className="p-3 text-xs text-on-surface-variant font-code-tabular">
                                                        {inc.reportedAt ? new Date(inc.reportedAt).toLocaleTimeString() : "Recent"}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedIncident(inc);
                                                            }}
                                                            className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold hover:bg-primary/90 transition-colors"
                                                        >
                                                            Dispatch
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Incident Detail Drawer */}
            {selectedIncident && (
                <IncidentDetailDrawer
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                    onUpdated={loadData}
                    onRequestMutualAid={(inc) => setMutualAidIncident(inc)}
                />
            )}

            {/* Mutual Aid Modal */}
            {mutualAidIncident && (
                <NewServiceRequestModal
                    incident={mutualAidIncident}
                    onClose={() => setMutualAidIncident(null)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}
