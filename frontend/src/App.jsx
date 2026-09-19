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

import OperatorDashboard from "./pages/dashboards/OperatorDashboard";
import ResponseTeamDashboard from "./pages/dashboards/ResponseTeamDashboard";
import HospitalDashboard from "./pages/dashboards/HospitalDashboard";
import AuthorityDashboard from "./pages/dashboards/AuthorityDashboard";

function MainDashboard() {
    const { user } = useAuth();
    const role = user?.role || "Emergency Operator";

    switch (role) {
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
                        <Route path="/operator-dashboard" element={<OperatorDashboard />} />
                        <Route path="/response-dashboard" element={<ResponseTeamDashboard />} />
                        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
                        <Route path="/authority-dashboard" element={<AuthorityDashboard />} />

                        {/* Global Network Views */}
                        <Route path="/incidents" element={<IncidentsPage />} />
                        <Route path="/resources" element={<ResourcesPage />} />
                        <Route path="/hospitals" element={<HospitalsPage />} />
                        <Route path="/report" element={<CitizenReportPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />

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
            <Route path="/*" element={<AppLayout />} />
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