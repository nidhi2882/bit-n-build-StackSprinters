import React, { useState, useEffect } from "react";
import { 
    Layers, 
    ShieldCheck, 
    Clock, 
    Radio, 
    CheckCircle, 
    XCircle, 
    Search, 
    Filter, 
    Sparkles, 
    Sliders,
    Building2,
    Users
} from "lucide-react";
import { apiClient } from "../services/api";

const FALLBACK_CATEGORIES = [
    { id: "CAT_FLOOD", name: "Flood & Inundation", icon: "🌊", color: "#3b82f6", priority: "P1", dept: "Disaster Management, Fire & Rescue", caps: ["WATER_RESCUE", "INFLATABLE_BOAT", "HEAVY_PUMP", "TEMPORARY_SHELTER"], sla: "≤ 5m" },
    { id: "CAT_FIRE", name: "Fire & Explosion", icon: "🔥", color: "#ef4444", priority: "P1", dept: "Fire & Rescue, Hazmat", caps: ["FIRE_ENGINE", "FOAM_TENDER", "LADDER_TRUCK", "BREATHING_APPARATUS"], sla: "≤ 5m" },
    { id: "CAT_MED", name: "Medical & Mass Casualty", icon: "🚑", color: "#10b981", priority: "P1", dept: "EMS / Ambulance, Hospitals", caps: ["ADVANCED_AMBULANCE", "TRAUMA_TEAM", "ICU_BED_CAPACITY", "TRIAGE_KIT"], sla: "≤ 5m" },
    { id: "CAT_TRAFFIC", name: "Road & Traffic Incident", icon: "🚗", color: "#f97316", priority: "P2", dept: "Police, EMS, Highway Safety", caps: ["EXTRICATION_EQUIPMENT", "TRAFFIC_CONTROL", "AMBULANCE", "TOW_TRUCK"], sla: "≤ 15m" },
    { id: "CAT_HAZMAT", name: "Industrial & Hazmat", icon: "☣️", color: "#a855f7", priority: "P1", dept: "Hazmat Specialist Unit, Fire & Rescue", caps: ["HAZMAT_SUIT_LEVEL_A", "GAS_DETECTOR", "DECONTAMINATION_UNIT"], sla: "≤ 5m" },
    { id: "CAT_COLLAPSE", name: "Structural Failure", icon: "🏚️", color: "#eab308", priority: "P1", dept: "Urban Search & Rescue (USAR), Engineering", caps: ["SEARCH_DOGS", "CONCRETE_CUTTER", "HEAVY_CRANE"], sla: "≤ 5m" },
    { id: "CAT_SEISMIC", name: "Geological & Seismic", icon: "🌋", color: "#854d0e", priority: "P1", dept: "Disaster Management, USAR", caps: ["USAR_TEAM", "EARTHMOVER", "GEOLOGICAL_SURVEYOR"], sla: "≤ 5m" },
    { id: "CAT_STORM", name: "Weather & Meteorological", icon: "🌪️", color: "#06b6d4", priority: "P2", dept: "Disaster Management, Power Utility", caps: ["TREE_TRIMMER", "POWER_RESTORATION_CREW", "EMERGENCY_GENERATOR"], sla: "≤ 15m" },
    { id: "CAT_UTILITY", name: "Utility & Infrastructure", icon: "⚡", color: "#6366f1", priority: "P3", dept: "Public Utilities Department", caps: ["HIGH_VOLTAGE_CREW", "WATER_REPAIR_CREW", "GENSET_MOBILE"], sla: "≤ 30m" },
    { id: "CAT_SAR", name: "Search & Rescue", icon: "🔍", color: "#ec4899", priority: "P2", dept: "Police, Search & Rescue Volunteers", caps: ["DRONE_THERMAL", "SEARCH_DOGS", "NIGHT_VISION"], sla: "≤ 15m" },
    { id: "CAT_HAZARD", name: "Environmental Hazard", icon: "⚠️", color: "#14b8a6", priority: "P3", dept: "Environmental Protection Agency", caps: ["BOOM_BARRIER", "SKIMMER", "CONTAINMENT_VESSEL"], sla: "≤ 30m" },
    { id: "CAT_SECURITY", name: "Public Safety & Crowd", icon: "🛡️", color: "#64748b", priority: "P1", dept: "Police Department", caps: ["CROWD_CONTROL", "BARRICADES", "TACTICAL_UNIT"], sla: "≤ 5m" }
];

