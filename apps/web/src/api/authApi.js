import { apiRequest } from "./client";

export const authApi = {
	loginPatient: (data) => apiRequest("/api/auth/patient/login", { method: "POST", body: JSON.stringify(data) }),
	registerPatient: (data) => apiRequest("/api/auth/patient/register", { method: "POST", body: JSON.stringify(data) }),
	updateProfile: (data) => apiRequest("/api/auth/update", { method: "PUT", body: JSON.stringify(data) }),
	loginHealthOfficer: (data) => apiRequest("/api/auth/staff/login", { method: "POST", body: JSON.stringify(data) }),
	registerHealthOfficer: (data) => apiRequest("/api/auth/staff/register", { method: "POST", body: JSON.stringify(data) }),
};
