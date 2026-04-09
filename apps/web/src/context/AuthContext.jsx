import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchMemberProfile } from "../api/patientApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		const storedUser = localStorage.getItem("user");
		return storedUser ? JSON.parse(storedUser) : null;
	});
	const [token, setToken] = useState(localStorage.getItem("token") || null);
	const [loading, setLoading] = useState(false); // No longer purely loading by default

	useEffect(() => {
		const initAuth = async () => {
			if (user && token) {
				try {
					// silent refresh in background
					if (user._id && (user.userType === 'patient' || !user.userType)) {
						const res = await fetchMemberProfile(user._id);
						if (res.success && res.data) {
							const refreshedUser = { ...res.data, userType: user.userType || "patient" };
							setUser(refreshedUser);
							localStorage.setItem("user", JSON.stringify(refreshedUser));
						}
					}
				} catch (e) {
					console.error("Failed to refresh profile", e);
				}
			}
		};

		initAuth();
	}, []);

	const login = (userData, userToken) => {
		setUser(userData);
		setToken(userToken);
		localStorage.setItem("user", JSON.stringify(userData));
		localStorage.setItem("token", userToken);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("token");
	};

	return (
		<AuthContext.Provider value={{ user, token, login, logout, setData: login }}>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext };

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
