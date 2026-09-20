import React, { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import TacticalHeader from "../../components/layout/TacticalHeader";

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "password123",
        role: "DEPARTMENT_ADMIN",
        departmentCategory: "FLOOD",
        phone: "+91 ",
        organization: "Emergency Operations Hub"
    });
    const [msg, setMsg] = useState("");

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setUsers(data || []);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await userService.createUser(formData);
            setMsg("User registered successfully");
            setShowAddModal(false);
            setFormData({
                name: "",
                email: "",
                password: "password123",
                role: "DEPARTMENT_ADMIN",
                departmentCategory: "FLOOD",
                phone: "+91 ",
                organization: "Emergency Operations Hub"
            });
            loadUsers();
        } catch (err) {
            setMsg(err.response?.data?.message || "Failed to register user");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await userService.toggleUserStatus(id);
            loadUsers();
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Permanently deactivate & remove this operator?")) return;
        try {
            await userService.deleteUser(id);
            loadUsers();
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.organization || "").toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || (u.role || "").toUpperCase().includes(roleFilter);
        return matchesSearch && matchesRole;
    });

    const categories = [
        "FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE"
    ];

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-64">
                <TacticalHeader />

                <main className="w-full pt-16 min-h-screen px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* Header Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                            <div>
                                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                                    Personnel & Node Clearance Registry
                                </h1>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Manage operator accounts, department administrative scopes, and cryptographic tokens
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-space-xs px-space-md py-2 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg shadow-md hover:bg-primary/90 transition-all"
                            >
                                <span className="material-symbols-outlined text-base">person_add</span>
                                <span>+ Register New Operator</span>
                            </button>
                        </div>

                        {msg && (
                            <div className="p-3 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                <span>{msg}</span>
                            </div>
                        )}

                        {/* Filter & Search Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md">
                            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                                {["ALL", "SUPER_ADMIN", "DEPARTMENT_ADMIN", "CITIZEN"].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRoleFilter(r)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                                            roleFilter === r
                                                ? "bg-primary text-on-primary shadow-sm"
                                                : "bg-surface-container-lowest text-on-surface border border-surface-container-high hover:bg-surface-container"
                                        }`}
                                    >
                                        {r}
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
                                    placeholder="Search operators, email, org..."
                                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-surface-container-high text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-body-sm font-body-sm">
                                    <thead className="bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider border-b border-surface-container-high">
                                        <tr>
                                            <th className="p-3">Operator Name</th>
                                            <th className="p-3">Email Node</th>
                                            <th className="p-3">System Role</th>
                                            <th className="p-3">Department Scope</th>
                                            <th className="p-3">Organization</th>
                                            <th className="p-3">Contact</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-high">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                                                    No registered operators found matching current filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-surface-container-low/60 transition-colors">
                                                    <td className="p-3 font-bold text-on-surface flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                                                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                        <span>{u.name}</span>
                                                    </td>
                                                    <td className="p-3 font-code-tabular text-xs text-on-surface-variant">
                                                        {u.email}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded font-code-tabular text-xs font-bold ${
                                                                (u.role || "").includes("SUPER")
                                                                    ? "bg-error-container text-error"
                                                                    : (u.role || "").includes("DEPARTMENT")
                                                                    ? "bg-primary-container text-on-primary-container"
                                                                    : "bg-surface-container text-on-surface-variant"
                                                            }`}
                                                        >
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        {u.departmentCategory ? (
                                                            <span className="px-2 py-0.5 rounded bg-secondary-container text-secondary font-code-tabular text-xs font-semibold">
                                                                {u.departmentCategory}
                                                            </span>
                                                        ) : (
                                                            <span className="text-on-surface-variant text-xs">Global / Central</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-xs text-on-surface-variant truncate max-w-xs">
                                                        {u.organization || "Civil Protection"}
                                                    </td>
                                                    <td className="p-3 font-code-tabular text-xs text-on-surface-variant">
                                                        {u.phone || "--"}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
                                                                title="Deactivate Operator"
                                                            >
                                                                <span className="material-symbols-outlined text-base">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-space-lg border-b border-surface-container-high flex items-center justify-between">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                Register Emergency CAD Operator
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-space-lg space-y-space-md">
                            <div>
                                <label className="text-xs font-semibold text-on-surface block mb-1">Full Officer Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Captain Rajesh Rao"
                                    className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">CAD Email Node</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="officer@resqgrid.gov"
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Initial Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">System Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    >
                                        <option value="DEPARTMENT_ADMIN">Department Admin</option>
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                        <option value="CITIZEN">Citizen</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-on-surface block mb-1">Department Category</label>
                                    <select
                                        value={formData.departmentCategory}
                                        onChange={(e) => setFormData({ ...formData, departmentCategory: e.target.value })}
                                        className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-on-surface block mb-1">Assigned Organization / Station</label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                />
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
                                    Enroll Operator
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
