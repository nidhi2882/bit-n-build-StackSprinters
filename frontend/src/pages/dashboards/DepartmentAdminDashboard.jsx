import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { incidentService } from "../../services/incidentService";
import { resourceService } from "../../services/resourceService";
import { serviceRequestService } from "../../services/serviceRequestService";
import TacticalHeader from "../../components/layout/TacticalHeader";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import IncidentDetailDrawer from "../../components/incidents/IncidentDetailDrawer";
import NewServiceRequestModal from "../../components/modals/NewServiceRequestModal";
import { SectorAllClearEmptyState } from "../../components/common/SystemStateFallbacks";

const DEPT_CONFIGS = {
    FLOOD: {
        title: "Flood & Water Infrastructure Department Console",
        subtitle: "Tactical Command Sector 4 • NDRF Water Rescue Command",
        sectorCode: "CAD-S4",
        icon: "waves",
        primaryColor: "#0284c7",
        badgeBg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
        bannerBg: "from-sky-950 via-slate-900 to-slate-950",
        activeAlert: "Active Storm Surge Phase 2 • High Inundation Risk",
        unitCategory: "Water Rescue & Heavy Submersibles"
    },
    FIRE: {
        title: "Fire Suppression & Heavy Rescue Console",
        subtitle: "Vadodara Fire Department • Industrial & Structural Command",
        sectorCode: "CAD-FIRE",
        icon: "local_fire_department",
        primaryColor: "#dc2626",
        badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        bannerBg: "from-rose-950 via-slate-900 to-slate-950",
        activeAlert: "Structural Chemical Fire Phase 4 • Hazmat Units On Standby",
        unitCategory: "Fire Tenders, Foam Rigs & Ladders"
    },
    MEDICAL: {
        title: "Emergency Medical & Trauma EMS Console",
        subtitle: "SSG Hospital Trauma Emergency Center • Mass Casualty Command",
        sectorCode: "CAD-MED",
        icon: "medical_services",
        primaryColor: "#059669",
        badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        bannerBg: "from-emerald-950 via-slate-900 to-slate-950",
        activeAlert: "Mass Casualty Protocol Level 2 Active • Triage Bay Open",
        unitCategory: "Advanced Life Support & Trauma Teams"
    },
    CRASH: {
        title: "Highway Crash & Vehicle Extrication Console",
        subtitle: "Highway Patrol Corridor • Multi-Vehicle Pileup Division",
        sectorCode: "CAD-CRASH",
        icon: "car_crash",
        primaryColor: "#d97706",
        badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        bannerBg: "from-amber-950 via-slate-900 to-slate-950",
        activeAlert: "Expressway Traffic Diversion Active • Heavy Tow Deployed",
        unitCategory: "Hydraulic Cutters & Heavy Tow Cranes"
    },
    HAZMAT: {
        title: "Industrial Hazmat & CBRN Containment Console",
        subtitle: "GIDC Industrial Hazmat Division • Toxic Vapor Mitigation",
        sectorCode: "CAD-HAZ",
        icon: "science",
        primaryColor: "#ca8a04",
        badgeBg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        bannerBg: "from-yellow-950 via-slate-900 to-slate-950",
        activeAlert: "Level-A Chemical Threat Active • 800m Perimeter Enforced",
        unitCategory: "Level-A Suits & Decontamination Rigs"
    },
    COLLAPSE: {
        title: "Urban Search & Heavy Structural Collapse Console",
        subtitle: "USAR Structural Wing • Void Entrapment Operations",
        sectorCode: "CAD-USAR",
        icon: "domain_disabled",
        primaryColor: "#ea580c",
        badgeBg: "bg-orange-500/15 text-orange-400 border-orange-500/30",
        bannerBg: "from-stone-900 via-orange-950 to-slate-950",
        activeAlert: "Underground Structural Failure • Seismic Void Sensors Active",
        unitCategory: "Concrete Breakers, Cranes & USAR K9"
    },
    CYCLONE: {
        title: "Severe Cyclone & Storm Emergency Console",
        subtitle: "Coastal Weather Disaster Unit • Gale Force Debris Clearance",
        sectorCode: "CAD-CYC",
        icon: "cyclone",
        primaryColor: "#7c3aed",
        badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        bannerBg: "from-indigo-950 via-purple-950 to-slate-950",
        activeAlert: "Category 3 Cyclone Influx • Downed Live Line Protocols",
        unitCategory: "Mobile Gensets, Tree Clearers & Utility"
    },
    SEARCH_RESCUE: {
        title: "Wilderness & Thermal Drone SAR Console",
        subtitle: "Mountain & Wilderness Search Command • K9 SAR Unit",
        sectorCode: "CAD-SAR",
        icon: "travel_explore",
        primaryColor: "#16a34a",
        badgeBg: "bg-green-500/15 text-green-400 border-green-500/30",
        bannerBg: "from-green-950 via-slate-900 to-slate-950",
        activeAlert: "Night Ridge Search Active • Thermal Aerial Drones Deployed",
        unitCategory: "Night Vision, Thermal Drones & K9 Trackers"
    },
    POLICE: {
        title: "Metropolitan Police Tactical Command Console",
        subtitle: "City Police Headquarters • Civil Protection & Patrol",
        sectorCode: "CAD-POLICE",
        icon: "local_police",
        primaryColor: "#2563eb",
        badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        bannerBg: "from-blue-950 via-slate-900 to-slate-950",
        activeAlert: "Substation Security Perimeter Active • Barricades Deployed",
        unitCategory: "Crowd Control, Traffic & Tactical Squads"
    }
};

