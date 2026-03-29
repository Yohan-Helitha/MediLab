import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("token") || null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		const storedToken = localStorage.getItem("token");
		if (storedUser && storedToken) {
			try {
				setUser(JSON.parse(storedUser));
				setToken(storedToken);
			} catch (e) {
				console.error("Failed to parse stored user", e);
			}
		}
		setLoading(false);
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

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
