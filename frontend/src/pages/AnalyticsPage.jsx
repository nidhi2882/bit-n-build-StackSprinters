import React from "react";
import { BarChart3, Clock, ShieldCheck, Activity, Copy, TrendingUp, AlertTriangle, PieChart, Layers, CheckCircle2 } from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";

function AnalyticsPage() {
    const { incidents, resources, hospitals, alerts } = useEmergency();

    const floodCount = incidents.filter(i => (i.type || "").toLowerCase().includes("flood") || (i.type || "").toLowerCase().includes("water")).length;
    const fireCount = incidents.filter(i => (i.type || "").toLowerCase().includes("fire")).length;
    const accidentCount = incidents.filter(i => (i.type || "").toLowerCase().includes("traffic") || (i.type || "").toLowerCase().includes("accident") || (i.type || "").toLowerCase().includes("crash")).length;
    const hazCount = incidents.filter(i => (i.type || "").toLowerCase().includes("haz") || (i.type || "").toLowerCase().includes("chemical")).length;
    const medCount = incidents.filter(i => (i.type || "").toLowerCase().includes("med")).length;
    const otherCount = Math.max(0, incidents.length - (floodCount + fireCount + accidentCount + hazCount + medCount));

    const totalIncidents = incidents.length;
    const activeIncidents = incidents.filter(i => i.status !== "Resolved").length;
    const resolvedIncidents = incidents.filter(i => i.status === "Resolved").length;

    const criticalLevel5 = incidents.filter(i => i.severity === 5).length;
    const severeLevel4 = incidents.filter(i => i.severity === 4).length;
    const moderateLevel3 = incidents.filter(i => i.severity === 3).length;
    const minorLevel12 = incidents.filter(i => i.severity <= 2).length;

    const totalDuplicates = incidents.reduce((acc, curr) => acc + (curr.duplicateCount || 0), 0);
    const availableResources = resources.filter(r => (r.status || "").toLowerCase() === "available").length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Executive Header */}
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, textAlign: 'left' }}>
                    Executive Governance & Emergency Analytics
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Cross-agency figures, emergency category breakdown, severity distribution, and SLA response metrics
                </p>
            </div>

            {/* Total Issues Figures */}
            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div className="stat-card" style={{ background: '#0b1120', border: '1px solid #1e293b' }}>
                    <div>
                        <div className="stat-lbl">Total Emergencies</div>
                        <div className="stat-val" style={{ color: '#fff' }}>{totalIncidents}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ingested across sources</div>
                    </div>
                    <Layers size={24} style={{ color: '#3b82f6' }} />
                </div>

                <div className="stat-card" style={{ background: '#0b1120', border: '1px solid #1e293b' }}>
                    <div>
                        <div className="stat-lbl">Active & In-Progress</div>
                        <div className="stat-val" style={{ color: '#ef4444' }}>{activeIncidents}</div>
                        <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Requiring active unit response</div>
                    </div>
                    <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                </div>

                <div className="stat-card" style={{ background: '#0b1120', border: '1px solid #1e293b' }}>
                    <div>
                        <div className="stat-lbl">Resolved Missions</div>
                        <div className="stat-val" style={{ color: '#10b981' }}>{resolvedIncidents}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>Successfully contained</div>
                    </div>
                    <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                </div>

                <div className="stat-card" style={{ background: '#0b1120', border: '1px solid #1e293b' }}>
                    <div>
                        <div className="stat-lbl">Fleet Readiness</div>
                        <div className="stat-val" style={{ color: '#a855f7' }}>{availableResources}/{resources.length}</div>
                        <div style={{ fontSize: '0.75rem', color: '#e9d5ff' }}>Units available for dispatch</div>
                    </div>
                    <TrendingUp size={24} style={{ color: '#a855f7' }} />
                </div>
            </div>

            {/* Category Breakdown Charts & Severity Distribution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Visual Category Distribution Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={18} style={{ color: '#3b82f6' }} />
                        <span>Emergency Issues Breakdown by Category (Figures & Chart)</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { label: "🌊 Flood & Water Rescue", count: floodCount, color: "#3b82f6" },
                            { label: "🔥 Structure & Wildfire", count: fireCount, color: "#ef4444" },
                            { label: "🚑 Medical Emergency", count: medCount, color: "#10b981" },
                            { label: "🚗 Highway & Traffic", count: accidentCount, color: "#f97316" },
                            { label: "☣️ Hazmat & Chemical", count: hazCount, color: "#a855f7" },
                            { label: "🛡️ Other Emergencies", count: otherCount, color: "#64748b" }
                        ].map((item, idx) => {
                            const pct = totalIncidents > 0 ? Math.round((item.count / totalIncidents) * 100) : 0;
                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.label}</span>
                                        <span style={{ color: '#94a3b8', fontWeight: 700 }}>
                                            <strong style={{ color: '#fff', marginRight: '4px' }}>{item.count}</strong> ({pct}%)
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: '#0b1120', borderRadius: '5px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.max(pct, 4)}%`, height: '100%', background: item.color, borderRadius: '5px', transition: 'width 0.5s ease-in-out' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Severity Breakdown Cards */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PieChart size={18} style={{ color: '#ef4444' }} />
                        <span>Severity Level Distribution & Priority Code</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700 }}>LEVEL 5 CRITICAL (P1)</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{criticalLevel5}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Life-threatening / Active rescue</div>
                        </div>

                        <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid #f97316', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#fdba74', fontWeight: 700 }}>LEVEL 4 SEVERE (P2)</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f97316' }}>{severeLevel4}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Heavy structural / Injury risk</div>
                        </div>

                        <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#fef08a', fontWeight: 700 }}>LEVEL 3 MODERATE (P3)</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#eab308' }}>{moderateLevel3}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Contained active incident</div>
                        </div>

                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700 }}>LEVEL 1-2 MINOR (P4/P5)</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6' }}>{minorLevel12}</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Property damage / Advisory</div>
                        </div>
                    </div>

                    <div style={{ background: '#0b1120', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>AI Duplicate Report Consolidation</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#3b82f6' }}>{totalDuplicates} Duplicate Reports Merged</div>
                        </div>
                        <Copy size={22} style={{ color: '#3b82f6' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;
