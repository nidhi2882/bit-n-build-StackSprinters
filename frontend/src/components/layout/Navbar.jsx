import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Bot, PlusCircle, User, Bell, Activity, LogOut } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
    const { 
        incidents, 
        resources, 
        alerts, 
        isCopilotOpen, 
        setIsCopilotOpen,
        setIsNewIncidentModalOpen 
    } = useEmergency();

    const { user, logout, switchRoleDemo } = useAuth();
    const navigate = useNavigate();

    const criticalCount = incidents.filter(i => i.severity >= 4 && i.status !== "Resolved").length;
    const availableResourcesCount = resources.filter(r => r.status === "Available").length;

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        switchRoleDemo(newRole);
        navigate("/");
    };

    return (
        <header className="navbar">
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
                {alerts.length > 0 && (
                    <div className="nav-stat-pill" style={{ borderColor: 'rgba(234, 179, 8, 0.4)', color: '#fef08a' }}>
                        <Bell size={14} style={{ color: '#eab308' }} />
                        <span>{alerts.length} Active Alerts</span>
                    </div>
                )}
            </div>

            {/* Right Controls */}
            <div className="navbar-right">
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
