import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import AdminDashboardLayout from "../layout/AdminDashboardLayout";
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
import AdminOverviewDashboard from "../pages/AdminOverviewDashboard";
import AdminFinanceDashboard from "../pages/AdminFinanceDashboard";
import AdminInventoryDashboard from "../pages/AdminInventoryDashboard";
import AdminEquipmentCatalog from "../pages/AdminEquipmentCatalog";
import AdminTestEquipmentRequirements from "../pages/AdminTestEquipmentRequirements";

const AppRoutes = () => {
	const { user, logout } = useAuth();

	const normalize = (value) =>
		(value || "")
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "_");

	const userRole = normalize(user?.role || user?.profile?.role);

	const isAdminUser = () => {
		return userRole === "admin";
	};

	const isPatientUser = () => {
		// Backend returns role="patient" for patients; userType is not reliably present on the user object.
		return userRole === "patient";
	};

	const getPostAuthRedirect = () => {
		if (!user) return "/";
		if (isAdminUser()) return "/admin/overview";
		if (isPatientUser()) return "/dashboard";
		return "/staff/dashboard";
	};

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
				element={!user ? <LoginPage /> : <Navigate to={getPostAuthRedirect()} />}
			/>
			<Route
				path="/register"
				element={!user ? <RegisterPage /> : <Navigate to={getPostAuthRedirect()} />}
			/>

			{/* Staff Auth Routes */}
			<Route
				path="/staff/login"
				element={!user ? <StaffLoginPage /> : <Navigate to={getPostAuthRedirect()} />}
			/>
			<Route
				path="/staff/register"
				element={!user ? <StaffRegisterPage /> : <Navigate to={getPostAuthRedirect()} />}
			/>

			{/* Protected Staff Routes */}
			<Route element={<ProtectedRoute />}>
				<Route path="/staff/dashboard" element={<DashboardLayout activePage="labs"><LabManagementPage /></DashboardLayout>} />
				<Route
					element={
						isAdminUser() ? (
							<Navigate to="/admin/overview" replace />
						) : (
							<ProtectedRoute
								allowedRoles={["Staff", "Lab_Technician", "MOH", "PHI", "Nurse", "Doctor", "HealthOfficer"]}
								redirectTo="/staff/login"
							/>
						)
					}
				>
				<Route
					path="/staff/dashboard"
					element={<DashboardLayout activePage="labs"><LabManagementPage /></DashboardLayout>}
				/>
				<Route path="/staff/tests" element={<DashboardLayout activePage="tests"><TestManagementPage /></DashboardLayout>} />
				<Route path="/staff/availability" element={<DashboardLayout activePage="availability"><TestAvailabilityPage /></DashboardLayout>} />
				<Route path="/staff/instructions" element={<DashboardLayout activePage="instructions"><TestInstructionsPage /></DashboardLayout>} />
			</Route>

			{/* Protected Admin Routes */}
				<Route element={<ProtectedRoute allowedRoles={["Admin", "admin"]} redirectTo="/staff/login" />}>
				<Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
				<Route
					path="/admin/overview"
					element={
						<AdminDashboardLayout title="Overview" onLogout={logout}>
							<AdminOverviewDashboard />
						</AdminDashboardLayout>
					}
				/>
				<Route
					path="/admin/finance"
					element={
						<AdminDashboardLayout title="Finance" onLogout={logout}>
							<AdminFinanceDashboard />
						</AdminDashboardLayout>
					}
				/>
				<Route
					path="/admin/inventory"
					element={
						<AdminDashboardLayout title="Inventory" onLogout={logout}>
							<AdminInventoryDashboard />
						</AdminDashboardLayout>
					}
				/>
				<Route
					path="/admin/inventory/equipment"
					element={
						<AdminDashboardLayout title="Equipment Catalog" onLogout={logout}>
							<AdminEquipmentCatalog />
						</AdminDashboardLayout>
					}
				/>
				<Route
					path="/admin/inventory/requirements"
					element={
						<AdminDashboardLayout title="Test Requirements" onLogout={logout}>
							<AdminTestEquipmentRequirements />
						</AdminDashboardLayout>
					}
				/>
				<Route
					path="/admin/users"
					element={
						<AdminDashboardLayout title="Users" onLogout={logout}>
							<div className="text-sm text-slate-600">Users management coming soon.</div>
						</AdminDashboardLayout>
					}
				/>
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
