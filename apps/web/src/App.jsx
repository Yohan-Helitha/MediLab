import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import AdminDashboardLayout from "./layout/AdminDashboardLayout.jsx";
import LabManagementPage from "./pages/LabManagementPage.jsx";
import AdminFinanceDashboard from "./pages/AdminFinanceDashboard.jsx";
import AdminInventoryDashboard from "./pages/AdminInventoryDashboard.jsx";
import AdminOverviewDashboard from "./pages/AdminOverviewDashboard.jsx";
import AdminEquipmentCatalog from "./pages/AdminEquipmentCatalog.jsx";
import AdminTestEquipmentRequirements from "./pages/AdminTestEquipmentRequirements.jsx";

function App() {
	return (
		<Routes>
			<Route
				path="/"
				 element={
					<DashboardLayout>
						<LabManagementPage />
					</DashboardLayout>
				}
			/>
			<Route
				path="/admin/overview"
				 element={
					<AdminDashboardLayout title="Overview">
						<AdminOverviewDashboard />
					</AdminDashboardLayout>
				}
			/>
			<Route
				path="/admin/finance"
				 element={
					<AdminDashboardLayout title="Finance Management">
						<AdminFinanceDashboard />
					</AdminDashboardLayout>
				}
			/>
			<Route
				path="/admin/inventory"
				 element={
					<AdminDashboardLayout title="Inventory Management">
						<AdminInventoryDashboard />
					</AdminDashboardLayout>
				}
			/>
			<Route
				path="/admin/inventory/equipment"
				 element={
					<AdminDashboardLayout title="Equipment Catalog">
						<AdminEquipmentCatalog />
					</AdminDashboardLayout>
				}
			/>
			<Route
				path="/admin/inventory/requirements"
				 element={
					<AdminDashboardLayout title="Test Equipment Requirements">
						<AdminTestEquipmentRequirements />
					</AdminDashboardLayout>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
