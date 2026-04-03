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
import AccountPage from "../pages/patient/AccountPage";
import HealthProfilePage from "../pages/patient/HealthProfilePage";
import HouseholdRegistrationPage from "../pages/patient/HouseholdRegistrationPage";
import EmergencyContactPage from "../pages/patient/EmergencyContactPage";
import VisitReferralPage from "../pages/patient/VisitReferralPage";
import FamilyTreePage from "../pages/patient/FamilyTreePage";
import SymptomCheckerPage from "../pages/patient/SymptomCheckerPage";
import AIDoctorChatPage from "../pages/patient/AIDoctorChatPage";
import HealthReportsPage from "../pages/patient/HealthReportsPage";

const AppRoutes = () => {
	const { user } = useAuth();

	return (
		<Routes>
			{/* Public Patient Routes */}
			<Route path="/" element={<HomePage />} />
			<Route path="/health-centers" element={<HealthCentersPage />} />
			<Route path="/labs/:labId" element={<LabDetailsPage />} />
			
			<Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
			<Route path="/health-profile" element={<ProtectedRoute><HealthProfilePage /></ProtectedRoute>} />
			<Route path="/health-reports" element={<ProtectedRoute><HealthReportsPage /></ProtectedRoute>} />
			<Route path="/household-registration" element={<ProtectedRoute><HouseholdRegistrationPage /></ProtectedRoute>} />
			<Route path="/emergency-contact" element={<ProtectedRoute><EmergencyContactPage /></ProtectedRoute>} />
			<Route path="/visits-referrals" element={<ProtectedRoute><VisitReferralPage /></ProtectedRoute>} />
			<Route path="/family-tree" element={<ProtectedRoute><FamilyTreePage /></ProtectedRoute>} />
			<Route path="/symptom-checker" element={<ProtectedRoute><SymptomCheckerPage /></ProtectedRoute>} />
			<Route path="/ai-doctor" element={<ProtectedRoute><AIDoctorChatPage /></ProtectedRoute>} />
			
			<Route element={<ProtectedRoute />}>
				<Route path="/dashboard" element={<div className="p-8">Patient Dashboard Coming Soon</div>} />
			</Route>

			<Route
				path="/login"
				element={!user ? <LoginPage /> : <Navigate to={user.userType === "patient" ? "/" : "/staff/dashboard"} />}
			/>
			<Route
				path="/register"
				element={!user ? <RegisterPage /> : <Navigate to={user.userType === "patient" ? "/" : "/staff/dashboard"} />}
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
			<Route element={<ProtectedRoute />}>
				<Route path="/staff/dashboard" element={<DashboardLayout activePage="labs"><LabManagementPage /></DashboardLayout>} />
				<Route path="/staff/tests" element={<DashboardLayout activePage="tests"><TestManagementPage /></DashboardLayout>} />
				<Route path="/staff/availability" element={<DashboardLayout activePage="availability"><TestAvailabilityPage /></DashboardLayout>} />
				<Route path="/staff/instructions" element={<DashboardLayout activePage="instructions"><TestInstructionsPage /></DashboardLayout>} />
			</Route>

			{/* Catch all */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

export default AppRoutes;
