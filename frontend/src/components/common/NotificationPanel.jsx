import React, { useState } from "react";

export default function NotificationPanel({ onClose }) {
    const [activeTab, setActiveTab] = useState("all");
    const [notifications, setNotifications] = useState([
        {
            id: "N1",
            type: "critical",
            title: "Critical Inundation Alert - Vishwamitri",
            body: "INC-2026-001 water level surging +4.2ft near bridge pier. Evacuation team deployed.",
            time: "2m ago",
            cad: "INC-2026-001",
            location: "Vishwamitri River Bridge",
            icon: "tsunami",
            unread: true,
        },
        {
            id: "N2",
            type: "critical",
            title: "Structural Chemical Fire Escalation",
            body: "INC-2026-002 escalated to Level 5. Hazmat foam tender en route from Dandiyabazar.",
            time: "5m ago",
            cad: "INC-2026-002",
            location: "GIDC Nandesari",
            icon: "local_fire_department",
            unread: true,
        },
        {
            id: "N3",
            type: "requests",
            title: "Mutual Aid Request Received: Pumping Unit",
            body: "Flood Dept requested heavy dewatering pump from Fire Dept for bridge pier foundation.",
            time: "14m ago",
            cad: "INC-2026-001",
            location: "Sector 04",
            icon: "swap_horiz",
            unread: true,
        },
        {
            id: "N4",
            type: "system",
            title: "Telemetry SLA Benchmark Normal",
            body: "Citywide average dispatch time currently 4m 12s, well within 5m target SLA.",
            time: "25m ago",
            cad: "SLA-GRID",
            location: "Central CAD",
            icon: "monitoring",
            unread: false,
        },
        {
            id: "N5",
            type: "system",
            title: "USAR Collapse Sensor Online",
            body: "Structural seismic vibration sensors connected in Sector 2 Commercial District.",
            time: "1h ago",
            cad: "SYS-09",
            location: "Alkapuri Complex",
            icon: "cloud_sync",
            unread: false,
        }
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    };

    const dismiss = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const filtered = notifications.filter(n => {
        if (activeTab === "all") return true;
        return n.type === activeTab;
    });

    const unreadCount = notifications.filter(n => n.unread).length;
    const criticalCount = notifications.filter(n => n.type === "critical").length;
    const requestsCount = notifications.filter(n => n.type === "requests").length;
    const systemCount = notifications.filter(n => n.type === "system").length;

    return (
        <div className="w-[420px] max-w-[calc(100vw-32px)] bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
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
                        Requests ({requestsCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("system")}
                        className={`flex-1 py-1 rounded text-label-xs font-semibold transition-all ${
                            activeTab === "system"
                                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                                : "text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                        System ({systemCount})
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
                                n.type === "critical"
                                    ? "bg-error-container/15 hover:bg-error-container/25"
                                    : "bg-surface-container-lowest hover:bg-surface-container-low/60"
                            }`}
                        >
                            {n.unread && (
                                <div
                                    className="w-2 h-2 rounded-full bg-primary absolute left-2 top-5 ring-2 ring-surface-container-lowest"
                                    title="Unread"
                                ></div>
                            )}
                            <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                    n.type === "critical"
                                        ? "bg-error-container text-on-error-container"
                                        : n.type === "requests"
                                        ? "bg-secondary-container text-on-secondary-container"
                                        : "bg-surface-container-high text-on-surface"
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">{n.icon}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-space-xs">
                                    <span
                                        className={`font-label-xs text-label-xs uppercase font-bold tracking-wider ${
                                            n.type === "critical"
                                                ? "text-error"
                                                : n.type === "requests"
                                                ? "text-secondary"
                                                : "text-on-surface-variant"
                                        }`}
                                    >
                                        {n.type}
                                    </span>
                                    <span className="font-code-tabular text-label-xs text-on-surface-variant">
                                        {n.time}
                                    </span>
                                </div>
                                <h4 className="font-headline-sm text-body-md font-semibold text-on-surface mt-0.5 leading-snug">
                                    {n.title}
                                </h4>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                                    {n.body}
                                </p>
                                <div className="flex items-center gap-2 mt-2 font-label-xs text-label-xs text-on-surface-variant">
                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                    <span>{n.location}</span>
                                    <span>•</span>
                                    <span className="font-code-tabular font-bold text-primary">{n.cad}</span>
                                </div>

                                <div className="flex items-center gap-space-xs mt-3">
                                    <button
                                        onClick={() => dismiss(n.id)}
                                        className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-xs text-label-xs rounded font-medium transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
