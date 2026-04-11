import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import AdminOverviewDashboard from "../pages/AdminOverviewDashboard";
import AdminFinanceDashboard from "../pages/AdminFinanceDashboard";
import AdminInventoryDashboard from "../pages/AdminInventoryDashboard";
import AdminEquipmentCatalog from "../pages/AdminEquipmentCatalog";
import AdminTestEquipmentRequirements from "../pages/AdminTestEquipmentRequirements";
import AdminUsers from "../pages/AdminUsers";
import AdminResultsPage from "../pages/AdminResultsPage";
import BookingCreatePage from "../pages/BookingCreatePage";
import BookingUpdatePage from "../pages/BookingUpdatePage";
import PayHereReturnPage from "../pages/PayHereReturnPage";
import AccountPage from "../pages/patient/AccountPage";
import AIDoctorChatPage from "../pages/patient/AIDoctorChatPage";
import BookingPage from "../pages/patient/BookingPage";
import EmergencyContactPage from "../pages/patient/EmergencyContactPage";
import FamilyTreePage from "../pages/patient/FamilyTreePage";
import HealthProfilePage from "../pages/patient/HealthProfilePage";
import HealthReportsPage from "../pages/patient/HealthReportsPage";
import HouseholdRegistrationPage from "../pages/patient/HouseholdRegistrationPage";
import SymptomCheckerPage from "../pages/patient/SymptomCheckerPage";
import VisitReferralPage from "../pages/patient/VisitReferralPage";
import TestResultsPage from "../pages/staff/TestResultsPage";
import LabTechnicianLayout from "../layout/LabTechnicianLayout";
import LabOverviewPage from "../pages/lab/LabOverviewPage";
import LabResultsPage from "../pages/lab/LabResultsPage";
import LabSubmitPage from "../pages/lab/LabSubmitPage";
import LabUncollectedPage from "../pages/lab/LabUncollectedPage";
import LabNotificationsPage from "../pages/lab/LabNotificationsPage";

const POST_AUTH_REDIRECT_KEY = "medilab.postAuthRedirect";

const AppRoutes = () => {
	const { user, logout } = useAuth();
	const location = useLocation();

	const normalize = (value) =>
		(value || "")
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "_");

	// Prefer profile.role when present (e.g., HealthOfficer profile role can be Admin)
	const userRole = normalize(user?.profile?.role || user?.role);

	const isAdminUser = () => {
		return userRole === "admin";
	};

	const isLabTechnicianUser = () => {
		return userRole === "lab_technician";
	};

	const isPatientUser = () => {
		// Backend returns role="patient" for patients; userType is not reliably present on the user object.
		return userRole === "patient";
	};

	const getPostAuthRedirect = () => {
		if (!user) return "/";
		if (isAdminUser()) return "/admin/overview";
		if (isLabTechnicianUser()) return "/lab/overview";
		if (isPatientUser()) return "/";
		return "/staff/dashboard";
	};

	const PostAuthRedirect = ({ fallback }) => {
		const from = location?.state?.from;
		let fromPath = typeof from?.pathname === "string" ? from.pathname : "";
		let fromSearch = from?.search || "";
		let fromState = from?.state;

		if (!fromPath) {
			try {
				const raw = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
				if (raw) {
					const stored = JSON.parse(raw);
					fromPath = typeof stored?.pathname === "string" ? stored.pathname : "";
					fromSearch = typeof stored?.search === "string" ? stored.search : "";
					fromState = stored?.state;
				}
			} catch {
				// Ignore parsing/storage errors
			}
		}

		try {
			sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
		} catch {
			// Ignore
		}
		const disallowed = new Set([
			"/login",
			"/register",
			"/staff/login",
			"/staff/register",
		]);

		if (fromPath && !disallowed.has(fromPath)) {
			const to = `${fromPath}${fromSearch || ""}`;
			return <Navigate to={to} state={fromState} replace />;
		}

		return <Navigate to={fallback} replace />;
	};

	return (
		<Routes>
			{/* Public Patient Routes */}
			<Route path="/" element={<HomePage />} />
			<Route path="/health-centers" element={<HealthCentersPage />} />
			<Route path="/labs/:labId" element={<LabDetailsPage />} />
			<Route path="/payments/payhere/return" element={<PayHereReturnPage />} />
			<Route
				path="/login"
				element={!user ? <LoginPage /> : <PostAuthRedirect fallback={getPostAuthRedirect()} />}
			/>
			<Route
				path="/register"
				element={!user ? <RegisterPage /> : <PostAuthRedirect fallback={getPostAuthRedirect()} />}
			/>

			{/* Staff Auth Routes */}
			<Route
				path="/staff/login"
				element={!user ? <StaffLoginPage /> : <PostAuthRedirect fallback={getPostAuthRedirect()} />}
			/>
			<Route
				path="/staff/register"
				element={!user ? <StaffRegisterPage /> : <PostAuthRedirect fallback={getPostAuthRedirect()} />}
			/>

			{/* Protected Staff Routes */}
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
				<Route
					path="/staff/lab-dashboard"
					element={<Navigate to="/lab/overview" replace />}
				/>
				<Route path="/staff/tests" element={<DashboardLayout activePage="tests"><TestManagementPage /></DashboardLayout>} />
				<Route path="/staff/availability" element={<DashboardLayout activePage="availability"><TestAvailabilityPage /></DashboardLayout>} />
				<Route path="/staff/instructions" element={<DashboardLayout activePage="instructions"><TestInstructionsPage /></DashboardLayout>} />
				<Route path="/staff/results" element={<DashboardLayout activePage="results"><TestResultsPage /></DashboardLayout>} />
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
							<AdminUsers />
						</AdminDashboardLayout>
					}
				/>
				<Route
					path="/admin/results"
					element={
						<AdminDashboardLayout title="Test Results" onLogout={logout}>
							<AdminResultsPage />
						</AdminDashboardLayout>
					}
				/>
			</Route>

			{/* Protected Patient Routes */}
			<Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
				<Route path="/bookings/new" element={<BookingCreatePage />} />
				<Route path="/bookings/:id/edit" element={<BookingUpdatePage />} />
				<Route path="/account" element={<AccountPage />} />
				<Route path="/health-profile" element={<HealthProfilePage />} />
				<Route path="/health-reports" element={<HealthReportsPage />} />
				<Route path="/booking" element={<BookingPage />} />
				<Route path="/visits-referrals" element={<VisitReferralPage />} />
				<Route path="/household-registration" element={<HouseholdRegistrationPage />} />
				<Route path="/family-tree" element={<FamilyTreePage />} />
				<Route path="/emergency-contact" element={<EmergencyContactPage />} />
				<Route path="/symptom-checker" element={<SymptomCheckerPage />} />
				<Route path="/ai-doctor" element={<AIDoctorChatPage />} />
				<Route path="/dashboard" element={<div className="p-8">Patient Dashboard Coming Soon</div>} />
			</Route>

			{/* Protected Lab Technician Routes */}
			<Route element={<ProtectedRoute allowedRoles={["Lab_Technician"]} redirectTo="/staff/login" />}>
				<Route element={<LabTechnicianLayout />}>
					<Route path="/lab/overview" element={<LabOverviewPage />} />
					<Route path="/lab/results" element={<LabResultsPage />} />
					<Route path="/lab/submit" element={<LabSubmitPage />} />
					<Route path="/lab/uncollected" element={<LabUncollectedPage />} />
					<Route path="/lab/notifications" element={<LabNotificationsPage />} />
				</Route>
			</Route>

			{/* Catch all */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};

export default AppRoutes;
