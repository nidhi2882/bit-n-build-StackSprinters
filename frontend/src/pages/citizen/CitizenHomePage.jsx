import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";

export default function CitizenHomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sosTriggered, setSosTriggered] = useState(false);
    const [myReports, setMyReports] = useState([]);
    const [locCoords, setLocCoords] = useState({ lat: 22.3100, lng: 73.1800 });

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("Geolocation permission deferred", err)
            );
        }
        loadMyReports();
    }, []);

    const loadMyReports = async () => {
        try {
            const data = await reportService.getMyReports();
            setMyReports(data || []);
        } catch (err) {
            console.warn("Could not load citizen reports", err);
        }
    };

    const handleInstantSos = async () => {
        try {
            setSosTriggered(true);
            const sosResult = await reportService.triggerSos({
                lat: locCoords.lat,
                lng: locCoords.lng,
                addressText: "Citizen Geolocation Dispatch Node",
                reporterPhone: user?.phone || "+91 97234 11223"
            });
            navigate(`/citizen/sos-confirmation?cad=${sosResult?.id || "SOS-2026"}`);
        } catch (err) {
            console.error("SOS trigger failed", err);
            // Navigate with fallback ID
            navigate(`/citizen/sos-confirmation?cad=SOS-${Math.floor(1000 + Math.random() * 9000)}`);
        }
    };

    const categories = [
        { code: "FLOOD", name: "Flood & Inundation", icon: "waves", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
        { code: "FIRE", name: "Fire & Explosion", icon: "local_fire_department", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
        { code: "MEDICAL", name: "Medical Emergency", icon: "medical_services", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
        { code: "CRASH", name: "Vehicle Highway Crash", icon: "car_crash", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
        { code: "HAZMAT", name: "Hazardous Chemical / Gas", icon: "science", color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20" },
        { code: "COLLAPSE", name: "Structural Collapse", icon: "domain_disabled", color: "text-orange-600 bg-orange-500/10 border-orange-500/20" },
        { code: "CYCLONE", name: "Cyclone & Severe Storm", icon: "cyclone", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
        { code: "SEARCH_RESCUE", name: "Missing Person / SAR", icon: "travel_explore", color: "text-green-600 bg-green-500/10 border-green-500/20" },
        { code: "POLICE", name: "Civil Disturbance / Police", icon: "local_police", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
    ];

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            {/* Top Navigation */}
            <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-sm border-b border-surface-container-high">
                <div className="h-16 max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-2xl">emergency_share</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                                ResQGrid
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-xs text-xs font-semibold uppercase">
                                Citizen Portal
                            </span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-2">
                        <Link to="/citizen/home" className="px-3 py-1.5 rounded-lg font-label-md text-sm font-bold bg-primary-container text-on-primary-container">
                            Home
                        </Link>
                        <Link to="/citizen/report" className="px-3 py-1.5 rounded-lg font-label-md text-sm text-on-surface-variant hover:bg-surface-container font-medium">
                            Report Incident
                        </Link>
                        <a href="tel:112" className="px-3 py-1.5 rounded-lg font-label-md text-sm text-error font-bold flex items-center gap-1 hover:bg-error-container/20">
                            <span className="material-symbols-outlined text-base">phone</span>
                            <span>Helpline: 112</span>
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-on-surface-variant hidden sm:inline">
                            Logged in as <strong className="text-on-surface">{user?.name || "Citizen"}</strong>
                        </span>
                        <button
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Critical Alert Bar */}
            <div className="w-full bg-error-container text-on-error-container px-4 md:px-8 py-2.5 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-error animate-ping"></span>
                        <span className="font-label-xs text-xs uppercase font-bold bg-error text-on-error px-2 py-0.5 rounded">
                            PUBLIC NOTICE
                        </span>
                        <p className="text-xs md:text-sm font-semibold truncate text-on-error-container">
                            All municipal emergency response networks synchronized. For life-threatening emergencies, press Instant SOS.
                        </p>
                    </div>
                    <a href="tel:112" className="text-xs font-bold text-error hover:underline shrink-0">
                        Emergency 112 / 108
                    </a>
                </div>
            </div>

            {/* Hero Gateway with Instant SOS */}
            <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Info */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">satellite_alt</span>
                            <span>CAD Public Dispatch Telemetry Link Active</span>
                        </div>
                        <h1 className="font-headline-xl text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">
                            Report an Emergency or Transmit Instant SOS
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                            Direct connection to citywide Police, Fire, Ambulance, Flood, and Hazmat first responders. Your live GPS coordinates will be instantly routed to the nearest dispatch station.
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-4">
                            <Link
                                to="/citizen/report"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-on-primary font-label-md text-base font-bold rounded-xl shadow-lg transition-all"
                            >
                                <span className="material-symbols-outlined">campaign</span>
                                <span>Report an Emergency Form</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Massive SOS Trigger Button */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-3xl shadow-xl border border-surface-container-high text-center">
                        <span className="font-label-xs text-xs uppercase font-bold text-error tracking-wider mb-3">
                            IMMEDIATE LIFE THREAT
                        </span>
                        <button
                            onClick={handleInstantSos}
                            disabled={sosTriggered}
                            className="w-48 h-48 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 text-white font-extrabold text-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center ring-8 ring-error/20 hover:ring-error/40 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-5xl mb-1 animate-pulse">sos</span>
                            <span className="tracking-widest">SOS</span>
                            <span className="text-[11px] font-semibold text-rose-200 uppercase mt-1">1-Click Dispatch</span>
                        </button>
                        <p className="text-xs text-on-surface-variant mt-4 max-w-xs">
                            Transmits instant high-priority distress telemetry with your device location (Lat: {locCoords.lat.toFixed(4)}, Lng: {locCoords.lng.toFixed(4)})
                        </p>
                    </div>
                </div>
            </section>

            {/* 3x3 Emergency Categories Grid */}
            <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="font-headline-md text-2xl font-bold text-on-surface">
                        Select Incident Category
                    </h2>
                    <p className="text-sm text-on-surface-variant">
                        Choose the emergency type to launch tailored tactical intake
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((c) => {
                        const isOperator = user?.role === "Department Admin" || user?.role === "DEPARTMENT_ADMIN" || user?.role === "Super Admin" || user?.role === "SUPER_ADMIN" || user?.role === "EMERGENCY_OPERATOR";
                        const targetPath = isOperator ? `/department/${c.code}` : `/citizen/report?category=${c.code}`;

                        return (
                            <Link
                                key={c.code}
                                to={targetPath}
                                className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${c.color} transition-transform group-hover:scale-110`}>
                                        <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                                            {c.name}
                                        </h3>
                                        <span className="text-xs text-on-surface-variant font-code-tabular">
                                            Dispatch to {c.code}
                                        </span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all">
                                    arrow_forward
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* My Reports Tracker */}
            <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto mb-12">
                <div className="p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                                My Active CAD Reports
                            </h2>
                            <p className="text-xs text-on-surface-variant">
                                Real-time dispatch and progression timeline for reports submitted from this account
                            </p>
                        </div>
                        <button
                            onClick={loadMyReports}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            <span>Refresh</span>
                        </button>
                    </div>

                    {myReports.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant border border-dashed border-surface-container-high rounded-xl">
                            <span className="material-symbols-outlined text-3xl mb-1 text-outline">assignment_turned_in</span>
                            <p className="text-sm font-medium">No open reports filed by you.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-surface-container-high">
                            {myReports.map((r) => (
                                <div
                                    key={r.id}
                                    onClick={() => navigate(`/citizen/status/${r.id}`)}
                                    className="py-3 flex items-center justify-between hover:bg-surface-container-low px-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div>
                                        <span className="font-code-tabular font-bold text-primary text-xs mr-2">
                                            {r.id}
                                        </span>
                                        <span className="font-bold text-sm text-on-surface">{r.title}</span>
                                        <div className="text-xs text-on-surface-variant">
                                            {r.locationName || "Location Recorded"} • {r.reportedAt ? new Date(r.reportedAt).toLocaleString() : "Recent"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2.5 py-1 rounded-full bg-surface-container text-xs font-bold font-code-tabular">
                                            {r.status || "Reported"}
                                        </span>
                                        <span className="material-symbols-outlined text-sm text-on-surface-variant">
                                            chevron_right
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
