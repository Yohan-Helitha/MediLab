import React from "react";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import LabManagementPage from "./pages/LabManagementPage.jsx";

function App() {
	return (
		<DashboardLayout>
			<LabManagementPage />
		</DashboardLayout>
	);
}

export default App;
