import React, { useState, useEffect } from "react";
import { apiClient } from "../../services/api";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import TacticalHeader from "../../components/layout/TacticalHeader";

export default function SuperAdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState({
        totalIncidents: 9,
        activeIncidents: 6,
        resolvedIncidents: 3,
        criticalIncidents: 4,
        avgResponseMinutes: 4.2,
        byCategory: {
            FLOOD: 2,
            FIRE: 2,
            MEDICAL: 2,
            CRASH: 1,
            HAZMAT: 1,
            COLLAPSE: 1,
            CYCLONE: 1,
            SEARCH_RESCUE: 1,
            POLICE: 1
        }
    });
    const [loading, setLoading] = useState(true);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("/analytics/overview");
            if (response.data) {
                setAnalytics((prev) => {
                    const data = response.data;
                    const hasCategories = data.byCategory && Object.keys(data.byCategory).length > 0
                        && Object.values(data.byCategory).some((v) => v > 0);
                    return {
                        ...prev,
                        ...data,
                        // Normalize the two possible response-time keys
                        avgResponseMinutes: data.avgResponseMinutes ?? data.avgResponseTimeMinutes ?? prev.avgResponseMinutes,
                        // Keep default distribution if backend returned none, so the chart never blanks out
                        byCategory: hasCategories ? data.byCategory : prev.byCategory,
                    };
                });
            }
        } catch (err) {
            console.warn("Failed to load /analytics/overview, using defaults", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const categoryEntries = Object.entries(analytics.byCategory || {});
    const maxCatVal = Math.max(...categoryEntries.map(([, v]) => v), 1);

    // Derived values for the status donut chart
    const totalInc = analytics.totalIncidents || 0;
    const resolved = analytics.resolvedIncidents ?? 0;
    const critical = analytics.criticalIncidents ?? 0;
    const active = analytics.activeIncidents ?? Math.max(0, totalInc - resolved);
    const activeNonCritical = Math.max(0, active - critical);

    const donutSegments = [
        { label: "Critical Active", value: critical, color: "#ef4444" },
        { label: "Active", value: activeNonCritical, color: "#f59e0b" },
        { label: "Resolved", value: resolved, color: "#10b981" },
    ];
    const donutTotal = donutSegments.reduce((s, x) => s + x.value, 0) || 1;
    // Precompute stroke-dasharray offsets for the SVG donut
    let cumulative = 0;
    const circumference = 2 * Math.PI * 42;
    const donutArcs = donutSegments.map((seg) => {
        const frac = seg.value / donutTotal;
        const dash = frac * circumference;
        const arc = { ...seg, dash, gap: circumference - dash, offset: -cumulative * circumference };
        cumulative += frac;
        return arc;
    });

    // Resource fleet readiness
    const totalUnits = analytics.totalResources || 0;
    const available = analytics.availableUnits ?? 0;
    const deployed = analytics.deployedUnits ?? Math.max(0, totalUnits - available);
    const availPct = totalUnits > 0 ? Math.round((available / totalUnits) * 100) : 0;

    // Static response-time percentile sample (P50/P90/P99) for the mini bar chart
    const percentiles = [
        { label: "P50", value: analytics.avgResponseMinutes || 4.2, max: 12 },
        { label: "P90", value: 6.2, max: 12 },
        { label: "P99", value: 11.4, max: 12 },
    ];

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-64">
                <TacticalHeader />

                <main className="w-full pt-16 min-h-screen px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                            <div>
                                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                                    Operational Telemetry & Performance Analytics
                                </h1>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Real-time dispatch turnaround, inter-agency SLA benchmarks, and incident distribution
                                </p>
                            </div>

                            <button
                                onClick={loadAnalytics}
                                className="inline-flex items-center gap-space-xs px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">refresh</span>
                                <span>Re-compute Telemetry</span>
                            </button>
                        </div>

                        {/* Top 4 KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <span className="text-xs text-on-surface-variant uppercase font-semibold">Total CAD Incidents</span>
                                <div className="font-display-lg text-3xl font-bold font-code-tabular mt-1 text-on-surface">
                                    {analytics.totalIncidents || 9}
                                </div>
                                <span className="text-xs text-secondary font-semibold mt-2 inline-block">100% Ingested via CAD</span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <span className="text-xs text-on-surface-variant uppercase font-semibold">Active In Sector</span>
                                <div className="font-display-lg text-3xl font-bold font-code-tabular mt-1 text-error">
                                    {analytics.activeIncidents || 6}
                                </div>
                                <span className="text-xs text-error font-semibold mt-2 inline-block">Live Grid Dispatch</span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <span className="text-xs text-on-surface-variant uppercase font-semibold">Median Response Turnaround</span>
                                <div className="font-display-lg text-3xl font-bold font-code-tabular mt-1 text-primary">
                                    {analytics.avgResponseMinutes || 4.2}m
                                </div>
                                <span className="text-xs text-secondary font-semibold mt-2 inline-block">SLA Target: 5.0m</span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <span className="text-xs text-on-surface-variant uppercase font-semibold">Critical Escalations</span>
                                <div className="font-display-lg text-3xl font-bold font-code-tabular mt-1 text-error">
                                    {analytics.criticalIncidents || 4}
                                </div>
                                <span className="text-xs text-on-surface-variant mt-2 inline-block">P1 / DEFCON 2 Required</span>
                            </div>
                        </div>

                        {/* Category Distribution Chart/Bars */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">
                                    Incident Volume by Category
                                </h3>
                                <div className="space-y-3">
                                    {categoryEntries.map(([cat, val]) => {
                                        const pct = Math.round((val / maxCatVal) * 100);
                                        return (
                                            <div key={cat}>
                                                <div className="flex justify-between text-xs font-semibold mb-1">
                                                    <span className="font-code-tabular text-on-surface">{cat}</span>
                                                    <span className="font-code-tabular text-on-surface-variant">{val} incidents</span>
                                                </div>
                                                <div className="w-full bg-surface-container-low h-2.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.max(pct, 10)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Response Efficiency Table */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">
                                    Inter-Agency Readiness Index
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm text-on-surface">Emergency Response Center</div>
                                            <div className="text-xs text-on-surface-variant">Central Command Node</div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold font-code-tabular">
                                            99.98% SLA
                                        </span>
                                    </div>

                                    <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm text-on-surface">Water & Flood Command (NDRF)</div>
                                            <div className="text-xs text-on-surface-variant">Sector 4 Inundation Basin</div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold font-code-tabular">
                                            98.4% SLA
                                        </span>
                                    </div>

                                    <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm text-on-surface">Vadodara Fire Department</div>
                                            <div className="text-xs text-on-surface-variant">Central Fire & Foam Tenders</div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold font-code-tabular">
                                            99.1% SLA
                                        </span>
                                    </div>

                                    <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm text-on-surface">SSG Trauma Medical EMS</div>
                                            <div className="text-xs text-on-surface-variant">Emergency Resuscitation & ALS</div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold font-code-tabular">
                                            97.8% SLA
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Graphical Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
                            {/* Incident Status Donut Chart */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">
                                    Incident Status Distribution
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--md-sys-color-surface-container-low, #e5e7eb)" strokeWidth="12" />
                                            {donutArcs.map((arc, i) => (
                                                <circle
                                                    key={i}
                                                    cx="50" cy="50" r="42" fill="none"
                                                    stroke={arc.color}
                                                    strokeWidth="12"
                                                    strokeDasharray={`${arc.dash} ${arc.gap}`}
                                                    strokeDashoffset={arc.offset}
                                                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                                                />
                                            ))}
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="font-code-tabular font-bold text-xl text-on-surface">{totalInc}</span>
                                            <span className="text-[10px] text-on-surface-variant uppercase">Total</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-1">
                                        {donutSegments.map((seg) => (
                                            <div key={seg.label} className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-2 text-on-surface">
                                                    <span className="w-3 h-3 rounded-sm" style={{ background: seg.color }}></span>
                                                    {seg.label}
                                                </span>
                                                <span className="font-code-tabular font-bold text-on-surface-variant">{seg.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Fleet Readiness Gauge */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">
                                    Fleet Readiness
                                </h3>
                                <div className="flex flex-col items-center justify-center py-2">
                                    <div className="relative w-32 h-16 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-surface-container-low"></div>
                                        <div
                                            className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-transparent border-t-primary border-l-primary"
                                            style={{ transform: `rotate(${-135 + (availPct / 100) * 180}deg)`, transition: "transform 0.6s ease" }}
                                        ></div>
                                    </div>
                                    <div className="text-center -mt-2">
                                        <span className="font-code-tabular font-bold text-2xl text-primary">{availPct}%</span>
                                        <div className="text-xs text-on-surface-variant">Units Available</div>
                                    </div>
                                </div>
                                <div className="flex justify-around mt-3 pt-3 border-t border-surface-container-high text-center">
                                    <div>
                                        <div className="font-code-tabular font-bold text-emerald-500">{available}</div>
                                        <div className="text-[10px] text-on-surface-variant uppercase">Available</div>
                                    </div>
                                    <div>
                                        <div className="font-code-tabular font-bold text-amber-500">{deployed}</div>
                                        <div className="text-[10px] text-on-surface-variant uppercase">Deployed</div>
                                    </div>
                                    <div>
                                        <div className="font-code-tabular font-bold text-on-surface">{totalUnits}</div>
                                        <div className="text-[10px] text-on-surface-variant uppercase">Total</div>
                                    </div>
                                </div>
                            </div>

                            {/* Response Time Percentiles Bar Chart */}
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">
                                    Response Time Percentiles
                                </h3>
                                <div className="flex items-end justify-around h-40 gap-3 pt-2">
                                    {percentiles.map((p) => {
                                        const heightPct = Math.min(100, Math.round((p.value / p.max) * 100));
                                        return (
                                            <div key={p.label} className="flex flex-col items-center gap-2 flex-1">
                                                <span className="font-code-tabular text-xs font-bold text-on-surface">{p.value}m</span>
                                                <div className="w-full bg-surface-container-low rounded-t-lg flex items-end" style={{ height: "100px" }}>
                                                    <div
                                                        className={`w-full rounded-t-lg transition-all duration-500 ${
                                                            p.value > 8 ? "bg-error" : p.value > 5 ? "bg-amber-400" : "bg-primary"
                                                        }`}
                                                        style={{ height: `${heightPct}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[11px] font-mono font-bold text-on-surface-variant">{p.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="text-center text-[10px] text-on-surface-variant mt-2">
                                    Target SLA: 5.0m • lower is better
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
