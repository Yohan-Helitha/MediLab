import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

const AppContent = () => {
	const { user, logout, loading } = useAuth();

	if (loading) {
		return <div className="flex h-screen items-center justify-center font-medium">Loading session...</div>;
	}

	return (
		<>
			{user && (
				<div className="p-3 flex justify-end gap-4 bg-white border-b border-slate-100">
					<span className="text-sm text-slate-600 flex items-center">
						Logged in as: <strong className="ml-1 text-slate-900">{user.email || user.fullName}</strong> ({user.role})
					</span>
					<button
						className="px-3 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-medium transition-colors"
						onClick={logout}
					>
						Logout
					</button>
				</div>
			)}
			<AppRoutes />
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
