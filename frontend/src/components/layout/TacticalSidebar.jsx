import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function TacticalSidebar() {
    const { user } = useAuth();
    const location = useLocation();

    const isSuperAdmin = user?.role === "Super Admin" || user?.role === "SUPER_ADMIN";
    const isDepartmentAdmin = user?.role === "Department Admin" || user?.role === "DEPARTMENT_ADMIN";
    const deptCategory = user?.departmentCategory || "FLOOD";

    const superAdminNav = [
        { name: "Dashboard", path: "/", icon: "dashboard" },
        { name: "Incidents", path: "/incidents", icon: "emergency", badge: "Live" },
        { name: "Users & Roles", path: "/admin/users", icon: "group" },
        { name: "Units / Resources", path: "/admin/resources", icon: "local_shipping" },
        { name: "Service Requests", path: "/admin/service-requests", icon: "headset_mic" },
        { name: "Analytics", path: "/analytics", icon: "monitoring" },
        { name: "Audit Log", path: "/admin/audit-log", icon: "cloud_upload" },
    ];

    const departmentAdminNav = [
        { name: "Dashboard", path: "/", icon: "grid_view" },
        { name: "My Incidents", path: "/incidents", icon: "warning", badge: "Sector" },
        { name: "Cross-Dept Requests", path: "/department/cross-dept-requests", icon: "swap_horiz" },
        { name: "Unit Roster", path: "/department/unit-roster", icon: "local_shipping" },
        { name: "My Analytics", path: "/department/analytics", icon: "bar_chart" },
    ];

    const navItems = isSuperAdmin ? superAdminNav : departmentAdminNav;

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-high">
            <div className="flex flex-col flex-1 min-h-0">
                {/* Brand Header */}
                <div className="h-16 px-space-md flex items-center gap-space-sm bg-surface-container-lowest border-b border-surface-container-high/60">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-xl">emergency_share</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none font-bold">
                            ResQGrid
                        </span>
                        <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-widest mt-0.5">
                            {isSuperAdmin ? "HQ OPS COMMAND" : `${deptCategory} OPS COMMAND`}
                        </span>
                    </div>
                </div>

                {/* Sub-header banner */}
                <div className="px-space-md py-space-xs">
                    <div className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-low rounded-lg">
                        <span className="material-symbols-outlined text-sm text-secondary">shield</span>
                        <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold truncate">
                            {isSuperAdmin ? "Tactical Multi-Precinct Grid" : `${deptCategory} Sector Active`}
                        </span>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-space-sm py-space-xs space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between px-space-sm py-space-sm rounded-lg transition-colors font-label-md text-label-md ${
                                    isActive
                                        ? "bg-primary-container text-on-primary-container font-semibold shadow-sm"
                                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                                }`}
                            >
                                <div className="flex items-center gap-space-sm">
                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                    <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                    <span className="px-space-xs py-space-2xs bg-error-container text-on-error-container font-code-tabular text-label-xs rounded-full font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Status & Emergency Helpline */}
            <div className="p-space-sm space-y-1 bg-surface-container-low border-t border-surface-container-high/60">
                <div className="px-space-sm py-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-space-xs">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                        </span>
                        <span className="font-label-xs text-label-xs text-on-surface-variant font-medium">Grid Online</span>
                    </div>
                    <span className="font-code-tabular text-label-xs text-secondary font-bold">99.98%</span>
                </div>

                <div className="pt-1">
                    <a
                        href="tel:112"
                        className="flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg text-error hover:bg-error-container/20 transition-colors font-label-xs text-label-xs font-semibold"
                    >
                        <span className="material-symbols-outlined text-base">phone_in_talk</span>
                        <span>Emergency Helpline: 112 / 108</span>
                    </a>
                </div>
            </div>
        </aside>
    );
}
