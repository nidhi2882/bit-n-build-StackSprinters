import React, { useState, useEffect } from "react";
import { auditLogService } from "../../services/auditLogService";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import TacticalHeader from "../../components/layout/TacticalHeader";

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState("ALL");

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await auditLogService.getAuditLogs();
            setLogs(data || []);
        } catch (err) {
            console.error("Failed to load audit logs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const filtered = logs.filter((l) => {
        if (filterAction === "ALL") return true;
        return (l.action || "").toUpperCase().includes(filterAction);
    });

    const getActionBadge = (action) => {
        const act = (action || "").toUpperCase();
        if (act.includes("ASSIGN")) {
            return <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-tabular text-xs font-bold">{action}</span>;
        }
        if (act.includes("RECLASSIFY")) {
            return <span className="px-2 py-0.5 rounded bg-error-container text-error font-code-tabular text-xs font-bold">{action}</span>;
        }
        if (act.includes("ACCEPT") || act.includes("RESOLVE")) {
            return <span className="px-2 py-0.5 rounded bg-secondary-container text-secondary font-code-tabular text-xs font-bold">{action}</span>;
        }
        return <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-tabular text-xs font-bold">{action}</span>;
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
                                    CAD Operational Audit Trail & Event Ledger
                                </h1>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Cryptographically sequenced, immutable dispatch records compliant with ISO 27001 CAD standards
                                </p>
                            </div>

                            <button
                                onClick={loadLogs}
                                className="inline-flex items-center gap-space-xs px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">refresh</span>
                                <span>Sync Audit Ledger</span>
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2">
                            {["ALL", "ASSIGN", "RECLASSIFY", "ACCEPT", "STATUS"].map((act) => (
                                <button
                                    key={act}
                                    onClick={() => setFilterAction(act)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        filterAction === act
                                            ? "bg-primary text-on-primary shadow-sm"
                                            : "bg-surface-container-lowest text-on-surface border border-surface-container-high hover:bg-surface-container"
                                    }`}
                                >
                                    {act === "ALL" ? "All Operations" : act}
                                </button>
                            ))}
                        </div>

                        {/* Audit Table */}
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-body-sm font-body-sm">
                                    <thead className="bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider border-b border-surface-container-high">
                                        <tr>
                                            <th className="p-3">Log ID</th>
                                            <th className="p-3">Timestamp (UTC)</th>
                                            <th className="p-3">Operator / Actor</th>
                                            <th className="p-3">Action</th>
                                            <th className="p-3">Entity Type & Target</th>
                                            <th className="p-3">Audit Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-high">
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                                                    No audit ledger entries match current action filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((l) => (
                                                <tr key={l.id} className="hover:bg-surface-container-low/60 transition-colors">
                                                    <td className="p-3 font-code-tabular text-xs font-bold text-on-surface-variant">
                                                        #{l.id}
                                                    </td>
                                                    <td className="p-3 font-code-tabular text-xs text-on-surface-variant">
                                                        {l.timestamp ? new Date(l.timestamp).toLocaleString() : "Recent"}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="font-bold text-on-surface text-xs block">{l.actorName || l.actorEmail}</span>
                                                        <span className="font-code-tabular text-[11px] text-on-surface-variant">{l.actorEmail}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        {getActionBadge(l.action)}
                                                    </td>
                                                    <td className="p-3 font-code-tabular text-xs">
                                                        <span className="text-on-surface-variant font-semibold">{l.entityType}: </span>
                                                        <span className="font-bold text-primary">{l.entityId}</span>
                                                    </td>
                                                    <td className="p-3 text-xs text-on-surface-variant max-w-md">
                                                        {l.details || "--"}
                                                    </td>
                                                </tr>
                                            ))
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
