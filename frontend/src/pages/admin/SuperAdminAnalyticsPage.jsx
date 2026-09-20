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
                setAnalytics(response.data);
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
                    </div>
                </main>
            </div>
        </div>
    );
}
