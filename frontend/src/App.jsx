import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { EmergencyProvider } from "./context/EmergencyContext";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CommandCenter from "./pages/CommandCenter";
import IncidentsPage from "./pages/IncidentsPage";
import ResourcesPage from "./pages/ResourcesPage";
import HospitalsPage from "./pages/HospitalsPage";
import CitizenReportPage from "./pages/CitizenReportPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AdminConsolePage from "./pages/AdminConsolePage";

import OperatorDashboard from "./pages/dashboards/OperatorDashboard";
import ResponseTeamDashboard from "./pages/dashboards/ResponseTeamDashboard";
import HospitalDashboard from "./pages/dashboards/HospitalDashboard";
import AuthorityDashboard from "./pages/dashboards/AuthorityDashboard";
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import DepartmentAdminDashboard from "./pages/dashboards/DepartmentAdminDashboard";

function MainDashboard() {
    const { user } = useAuth();
    const role = user?.role || "Emergency Operator";

    switch (role) {
        case "Super Admin":
            return <SuperAdminDashboard />;
        case "Department Admin":
            return <DepartmentAdminDashboard />;
        case "Response Team":
            return <ResponseTeamDashboard />;
        case "Hospital Admin":
            return <HospitalDashboard />;
        case "Authority Admin":
            return <AuthorityDashboard />;
        case "Citizen":
            return <CitizenReportPage />;
        case "Emergency Operator":
        default:
            return <OperatorDashboard />;
    }
}

function AppLayout() {
    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-main-body">
                <Sidebar />
                <main className="app-content">
                    <Routes>
                        {/* Primary Dynamic Role Dashboard */}
                        <Route path="/" element={<MainDashboard />} />
                        
                        {/* Dedicated Role Dashboard Views */}
                        <Route path="/operator-dashboard" element={
                            <ProtectedRoute allowedRoles={["Emergency Operator", "Authority Admin", "Super Admin"]}>
                                <OperatorDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/response-dashboard" element={
                            <ProtectedRoute allowedRoles={["Response Team", "Authority Admin", "Emergency Operator", "Super Admin"]}>
                                <ResponseTeamDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/hospital-dashboard" element={
                            <ProtectedRoute allowedRoles={["Hospital Admin", "Authority Admin", "Emergency Operator", "Super Admin"]}>
                                <HospitalDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/authority-dashboard" element={
                            <ProtectedRoute allowedRoles={["Authority Admin", "Emergency Operator", "Super Admin"]}>
                                <AuthorityDashboard />
                            </ProtectedRoute>
                        } />

                        {/* Network Views */}
                        <Route path="/incidents" element={<IncidentsPage />} />
                        <Route path="/resources" element={
                            <ProtectedRoute allowedRoles={["Response Team", "Emergency Operator", "Authority Admin", "Hospital Admin", "Super Admin"]}>
                                <ResourcesPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/hospitals" element={<HospitalsPage />} />
                        <Route path="/report" element={<CitizenReportPage />} />
                        <Route path="/analytics" element={
                            <ProtectedRoute allowedRoles={["Authority Admin", "Emergency Operator", "Super Admin"]}>
                                <AnalyticsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={["Authority Admin", "Emergency Operator", "Super Admin"]}>
                                <AdminConsolePage />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function AppContent() {
    return (
        <Routes>
            {/* Standalone Auth Routes (Full-screen, No Navbar/Sidebar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Application Routes with Main Shell Layout */}
            <Route path="/*" element={
                <ProtectedRoute>
                    <AppLayout />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

function App() {
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

export default App;