export default function DepartmentAdminDashboard({ categoryOverride = null }) {
    const { user } = useAuth();
    const rawCategory = categoryOverride || user?.departmentCategory || "FLOOD";
    const categoryKey = rawCategory.toUpperCase().replace("CAT_", "");
    const config = DEPT_CONFIGS[categoryKey] || DEPT_CONFIGS.FLOOD;

    const [incidents, setIncidents] = useState([]);
    const [units, setUnits] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [mutualAidIncident, setMutualAidIncident] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [incData, unitData, incomingData] = await Promise.all([
                incidentService.getIncidents(),
                resourceService.getResources(categoryKey),
                serviceRequestService.getIncomingRequests(),
            ]);
            setIncidents(incData || []);
            setUnits(unitData || []);
            setIncomingRequests(incomingData || []);
        } catch (err) {
            console.error("Failed to load department telemetry", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 15000);
        return () => clearInterval(interval);
    }, [categoryKey]);

    const activeIncidents = incidents.filter(i => i.status !== "Resolved");
    const deployedUnits = units.filter(u => u.status !== "Available");
    const availableUnits = units.filter(u => u.status === "Available");

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-64">
                <TacticalHeader
                    activeIncidentCount={activeIncidents.length}
                    onOpenDispatchModal={() => setSelectedIncident(incidents[0] || null)}
                />

                <main className="w-full pt-16 min-h-screen px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* 1. Department Top Banner */}
                        <div
                            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${config.bannerBg} p-space-lg shadow-md border border-surface-container-high text-on-surface`}
                        >
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                                <div className="flex items-start sm:items-center gap-space-md">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-container-highest/20 backdrop-blur-md flex items-center justify-center shadow-md shrink-0 border border-white/10">
                                        <span className="material-symbols-outlined text-4xl text-primary-fixed">
                                            {config.icon}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-space-xs flex-wrap">
                                            <h1 className="font-headline-lg text-headline-lg font-bold text-white tracking-tight">
                                                {config.title}
                                            </h1>
                                            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-code-tabular text-xs font-semibold uppercase">
                                                {config.sectorCode}
                                            </span>
                                        </div>
                                        <p className="font-body-md text-body-md text-slate-300 flex items-center gap-2 mt-1 flex-wrap">
                                            <span>{config.subtitle}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-error">{config.activeAlert}</span>
                                            <span>•</span>
                                            <span className="font-code-tabular font-medium text-secondary">
                                                {units.length} Fleet Units
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
                                    <button
                                        onClick={() => setMutualAidIncident(incidents[0] || { id: "INC-SECTOR", title: `${categoryKey} Sector Operation` })}
                                        className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-label-md text-label-md font-bold shadow-md transition-all"
                                    >
                                        <span className="material-symbols-outlined text-base">handshake</span>
                                        <span>Request Mutual Aid</span>
                                    </button>
                                    <button
                                        onClick={loadData}
                                        className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-label-md text-label-md font-bold shadow-sm transition-all"
                                    >
                                        <span className="material-symbols-outlined text-base">refresh</span>
                                        <span>Refresh Sector</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Departmental KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Sector Incidents
                                    </span>
                                    <span className="material-symbols-outlined text-primary text-xl">emergency</span>
                                </div>
                                <div className="my-space-xs">
                                    <span className="font-display-lg text-3xl font-bold font-code-tabular text-on-surface">
                                        {activeIncidents.length}
                                    </span>
                                </div>
                                <span className="font-label-xs text-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
                                    Jurisdictional Jurisdiction
                                </span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Units Deployed
                                    </span>
                                    <span className="material-symbols-outlined text-error text-xl">fmd_good</span>
                                </div>
                                <div className="my-space-xs">
                                    <span className="font-display-lg text-3xl font-bold font-code-tabular text-error">
                                        {deployedUnits.length}
                                    </span>
                                </div>
                                <span className="font-label-xs text-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
                                    En-Route & On-Scene
                                </span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Units Standby
                                    </span>
                                    <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                                </div>
                                <div className="my-space-xs">
                                    <span className="font-display-lg text-3xl font-bold font-code-tabular text-secondary">
                                        {availableUnits.length}
                                    </span>
                                </div>
                                <span className="font-label-xs text-xs text-secondary font-semibold pt-2 border-t border-surface-container-high">
                                    Available for Tasking
                                </span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Incoming Requests
                                    </span>
                                    <span className="material-symbols-outlined text-tertiary text-xl">swap_horiz</span>
                                </div>
                                <div className="my-space-xs">
                                    <span className="font-display-lg text-3xl font-bold font-code-tabular text-tertiary">
                                        {incomingRequests.filter(r => r.status === "PENDING").length}
                                    </span>
                                </div>
                                <span className="font-label-xs text-xs text-tertiary font-semibold pt-2 border-t border-surface-container-high">
                                    Requires Agency Action
                                </span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Sector SLA Turnaround
                                    </span>
                                    <span className="material-symbols-outlined text-secondary text-xl">timer</span>
                                </div>
                                <div className="my-space-xs">
                                    <span className="font-display-lg text-3xl font-bold font-code-tabular text-on-surface">
                                        3m 48s
                                    </span>
                                </div>
                                <span className="font-label-xs text-xs text-secondary font-semibold pt-2 border-t border-surface-container-high">
                                    98.4% SLA Compliance
                                </span>
                            </div>
                        </div>

                        {/* 3. Incidents Queue & Mutual Aid Ingress */}
                        {incidents.length === 0 ? (
                            <SectorAllClearEmptyState
                                title={`${categoryKey} Sector Operational All Clear`}
                                message={`All incidents in the ${config.title} grid have been resolved. Response units remain on standby.`}
                            />
                        ) : (
                            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                                <div className="p-space-md border-b border-surface-container-high flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                                            Sector Incident Telemetry Queue
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-code-tabular font-bold">
                                            {incidents.length} in scope
                                        </span>
                                    </div>
                                    <span className="text-xs text-on-surface-variant font-code-tabular">
                                        Scoped to {categoryKey} & Accepted Mutual-Aid
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-body-sm font-body-sm">
                                        <thead className="bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider border-b border-surface-container-high">
                                            <tr>
                                                <th className="p-3">CAD ID</th>
                                                <th className="p-3">Incident Description & Coordinates</th>
                                                <th className="p-3">Severity</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Assigned Fleet Unit</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-container-high">
                                            {incidents.map((inc) => (
                                                <tr
                                                    key={inc.id}
                                                    onClick={() => setSelectedIncident(inc)}
                                                    className="hover:bg-surface-container-low/60 cursor-pointer transition-colors"
                                                >
                                                    <td className="p-3 font-code-tabular font-bold text-primary">
                                                        {inc.id}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-on-surface">{inc.title}</div>
                                                        <div className="text-xs text-on-surface-variant">
                                                            {inc.locationName || "Precinct Coordinates"}
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
                                                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-code-tabular text-xs font-bold">
                                                            {inc.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-code-tabular text-xs font-semibold">
                                                        {inc.assignedUnitId || "None"}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedIncident(inc);
                                                            }}
                                                            className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold hover:bg-primary/90 transition-colors"
                                                        >
                                                            Manage CAD
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Detail Drawer */}
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
