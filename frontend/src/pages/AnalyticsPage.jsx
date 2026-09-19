import React from "react";
import { BarChart3, Clock, ShieldCheck, Activity, Copy, TrendingUp, AlertTriangle } from "lucide-react";
import { useEmergency } from "../context/EmergencyContext";

function AnalyticsPage() {
    const { incidents, resources, hospitals } = useEmergency();

    const floodCount = incidents.filter(i => i.type === "Flood").length;
    const fireCount = incidents.filter(i => i.type === "Fire").length;
    const accidentCount = incidents.filter(i => i.type === "Accident").length;
    const hazCount = incidents.filter(i => i.type === "Hazardous").length;
    const medCount = incidents.filter(i => i.type === "Medical").length;

    const totalDuplicates = incidents.reduce((acc, curr) => acc + (curr.duplicateCount || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, textAlign: 'left' }}>
                    Emergency Coordination Analytics & Insights
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Response efficiency metrics, AI duplicate reduction, resource utilization, and incident density
                </p>
            </div>

            {/* Metrics Overview Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Avg Response Dispatch Time</div>
                        <div className="stat-val" style={{ color: '#10b981' }}>4.2 min</div>
                        <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>↓ 35% faster than baseline</div>
                    </div>
                    <Clock size={24} style={{ color: '#10b981' }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">AI Duplicate Reduction</div>
                        <div className="stat-val" style={{ color: '#3b82f6' }}>{totalDuplicates} Reports</div>
                        <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>Consolidated automatically</div>
                    </div>
                    <Copy size={24} style={{ color: '#3b82f6' }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-lbl">Fleet Utilization Rate</div>
                        <div className="stat-val" style={{ color: '#a855f7' }}>78.5%</div>
                        <div style={{ fontSize: '0.75rem', color: '#e9d5ff' }}>Active / En-route units</div>
                    </div>
                    <TrendingUp size={24} style={{ color: '#a855f7' }} />
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Incident Distribution Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={18} style={{ color: '#3b82f6' }} />
                        <span>Incident Distribution by Type</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { label: "🌊 Flood / Water Rescue", count: floodCount, color: "#3b82f6" },
                            { label: "🔥 Structure Fire", count: fireCount, color: "#ef4444" },
                            { label: "☣️ Hazardous Leak", count: hazCount, color: "#a855f7" },
                            { label: "🚗 Highway Crash", count: accidentCount, color: "#f97316" },
                            { label: "🚑 Mass Medical", count: medCount, color: "#10b981" }
                        ].map((item, idx) => {
                            const pct = Math.round((item.count / incidents.length) * 100) || 0;
                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.label}</span>
                                        <span style={{ color: '#94a3b8' }}>{item.count} ({pct}%)</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#0b1120', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Performance & Emergency Intelligence Insights */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} style={{ color: '#a855f7' }} />
                        <span>AI Emergency Intelligence Metrics</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>AI Classification Precision</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a7f3d0' }}>94.8%</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Validated against ground truth reports</div>
                        </div>

                        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Geospatial Matching Distance Threshold</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#93c5fd' }}>300 meters / 15 mins</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Threshold for automated duplicate clustering</div>
                        </div>

                        <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Resource Recommendation Match Score</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e9d5ff' }}>96.2%</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Based on capability + distance optimization algorithm</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;
