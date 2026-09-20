import React, { useState, useEffect } from "react";
import { incidentService } from "../../services/incidentService";
import { resourceService } from "../../services/resourceService";

export default function IncidentDetailDrawer({ incident, onClose, onUpdated, onRequestMutualAid }) {
    const [status, setStatus] = useState(incident?.status || "Reported");
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(incident?.assignedUnitId || "");
    const [showReclassify, setShowReclassify] = useState(false);
    const [newCategory, setNewCategory] = useState(incident?.category || incident?.type || "FLOOD");
    const [reclassifyReason, setReclassifyReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState("");

    useEffect(() => {
        if (incident) {
            setStatus(incident.status || "Reported");
            setSelectedUnit(incident.assignedUnitId || (incident.assignedResourceIds && incident.assignedResourceIds[0]) || "");
            loadUnits();
        }
    }, [incident]);

    const loadUnits = async () => {
        try {
            const data = await resourceService.getResources();
            setUnits(data || []);
        } catch (err) {
            console.error("Failed to load units", err);
        }
    };

    if (!incident) return null;

    const steps = ["Reported", "Assigned", "En Route", "Arrived", "Resolved"];
    const currentStepIdx = steps.findIndex(s => s.toLowerCase() === status.toLowerCase().replace("-", " "));
    const activeIdx = currentStepIdx >= 0 ? currentStepIdx : 0;

    const handleStatusChange = async (targetStatus) => {
        setLoading(true);
        try {
            await incidentService.updateStatus(incident.id, targetStatus);
            setStatus(targetStatus);
            setActionMsg(`Status updated to ${targetStatus}`);
            if (onUpdated) onUpdated();
        } catch (err) {
            console.error("Status update failed", err);
            setActionMsg(err.response?.data?.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleAssignUnit = async (unitId) => {
        if (!unitId) return;
        setLoading(true);
        try {
            await incidentService.assignResource(incident.id, unitId);
            setSelectedUnit(unitId);
            setStatus("Assigned");
            setActionMsg(`Assigned unit ${unitId}`);
            if (onUpdated) onUpdated();
        } catch (err) {
            console.error("Assignment failed", err);
            setActionMsg(err.response?.data?.message || "Failed to assign unit");
        } finally {
            setLoading(false);
        }
    };

    const handleReclassify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await incidentService.reclassifyIncident(incident.id, newCategory, reclassifyReason || "Dispatcher reclassification");
            setActionMsg(`Reclassified to ${newCategory}`);
            setShowReclassify(false);
            if (onUpdated) onUpdated();
        } catch (err) {
            console.error("Reclassify failed", err);
            setActionMsg(err.response?.data?.message || "Reclassification failed");
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        "FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE"
    ];

    const getSeverityBadge = (sev) => {
        if (sev >= 4) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-label-xs text-label-xs font-bold tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-error animate-ping"></span>
                    <span>SEVERITY {sev} • CRITICAL</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-secondary font-label-xs text-label-xs font-bold tracking-wider">
                <span>SEVERITY {sev} • ELEVATED</span>
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-200">
            {/* 680px Tactical Drawer */}
            <section className="w-full max-w-[680px] h-full bg-surface-container-low shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-300">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md px-space-lg py-space-md border-b border-surface-container-high flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between gap-space-sm">
                        <div className="flex items-center gap-space-xs flex-wrap">
                            <div className="inline-flex items-center gap-space-2xs px-2.5 py-1 rounded bg-error-container text-on-error-container font-label-xs text-label-xs font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm font-semibold">emergency</span>
                                <span>{incident.category || incident.type || "INCIDENT"}</span>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-surface-container font-code-tabular text-code-tabular text-on-surface font-semibold">
                                {incident.id}
                            </div>
                            {getSeverityBadge(incident.severity || 4)}
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                                (incident.severity || 4) >= 5
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}>
                                {(incident.severity || 4) >= 5 ? "SLA 5m Breach Timer" : "SLA 15m Target"}
                            </span>
                        </div>

                        <div className="flex items-center gap-space-xs">
                            <button
                                onClick={() => setShowReclassify(!showReclassify)}
                                className="px-2.5 py-1 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="Reclassify Category"
                            >
                                <span className="material-symbols-outlined text-sm">tune</span>
                                <span>Reclassify</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface hover:bg-error hover:text-on-error transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    </div>

                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">
                        {incident.title}
                    </h2>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-xs text-label-xs">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{incident.locationName || "Sector Coordinate Dispatch"}</span>
                        <span>•</span>
                        <span className="font-code-tabular">Lat: {incident.lat || 22.31}, Lng: {incident.lng || 73.18}</span>
                    </div>

                    {actionMsg && (
                        <div className="mt-2 px-3 py-1.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-xs font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">info</span>
                            <span>{actionMsg}</span>
                        </div>
                    )}
                </header>

                {/* Reclassify Form Drawer Sub-panel */}
                {showReclassify && (
                    <div className="p-4 bg-surface-container-high border-b border-outline-variant animate-in slide-in-from-top-2">
                        <form onSubmit={handleReclassify} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-label-sm text-label-sm font-bold text-on-surface">
                                    Reclassify Incident Category
                                </span>
                                <span className="text-xs text-on-surface-variant">Logged in Audit Trail</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-on-surface-variant block mb-1">New Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="w-full h-9 px-2 bg-surface-container-lowest rounded text-on-surface text-sm border border-outline-variant"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant block mb-1">Reason / Justification</label>
                                    <input
                                        type="text"
                                        value={reclassifyReason}
                                        onChange={(e) => setReclassifyReason(e.target.value)}
                                        placeholder="E.g., Hazmat chemical risk detected"
                                        className="w-full h-9 px-2 bg-surface-container-lowest rounded text-on-surface text-sm border border-outline-variant"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReclassify(false)}
                                    className="px-3 py-1 bg-surface-container text-on-surface rounded text-xs font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-1 bg-primary text-on-primary rounded text-xs font-bold"
                                >
                                    Confirm Reclassification
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-space-lg space-y-space-lg">
                    {/* Status Stepper */}
                    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                        <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold block mb-3">
                            CAD Incident Progression
                        </span>
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-container-high -translate-y-1/2 -z-0"></div>
                            {steps.map((step, index) => {
                                const isPassed = index <= activeIdx;
                                const isCurrent = index === activeIdx;
                                return (
                                    <button
                                        key={step}
                                        onClick={() => handleStatusChange(step)}
                                        disabled={loading}
                                        className="flex flex-col items-center gap-1.5 z-10 group cursor-pointer"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                                isCurrent
                                                    ? "bg-primary text-on-primary ring-4 ring-primary-container/30"
                                                    : isPassed
                                                    ? "bg-primary-container text-on-primary-container"
                                                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                                            }`}
                                        >
                                            {isPassed ? (
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <span
                                            className={`font-label-xs text-[11px] font-semibold ${
                                                isCurrent ? "text-primary" : "text-on-surface-variant"
                                            }`}
                                        >
                                            {step}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dispatch Unit Selection & Mutual Aid Trigger */}
                    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm font-bold text-on-surface">
                                Unit Deployment & Resource Allocation
                            </span>
                            {onRequestMutualAid && (
                                <button
                                    onClick={() => onRequestMutualAid(incident)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container hover:bg-secondary hover:text-on-secondary text-on-secondary-container text-xs font-bold rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">handshake</span>
                                    <span>Request Mutual Aid</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={selectedUnit}
                                onChange={(e) => handleAssignUnit(e.target.value)}
                                disabled={loading}
                                className="flex-1 h-10 px-3 bg-surface-container-low rounded-lg text-on-surface text-sm border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">-- Select Available Emergency Unit --</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.callSign || u.id} - {u.name} ({u.status}) [{u.departmentCategory || u.type}]
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tactical Department Actions */}
                    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-2.5">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface block">
                            Sector Tactical Directives
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleStatusChange("En Route")}
                                disabled={loading}
                                className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">directions_car</span>
                                <span>Deploy / En-Route</span>
                            </button>
                            <button
                                onClick={() => handleStatusChange("Arrived")}
                                disabled={loading}
                                className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">fmd_good</span>
                                <span>Mark On-Scene</span>
                            </button>
                            <button
                                onClick={() => handleStatusChange("Resolved")}
                                disabled={loading}
                                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">task_alt</span>
                                <span>Resolve Incident</span>
                            </button>
                            {onRequestMutualAid && (
                                <button
                                    onClick={() => onRequestMutualAid(incident)}
                                    disabled={loading}
                                    className="px-3 py-2 bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">handshake</span>
                                    <span>Request Mutual Aid</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Incident Summary & AI Insights */}
                    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-3">
                        <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold block">
                            Operational Description
                        </span>
                        <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                            {incident.description || "No tactical details recorded by reporter."}
                        </p>

                        {incident.aiSummary && (
                            <div className="mt-3 p-3 rounded-lg bg-surface-container-low border border-primary-container/20">
                                <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-1">
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    <span>AI CAD Telemetry & Synthesis</span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    {incident.aiSummary}
                                </p>
                            </div>
                        )}

                        {incident.requiredCapabilities && incident.requiredCapabilities.length > 0 && (
                            <div className="pt-2">
                                <span className="font-label-xs text-label-xs text-on-surface-variant block mb-1.5">
                                    Required Tactical Capabilities
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {incident.requiredCapabilities.map((cap) => (
                                        <span
                                            key={cap}
                                            className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-xs font-medium font-code-tabular"
                                        >
                                            {cap}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dispatch Activity Timeline */}
                    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-3">
                        <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold block">
                            CAD Dispatch Timeline
                        </span>
                        <div className="space-y-3 border-l-2 border-surface-container-high pl-4 ml-2">
                            <div className="relative">
                                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-secondary"></span>
                                <p className="font-label-sm text-label-sm font-bold text-on-surface">Incident Reported</p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Reported via citizen CAD node • {incident.reportedAt ? new Date(incident.reportedAt).toLocaleTimeString() : "Recent"}
                                </p>
                            </div>
                            {incident.assignedUnitId && (
                                <div className="relative">
                                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary"></span>
                                    <p className="font-label-sm text-label-sm font-bold text-on-surface">Unit Dispatched</p>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                                        Assigned to unit {incident.assignedUnitId}
                                    </p>
                                </div>
                            )}
                            <div className="relative">
                                <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary-container"></span>
                                <p className="font-label-sm text-label-sm font-bold text-on-surface">Current Status: {status}</p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Grid coordination active
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