const RBAC_MATRIX = [
    { action: "Submit Incident Report / SOS", superAdmin: true, authAdmin: true, deptAdmin: true, operator: true, teamLead: true, teamMember: true, hospital: false, citizen: true },
    { action: "View Authority Incidents", superAdmin: "All", authAdmin: "Authority", deptAdmin: "Dept Only", operator: "Authority", teamLead: false, teamMember: false, hospital: false, citizen: "Own Only" },
    { action: "Override AI Classification", superAdmin: true, authAdmin: true, deptAdmin: "Dept Only", operator: true, teamLead: false, teamMember: false, hospital: false, citizen: false },
    { action: "Assign Resource to Incident", superAdmin: true, authAdmin: true, deptAdmin: "Dept Only", operator: true, teamLead: false, teamMember: false, hospital: false, citizen: false },
    { action: "Merge / Split Duplicates", superAdmin: true, authAdmin: true, deptAdmin: false, operator: true, teamLead: false, teamMember: false, hospital: false, citizen: false },
    { action: "Update Assignment Status", superAdmin: false, authAdmin: false, deptAdmin: false, operator: false, teamLead: true, teamMember: "Own Unit", hospital: false, citizen: false },
    { action: "Update Hospital Bed Capacity", superAdmin: true, authAdmin: true, deptAdmin: false, operator: false, teamLead: false, teamMember: false, hospital: "Own Facility", citizen: false },
    { action: "Configure Routing Rules", superAdmin: true, authAdmin: true, deptAdmin: "Sub-rules", operator: false, teamLead: false, teamMember: false, hospital: false, citizen: false },
    { action: "Query AI Copilot (RAG)", superAdmin: "Global", authAdmin: "Authority", deptAdmin: "Dept Scoped", operator: "Authority", teamLead: "Unit Scoped", teamMember: false, hospital: "Facility", citizen: false }
];

