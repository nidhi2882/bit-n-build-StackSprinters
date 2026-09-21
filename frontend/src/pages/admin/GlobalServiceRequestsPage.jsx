import React, { useState, useEffect } from "react";
import { serviceRequestService } from "../../services/serviceRequestService";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import TacticalHeader from "../../components/layout/TacticalHeader";

export default function GlobalServiceRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("ALL");

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await serviceRequestService.getAllRequests();
            setRequests(data || []);
        } catch (err) {
            console.error("Failed to load service requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const filtered = requests.filter((r) => {
        if (filterStatus === "ALL") return true;
        return r.status === filterStatus;
    });

    const isEscalated = (r) => {
        if (r.status !== "PENDING" || r.urgency !== "CRITICAL") return false;
        if (!r.createdAt) return false;
        const created = new Date(r.createdAt).getTime();
        const now = new Date().getTime();
        return (now - created) > 5 * 60 * 1000; // > 5 minutes
    };

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-0 md:pl-64">
                <TacticalHeader />

                <main className="w-full pt-16 min-h-screen px-3 sm:px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                            <div>
                                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                                    Cross-Department Mutual Aid Telemetry
                                </h1>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Global registry of inter-agency resource loans, escalations, and cross-precinct assignments
                                </p>
                            </div>

                            <button
                                onClick={loadRequests}
                                className="inline-flex items-center gap-space-xs px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">refresh</span>
                                <span>Refresh Requests</span>
                            </button>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-2">
                            {["ALL", "PENDING", "ACCEPTED", "DECLINED", "RESOLVED"].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        filterStatus === st
                                            ? "bg-primary text-on-primary shadow-sm"
                                            : "bg-surface-container-lowest text-on-surface border border-surface-container-high hover:bg-surface-container"
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>

                        {/* Requests Table */}
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-body-sm font-body-sm">
                                    <thead className="bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider border-b border-surface-container-high">
                                        <tr>
                                            <th className="p-3">Req ID</th>
                                            <th className="p-3">Attached Incident</th>
                                            <th className="p-3">Inter-Agency Flow</th>
                                            <th className="p-3">Urgency & SLA</th>
                                            <th className="p-3">Operational Justification</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Assigned Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-high">
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                                                    No mutual-aid requests recorded under selected status filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((r) => {
                                                const escalated = isEscalated(r);
                                                return (
                                                    <tr
                                                        key={r.id}
                                                        className={`hover:bg-surface-container-low/60 transition-colors ${
                                                            escalated ? "bg-error-container/20" : ""
                                                        }`}
                                                    >
                                                        <td className="p-3 font-code-tabular font-bold text-primary">
                                                            REQ-{r.id}
                                                        </td>
                                                        <td className="p-3 font-code-tabular font-semibold text-on-surface">
                                                            {r.incidentId}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-1.5 font-semibold text-xs">
                                                                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface">
                                                                    {r.requestedByDepartment}
                                                                </span>
                                                                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                                                                    arrow_forward
                                                                </span>
                                                                <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-bold">
                                                                    {r.requestedDepartment}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex flex-col items-start gap-1">
                                                                <span
                                                                    className={`px-2 py-0.5 rounded font-code-tabular text-xs font-bold ${
                                                                        r.urgency === "CRITICAL"
                                                                            ? "bg-error-container text-error"
                                                                            : r.urgency === "HIGH"
                                                                            ? "bg-secondary-container text-secondary"
                                                                            : "bg-surface-container text-on-surface-variant"
                                                                    }`}
                                                                >
                                                                    {r.urgency}
                                                                </span>
                                                                {escalated && (
                                                                    <span className="text-[10px] font-bold text-error animate-pulse flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-xs">warning</span>
                                                                        <span>Auto-Escalated (&gt;5m)</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-xs text-on-surface-variant max-w-sm">
                                                            {r.reason || "Equipment assistance requested"}
                                                        </td>
                                                        <td className="p-3">
                                                            <span
                                                                className={`px-2.5 py-0.5 rounded-full font-code-tabular text-xs font-bold ${
                                                                    r.status === "ACCEPTED"
                                                                        ? "bg-secondary-container text-secondary"
                                                                        : r.status === "PENDING"
                                                                        ? "bg-error-container text-error"
                                                                        : "bg-surface-container text-on-surface-variant"
                                                                }`}
                                                            >
                                                                {r.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 font-code-tabular text-xs">
                                                            {r.assignedUnitId ? (
                                                                <span className="font-bold text-primary">{r.assignedUnitId}</span>
                                                            ) : (
                                                                <span className="text-on-surface-variant">--</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
