import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const POST_AUTH_REDIRECT_KEY = "medilab.postAuthRedirect";

const normalize = (value) =>
	(value || "")
		.toString()
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "_");

const ProtectedRoute = ({ allowedRoles = [], redirectTo = "/login" }) => {
	const { user, loading } = useAuth();
	const location = useLocation();
	const allowed = allowedRoles.map(normalize);
	const userRole = normalize(user?.role || user?.profile?.role);
	const userType = normalize(user?.userType);

	useEffect(() => {
		if (loading) return;
		if (user) return;
		try {
			const value = {
				pathname: location?.pathname,
				search: location?.search,
				state: location?.state,
			};
			sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, JSON.stringify(value));
		} catch {
			// Ignore storage errors (private mode, quota, etc.)
		}
	}, [loading, user, location?.pathname, location?.search, location?.state]);

	if (loading) {
		return <div className="flex h-screen items-center justify-center font-medium">Loading session...</div>;
	}

	if (!user) {
		return <Navigate to="/" replace />;
	}

	if (allowed.length > 0 && !allowed.includes(userRole) && !allowed.includes(userType)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
