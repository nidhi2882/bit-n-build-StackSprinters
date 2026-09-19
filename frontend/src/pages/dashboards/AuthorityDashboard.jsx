import React from "react";
import { ShieldCheck, Users, Truck, FileText, BarChart3, Activity } from "lucide-react";
import AnalyticsPage from "../AnalyticsPage";

function AuthorityDashboard() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Admin Header */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderColor: '#3b82f6', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#3b82f6', color: '#fff', padding: '10px', borderRadius: '10px' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>
                                EXECUTIVE AUTHORITY & SYSTEM GOVERNANCE PORTAL
                            </div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                                System Administration & Security Audit
                            </h1>
                        </div>
                    </div>

                    <span className="brand-badge" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        RBAC Scope: Full Governance
                    </span>
                </div>
            </div>

            {/* Audit Trail preview */}
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} style={{ color: '#3b82f6' }} />
                    <span>System Security & Action Audit Log</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { time: "12:14 PM", user: "Operator P. Sharma", action: "Dispatched NDRF Squad 03 to INC-2026-001 (Subhanpura)", ip: "192.168.1.45" },
                        { time: "12:10 PM", user: "Sensor Node-4", action: "Water level threshold alert triggered (1.2m)", ip: "IoT Gateway" },
                        { time: "11:58 AM", user: "Admin M. Rao", action: "Updated RBAC permissions for Response Team Leads", ip: "10.0.4.12" }
                    ].map((log, i) => (
                        <div key={i} style={{ fontSize: '0.8rem', background: '#0b1120', padding: '8px 12px', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong style={{ color: '#60a5fa' }}>[{log.user}]</strong> {log.action}
                            </div>
                            <div style={{ color: '#64748b' }}>{log.time} • IP: {log.ip}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Embed Analytics Insights */}
            <AnalyticsPage />
        </div>
    );
}

export default AuthorityDashboard;
