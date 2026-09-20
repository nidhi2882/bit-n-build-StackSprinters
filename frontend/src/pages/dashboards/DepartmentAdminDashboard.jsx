import React, { useState, useEffect } from "react";
import { Flame, Waves, Stethoscope, ShieldAlert, ArrowRightLeft, AlertTriangle, Users, CheckCircle2, Clock, Filter, MapPin, Share2, Check, X, ShieldCheck, RefreshCw } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

function DepartmentAdminDashboard() {
    const { incidents, resources, alerts, dismissAlert, updateIncidentStatus, assignResource } = useEmergency();
    const { user } = useAuth();

    const userDeptCat = user?.departmentCategory || "CAT_FIRE";
    const [selectedDeptCategory, setSelectedDeptCategory] = useState(userDeptCat);
    const [reclassifyIncidentId, setReclassifyIncidentId] = useState(null);
    const [targetCategory, setTargetCategory] = useState("CAT_FLOOD");

    // Scoped alerts targeting current selected department
    const deptAlerts = alerts.filter(a => {
        if (!a.targetDepartment) return true;
        const targetUpper = a.targetDepartment.toUpperCase();
        const currentUpper = selectedDeptCategory.toUpperCase();
        const shortCategory = currentUpper.replace("CAT_", "");
        return targetUpper.includes(shortCategory) || targetUpper === currentUpper;
    });

    // Cross-Department Requests State
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [acceptingReqId, setAcceptingReqId] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState("");
    const [decliningReqId, setDecliningReqId] = useState(null);
    const [declineReason, setDeclineReason] = useState("");
    const [activeSection, setActiveSection] = useState("incidents"); // "incidents" | "requests"

    // Dept Metadata
    const deptConfig = {
        "CAT_FIRE": { name: "Fire & Rescue Department", icon: "🔥", color: "#ef4444", types: ["FIRE", "Explosion", "Smoke"] },
        "CAT_FLOOD": { name: "Flood & Water Rescue Command", icon: "🌊", color: "#3b82f6", types: ["FLOOD", "Flood", "Drowning", "Water Logging"] },
        "CAT_MED": { name: "Medical Emergency & Trauma Center", icon: "🚑", color: "#10b981", types: ["MEDICAL", "Medical", "Accident", "Trauma"] },
        "CAT_SECURITY": { name: "Police & Public Safety Admin", icon: "🛡️", color: "#f97316", types: ["POLICE", "Security", "Riot", "Theft"] }
    };

    const currentDept = deptConfig[selectedDeptCategory] || deptConfig["CAT_FIRE"];

    // Fetch incoming service requests for logged in dept admin
    const fetchIncomingRequests = async () => {
        setLoadingRequests(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/service-requests/incoming", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setIncomingRequests(data);
            }
        } catch (err) {
            console.error("Failed to fetch incoming service requests:", err);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        fetchIncomingRequests();
        const interval = setInterval(fetchIncomingRequests, 15000); // Polling every 15s
        return () => clearInterval(interval);
    }, [selectedDeptCategory]);

    // Category Scoped Incidents
    const categoryIncidents = incidents.filter(i => {
        const typeUpper = (i.type || "").toUpperCase();
        return currentDept.types.some(t => typeUpper.includes(t.toUpperCase())) || typeUpper.includes(selectedDeptCategory.replace("CAT_", ""));
    });

    const unassignedIncidents = categoryIncidents.filter(i => i.status === "Reported" || i.assignedResourceIds.length === 0);
    const assignedIncidents = categoryIncidents.filter(i => i.assignedResourceIds.length > 0 && i.status !== "Resolved");

    // Category Scoped Team Roster
    const departmentUnits = resources.filter(r => {
        const rType = (r.type || "").toLowerCase();
        const keyword = selectedDeptCategory.replace("CAT_", "").toLowerCase();
        return rType.includes(keyword) || (keyword === "fire" && rType.includes("fire")) || (keyword === "flood" && (rType.includes("water") || rType.includes("rescue"))) || (keyword === "med" && rType.includes("ambul"));
    });

    const pendingRequestsCount = incomingRequests.filter(r => r.status === "PENDING").length;

    const handleReclassifySubmit = async (incidentId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/incidents/${incidentId}/reclassify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ newCategory: targetCategory })
            });

            if (response.ok) {
                alert(`Incident ${incidentId} successfully reclassified and rerouted to ${targetCategory} department!`);
                setReclassifyIncidentId(null);
                window.location.reload();
            } else {
                alert("Failed to reclassify incident.");
            }
        } catch (err) {
            console.error("Reclassify error:", err);
            alert("Error connecting to server for reclassification.");
        }
    };

    const handleEscalate = async (incidentId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/incidents/${incidentId}/escalate`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert(`Incident ${incidentId} escalated to Level 5 Critical Priority and Super Admin notified!`);
                window.location.reload();
            }
        } catch (err) {
            console.error("Escalate error:", err);
        }
    };

    const handleAcceptRequest = async (reqId) => {
        try {
            const token = localStorage.getItem("token");
            const selectedUnit = departmentUnits.find(u => String(u.id) === String(selectedUnitId));
            const response = await fetch(`http://localhost:8080/api/service-requests/${reqId}/accept`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    unitId: selectedUnitId || null,
                    assignedUnitName: selectedUnit ? selectedUnit.name : null
                })
            });

            if (response.ok) {
                alert("Service request accepted! Full incident access has been unlocked for your department.");
                setAcceptingReqId(null);
                setSelectedUnitId("");
                fetchIncomingRequests();
                window.location.reload();
            } else {
                alert("Failed to accept service request.");
            }
        } catch (err) {
            console.error("Accept request error:", err);
        }
    };

    const handleDeclineRequest = async (reqId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/service-requests/${reqId}/decline`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    reason: declineReason || "Resource unavailable at this moment"
                })
            });

            if (response.ok) {
                alert("Service request declined.");
                setDecliningReqId(null);
                setDeclineReason("");
                fetchIncomingRequests();
            } else {
                alert("Failed to decline service request.");
            }
        } catch (err) {
            console.error("Decline request error:", err);
        }
    };

    const handleResolveRequest = async (reqId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/service-requests/${reqId}/resolve`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert("Service request marked as resolved.");
                fetchIncomingRequests();
            }
        } catch (err) {
            console.error("Resolve request error:", err);
        }
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Department Admin Header */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderColor: currentDept.color, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ background: currentDept.color, color: '#fff', padding: '12px', borderRadius: '12px', fontSize: '1.6rem' }}>
                            {currentDept.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase' }}>
                                DEPARTMENT ADMIN COMMAND CONSOLE
                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                                {user?.name || currentDept.name}
                            </h1>
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                Department Category Scope: <strong style={{ color: currentDept.color }}>{selectedDeptCategory}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0b1120', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                        <Filter size={14} color="#60a5fa" />
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>Switch Dept View:</span>
                        <select
                            value={selectedDeptCategory}
                            onChange={(e) => setSelectedDeptCategory(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="CAT_FIRE">🔥 Fire & Rescue Admin</option>
                            <option value="CAT_FLOOD">🌊 Flood & Disaster Admin</option>
                            <option value="CAT_MED">🚑 Medical & Trauma Admin</option>
                            <option value="CAT_SECURITY">🛡️ Police & Safety Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Targeted Department Alerts Notification Panel */}
            {deptAlerts.length > 0 && (
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)', borderColor: '#eab308', padding: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fef08a', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldAlert size={18} color="#eab308" />
                            <span>Department Action Notifications & Live Alerts ({deptAlerts.length})</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {deptAlerts.slice(0, 3).map(alt => (
                            <div key={alt.id} style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: alt.type === 'SERVICE_REQUEST' ? 'rgba(168,85,247,0.2)' : 'rgba(239,68,68,0.2)',
                                        color: alt.type === 'SERVICE_REQUEST' ? '#c084fc' : '#fca5a5'
                                    }}>
                                        {alt.type || "ALERT"}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem' }}>{alt.title}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{alt.message}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {alt.type === 'SERVICE_REQUEST' && (
                                        <button
                                            onClick={() => setActiveSection("requests")}
                                            style={{ background: '#a855f7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            View Inbox
                                        </button>
                                    )}
                                    <button
                                        onClick={() => dismissAlert(alt.id)}
                                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Department Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div className="card" style={{ padding: '16px', background: '#0f172a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>UNASSIGNED INCIDENTS</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444', marginTop: '6px' }}>
                        {unassignedIncidents.length}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', background: '#0f172a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>ACTIVE DEPLOYMENTS</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#3b82f6', marginTop: '6px' }}>
                        {assignedIncidents.length}
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', background: '#0f172a', borderLeft: pendingRequestsCount > 0 ? '4px solid #a855f7' : 'none' }}>
                    <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Share2 size={14} />
                        <span>CROSS-DEPT REQUESTS INBOX</span>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#a855f7', marginTop: '6px' }}>
                        {pendingRequestsCount} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>Pending</span>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', background: '#0f172a' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>DEPARTMENT SQUAD UNITS</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
                        {departmentUnits.length}
                    </div>
                </div>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #1e293b', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveSection("incidents")}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === "incidents" ? '#3b82f6' : '#1e293b',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Flame size={16} />
                    <span>Primary Dept Incidents ({unassignedIncidents.length})</span>
                </button>

                <button
                    onClick={() => setActiveSection("requests")}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeSection === "requests" ? '#a855f7' : '#1e293b',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Share2 size={16} />
                    <span>Cross-Dept Support Requests Inbox ({incomingRequests.length})</span>
                    {pendingRequestsCount > 0 && (
                        <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>
                            {pendingRequestsCount} NEW
                        </span>
                    )}
                </button>
            </div>

            {/* SECTION 1: Primary Department Incidents & Team Roster */}
            {activeSection === "incidents" && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
                    {/* Unassigned Incidents & Reclassify Queue */}
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Unassigned Incidents Queue ({unassignedIncidents.length})</span>
                            <span style={{ fontSize: '0.72rem', color: '#a5b4fc' }}>Category Scoped ONLY</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {unassignedIncidents.length > 0 ? (
                                unassignedIncidents.map(inc => (
                                    <div key={inc.id} style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span className={`severity-badge severity-${inc.severity}`}>
                                                Level {inc.severity} Priority
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>{inc.id}</span>
                                        </div>

                                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{inc.title}</h3>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={13} />
                                            <span>{inc.locationName}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => setReclassifyIncidentId(inc.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #f59e0b',
                                                    color: '#f59e0b',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <ArrowRightLeft size={13} />
                                                <span>Reclassify / Reject Misroute</span>
                                            </button>

                                            <button
                                                onClick={() => handleEscalate(inc.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #ef4444',
                                                    color: '#ef4444',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <AlertTriangle size={13} />
                                                <span>Escalate to Critical</span>
                                            </button>
                                        </div>

                                        {/* Reclassify Modal Inline */}
                                        {reclassifyIncidentId === inc.id && (
                                            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', marginTop: '8px', border: '1px solid #f59e0b' }}>
                                                <div style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
                                                    Select Correct Department to Reroute Incident:
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <select
                                                        value={targetCategory}
                                                        onChange={e => setTargetCategory(e.target.value)}
                                                        style={{ flex: 1, padding: '6px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                                                    >
                                                        <option value="CAT_FLOOD">🌊 Flood Department</option>
                                                        <option value="CAT_FIRE">🔥 Fire Department</option>
                                                        <option value="CAT_MED">🚑 Medical / Hospital</option>
                                                        <option value="CAT_SECURITY">🛡️ Police & Safety</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleReclassifySubmit(inc.id)}
                                                        style={{ padding: '6px 12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                                                    >
                                                        Reroute
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                    No unassigned incidents currently in {currentDept.name} queue.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department Team Roster */}
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} color="#10b981" />
                            <span>Department Team Roster & Readiness</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {departmentUnits.length > 0 ? (
                                departmentUnits.map(unit => (
                                    <div key={unit.id} style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>{unit.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Leader: {unit.leaderName || "Commander"}</div>
                                        </div>
                                        <span style={{
                                            background: unit.status === "Available" ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                                            color: unit.status === "Available" ? '#6ee7b7' : '#93c5fd',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700
                                        }}>
                                            {unit.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                    No units registered for this department.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 2: Cross-Department Support Requests Inbox */}
            {activeSection === "requests" && (
                <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Share2 size={20} color="#a855f7" />
                            <span>Incoming Assistance Requests ({incomingRequests.length})</span>
                        </div>
                        <button
                            onClick={fetchIncomingRequests}
                            style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <RefreshCw size={14} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {incomingRequests.length > 0 ? (
                            incomingRequests.map(req => (
                                <div
                                    key={req.id}
                                    style={{
                                        background: '#0b1120',
                                        border: req.status === "PENDING" ? '1px solid #a855f7' : '1px solid #1e293b',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.78rem', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                                REQ #{req.id}
                                            </span>
                                            <span style={{ fontSize: '0.78rem', background: '#1e293b', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                                Incident #{req.incidentId}
                                            </span>
                                            {req.escalatedToSuperAdmin && (
                                                <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                                                    ⚠️ ESCALATED TO SUPER ADMIN
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                fontWeight: 800,
                                                background: req.urgency === "CRITICAL" ? 'rgba(239,68,68,0.2)' : req.urgency === "HIGH" ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                                                color: req.urgency === "CRITICAL" ? '#ef4444' : req.urgency === "HIGH" ? '#f59e0b' : '#3b82f6'
                                            }}>
                                                Urgency: {req.urgency}
                                            </span>

                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                fontWeight: 800,
                                                background: req.status === "ACCEPTED" ? 'rgba(16,185,129,0.2)' : req.status === "DECLINED" ? 'rgba(239,68,68,0.2)' : req.status === "RESOLVED" ? 'rgba(100,116,139,0.2)' : 'rgba(168,85,247,0.2)',
                                                color: req.status === "ACCEPTED" ? '#10b981' : req.status === "DECLINED" ? '#ef4444' : req.status === "RESOLVED" ? '#94a3b8' : '#a855f7'
                                            }}>
                                                Status: {req.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>
                                            Requesting Department: <span style={{ color: '#fff' }}>{req.requestedByDepartment}</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginTop: '4px' }}>
                                            Required Support: <span style={{ color: '#38bdf8' }}>{req.requiredCapability}</span>
                                        </div>
                                        {req.notes && (
                                            <div style={{ fontSize: '0.82rem', color: '#94a3b8', background: '#070b14', padding: '8px 12px', borderRadius: '6px', marginTop: '6px' }}>
                                                "{req.notes}"
                                            </div>
                                        )}
                                        {req.assignedUnitName && (
                                            <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, marginTop: '6px' }}>
                                                Assigned Squad Unit: {req.assignedUnitName} ({req.assignedUnitId || "Unit"})
                                            </div>
                                        )}
                                        {req.declineReason && (
                                            <div style={{ fontSize: '0.82rem', color: '#ef4444', marginTop: '6px' }}>
                                                Decline Reason: {req.declineReason}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons based on status */}
                                    {req.status === "PENDING" && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => {
                                                    setAcceptingReqId(req.id);
                                                    setDecliningReqId(null);
                                                }}
                                                style={{
                                                    padding: '8px 14px',
                                                    background: '#10b981',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontWeight: 800,
                                                    fontSize: '0.82rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <Check size={14} />
                                                <span>Accept & Unlock Incident Access</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setDecliningReqId(req.id);
                                                    setAcceptingReqId(null);
                                                }}
                                                style={{
                                                    padding: '8px 14px',
                                                    background: 'transparent',
                                                    border: '1px solid #ef4444',
                                                    color: '#ef4444',
                                                    borderRadius: '6px',
                                                    fontWeight: 700,
                                                    fontSize: '0.82rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <X size={14} />
                                                <span>Decline Request</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Inline Accept Unit Assignment Form */}
                                    {acceptingReqId === req.id && (
                                        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', marginTop: '8px', border: '1px solid #10b981' }}>
                                            <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700, marginBottom: '8px' }}>
                                                Assign Squad Unit to Emergency Request:
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <select
                                                    value={selectedUnitId}
                                                    onChange={e => setSelectedUnitId(e.target.value)}
                                                    style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem' }}
                                                >
                                                    <option value="">-- Select Available Unit (Optional) --</option>
                                                    {departmentUnits.map(unit => (
                                                        <option key={unit.id} value={unit.id}>
                                                            {unit.name} ({unit.status})
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleAcceptRequest(req.id)}
                                                    style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    Confirm Accept
                                                </button>
                                                <button
                                                    onClick={() => setAcceptingReqId(null)}
                                                    style={{ padding: '8px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Inline Decline Form */}
                                    {decliningReqId === req.id && (
                                        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '8px', marginTop: '8px', border: '1px solid #ef4444' }}>
                                            <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700, marginBottom: '8px' }}>
                                                Specify Reason for Declining Assistance Request:
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <input
                                                    type="text"
                                                    value={declineReason}
                                                    onChange={e => setDeclineReason(e.target.value)}
                                                    placeholder="e.g. All units currently deployed on Level 5 emergency"
                                                    style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '0.82rem' }}
                                                />
                                                <button
                                                    onClick={() => handleDeclineRequest(req.id)}
                                                    style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                                                >
                                                    Confirm Decline
                                                </button>
                                                <button
                                                    onClick={() => setDecliningReqId(null)}
                                                    style={{ padding: '8px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Accepted status resolve action */}
                                    {req.status === "ACCEPTED" && (
                                        <div style={{ marginTop: '8px' }}>
                                            <button
                                                onClick={() => handleResolveRequest(req.id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#334155',
                                                    color: '#cbd5e1',
                                                    border: '1px solid #475569',
                                                    borderRadius: '6px',
                                                    fontWeight: 700,
                                                    fontSize: '0.78rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Mark Cross-Dept Support Complete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                {loadingRequests ? "Loading assistance requests..." : "No incoming service requests currently targeting your department."}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DepartmentAdminDashboard;

