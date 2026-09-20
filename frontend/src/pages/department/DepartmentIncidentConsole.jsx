import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { incidentService } from "../../services/incidentService";
import { resourceService } from "../../services/resourceService";
import { serviceRequestService } from "../../services/serviceRequestService";
import TacticalHeader from "../../components/layout/TacticalHeader";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import IncidentDetailDrawer from "../../components/incidents/IncidentDetailDrawer";
import NewServiceRequestModal from "../../components/modals/NewServiceRequestModal";
import { SectorAllClearEmptyState } from "../../components/common/SystemStateFallbacks";
import { DEPARTMENT_CONSOLE_CONFIGS } from "../../config/departmentConfig";
import { DEPARTMENT_KEYS } from "../../config/departmentRoutingConfig";

export default function DepartmentIncidentConsole({ departmentKey: propDeptKey = null }) {
    const { user } = useAuth();
    const normalizedRole = (user?.role || "").toUpperCase().replace(" ", "_");
    const isSuperAdmin = normalizedRole === "SUPER_ADMIN" || normalizedRole === "AUTHORITY_ADMIN";

    // A department admin is strictly locked to their own assigned department. Only a
    // Super Admin may switch sectors, and only they see the sector switcher bar. This
    // prevents cross-department 403s and guarantees each login renders its own console.
    const ownDepartment = (user?.departmentCategory || "FLOOD").toUpperCase().replace("CAT_", "");
    const requestedKey = propDeptKey ? propDeptKey.toUpperCase().replace("CAT_", "") : null;

    const initialDepartment = isSuperAdmin
        ? (requestedKey || ownDepartment)
        : ownDepartment;

    const [activeDepartment, setActiveDepartment] = useState(initialDepartment);

    useEffect(() => {
        // Non-super-admins can never leave their own department, regardless of route params.
        if (!isSuperAdmin) {
            setActiveDepartment(ownDepartment);
        } else if (requestedKey) {
            setActiveDepartment(requestedKey);
        }
    }, [propDeptKey, isSuperAdmin, ownDepartment, requestedKey]);

    const config = DEPARTMENT_CONSOLE_CONFIGS[activeDepartment] || DEPARTMENT_CONSOLE_CONFIGS.FLOOD;

    // Telemetry state
    const [incidents, setIncidents] = useState([]);
    const [units, setUnits] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [mutualAidIncident, setMutualAidIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table"); // 'table' | 'radar'
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterSeverity, setFilterSeverity] = useState("ALL");
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [actionFeedback, setActionFeedback] = useState("");

    // Live clock for SLA countdowns
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load department-scoped telemetry
    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [incData, unitData, incomingData, outgoingData] = await Promise.all([
                incidentService.getDepartmentIncidents(activeDepartment),
                resourceService.getResources(activeDepartment),
                serviceRequestService.getIncomingRequests().catch(() => []),
                serviceRequestService.getOutgoingRequests().catch(() => [])
            ]);

            setIncidents(incData || []);
            setUnits(unitData || []);
            setIncomingRequests(incomingData || []);
            setOutgoingRequests(outgoingData || []);
        } catch (err) {
            console.error(`Failed to load telemetry for ${activeDepartment}`, err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => loadData(true), 8000);
        return () => clearInterval(interval);
    }, [activeDepartment]);

    // Keep the open detail drawer in sync with freshly polled incident data so status
    // changes reflect in real time without needing to reopen the drawer.
    useEffect(() => {
        if (!selectedIncident) return;
        const fresh = incidents.find((i) => i.id === selectedIncident.id);
        if (fresh && fresh.status !== selectedIncident.status) {
            setSelectedIncident(fresh);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [incidents]);

    // SLA helper: Calculate remaining seconds and urgency styling
    const getSlaInfo = (incident) => {
        const slaMinutes = incident.slaMinutes || (incident.severity >= 4 ? 10 : 15);
        let deadline = incident.slaDeadline ? new Date(incident.slaDeadline).getTime() : null;
        if (!deadline && incident.reportedAt) {
            deadline = new Date(incident.reportedAt).getTime() + (slaMinutes * 60 * 1000);
        }
        if (!deadline) {
            deadline = currentTime + (slaMinutes * 60 * 1000);
        }

        const remainingMs = deadline - currentTime;
        const remainingSec = Math.floor(remainingMs / 1000);

        if (incident.status === "Resolved") {
            return { label: "SLA MET", breached: false, resolved: true, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
        }

        if (remainingSec <= 0) {
            const overSec = Math.abs(remainingSec);
            const m = Math.floor(overSec / 60);
            const s = overSec % 60;
            return {
                label: `BREACHED +${m}m ${s < 10 ? "0" : ""}${s}s`,
                breached: true,
                resolved: false,
                color: "text-rose-400 bg-rose-500/20 border-rose-500/40 animate-pulse"
            };
        }

        const m = Math.floor(remainingSec / 60);
        const s = remainingSec % 60;
        const formatted = `${m}m ${s < 10 ? "0" : ""}${s}s`;

        if (m < 3) {
            return { label: formatted, breached: false, resolved: false, color: "text-amber-400 bg-amber-500/20 border-amber-500/40" };
        }
        return { label: formatted, breached: false, resolved: false, color: "text-sky-400 bg-sky-500/15 border-sky-500/30" };
    };

    // Filter and priority-sort incidents
    const filteredIncidents = useMemo(() => {
        return incidents
            .filter((inc) => {
                if (filterStatus !== "ALL" && inc.status !== filterStatus) return false;
                if (filterSeverity !== "ALL" && inc.severity !== parseInt(filterSeverity)) return false;
                return true;
            })
            .sort((a, b) => {
                // Priority 1: Status (Active before Resolved)
                const aResolved = a.status === "Resolved" ? 1 : 0;
                const bResolved = b.status === "Resolved" ? 1 : 0;
                if (aResolved !== bResolved) return aResolved - bResolved;

                // Priority 2: Severity (Higher severity first)
                const sevDiff = (b.severity || 0) - (a.severity || 0);
                if (sevDiff !== 0) return sevDiff;

                // Priority 3: Urgency (Newer or closest to SLA deadline)
                return new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0);
            });
    }, [incidents, filterStatus, filterSeverity]);

    // Mutual aid handlers
    const handleAcceptRequest = async (requestId) => {
        try {
            await serviceRequestService.updateStatus(requestId, "ACCEPTED");
            setActionFeedback("Mutual aid request accepted & unit assigned.");
            loadData();
            setTimeout(() => setActionFeedback(""), 4000);
        } catch (err) {
            setActionFeedback(err.response?.data?.message || "Failed to accept request");
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await serviceRequestService.updateStatus(requestId, "DECLINED");
            setActionFeedback("Mutual aid request declined.");
            loadData();
            setTimeout(() => setActionFeedback(""), 4000);
        } catch (err) {
            setActionFeedback(err.response?.data?.message || "Failed to decline request");
        }
    };

    const activeIncidents = incidents.filter((i) => i.status !== "Resolved");
    const deployedUnits = units.filter((u) => u.status !== "Available");
    const availableUnits = units.filter((u) => u.status === "Available");

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            {/* Mobile Drawer Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                >
                    <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
                        <TacticalSidebar />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <TacticalSidebar />
            </div>

            <div className="pl-0 md:pl-64 transition-all duration-200">
                {/* Header */}
                <TacticalHeader
                    activeIncidentCount={activeIncidents.length}
                    onOpenDispatchModal={() => setSelectedIncident(incidents[0] || null)}
                    onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                />

                <main className="w-full pt-16 min-h-screen px-3 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col w-full gap-6 max-w-[1920px] mx-auto">
                        {/* Department Switcher Bar — Super Admin only. Department admins are
                            locked to their own sector and never see this switcher. */}
                        {isSuperAdmin ? (
                            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high overflow-x-auto">
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                                    <span className="font-label-sm text-xs font-bold text-on-surface uppercase tracking-wider">
                                        Operational Sector:
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                    {Object.keys(DEPARTMENT_KEYS).map((key) => {
                                        const isActive = activeDepartment === key;
                                        const deptConf = DEPARTMENT_CONSOLE_CONFIGS[key];
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setActiveDepartment(key)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                                    isActive
                                                        ? "bg-primary text-on-primary shadow-md"
                                                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {deptConf?.icon || "emergency"}
                                                </span>
                                                <span>{key.replace("_", " ")}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high">
                                <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                <span className="font-label-sm text-xs font-bold text-on-surface uppercase tracking-wider">
                                    Assigned Sector:
                                </span>
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-on-primary flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">{config.icon}</span>
                                    {activeDepartment.replace("_", " ")} Command
                                </span>
                            </div>
                        )}

                        {/* Top Banner */}
                        <div
                            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${config.bannerBg} p-5 sm:p-6 shadow-xl border border-surface-container-high text-on-surface`}
                        >
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-container-highest/25 backdrop-blur-md flex items-center justify-center shadow-md shrink-0 border border-white/15">
                                        <span className="material-symbols-outlined text-4xl text-primary-fixed">
                                            {config.icon}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="font-headline-lg text-xl sm:text-2xl font-bold text-white tracking-tight">
                                                {config.title}
                                            </h1>
                                            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-code-tabular text-xs font-semibold uppercase border border-white/20">
                                                {config.sectorCode}
                                            </span>
                                        </div>
                                        <p className="font-body-md text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-1 flex-wrap">
                                            <span>{config.subtitle}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-error flex items-center gap-1">
                                                <span className="h-2 w-2 rounded-full bg-error animate-ping inline-block"></span>
                                                {config.activeAlert}
                                            </span>
                                            <span>•</span>
                                            <span className="font-code-tabular font-medium text-secondary">
                                                {units.length} Tactical Units Active
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                    <button
                                        onClick={() =>
                                            setMutualAidIncident(
                                                incidents[0] || {
                                                    id: `INC-${activeDepartment}-OP`,
                                                    title: `${activeDepartment} Sector Mutual Aid Operation`
                                                }
                                            )
                                        }
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-label-md text-xs sm:text-sm font-bold shadow-md transition-all"
                                    >
                                        <span className="material-symbols-outlined text-base">handshake</span>
                                        <span>Request Mutual Aid</span>
                                    </button>
                                    <button
                                        onClick={loadData}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-label-md text-xs sm:text-sm font-bold shadow-sm transition-all"
                                    >
                                        <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
                                            refresh
                                        </span>
                                        <span className="hidden sm:inline">Refresh Telemetry</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Feedback Notification */}
                        {actionFeedback && (
                            <div className="p-3 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                                <span className="material-symbols-outlined text-base">check_circle</span>
                                <span>{actionFeedback}</span>
                            </div>
                        )}

                        {/* Dynamic Department KPI Cards Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            {config.kpis.map((kpi) => {
                                const value = kpi.compute ? kpi.compute(incidents, units) : "N/A";
                                return (
                                    <div
                                        key={kpi.id}
                                        className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-label-xs text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                                                {kpi.label}
                                            </span>
                                            <span className={`material-symbols-outlined ${kpi.color} text-xl`}>
                                                {kpi.icon}
                                            </span>
                                        </div>
                                        <div className="my-2">
                                            <span className={`font-display-lg text-2xl sm:text-3xl font-bold font-code-tabular ${kpi.color}`}>
                                                {value}
                                            </span>
                                        </div>
                                        <span className="font-label-xs text-[10px] text-on-surface-variant pt-1.5 border-t border-surface-container-high truncate">
                                            {config.sectorCode} Telemetry
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resource Readiness Strip & Operational Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Left 2 Cols: Resource Readiness Panel */}
                            <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-secondary text-xl">inventory_2</span>
                                        <span className="font-headline-sm text-sm font-bold text-on-surface">
                                            Tactical Readiness & Specialized Equipment
                                        </span>
                                    </div>
                                    <span className="text-xs text-on-surface-variant font-code-tabular">
                                        {config.unitCategory}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {config.resourceReadiness.map((res, idx) => {
                                        const pct = Math.round((res.available / res.total) * 100);
                                        return (
                                            <div key={idx} className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-on-surface truncate">{res.name}</span>
                                                    <span className="font-code-tabular font-bold text-primary">
                                                        {res.available} / {res.total}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 rounded-full ${
                                                            pct < 30 ? "bg-error" : pct < 60 ? "bg-amber-400" : "bg-emerald-500"
                                                        }`}
                                                        style={{ width: `${pct}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-on-surface-variant">
                                                    <span>Readiness: {pct}%</span>
                                                    <span>{res.available > 0 ? "Operational" : "Depleted"}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Col: Department Actions */}
                            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-surface-container-high flex flex-col justify-between">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                                    <span className="font-headline-sm text-sm font-bold text-on-surface">
                                        Sector Command Directives
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {config.actions.map((act) => (
                                        <button
                                            key={act.id}
                                            onClick={() => {
                                                if (act.id.includes("REQUEST")) {
                                                    setMutualAidIncident(
                                                        incidents[0] || {
                                                            id: `INC-${activeDepartment}`,
                                                            title: `${activeDepartment} Mutual Aid Request`
                                                        }
                                                    );
                                                } else if (incidents.length > 0) {
                                                    setSelectedIncident(incidents[0]);
                                                } else {
                                                    setActionFeedback(`Directive triggered: ${act.label}`);
                                                    setTimeout(() => setActionFeedback(""), 3000);
                                                }
                                            }}
                                            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-between transition-all ${
                                                act.primary
                                                    ? "bg-primary text-on-primary shadow-sm hover:bg-primary/90"
                                                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">{act.icon}</span>
                                                <span>{act.label}</span>
                                            </span>
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cross-Department Mutual Aid Ingress & Egress Requests */}
                        {incomingRequests.length > 0 && (
                            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-primary-container/30 overflow-hidden">
                                <div className="p-4 bg-primary-container/10 border-b border-surface-container-high flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-xl animate-pulse">
                                            notification_important
                                        </span>
                                        <span className="font-headline-sm text-sm font-bold text-on-surface">
                                            Incoming Mutual Aid Requests For {activeDepartment} ({incomingRequests.length})
                                        </span>
                                    </div>
                                    <span className="text-xs text-primary font-bold">Requires Direct Allocation</span>
                                </div>

                                <div className="divide-y divide-surface-container-high">
                                    {incomingRequests.map((req) => (
                                        <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-code-tabular font-bold text-primary">
                                                        {req.id}
                                                    </span>
                                                    <span className="font-bold text-sm text-on-surface">
                                                        Origin: {req.requestingDepartment}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-secondary-container text-secondary text-xs font-semibold">
                                                        Requested: {req.requiredCapability}
                                                    </span>
                                                    <span className="text-xs text-on-surface-variant font-code-tabular">
                                                        Incident #{req.incidentId}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant mt-1">
                                                    {req.notes || "High priority mutual aid assistance requested by scene commander."}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {req.status === "PENDING" ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptRequest(req.id)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Accept & Dispatch
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeclineRequest(req.id)}
                                                            className="px-3 py-1.5 bg-surface-container hover:bg-error hover:text-white text-on-surface-variant rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Decline
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="px-3 py-1 rounded bg-surface-container text-xs font-bold text-secondary">
                                                        {req.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Priority Incident Telemetry Queue Header & Controls */}
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                            <div className="p-4 border-b border-surface-container-high flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-xl">crisis_alert</span>
                                        <span className="font-headline-sm text-base font-bold text-on-surface">
                                            Sector Incident Telemetry Queue
                                        </span>
                                    </div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-code-tabular text-xs font-bold">
                                        {filteredIncidents.length} in scope
                                    </span>
                                </div>

                                {/* Controls: Filters & View Switcher */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Status Filter */}
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="h-9 px-2.5 bg-surface-container-low rounded-lg text-xs font-bold text-on-surface border border-surface-container-high focus:outline-none"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="Reported">Reported</option>
                                        <option value="Assigned">Assigned</option>
                                        <option value="En-Route">En-Route</option>
                                        <option value="On-Scene">On-Scene</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>

                                    {/* Severity Filter */}
                                    <select
                                        value={filterSeverity}
                                        onChange={(e) => setFilterSeverity(e.target.value)}
                                        className="h-9 px-2.5 bg-surface-container-low rounded-lg text-xs font-bold text-on-surface border border-surface-container-high focus:outline-none"
                                    >
                                        <option value="ALL">All Severities</option>
                                        <option value="5">P5 (Critical)</option>
                                        <option value="4">P4 (High)</option>
                                        <option value="3">P3 (Elevated)</option>
                                        <option value="2">P2 (Normal)</option>
                                        <option value="1">P1 (Low)</option>
                                    </select>

                                    {/* View Mode Toggle */}
                                    <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-surface-container-high">
                                        <button
                                            onClick={() => setViewMode("table")}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                                                viewMode === "table"
                                                    ? "bg-surface text-on-surface shadow-sm"
                                                    : "text-on-surface-variant hover:text-on-surface"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">table_rows</span>
                                            <span className="hidden sm:inline">Queue</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode("radar")}
                                            className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                                                viewMode === "radar"
                                                    ? "bg-surface text-on-surface shadow-sm"
                                                    : "text-on-surface-variant hover:text-on-surface"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">radar</span>
                                            <span className="hidden sm:inline">Radar GIS</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Body: Incidents or Empty State */}
                            {filteredIncidents.length === 0 ? (
                                <SectorAllClearEmptyState
                                    title={`${activeDepartment} Sector Operational All Clear`}
                                    message={`All incidents in the ${config.title} grid have been resolved or filtered. Response units remain on standby.`}
                                />
                            ) : viewMode === "radar" ? (
                                /* Radar GIS Map View */
                                <div className="p-6 bg-surface-container-lowest">
                                    <div className="relative w-full h-[480px] rounded-xl overflow-hidden bg-slate-950 border border-surface-container-high flex items-center justify-center">
                                        {/* Radar sweep lines */}
                                        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                                        <div className="absolute w-[400px] h-[400px] rounded-full border border-sky-500/20"></div>
                                        <div className="absolute w-[260px] h-[260px] rounded-full border border-sky-500/20"></div>
                                        <div className="absolute w-[120px] h-[120px] rounded-full border border-sky-500/20"></div>
                                        <div className="absolute h-full w-[1px] bg-sky-500/20"></div>
                                        <div className="absolute w-full h-[1px] bg-sky-500/20"></div>

                                        {/* Incident Pins */}
                                        {filteredIncidents.map((inc, i) => {
                                            const angle = (i * 360) / filteredIncidents.length;
                                            const rad = (angle * Math.PI) / 180;
                                            const dist = 60 + ((i * 37) % 130);
                                            const top = 50 + Math.sin(rad) * (dist / 4.8);
                                            const left = 50 + Math.cos(rad) * (dist / 4.8);

                                            return (
                                                <div
                                                    key={inc.id}
                                                    onClick={() => setSelectedIncident(inc)}
                                                    style={{ top: `${top}%`, left: `${left}%` }}
                                                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                                                >
                                                    <div className="relative flex items-center justify-center">
                                                        <span
                                                            className={`h-4 w-4 rounded-full flex items-center justify-center shadow-lg font-bold text-[9px] text-white ${
                                                                inc.severity >= 4 ? "bg-rose-600" : "bg-sky-600"
                                                            }`}
                                                        >
                                                            {inc.severity || 3}
                                                        </span>
                                                        <span
                                                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                                                inc.severity >= 4 ? "bg-rose-500" : "bg-sky-500"
                                                            }`}
                                                        ></span>
                                                    </div>

                                                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-slate-900 text-white text-xs border border-white/20 shadow-2xl z-30 pointer-events-none">
                                                        <div className="font-bold text-primary">{inc.id}</div>
                                                        <div className="font-semibold truncate">{inc.title}</div>
                                                        <div className="text-[10px] text-slate-400">{inc.locationName}</div>
                                                        <div className="text-[10px] font-bold text-amber-400 mt-1">
                                                            Status: {inc.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="absolute bottom-4 left-4 p-2 rounded bg-black/70 backdrop-blur text-white text-xs font-code-tabular">
                                            Sector GPS Coordinates: 22.3100° N, 73.1800° E
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Table View (Responsive: Desktop Table + Mobile Cards) */
                                <div>
                                    {/* Desktop Table View (>= 768px) */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left text-body-sm font-body-sm">
                                            <thead className="bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider border-b border-surface-container-high">
                                                <tr>
                                                    <th className="p-3.5">CAD ID</th>
                                                    <th className="p-3.5">Incident Details & Coordinates</th>
                                                    <th className="p-3.5">Priority</th>
                                                    <th className="p-3.5">SLA Countdown</th>
                                                    <th className="p-3.5">Status</th>
                                                    <th className="p-3.5">Assigned Unit</th>
                                                    <th className="p-3.5 text-right">CAD Operations</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-container-high">
                                                {filteredIncidents.map((inc) => {
                                                    const sla = getSlaInfo(inc);
                                                    return (
                                                        <tr
                                                            key={inc.id}
                                                            onClick={() => setSelectedIncident(inc)}
                                                            className="hover:bg-surface-container-low/70 cursor-pointer transition-colors"
                                                        >
                                                            <td className="p-3.5 font-code-tabular font-bold text-primary whitespace-nowrap">
                                                                {inc.id}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <div className="font-bold text-on-surface max-w-sm truncate">
                                                                    {inc.title}
                                                                </div>
                                                                <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                                                                    <span className="material-symbols-outlined text-xs text-rose-400">
                                                                        location_on
                                                                    </span>
                                                                    <span className="truncate">{inc.locationName || "Sector Coordinates"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-3.5 whitespace-nowrap">
                                                                <span
                                                                    className={`px-2.5 py-1 rounded-md font-code-tabular font-bold text-xs ${
                                                                        inc.severity >= 4
                                                                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                                                            : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                                                    }`}
                                                                >
                                                                    P{inc.severity || 3}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 whitespace-nowrap">
                                                                <span
                                                                    className={`px-2.5 py-1 rounded-md font-code-tabular text-xs font-bold border ${sla.color}`}
                                                                >
                                                                    {sla.label}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 whitespace-nowrap">
                                                                <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-code-tabular text-xs font-bold">
                                                                    {inc.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 font-code-tabular text-xs font-semibold whitespace-nowrap">
                                                                {inc.assignedUnitId ? (
                                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-sm">
                                                                            local_shipping
                                                                        </span>
                                                                        {inc.assignedUnitId}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-on-surface-variant italic">Unassigned</span>
                                                                )}
                                                            </td>
                                                            <td className="p-3.5 text-right whitespace-nowrap">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedIncident(inc);
                                                                    }}
                                                                    className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                                                                >
                                                                    Manage CAD
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Cards View (< 768px) */}
                                    <div className="md:hidden divide-y divide-surface-container-high">
                                        {filteredIncidents.map((inc) => {
                                            const sla = getSlaInfo(inc);
                                            return (
                                                <div
                                                    key={inc.id}
                                                    onClick={() => setSelectedIncident(inc)}
                                                    className="p-4 flex flex-col gap-2.5 hover:bg-surface-container-low cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-code-tabular font-bold text-primary text-xs">
                                                            {inc.id}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span
                                                                className={`px-2 py-0.5 rounded font-code-tabular font-bold text-[11px] ${
                                                                    inc.severity >= 4
                                                                        ? "bg-rose-500/20 text-rose-400"
                                                                        : "bg-sky-500/15 text-sky-400"
                                                                }`}
                                                            >
                                                                P{inc.severity || 3}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-bold">
                                                                {inc.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="font-bold text-sm text-on-surface">
                                                        {inc.title}
                                                    </div>

                                                    <div className="text-xs text-on-surface-variant flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs text-rose-400">
                                                            location_on
                                                        </span>
                                                        <span className="truncate">{inc.locationName || "Sector Coordinates"}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-1 text-xs">
                                                        <span className={`px-2 py-0.5 rounded font-code-tabular text-[11px] font-bold border ${sla.color}`}>
                                                            {sla.label}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedIncident(inc);
                                                            }}
                                                            className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold"
                                                        >
                                                            Manage CAD
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Tactical Incident Detail Drawer */}
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
