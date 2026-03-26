import React, { useState } from "react";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import LabManagementPage from "./pages/LabManagementPage.jsx";
import TestManagementPage from "./pages/TestManagementPage.jsx";
import TestAvailabilityPage from "./pages/TestAvailabilityPage.jsx";
import TestInstructionsPage from "./pages/TestInstructionsPage.jsx";

function App() {
	const [activePage, setActivePage] = useState("labs");

	const renderPage = () => {
		switch (activePage) {
			case "tests":
				return <TestManagementPage />;
			case "availability":
				return <TestAvailabilityPage />;
			case "instructions":
				return <TestInstructionsPage />;
			case "labs":
			default:
				return <LabManagementPage />;
		}
	};

	return (
		<DashboardLayout activePage={activePage} onChangePage={setActivePage}>
			{renderPage()}
		</DashboardLayout>
	);
}

export default App;
