import React, { useState, useEffect } from "react";
import { resourceService } from "../../services/resourceService";
import { useAuth } from "../../context/AuthContext";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import TacticalHeader from "../../components/layout/TacticalHeader";

export default function UnitRosterPage() {
    const { user } = useAuth();
    const currentDept = user?.departmentCategory || "FLOOD";

    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadUnits = async () => {
        setLoading(true);
        try {
            const data = await resourceService.getResources(currentDept);
            setUnits(data || []);
        } catch (err) {
            console.error("Failed to load department unit roster", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnits();
    }, [currentDept]);

    const handleStatusChange = async (unitId, newStatus) => {
        try {
            await resourceService.updateStatus(unitId, newStatus);
            loadUnits();
        } catch (err) {
            console.error("Status change failed", err);
            alert(err.response?.data?.message || "Failed to update unit status");
        }
    };

    const filtered = units.filter((u) => {
        const s = search.toLowerCase();
        return (
            (u.name || "").toLowerCase().includes(s) ||
            (u.callSign || "").toLowerCase().includes(s) ||
            (u.teamLeader || "").toLowerCase().includes(s)
        );
    });

    const availableCount = units.filter(u => u.status === "Available").length;
    const deployedCount = units.filter(u => u.status !== "Available").length;

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-64">
                <TacticalHeader />

                <main className="w-full pt-16 min-h-screen px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                            <div>
                                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                                    {currentDept} Tactical Unit Roster & Crew Status
                                </h1>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Real-time personnel telemetry and deployment readiness for {currentDept} Precinct
                                </p>
                            </div>

                            <button
                                onClick={loadUnits}
                                className="inline-flex items-center gap-space-xs px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">refresh</span>
                                <span>Sync Roster</span>
                            </button>
                        </div>

                        {/* Top KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold">Total Sector Units</span>
                                    <div className="font-display-lg text-2xl font-bold font-code-tabular">{units.length}</div>
                                </div>
                                <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold">Available for Dispatch</span>
                                    <div className="font-display-lg text-2xl font-bold font-code-tabular text-secondary">{availableCount}</div>
                                </div>
                                <span className="material-symbols-outlined text-secondary text-2xl">check_circle</span>
                            </div>

                            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold">Actively Deployed</span>
                                    <div className="font-display-lg text-2xl font-bold font-code-tabular text-error">{deployedCount}</div>
                                </div>
                                <span className="material-symbols-outlined text-error text-2xl">fmd_good</span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full max-w-sm">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                                search
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Search ${currentDept} units, call signs, leaders...`}
                                className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Roster Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                            {filtered.length === 0 ? (
                                <div className="col-span-full p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-high">
                                    No response units found in {currentDept} sector.
                                </div>
                            ) : (
                                filtered.map((u) => (
                                    <div
                                        key={u.id}
                                        className="bg-surface-container-lowest rounded-xl p-space-md border border-surface-container-high shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <span className="font-code-tabular font-bold text-primary text-base">
                                                        {u.callSign || u.id}
                                                    </span>
                                                    <h3 className="font-headline-sm text-body-md font-bold text-on-surface">
                                                        {u.name}
                                                    </h3>
                                                </div>
                                                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-xs font-semibold font-code-tabular">
                                                    {u.departmentCategory || u.type}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-on-surface-variant mb-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">home_pin</span>
                                                    <span>{u.baseStation || "Sector Depot"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">group</span>
                                                    <span>{u.personnelCount || 6} Crew members • {u.teamLeader || "Leader"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">call</span>
                                                    <span className="font-code-tabular">{u.contact || "+91 98234 00000"}</span>
                                                </div>
                                            </div>

                                            {u.capabilities && u.capabilities.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {u.capabilities.map((cap) => (
                                                        <span
                                                            key={cap}
                                                            className="px-1.5 py-0.5 rounded bg-surface-container-low text-[10px] font-code-tabular text-on-surface-variant font-medium"
                                                        >
                                                            {cap}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
                                            <label className="text-xs text-on-surface-variant font-semibold">Status:</label>
                                            <select
                                                value={u.status || "Available"}
                                                onChange={(e) => handleStatusChange(u.id, e.target.value)}
                                                className="h-8 px-2 bg-surface-container-low text-on-surface font-semibold text-xs rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value="Available">Available</option>
                                                <option value="En-Route">En-Route</option>
                                                <option value="On-Scene">On-Scene</option>
                                                <option value="Returning">Returning</option>
                                            </select>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
