import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Bot, PlusCircle, User, Bell, Activity, LogOut, X, ExternalLink, AlertTriangle, Share2 } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
    const { 
        incidents, 
        resources, 
        alerts, 
        dismissAlert,
        setSelectedIncident,
        isCopilotOpen, 
        setIsCopilotOpen,
        setIsNewIncidentModalOpen 
    } = useEmergency();

    const { user, logout, switchRoleDemo } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);

    const criticalCount = incidents.filter(i => i.severity >= 4 && i.status !== "Resolved").length;
    const availableResourcesCount = resources.filter(r => r.status === "Available").length;

    // Filter alerts scoped to current logged-in role & department
    const userDept = user?.departmentCategory || "";
    const userRole = user?.role || "";

    const userAlerts = alerts.filter(alt => {
        if (!userDept || userRole.includes("Super Admin") || userRole.includes("SUPER_ADMIN") || userRole.includes("Emergency Operator")) {
            return true;
        }
        if (alt.targetDepartment) {
            const targetUpper = alt.targetDepartment.toUpperCase();
            const deptUpper = userDept.toUpperCase();
            const targetClean = targetUpper.replace("CAT_", "");
            const deptClean = deptUpper.replace("CAT_", "");
            return targetUpper === deptUpper || 
                   targetClean.includes(deptClean) || 
                   deptClean.includes(targetClean) ||
                   (deptClean.startsWith("MED") && targetClean.startsWith("MED")) ||
                   (deptClean.startsWith("SEC") && (targetClean.startsWith("POL") || targetClean.startsWith("SEC")));
        }
        return true;
    });

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        switchRoleDemo(newRole);
        navigate("/");
    };

    const handleNotificationClick = (alert) => {
        if (alert.incidentId) {
            const inc = incidents.find(i => i.id === alert.incidentId);
            if (inc) {
                setSelectedIncident(inc);
            }
        }
        setShowNotifications(false);
    };

    return (
        <header className="navbar" style={{ position: 'relative' }}>
            {/* Left Brand */}
            <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon-wrapper">
                        <ShieldAlert size={22} />
                    </div>
                    <span>ResQGrid</span>
                </Link>
                <span className="brand-badge">Bit N Build 2026</span>
            </div>

            {/* Center Live Stats */}
            <div className="navbar-center">
                <div className={`nav-stat-pill ${criticalCount > 0 ? "critical" : ""}`}>
                    <Activity size={15} style={{ color: criticalCount > 0 ? '#ef4444' : '#10b981' }} />
                    <span>{criticalCount} Critical Incidents</span>
                </div>
                <div className="nav-stat-pill">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                    <span>{availableResourcesCount} Units Available</span>
                </div>
            </div>

            {/* Right Controls */}
            <div className="navbar-right">
                {/* Interactive Notification Panel Bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            background: userAlerts.length > 0 ? 'rgba(234, 179, 8, 0.15)' : '#1e293b',
                            border: userAlerts.length > 0 ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid #334155',
                            color: userAlerts.length > 0 ? '#fef08a' : '#94a3b8',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 700,
                            fontSize: '0.82rem'
                        }}
                    >
                        <Bell size={16} style={{ color: userAlerts.length > 0 ? '#eab308' : '#94a3b8' }} />
                        <span>Notifications</span>
                        {userAlerts.length > 0 && (
                            <span style={{
                                background: '#ef4444',
                                color: '#fff',
                                borderRadius: '999px',
                                padding: '2px 7px',
                                fontSize: '0.72rem',
                                fontWeight: 800
                            }}>
                                {userAlerts.length}
                            </span>
                        )}
                    </button>

                    {/* Floating Notification Panel Overlay */}
                    {showNotifications && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '48px',
                                right: '0',
                                width: '380px',
                                maxHeight: '480px',
                                background: '#0f172a',
                                border: '1px solid #3b82f6',
                                borderRadius: '12px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                                zIndex: 3000,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '12px 16px', background: '#0b1120', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bell size={16} color="#38bdf8" />
                                    <span>Emergency Notification Center</span>
                                </div>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                {userAlerts.length > 0 ? (
                                    userAlerts.map(alt => (
                                        <div
                                            key={alt.id}
                                            style={{
                                                background: '#070b14',
                                                border: alt.type === 'SERVICE_REQUEST' ? '1px solid #a855f7' : alt.type === 'CRITICAL' ? '1px solid #ef4444' : '1px solid #1e293b',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 800,
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    background: alt.type === 'SERVICE_REQUEST' ? 'rgba(168,85,247,0.2)' : alt.type === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                                                    color: alt.type === 'SERVICE_REQUEST' ? '#c084fc' : alt.type === 'CRITICAL' ? '#fca5a5' : '#93c5fd'
                                                }}>
                                                    {alt.type || "ALERT"}
                                                </span>
                                                <button
                                                    onClick={() => dismissAlert(alt.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                                                {alt.title}
                                            </div>

                                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                                {alt.message}
                                            </div>

                                            {alt.incidentId && (
                                                <button
                                                    onClick={() => handleNotificationClick(alt)}
                                                    style={{
                                                        marginTop: '4px',
                                                        alignSelf: 'flex-start',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#38bdf8',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <span>View Incident #{alt.incidentId}</span>
                                                    <ExternalLink size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.85rem' }}>
                                        No active notifications for your department scope.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Role Switcher */}
                <div className="role-select-box">
                    <User size={15} style={{ color: '#94a3b8' }} />
                    <select 
                        value={user?.role || "Emergency Operator"} 
                        onChange={handleRoleChange}
                        className="role-select"
                        title="Switch Demo Role"
                    >
                        <option value="Emergency Operator">Role: Emergency Operator</option>
                        <option value="Citizen">Role: Citizen Reporter</option>
                        <option value="Response Team">Role: Response Team Lead</option>
                        <option value="Hospital Admin">Role: Hospital Admin</option>
                        <option value="Authority Admin">Role: Authority Admin</option>
                    </select>
                </div>

                {/* AI Copilot Toggle */}
                <button 
                    className="btn-ai-copilot" 
                    onClick={() => setIsCopilotOpen(!isCopilotOpen)}
                >
                    <Bot size={17} />
                    <span>AI Copilot</span>
                </button>

                {/* Report Emergency Button */}
                <button 
                    className="btn-report-emergency"
                    onClick={() => setIsNewIncidentModalOpen(true)}
                >
                    <PlusCircle size={17} />
                    <span>+ New Incident</span>
                </button>

                {/* Logout Button */}
                {user && (
                    <button 
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Navbar;

