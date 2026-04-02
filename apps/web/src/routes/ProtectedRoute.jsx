import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const normalize = (value) =>
	(value || "")
		.toString()
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "_");

const ProtectedRoute = ({ allowedRoles = [], redirectTo = "/login" }) => {
	const { user, loading } = useAuth();
	const allowed = allowedRoles.map(normalize);
	const userRole = normalize(user?.role || user?.profile?.role);
	const userType = normalize(user?.userType);

	if (loading) {
		return <div className="flex h-screen items-center justify-center font-medium">Loading session...</div>;
	}

	if (!user) {
		return <Navigate to={redirectTo} replace />;
	}

	if (allowed.length > 0 && !allowed.includes(userRole) && !allowed.includes(userType)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