function AdminConsolePage() {
    const [activeTab, setActiveTab] = useState("taxonomy");
    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

    useEffect(() => {
        apiClient.get("/taxonomy/categories")
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setCategories(res.data.map(c => ({
                        id: c.id,
                        name: c.name,
                        icon: c.icon || "🚨",
                        color: c.color || "#3b82f6",
                        priority: c.defaultPriorityCode || "P1",
                        dept: c.primaryDepartment,
                        caps: c.defaultRequiredCapabilities || [],
                        sla: c.defaultPriorityCode === "P1" ? "≤ 5m" : c.defaultPriorityCode === "P2" ? "≤ 15m" : "≤ 30m"
                    })));
                }
            })
            .catch(() => {
                // Keep fallbacks
            });
    }, []);

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "10px 0", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, color: "#60a5fa", marginBottom: "8px" }}>
                        <Sliders size={14} />
                        <span>Phase 2 Production Admin Shell</span>
                    </div>
                    <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                        Executive Governance & Emergency Admin Console
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "6px 0 0" }}>
                        Configure two-level emergency taxonomies, targeted department containment, SLA escalation tiers, and RBAC matrix.
                    </p>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "8px", background: "#0f172a", padding: "6px", borderRadius: "10px", border: "1px solid #1e293b" }}>
                    {[
                        { id: "taxonomy", label: "Emergency Taxonomy", icon: Layers },
                        { id: "routing", label: "Department Routing Hub", icon: Building2 },
                        { id: "rbac", label: "RBAC Security Matrix", icon: ShieldCheck }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: active ? "#3b82f6" : "transparent",
                                    color: active ? "#fff" : "#94a3b8",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TAB 1: TAXONOMY */}
            {activeTab === "taxonomy" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ position: "relative", minWidth: "300px" }}>
                            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#64748b" }} />
                            <input
                                type="text"
                                placeholder="Filter categories, departments, or capability tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: "100%",
                                    background: "#0f172a",
                                    border: "1px solid #1e293b",
                                    borderRadius: "8px",
                                    padding: "10px 14px 10px 38px",
                                    color: "#fff",
                                    fontSize: "0.88rem",
                                    outline: "none"
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "0.85rem", color: "#94a3b8" }}>
                            <span>Total Registered Categories: <strong style={{ color: "#fff" }}>{categories.length}</strong></span>
                            <span style={{ color: "#334155" }}>•</span>
                            <span>Target SLA: <strong style={{ color: "#ef4444" }}>≤ 5m (P1)</strong> to <strong style={{ color: "#3b82f6" }}>≤ 30m (P3)</strong></span>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
                        {filteredCategories.map(cat => (
                            <div key={cat.id} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", borderLeft: `4px solid ${cat.color}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ fontSize: "1.8rem" }}>{cat.icon}</div>
                                        <div>
                                            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                                                {cat.name}
                                            </h3>
                                            <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontFamily: "monospace" }}>
                                                {cat.id}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        padding: "4px 8px", 
                                        borderRadius: "6px", 
                                        fontWeight: 800, 
                                        fontSize: "0.75rem",
                                        background: cat.priority === "P1" ? "rgba(239, 68, 68, 0.2)" : cat.priority === "P2" ? "rgba(249, 115, 22, 0.2)" : "rgba(59, 130, 246, 0.2)",
                                        color: cat.priority === "P1" ? "#ef4444" : cat.priority === "P2" ? "#f97316" : "#60a5fa"
                                    }}>
                                        {cat.priority} • {cat.sla}
                                    </span>
                                </div>

                                <div style={{ fontSize: "0.84rem", color: "#cbd5e1" }}>
                                    <strong style={{ color: "#94a3b8", display: "block", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "4px" }}>
                                        Primary Responding Department
                                    </strong>
                                    {cat.dept}
                                </div>

                                <div>
                                    <strong style={{ color: "#94a3b8", display: "block", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "6px" }}>
                                        Default Required Capabilities
                                    </strong>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {cat.caps.map((cap, idx) => (
                                            <span key={idx} style={{ 
                                                background: "#1e293b", 
                                                color: "#93c5fd", 
                                                fontSize: "0.72rem", 
                                                padding: "3px 8px", 
                                                borderRadius: "4px",
                                                fontWeight: 600,
                                                fontFamily: "monospace"
                                            }}>
                                                {cap}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2: ROUTING HUB & STRUCTURAL CONTAINMENT */}
            {activeTab === "routing" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "18px 22px", borderRadius: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontWeight: 800, fontSize: "1rem", marginBottom: "6px" }}>
                            <Building2 size={20} />
                            <span>Structural Containment & Anti-Noise Routing Architecture</span>
                        </div>
                        <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                            ResQGrid structurally isolates department operational channels. Fire departments only receive packets scoped to Fire incidents; Flood teams receive water alerts. Cross-talk is strictly eliminated at the WebSocket and alert levels to prevent notification fatigue.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                        {[
                            { name: "Fire & Rescue Department", channel: "dept:fire-vadodara", cat: "CAT_FIRE", status: "Active Room", units: "4 Tenders", sla: "5 min SLA" },
                            { name: "Disaster Management & Flood", channel: "dept:flood-vadodara", cat: "CAT_FLOOD", status: "Active Room", units: "6 Boats", sla: "5 min SLA" },
                            { name: "EMS & Mass Casualty", channel: "dept:ems-vadodara", cat: "CAT_MED", status: "Active Room", units: "8 Ambulances", sla: "5 min SLA" },
                            { name: "Police & Traffic Command", channel: "dept:police-vadodara", cat: "CAT_TRAFFIC", status: "Active Room", units: "12 Patrols", sla: "15 min SLA" },
                            { name: "Industrial Hazmat Unit", channel: "dept:hazmat-vadodara", cat: "CAT_HAZMAT", status: "Standby Room", units: "2 Decon Units", sla: "5 min SLA" },
                            { name: "Public Utilities Department", channel: "dept:utility-vadodara", cat: "CAT_UTILITY", status: "Standby Room", units: "5 Crews", sla: "30 min SLA" }
                        ].map((dept, i) => (
                            <div key={i} className="card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", margin: 0 }}>{dept.name}</h3>
                                    <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                                        {dept.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: "0.82rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                                    <span>Socket.IO Scoped Room:</span>
                                    <code style={{ color: "#93c5fd" }}>{dept.channel}</code>
                                </div>
                                <div style={{ fontSize: "0.82rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                                    <span>Bound Category:</span>
                                    <span style={{ color: "#f8fafc", fontWeight: 600 }}>{dept.cat}</span>
                                </div>
                                <div style={{ fontSize: "0.82rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                                    <span>Active Resource Fleet:</span>
                                    <span style={{ color: "#a7f3d0", fontWeight: 600 }}>{dept.units}</span>
                                </div>
                                <div style={{ fontSize: "0.82rem", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                                    <span>Automated SLA Escalation:</span>
                                    <span style={{ color: "#f87171", fontWeight: 700 }}>BullMQ Timer ({dept.sla})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: RBAC SECURITY MATRIX */}
            {activeTab === "rbac" && (
                <div className="card" style={{ padding: "20px", overflowX: "auto" }}>
                    <div style={{ marginBottom: "16px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                            Granular CASL RBAC / ABAC Permission Evaluation Matrix
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
                            Defined in Section 7.1 of System Specification. Enforced server-side via JWT & Security policies.
                        </p>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #334155", color: "#94a3b8" }}>
                                <th style={{ padding: "12px 10px" }}>Action / Capability</th>
                                <th style={{ padding: "12px 6px" }}>Super Admin</th>
                                <th style={{ padding: "12px 6px" }}>Authority Admin</th>
                                <th style={{ padding: "12px 6px" }}>Dept Admin</th>
                                <th style={{ padding: "12px 6px" }}>Operator</th>
                                <th style={{ padding: "12px 6px" }}>Team Lead</th>
                                <th style={{ padding: "12px 6px" }}>Team Member</th>
                                <th style={{ padding: "12px 6px" }}>Hospital</th>
                                <th style={{ padding: "12px 6px" }}>Citizen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RBAC_MATRIX.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #1e293b" }}>
                                    <td style={{ padding: "12px 10px", fontWeight: 700, color: "#f8fafc" }}>
                                        {row.action}
                                    </td>
                                    {[row.superAdmin, row.authAdmin, row.deptAdmin, row.operator, row.teamLead, row.teamMember, row.hospital, row.citizen].map((val, cellIdx) => (
                                        <td key={cellIdx} style={{ padding: "12px 6px" }}>
                                            {val === true ? (
                                                <CheckCircle size={16} style={{ color: "#10b981" }} />
                                            ) : val === false ? (
                                                <XCircle size={16} style={{ color: "#475569" }} />
                                            ) : (
                                                <span style={{ fontSize: "0.75rem", background: "#1e293b", color: "#93c5fd", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                                                    {val}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminConsolePage;
