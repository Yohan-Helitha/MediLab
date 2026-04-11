import React from "react";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import FloatingChatIcon from "./components/FloatingChatIcon.jsx";

const AppContent = () => {
	const { loading } = useAuth();

	if (loading) {
		return <div className="flex h-screen items-center justify-center font-medium">Loading session...</div>;
	}

	return (
		<>
			<AppRoutes />
			<FloatingChatIcon />
			<Toaster position="top-right" toastOptions={{ duration: 4000 }} />
		</>
	);
};

function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	);
}

export default App;
