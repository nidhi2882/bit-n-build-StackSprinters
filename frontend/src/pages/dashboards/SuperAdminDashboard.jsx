import React, { useState, useEffect } from "react";
import { Shield, Activity, AlertTriangle, Clock, Users, Building2, Layers, Filter, Plus, UserPlus, CheckCircle, RefreshCw, BarChart3, Share2 } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

function SuperAdminDashboard() {
    const { incidents, resources, hospitals, alerts } = useEmergency();
    const { user } = useAuth();

    const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
    const [selectedSeverityFilter, setSelectedSeverityFilter] = useState("ALL");
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({
        name: "", email: "", password: "", role: "Department Admin", departmentCategory: "CAT_FIRE", unitId: "", phone: ""
    });

    // Global Service Requests state
    const [allServiceRequests, setAllServiceRequests] = useState([]);
    const [reqDeptFilter, setReqDeptFilter] = useState("ALL");
    const [reqStatusFilter, setReqStatusFilter] = useState("ALL");
    const [reqUrgencyFilter, setReqUrgencyFilter] = useState("ALL");
    const [reqEscalatedFilter, setReqEscalatedFilter] = useState("ALL");

    const fetchGlobalServiceRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/service-requests", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAllServiceRequests(data);
            }
        } catch (err) {
            console.error("Failed to fetch global service requests:", err);
        }
    };

    useEffect(() => {
        fetchGlobalServiceRequests();
        const interval = setInterval(fetchGlobalServiceRequests, 15000);
        return () => clearInterval(interval);
    }, []);

    // Cross-department metrics
    const totalIncidents = incidents.length;
    const criticalCount = incidents.filter(i => (i.severity || 0) >= 5).length;
    const activeIncidents = incidents.filter(i => i.status !== "Resolved").length;
    const totalResources = resources.length;
    const busyResources = resources.filter(r => (r.status || "").toLowerCase().includes("route") || (r.status || "").toLowerCase().includes("scene")).length;
    const resourceUtilPct = totalResources > 0 ? Math.round((busyResources / totalResources) * 100) : 0;

    // Filtered Incidents Master List
    const filteredIncidents = incidents.filter(i => {
        if (selectedDeptFilter !== "ALL") {
            const cat = selectedDeptFilter.replace("CAT_", "").toLowerCase();
            const typeStr = ((i.type || "") + " " + (i.title || "")).toLowerCase();
            if (!typeStr.includes(cat)) return false;
        }
        if (selectedSeverityFilter !== "ALL" && String(i.severity) !== selectedSeverityFilter) {
            return false;
        }
        if (selectedStatusFilter !== "ALL" && (i.status || "").toLowerCase() !== selectedStatusFilter.toLowerCase()) {
            return false;
        }
        return true;
    });

    // Filtered Global Service Requests
    const filteredServiceRequests = allServiceRequests.filter(req => {
        if (reqDeptFilter !== "ALL") {
            const dStr = (req.requestedDepartment || "").toUpperCase();
            if (!dStr.includes(reqDeptFilter.replace("CAT_", ""))) return false;
        }
        if (reqStatusFilter !== "ALL" && req.status !== reqStatusFilter) return false;
        if (reqUrgencyFilter !== "ALL" && req.urgency !== reqUrgencyFilter) return false;
        if (reqEscalatedFilter === "ESCALATED" && !req.escalatedToSuperAdmin) return false;
        return true;
    });

    // Department Performance Aggregates
    const deptStats = [
        { name: "Fire & Rescue", cat: "CAT_FIRE", count: incidents.filter(i => (i.type||"").toUpperCase().includes("FIRE")).length, avgTime: "11 mins", units: resources.filter(r => (r.type||"").toLowerCase().includes("fire")).length, status: "Normal" },
        { name: "Flood & Disaster", cat: "CAT_FLOOD", count: incidents.filter(i => (i.type||"").toUpperCase().includes("FLOOD")).length, avgTime: "14 mins", units: resources.filter(r => (r.type||"").toLowerCase().includes("water") || (r.type||"").toLowerCase().includes("rescue")).length, status: "High Activity" },
        { name: "Medical & EMS", cat: "CAT_MED", count: incidents.filter(i => (i.type||"").toUpperCase().includes("MED") || (i.type||"").toUpperCase().includes("ACCIDENT")).length, avgTime: "8 mins", units: resources.filter(r => (r.type||"").toLowerCase().includes("ambul")).length, status: "Optimal" },
        { name: "Police & Security", cat: "CAT_SECURITY", count: incidents.filter(i => (i.type||"").toUpperCase().includes("POLICE") || (i.type||"").toUpperCase().includes("SECURITY")).length, avgTime: "9 mins", units: resources.filter(r => (r.type||"").toLowerCase().includes("police") || (r.type||"").toLowerCase().includes("traffic")).length, status: "Normal" }
    ];

    const handleCreateUserSubmit = (e) => {
        e.preventDefault();
        alert(`Account created successfully for ${userForm.name} (${userForm.email}) assigned as ${userForm.role}!`);
        setShowUserModal(false);
        setUserForm({ name: "", email: "", password: "", role: "Department Admin", departmentCategory: "CAT_FIRE", unitId: "", phone: "" });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Super Admin Command Banner */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', borderColor: '#6366f1', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', padding: '14px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
                            <Shield size={32} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                PLATFORM SUPER ADMIN COMMAND & CONTROL
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                                Cross-Department Oversight Dashboard
                            </h1>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                                Full system visibility • Role & User Scoping Enforcer • System Audit Log
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setShowUserModal(true)}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <UserPlus size={18} />
                            <span>Manage / Create User</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', background: '#0f172a', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>TOTAL ACTIVE INCIDENTS</span>
                        <Activity size={20} color="#3b82f6" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginTop: '10px' }}>
                        {activeIncidents} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400 }}>/ {totalIncidents} total</span>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', background: '#0f172a', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>CRITICAL (LEVEL 5)</span>
                        <AlertTriangle size={20} color="#ef4444" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444', marginTop: '10px' }}>
                        {criticalCount} <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 400 }}>Immediate Attention</span>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', background: '#0f172a', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 700 }}>CROSS-DEPT SERVICE REQUESTS</span>
                        <Share2 size={20} color="#a855f7" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#a855f7', marginTop: '10px' }}>
                        {allServiceRequests.length} <span style={{ fontSize: '0.85rem', color: '#e9d5ff', fontWeight: 400 }}>({allServiceRequests.filter(r => r.escalatedToSuperAdmin).length} Escalated)</span>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', background: '#0f172a', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>RESOURCE UTILIZATION</span>
                        <Users size={20} color="#8b5cf6" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6', marginTop: '10px' }}>
                        {resourceUtilPct}% <span style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: 400 }}>({busyResources}/{totalResources} units)</span>
                    </div>
                </div>
            </div>

            {/* Department Comparison Table */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building2 size={20} color="#60a5fa" />
                    <span>Cross-Department Operational Readiness & Performance Comparison</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #1e293b', color: '#94a3b8' }}>
                                <th style={{ padding: '12px' }}>Department Category</th>
                                <th style={{ padding: '12px' }}>Total Volume</th>
                                <th style={{ padding: '12px' }}>Avg Response SLA</th>
                                <th style={{ padding: '12px' }}>Active Units</th>
                                <th style={{ padding: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deptStats.map((d, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #1e293b', color: '#f8fafc' }}>
                                    <td style={{ padding: '14px 12px', fontWeight: 700 }}>{d.name}</td>
                                    <td style={{ padding: '14px 12px' }}>{d.count} incidents</td>
                                    <td style={{ padding: '14px 12px', color: '#38bdf8', fontWeight: 700 }}>{d.avgTime}</td>
                                    <td style={{ padding: '14px 12px' }}>{d.units} units deployed</td>
                                    <td style={{ padding: '14px 12px' }}>
                                        <span style={{
                                            background: d.status === "High Activity" ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                                            color: d.status === "High Activity" ? '#fca5a5' : '#6ee7b7',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.78rem',
                                            fontWeight: 700
                                        }}>
                                            {d.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Cross-Department Service Requests Master Table */}
            <div className="card" style={{ padding: '24px', borderColor: '#a855f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Share2 size={20} color="#a855f7" />
                        <span>Global Cross-Department Service Requests Master Table ({filteredServiceRequests.length})</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Target Dept Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <Filter size={14} color="#a5b4fc" />
                            <select value={reqDeptFilter} onChange={e => setReqDeptFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}>
                                <option value="ALL">All Target Depts</option>
                                <option value="FIRE">Fire & Rescue</option>
                                <option value="FLOOD">Flood Command</option>
                                <option value="MED">Medical & EMS</option>
                                <option value="SECURITY">Police & Security</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <select value={reqStatusFilter} onChange={e => setReqStatusFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}>
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING">PENDING</option>
                                <option value="ACCEPTED">ACCEPTED</option>
                                <option value="DECLINED">DECLINED</option>
                                <option value="RESOLVED">RESOLVED</option>
                            </select>
                        </div>

                        {/* Urgency Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <select value={reqUrgencyFilter} onChange={e => setReqUrgencyFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}>
                                <option value="ALL">All Urgencies</option>
                                <option value="CRITICAL">CRITICAL</option>
                                <option value="HIGH">HIGH</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="LOW">LOW</option>
                            </select>
                        </div>

                        {/* Escalated Only Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <select value={reqEscalatedFilter} onChange={e => setReqEscalatedFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}>
                                <option value="ALL">All Escalation States</option>
                                <option value="ESCALATED">⚠️ Escalated Only</option>
                            </select>
                        </div>

                        <button
                            onClick={fetchGlobalServiceRequests}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <RefreshCw size={14} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #1e293b', color: '#94a3b8' }}>
                                <th style={{ padding: '10px' }}>Req ID</th>
                                <th style={{ padding: '10px' }}>Incident ID</th>
                                <th style={{ padding: '10px' }}>From Dept</th>
                                <th style={{ padding: '10px' }}>Target Dept</th>
                                <th style={{ padding: '10px' }}>Capability Needed</th>
                                <th style={{ padding: '10px' }}>Urgency</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Assigned Unit</th>
                                <th style={{ padding: '10px' }}>Escalated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServiceRequests.length > 0 ? (
                                filteredServiceRequests.map(req => (
                                    <tr key={req.id} style={{ borderBottom: '1px solid #1e293b', color: '#f8fafc', background: req.escalatedToSuperAdmin ? 'rgba(239, 68, 68, 0.08)' : 'transparent' }}>
                                        <td style={{ padding: '12px 10px', fontWeight: 800, color: '#a855f7' }}>#{req.id}</td>
                                        <td style={{ padding: '12px 10px', fontWeight: 700, color: '#60a5fa' }}>#{req.incidentId}</td>
                                        <td style={{ padding: '12px 10px', fontWeight: 700 }}>{req.requestedByDepartment}</td>
                                        <td style={{ padding: '12px 10px', fontWeight: 700, color: '#f472b6' }}>{req.requestedDepartment}</td>
                                        <td style={{ padding: '12px 10px' }}>{req.requiredCapability}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontWeight: 800,
                                                background: req.urgency === "CRITICAL" ? '#ef4444' : req.urgency === "HIGH" ? '#f59e0b' : '#3b82f6',
                                                color: '#fff'
                                            }}>
                                                {req.urgency}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                fontWeight: 800,
                                                background: req.status === "ACCEPTED" ? 'rgba(16,185,129,0.2)' : req.status === "DECLINED" ? 'rgba(239,68,68,0.2)' : req.status === "RESOLVED" ? 'rgba(100,116,139,0.2)' : 'rgba(168,85,247,0.2)',
                                                color: req.status === "ACCEPTED" ? '#10b981' : req.status === "DECLINED" ? '#ef4444' : req.status === "RESOLVED" ? '#94a3b8' : '#a855f7'
                                            }}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{req.assignedUnitName || "-"}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            {req.escalatedToSuperAdmin ? (
                                                <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                                    YES (STALE)
                                                </span>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        No cross-department service requests match the filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cross-Department Incidents Master List with Filters */}
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Layers size={20} color="#8b5cf6" />
                        <span>System Incident Master Feed (All Categories & Roles)</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Dept Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <Filter size={14} color="#a5b4fc" />
                            <select value={selectedDeptFilter} onChange={e => setSelectedDeptFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}>
                                <option value="ALL">All Departments</option>
                                <option value="CAT_FIRE">Fire & Rescue</option>
                                <option value="CAT_FLOOD">Flood & Disaster</option>
                                <option value="CAT_MED">Medical & EMS</option>
                                <option value="CAT_SECURITY">Police & Security</option>
                            </select>
                        </div>

                        {/* Severity Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <select value={selectedSeverityFilter} onChange={e => setSelectedSeverityFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}>
                                <option value="ALL">All Severities</option>
                                <option value="5">Severity 5 (Critical)</option>
                                <option value="4">Severity 4 (High)</option>
                                <option value="3">Severity 3 (Medium)</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                            <select value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none' }}>
                                <option value="ALL">All Statuses</option>
                                <option value="reported">Reported</option>
                                <option value="assigned">Assigned</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #1e293b', color: '#94a3b8' }}>
                                <th style={{ padding: '10px' }}>ID</th>
                                <th style={{ padding: '10px' }}>Title & Description</th>
                                <th style={{ padding: '10px' }}>Category</th>
                                <th style={{ padding: '10px' }}>Severity</th>
                                <th style={{ padding: '10px' }}>Reporter Email</th>
                                <th style={{ padding: '10px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncidents.length > 0 ? (
                                filteredIncidents.map(inc => (
                                    <tr key={inc.id} style={{ borderBottom: '1px solid #1e293b', color: '#f8fafc' }}>
                                        <td style={{ padding: '12px 10px', fontWeight: 800, color: '#60a5fa' }}>{inc.id}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <div style={{ fontWeight: 700, color: '#fff' }}>{inc.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inc.locationName}</div>
                                        </td>
                                        <td style={{ padding: '12px 10px', fontWeight: 700 }}>{inc.type}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span className={`severity-badge severity-${inc.severity}`}>
                                                Level {inc.severity}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 10px', color: '#cbd5e1' }}>{inc.reporterEmail || "citizen@resqgrid.org"}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{
                                                background: inc.status === "Resolved" ? '#10b981' : '#3b82f6',
                                                color: '#fff',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700
                                            }}>
                                                {inc.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                        No incidents matching selected filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {showUserModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', background: '#0f172a', border: '1px solid #6366f1', padding: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Create / Assign User Role Account</h2>

                        <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Full Name</label>
                                <input type="text" required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', marginTop: '4px' }} placeholder="e.g. Inspector Anil Sharma" />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Email Address</label>
                                <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', marginTop: '4px' }} placeholder="e.g. fire.admin@resqgrid.gov" />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Password</label>
                                <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', marginTop: '4px' }} placeholder="••••••••" />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Assign Platform Role</label>
                                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', marginTop: '4px' }}>
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Department Admin">Department Admin</option>
                                    <option value="Response Team">Response Team</option>
                                    <option value="Citizen">Citizen</option>
                                </select>
                            </div>

                            {userForm.role === "Department Admin" && (
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Department Category Scope</label>
                                    <select value={userForm.departmentCategory} onChange={e => setUserForm({...userForm, departmentCategory: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', marginTop: '4px' }}>
                                        <option value="CAT_FIRE">🔥 Fire & Rescue</option>
                                        <option value="CAT_FLOOD">🌊 Flood & Disaster</option>
                                        <option value="CAT_MED">🚑 Medical & EMS</option>
                                        <option value="CAT_SECURITY">🛡️ Police & Security</option>
                                    </select>
                                </div>
                            )}

                            {userForm.role === "Response Team" && (
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Assigned Unit ID</label>
                                    <input type="text" value={userForm.unitId} onChange={e => setUserForm({...userForm, unitId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', marginTop: '4px' }} placeholder="e.g. RES-001" />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                                    Create Account
                                </button>
                                <button type="button" onClick={() => setShowUserModal(false)} style={{ flex: 1, padding: '12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SuperAdminDashboard;

