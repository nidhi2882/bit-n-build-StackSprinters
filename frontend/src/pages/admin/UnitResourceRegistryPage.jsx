import React, { useState, useEffect } from "react";
import { resourceService } from "../../services/resourceService";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import TacticalHeader from "../../components/layout/TacticalHeader";

export default function UnitResourceRegistryPage() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        callSign: "",
        departmentCategory: "FLOOD",
        type: "Water Rescue",
        status: "Available",
        baseStation: "Central Dispatch Station",
        contact: "+91 98234 00000",
        teamLeader: "Officer In-Charge",
        personnelCount: 6,
        capabilities: ["RAPID_DEPLOYMENT"]
    });
    const [capabilityInput, setCapabilityInput] = useState("");

    const loadUnits = async () => {
        setLoading(true);
        try {
            const data = await resourceService.getResources();
            setUnits(data || []);
        } catch (err) {
            console.error("Failed to load units", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnits();
    }, []);

    const handleCreateUnit = async (e) => {
        e.preventDefault();
        try {
            const unitId = formData.id || `RES-${Math.floor(100 + Math.random() * 900)}`;
            await resourceService.createUnit({
                ...formData,
                id: unitId,
                callSign: formData.callSign || unitId
            });
            setShowAddModal(false);
            setFormData({
                id: "",
                name: "",
                callSign: "",
                departmentCategory: "FLOOD",
                type: "Water Rescue",
                status: "Available",
                baseStation: "Central Dispatch Station",
                contact: "+91 98234 00000",
                teamLeader: "Officer In-Charge",
                personnelCount: 6,
                capabilities: ["RAPID_DEPLOYMENT"]
            });
            loadUnits();
        } catch (err) {
            console.error("Failed to create unit", err);
            alert(err.response?.data?.message || "Failed to create unit");
        }
    };

    const handleStatusChange = async (unitId, newStatus) => {
        try {
            await resourceService.updateStatus(unitId, newStatus);
            loadUnits();
        } catch (err) {
            console.error("Failed to update unit status", err);
            alert(err.response?.data?.message || "Failed to update unit status");
        }
    };

    const handleDeleteUnit = async (unitId) => {
        if (!window.confirm(`Decommission unit ${unitId}?`)) return;
        try {
            await resourceService.deleteUnit(unitId);
            loadUnits();
        } catch (err) {
            console.error("Failed to delete unit", err);
        }
    };

    const categories = [
        "ALL", "FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE"
    ];

    const filteredUnits = units.filter((u) => {
        const matchesCat = categoryFilter === "ALL" || (u.departmentCategory || "").toUpperCase() === categoryFilter;
        const matchesSearch =
            (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.callSign || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.baseStation || "").toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const availableCount = units.filter(u => u.status === "Available").length;
    const enRouteCount = units.filter(u => u.status === "En-Route" || u.status === "En Route").length;
    const onSceneCount = units.filter(u => u.status === "On-Scene" || u.status === "Arrived").length;

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-0 md:pl-64">
                <TacticalHeader />

                <main className="w-full pt-16 min-h-screen px-3 sm:px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                            <div>
                                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                                    Operational Emergency Unit & Resource Registry
                                </h1>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Comprehensive telemetric status across all 9 emergency response department fleets
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-space-xs px-space-md py-2 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg shadow-md hover:bg-primary/90 transition-all"
                            >
                                <span className="material-symbols-outlined text-base">add_circle</span>
                                <span>+ Register New Response Unit</span>
                            </button>
                        </div>

                        {/* Status Count Metric Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-md">
                            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold">Total Fleet</span>
                                    <div className="font-display-lg text-2xl font-bold font-code-tabular">{units.length}</div>
                                </div>
                                <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                            </div>

                            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold">Available</span>
                                    <div className="font-display-lg text-2xl font-bold font-code-tabular text-secondary">{availableCount}</div>
                                </div>
                                <span className="material-symbols-outlined text-secondary text-2xl">check_circle</span>
                            </div>

                            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold">En-Route</span>
                                    <div className="font-display-lg text-2xl font-bold font-code-tabular text-primary">{enRouteCount}</div>
                                </div>
                                <span className="material-symbols-outlined text-primary text-2xl">directions_car</span>
                            </div>

                            <div className="p-space-md rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-on-surface-variant uppercase font-semibold">On-Scene</span>
                                    <div className="font-display-lg text-2xl font-bold font-code-tabular text-error">{onSceneCount}</div>
                                </div>
                                <span className="material-symbols-outlined text-error text-2xl">fmd_good</span>
                            </div>
                        </div>

                        {/* Filters & Search */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md">
                            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                                {categories.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCategoryFilter(c)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                                            categoryFilter === c
                                                ? "bg-primary text-on-primary shadow-sm"
                                                : "bg-surface-container-lowest text-on-surface border border-surface-container-high hover:bg-surface-container"
                                        }`}
                                    >
                                        {c === "ALL" ? "All Departments" : c}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full sm:w-80">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search call sign, unit name, base..."
                                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Units Grid / Table */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
                            {filteredUnits.length === 0 ? (
                                <div className="col-span-full p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-high">
                                    No response units registered matching this department scope.
                                </div>
                            ) : (
                                filteredUnits.map((u) => (
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
                                                    <span>{u.baseStation || "Municipal Depot"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">group</span>
                                                    <span>{u.personnelCount || 6} Crew members • {u.teamLeader || "Leader"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-sm">call</span>
                                                    <span className="font-code-tabular">{u.contact || "+91 98234 56789"}</span>
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
                                            <div className="flex items-center gap-2">
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

                                            <button
                                                onClick={() => handleDeleteUnit(u.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
                                                title="Decommission Unit"
                                            >
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Add Unit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-space-lg border-b border-surface-container-high flex items-center justify-between">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                Commission Emergency Response Unit
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUnit} className="p-space-lg space-y-space-md">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Unit ID</label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        placeholder="RES-010"
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high font-code-tabular"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Tactical Call Sign</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.callSign}
                                        onChange={(e) => setFormData({ ...formData, callSign: e.target.value })}
                                        placeholder="PUMP-01"
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high font-code-tabular"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-on-surface block mb-1">Full Unit / Fleet Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="High-Capacity Submersible Pump Tender 01"
                                    className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Department Category</label>
                                    <select
                                        value={formData.departmentCategory}
                                        onChange={(e) => setFormData({ ...formData, departmentCategory: e.target.value, type: e.target.value })}
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    >
                                        {categories.filter(c => c !== "ALL").map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Base Station</label>
                                    <input
                                        type="text"
                                        value={formData.baseStation}
                                        onChange={(e) => setFormData({ ...formData, baseStation: e.target.value })}
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Team Leader</label>
                                    <input
                                        type="text"
                                        value={formData.teamLeader}
                                        onChange={(e) => setFormData({ ...formData, teamLeader: e.target.value })}
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Personnel Count</label>
                                    <input
                                        type="number"
                                        value={formData.personnelCount}
                                        onChange={(e) => setFormData({ ...formData, personnelCount: parseInt(e.target.value) || 4 })}
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-surface-container rounded-lg text-sm font-semibold text-on-surface"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-md hover:bg-primary/90"
                                >
                                    Commission Unit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
