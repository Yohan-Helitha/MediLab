import React, { useState } from "react";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import LabManagementPage from "./pages/LabManagementPage.jsx";
import TestManagementPage from "./pages/TestManagementPage.jsx";
import TestAvailabilityPage from "./pages/TestAvailabilityPage.jsx";
import TestInstructionsPage from "./pages/TestInstructionsPage.jsx";
import PublicRoutes from "./routes/PublicRoutes.jsx";

function App() {
	const [activePage, setActivePage] = useState("labs");
	const [showPublic, setShowPublic] = useState(false);

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
		<>
			<div className="p-3 flex justify-end">
				<button
					className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
					onClick={() => setShowPublic((s) => !s)}
				>
					{showPublic ? "View Staff Dashboard" : "View Patient Site"}
				</button>
			</div>

			{showPublic ? (
				<PublicRoutes />
			) : (
				<DashboardLayout activePage={activePage} onChangePage={setActivePage}>
					{renderPage()}
				</DashboardLayout>
			)}
		</>
	);
}

export default App;
