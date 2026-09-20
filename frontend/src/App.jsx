import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { EmergencyProvider } from "./context/EmergencyContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboards
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import DepartmentAdminDashboard from "./pages/dashboards/DepartmentAdminDashboard";

// Super Admin Pages
import UserManagementPage from "./pages/admin/UserManagementPage";
import UnitResourceRegistryPage from "./pages/admin/UnitResourceRegistryPage";
import GlobalServiceRequestsPage from "./pages/admin/GlobalServiceRequestsPage";
import SuperAdminAnalyticsPage from "./pages/admin/SuperAdminAnalyticsPage";
import AuditLogPage from "./pages/admin/AuditLogPage";

// Department Admin Pages
import CrossDeptRequestsPage from "./pages/department/CrossDeptRequestsPage";
import UnitRosterPage from "./pages/department/UnitRosterPage";
import DepartmentAnalyticsPage from "./pages/department/DepartmentAnalyticsPage";

// Citizen Pages
import CitizenHomePage from "./pages/citizen/CitizenHomePage";
import CitizenReportPage from "./pages/citizen/CitizenReportPage";
import SosConfirmationPage from "./pages/citizen/SosConfirmationPage";
import CitizenReportStatusPage from "./pages/citizen/CitizenReportStatusPage";

// Other Existing Pages (preserved)
import IncidentsPage from "./pages/IncidentsPage";
import ResourcesPage from "./pages/ResourcesPage";
import HospitalsPage from "./pages/HospitalsPage";

function DynamicRootDashboard() {
    const { user } = useAuth();
    const role = (user?.role || "").toUpperCase().replace(" ", "_");

    if (role === "SUPER_ADMIN" || role === "ROLE_SUPER_ADMIN" || role === "AUTHORITY_ADMIN") {
        return <SuperAdminDashboard />;
    }
    if (role === "DEPARTMENT_ADMIN" || role === "ROLE_DEPARTMENT_ADMIN" || role === "EMERGENCY_OPERATOR") {
        return <DepartmentAdminDashboard />;
    }
    if (role === "CITIZEN" || role === "ROLE_CITIZEN") {
        return <CitizenHomePage />;
    }

    // Default fallback to Super Admin or Department Admin
    return <DepartmentAdminDashboard />;
}

function AppContent() {
    return (
        <Routes>
            {/* Standalone Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main Application Root */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DynamicRootDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Super Admin Tactical Console */}
            <Route
                path="/super-admin"
                element={
                    <ProtectedRoute>
                        <SuperAdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute>
                        <UserManagementPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/resources"
                element={
                    <ProtectedRoute>
                        <UnitResourceRegistryPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/service-requests"
                element={
                    <ProtectedRoute>
                        <GlobalServiceRequestsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/audit-log"
                element={
                    <ProtectedRoute>
                        <AuditLogPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <SuperAdminAnalyticsPage />
                    </ProtectedRoute>
                }
            />

            {/* Department Admin Sub-Pages */}
            <Route
                path="/department/cross-dept-requests"
                element={
                    <ProtectedRoute>
                        <CrossDeptRequestsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/department/unit-roster"
                element={
                    <ProtectedRoute>
                        <UnitRosterPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/department/analytics"
                element={
                    <ProtectedRoute>
                        <DepartmentAnalyticsPage />
                    </ProtectedRoute>
                }
            />

            {/* Citizen Portal Routes */}
            <Route
                path="/citizen/home"
                element={
                    <ProtectedRoute>
                        <CitizenHomePage />
                    </ProtectedRoute>
                }
            />
            <Route path="/citizen/report" element={<CitizenReportPage />} />
            <Route path="/citizen/sos-confirmation" element={<SosConfirmationPage />} />
            <Route path="/citizen/status/:id" element={<CitizenReportStatusPage />} />

            {/* Direct & Backward Compatibility Routes */}
            <Route path="/report" element={<CitizenReportPage />} />
            <Route
                path="/incidents"
                element={
                    <ProtectedRoute>
                        <DynamicRootDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/resources"
                element={
                    <ProtectedRoute>
                        <UnitResourceRegistryPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/hospitals"
                element={
                    <ProtectedRoute>
                        <HospitalsPage />
                    </ProtectedRoute>
                }
            />

            {/* Wildcard */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <EmergencyProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </EmergencyProvider>
        </AuthProvider>
    );
}