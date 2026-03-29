import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import LabManagementPage from "../pages/LabManagementPage";
import TestManagementPage from "../pages/TestManagementPage";
import TestAvailabilityPage from "../pages/TestAvailabilityPage";
import TestInstructionsPage from "../pages/TestInstructionsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StaffLoginPage from "../pages/StaffLoginPage";
import StaffRegisterPage from "../pages/StaffRegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "../pages/HomePage";
import HealthCentersPage from "../pages/HealthCentersPage";
import LabDetailsPage from "../pages/LabDetailsPage";

const AppRoutes = () => {
	const { user } = useAuth();

	return (
		<Routes>
			{/* Public Patient Routes */}
			<Route path="/" element={<HomePage />} />
			<Route path="/health-centers" element={<HealthCentersPage />} />
			<Route path="/labs/:labId" element={<LabDetailsPage />} />
			<Route
				path="/login"
				element={!user ? <LoginPage /> : <Navigate to={user.userType === "patient" ? "/dashboard" : "/staff/dashboard"} />}
			/>
			<Route
				path="/register"
				element={!user ? <RegisterPage /> : <Navigate to={user.userType === "patient" ? "/dashboard" : "/staff/dashboard"} />}
			/>

			{/* Staff Auth Routes */}
			<Route
				path="/staff/login"
				element={!user ? <StaffLoginPage /> : <Navigate to="/staff/dashboard" />}
			/>
			<Route
				path="/staff/register"
				element={!user ? <StaffRegisterPage /> : <Navigate to="/staff/dashboard" />}
			/>

			{/* Protected Staff Routes */}
			<Route element={<ProtectedRoute allowedRoles={["staff", "Lab_Technician", "MOH", "PHI", "Nurse", "Admin", "Doctor", "HealthOfficer"]} />}>
				<Route path="/staff/dashboard" element={<DashboardLayout activePage="labs"><LabManagementPage /></DashboardLayout>} />
				<Route path="/staff/tests" element={<DashboardLayout activePage="tests"><TestManagementPage /></DashboardLayout>} />
				<Route path="/staff/availability" element={<DashboardLayout activePage="availability"><TestAvailabilityPage /></DashboardLayout>} />
				<Route path="/staff/instructions" element={<DashboardLayout activePage="instructions"><TestInstructionsPage /></DashboardLayout>} />
			</Route>

			{/* Protected Patient Routes */}
			<Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
				<Route path="/dashboard" element={<div className="p-8">Patient Dashboard Coming Soon</div>} />
			</Route>

			{/* Catch all */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

export default AppRoutes;
