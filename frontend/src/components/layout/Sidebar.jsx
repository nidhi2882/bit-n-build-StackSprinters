import React from "react";
import { NavLink } from "react-router-dom";
import { 
    LayoutDashboard, 
    AlertTriangle, 
    Truck, 
    Hospital, 
    FileSpreadsheet, 
    BarChart3,
    Radio,
    ShieldCheck
} from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
    const { incidents, resources } = useEmergency();
    const { user } = useAuth();

    const activeIncidentsCount = incidents.filter(i => i.status !== "Resolved").length;
    const criticalIncidentsCount = incidents.filter(i => i.severity >= 4 && i.status !== "Resolved").length;

    const userRole = user?.role || "Emergency Operator";

    return (
        <aside className="sidebar">
            <div style={{ padding: '0 8px 12px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Role Scope: <span style={{ color: '#60a5fa' }}>{userRole}</span>
            </div>

            {/* Dynamic Role-Scoped Sidebar Navigation */}
            <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <LayoutDashboard size={18} />
                <span>
                    {userRole === "Response Team" && "Field Unit Dashboard"}
                    {userRole === "Hospital Admin" && "Facility Dashboard"}
                    {userRole === "Authority Admin" && "Executive Governance"}
                    {userRole === "Citizen" && "Citizen Portal & SOS"}
                    {userRole === "Emergency Operator" && "Command Center"}
                </span>
            </NavLink>

            {/* Incidents Link (All roles) */}
            <NavLink to="/incidents" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <AlertTriangle size={18} />
                <span>
                    {userRole === "Citizen" ? "Live Incidents Stream" : "Incidents Stream"}
                </span>
                <span className={`sidebar-badge ${criticalIncidentsCount > 0 ? "critical" : ""}`}>
                    {activeIncidentsCount}
                </span>
            </NavLink>

            {/* Resources Link (Excluded for Citizen) */}
            {userRole !== "Citizen" && (
                <NavLink to="/resources" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                    <Truck size={18} />
                    <span>{userRole === "Response Team" ? "Fleet & Squad Units" : "Resource Fleet"}</span>
                    <span className="sidebar-badge">
                        {resources.length}
                    </span>
                </NavLink>
            )}

            {/* Hospitals Link (All roles) */}
            <NavLink to="/hospitals" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <Hospital size={18} />
                <span>{userRole === "Hospital Admin" ? "Connected Facilities" : "Hospital Network"}</span>
            </NavLink>

            {/* GIS Command Center for Authority Admin */}
            {userRole === "Authority Admin" && (
                <NavLink to="/operator-dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                    <Radio size={18} />
                    <span>GIS Command Center</span>
                </NavLink>
            )}

            {/* Citizen Reporting (Only for Citizen & Emergency Operator) */}
            {(userRole === "Citizen" || userRole === "Emergency Operator") && (
                <NavLink to="/report" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                    <FileSpreadsheet size={18} />
                    <span>Report Emergency</span>
                </NavLink>
            )}

            {/* Analytics & Insights (Authority Admin & Emergency Operator) */}
            {(userRole === "Authority Admin" || userRole === "Emergency Operator") && (
                <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                    <BarChart3 size={18} />
                    <span>Analytics & Insights</span>
                </NavLink>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <Radio size={16} className="pulse-dot" style={{ color: '#10b981' }} />
                    <div style={{ fontSize: '0.78rem' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>System Online</div>
                        <div style={{ color: '#64748b' }}>Backend API & AI Ready</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
