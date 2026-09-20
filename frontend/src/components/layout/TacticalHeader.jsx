import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationPanel from "../common/NotificationPanel";
import Reverse911BroadcastModal from "../modals/Reverse911BroadcastModal";

export default function TacticalHeader({ onOpenDispatchModal, activeIncidentCount = 3 }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [alarmActive, setAlarmActive] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isSuperAdmin = user?.role === "Super Admin" || user?.role === "SUPER_ADMIN";
    const deptCategory = user?.departmentCategory || "FLOOD";

    const getRoleTitle = () => {
        if (isSuperAdmin) return "Super Admin / Tactical Lead";
        if (user?.role === "Department Admin" || user?.role === "DEPARTMENT_ADMIN") {
            return `${deptCategory} Dept Admin`;
        }
        return user?.role || "Operations Officer";
    };

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high">
            <div className="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
                {/* Left CAD Ticker & Quick Search */}
                <div className="flex items-center gap-space-md flex-1 max-w-2xl">
                    <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-error-container">
                        <span className="h-2 w-2 rounded-full bg-error animate-pulse"></span>
                        <span className="font-label-xs text-label-xs text-on-error-container uppercase font-semibold">
                            Level 2 CAD Ticker: {activeIncidentCount} Active Operations
                        </span>
                    </div>
                    <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                            search
                        </span>
                        <input
                            className="w-full h-9 pl-9 pr-space-sm bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
                            placeholder="Search incidents, units, callers, CAD IDs..."
                            type="text"
                        />
                    </div>
                </div>

                {/* Right Quick Actions & Profile */}
                <div className="flex items-center gap-space-md">
                    {onOpenDispatchModal && (
                        <button
                            onClick={onOpenDispatchModal}
                            className="inline-flex items-center gap-space-xs px-space-md h-9 bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors"
                            type="button"
                        >
                            <span className="material-symbols-outlined text-base">add_alert</span>
                            <span>+ Dispatch Unit</span>
                        </button>
                    )}

                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 h-9 bg-red-600 hover:bg-red-500 text-white font-label-md text-xs font-bold rounded-lg shadow-sm transition-colors"
                        type="button"
                        title="Broadcast Geofenced Reverse-911 Alert"
                    >
                        <span className="material-symbols-outlined text-base">campaign</span>
                        <span>Reverse 911</span>
                    </button>

                    {/* Alarm Sound & Notifications Toggle */}
                    <div className="flex items-center gap-space-xs">
                        <button
                            onClick={() => setAlarmActive(!alarmActive)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                                alarmActive
                                    ? "text-primary bg-primary-fixed hover:bg-primary-container/20"
                                    : "text-on-surface-variant hover:bg-surface-container"
                            }`}
                            title={alarmActive ? "Alarm Audio Active" : "Alarm Audio Muted"}
                            type="button"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {alarmActive ? "volume_up" : "volume_off"}
                            </span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                                title="Active Emergency Alerts"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-xl">notifications</span>
                                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                                </span>
                            </button>

                            {/* Dropdown Notification Panel */}
                            {notificationsOpen && (
                                <div className="absolute right-0 top-12 z-50">
                                    <NotificationPanel onClose={() => setNotificationsOpen(false)} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-6 w-px bg-surface-container-high"></div>

                    {/* User Profile Info with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-space-sm p-1 rounded-lg hover:bg-surface-container transition-colors text-left"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm ring-2 ring-primary-container/20">
                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                                    {user?.name || "Operator"}
                                </span>
                                <span className="font-label-xs text-label-xs text-on-surface-variant">
                                    {getRoleTitle()}
                                </span>
                            </div>
                            <span className="material-symbols-outlined text-base text-on-surface-variant">
                                arrow_drop_down
                            </span>
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-surface-container-high rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-2 border-b border-surface-container-high">
                                    <p className="font-label-sm text-on-surface font-bold">{user?.name}</p>
                                    <p className="font-label-xs text-on-surface-variant truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false);
                                        navigate("/profile");
                                    }}
                                    className="w-full px-4 py-2 text-left font-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">badge</span>
                                    <span>My Operator Profile</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false);
                                        logout();
                                        navigate("/login");
                                    }}
                                    className="w-full px-4 py-2 text-left font-body-sm text-error hover:bg-error-container/20 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    <span>Sign Out / Lock CAD</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showBroadcastModal && (
                <Reverse911BroadcastModal
                    onClose={() => setShowBroadcastModal(false)}
                    defaultCategory={deptCategory}
                />
            )}
        </header>
    );
}
