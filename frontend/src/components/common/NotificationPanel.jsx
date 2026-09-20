import React, { useState, useEffect } from "react";
import slaService from "../../services/slaService";
import { alertService, mapAlertToNotification } from "../../services/alertService";

// Persistent SLA monitor banner shown at the top of the live feed.
const SLA_MONITOR = {
    id: "N-SLA-01",
    type: "sla",
    title: "SLA Threshold Monitor Active",
    body: "Monitoring Level-5 Critical (5m SLA) and Level-4 High (15m SLA) dispatch timers across all 9 departments.",
    time: "Live",
    cad: "SLA-ENGINE",
    location: "CAD Core",
    icon: "timer",
    unread: false,
};

export default function NotificationPanel({ onClose }) {
    const [activeTab, setActiveTab] = useState("all");
    const [evaluating, setEvaluating] = useState(false);
    const [slaMetrics, setSlaMetrics] = useState(null);
    const [notifications, setNotifications] = useState([SLA_MONITOR]);

    // Load real, department-scoped alerts from the backend and keep them live-polled.
    const loadAlerts = async () => {
        try {
            const alerts = await alertService.getActiveAlerts();
            const mapped = (alerts || []).map(mapAlertToNotification);
            setNotifications([SLA_MONITOR, ...mapped]);
        } catch (err) {
            console.warn("Failed to load live alerts", err);
        }
    };

    useEffect(() => {
        loadAlerts();
        const poll = setInterval(loadAlerts, 12000);
        return () => clearInterval(poll);
    }, []);

    useEffect(() => {
        slaService.getStatus()
            .then(data => setSlaMetrics(data))
            .catch(() => console.log("SLA status polling"));
    }, []);

    const handleTriggerSla = async () => {
        try {
            setEvaluating(true);
            const result = await slaService.triggerEvaluation();
            setNotifications(prev => [
                {
                    id: `SLA-${Date.now()}`,
                    type: "sla",
                    title: `SLA Evaluation Cycle Executed`,
                    body: `Evaluated active CAD incidents. Breaches triggered: ${result.breachesTriggered || 0}, Warnings: ${result.warningsTriggered || 0}.`,
                    time: "Just now",
                    cad: "SLA-EVAL",
                    location: "Automated Worker",
                    icon: "schedule",
                    unread: true
                },
                ...prev
            ]);
        } catch (err) {
            console.error("Failed to run SLA evaluation", err);
        } finally {
            setEvaluating(false);
        }
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const dismiss = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
        // Persist dismissal for real backend alerts (skip the local SLA monitor banner).
        if (id && id !== SLA_MONITOR.id) {
            alertService.dismissAlert(id).catch(() => {});
        }
    };

    const filtered = notifications.filter(n => {
        if (activeTab === "all") return true;
        return n.type === activeTab;
    });

    const unreadCount = notifications.filter(n => n.unread).length;
    const slaCount = notifications.filter(n => n.type === "sla").length;
    const criticalCount = notifications.filter(n => n.type === "critical").length;
    const requestsCount = notifications.filter(n => n.type === "requests").length;

    return (
        <div className="w-[430px] max-w-[calc(100vw-32px)] bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="p-space-md border-b border-surface-container-high bg-surface-container-lowest">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Operational Alerts
                        </span>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-code-tabular text-label-xs font-bold">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleTriggerSla}
                            disabled={evaluating}
                            className="p-1 rounded text-primary hover:bg-primary/10 transition-colors text-xs font-medium flex items-center gap-1"
                            title="Trigger SLA evaluation worker"
                        >
                            <span className={`material-symbols-outlined text-base ${evaluating ? "animate-spin" : ""}`}>refresh</span>
                            <span className="font-mono text-[10px] hidden sm:inline">Check SLA</span>
                        </button>
                        <button
                            onClick={markAllRead}
                            className="p-1 rounded text-on-surface-variant hover:text-primary transition-colors text-xs font-medium"
                            title="Mark all as read"
                        >
                            <span className="material-symbols-outlined text-lg">done_all</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <nav className="flex items-center gap-1 mt-space-sm bg-surface-container-low p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex-1 py-1 rounded text-label-xs font-semibold transition-all ${
                            activeTab === "all"
                                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("sla")}
                        className={`flex-1 py-1 rounded text-label-xs font-semibold transition-all ${
                            activeTab === "sla"
                                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                        SLA ({slaCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("critical")}
                        className={`flex-1 py-1 rounded text-label-xs font-semibold transition-all ${
                            activeTab === "critical"
                                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                        Critical{" "}
                        <span className="px-1.5 py-0.2 rounded-full bg-error text-on-error text-[10px] font-bold">
                            {criticalCount}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("requests")}
                        className={`flex-1 py-1 rounded text-label-xs font-semibold transition-all ${
                            activeTab === "requests"
                                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                        Aid ({requestsCount})
                    </button>
                </nav>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[460px] divide-y divide-surface-container-low">
                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-3xl mb-2 text-outline">notifications_off</span>
                        <p className="font-body-sm text-body-sm">No alerts in this category</p>
                    </div>
                ) : (
                    filtered.map((n) => (
                        <article
                            key={n.id}
                            className={`p-space-md transition-colors flex gap-space-sm items-start relative ${
                                n.type === "sla"
                                    ? "bg-amber-500/10 hover:bg-amber-500/15"
                                    : n.type === "critical"
                                    ? "bg-error-container/15 hover:bg-error-container/25"
                                    : "bg-surface-container-lowest hover:bg-surface-container-low/60"
                            }`}
                        >
                            {n.unread && (
                                <div
                                    className="w-2 h-2 rounded-full bg-primary absolute left-2 top-5 ring-2 ring-surface-container-lowest"
                                    title="Unread"
                                />
                            )}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                n.type === "sla"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : n.type === "critical"
                                    ? "bg-error-container text-on-error-container"
                                    : "bg-surface-container-high text-on-surface-variant"
                            }`}>
                                <span className="material-symbols-outlined text-lg">{n.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                    <h4 className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                                        {n.title}
                                    </h4>
                                    <time className="font-code-tabular text-label-xs text-on-surface-variant shrink-0">
                                        {n.time}
                                    </time>
                                </div>
                                <p className="font-body-xs text-body-xs text-on-surface-variant line-clamp-2 mb-2">
                                    {n.body}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-code-tabular text-[11px] font-semibold">
                                        {n.cad}
                                    </span>
                                    <span className="font-body-xs text-body-xs text-on-surface-variant truncate">
                                        • {n.location}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => dismiss(n.id)}
                                className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-on-surface-variant hover:text-on-surface"
                                title="Dismiss"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
