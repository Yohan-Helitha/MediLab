import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return <div className="flex h-screen items-center justify-center font-medium">Loading session...</div>;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role) && !allowedRoles.includes(user.userType)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
