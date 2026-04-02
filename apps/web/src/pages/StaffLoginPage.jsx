import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function StaffLoginPage() {
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Staff login (Health Officer / Lab Tech / etc.)
			const response = await authApi.loginHealthOfficer({ 
				identifier: formData.email, 
				password: formData.password 
			});

			if (response && response.success && response.data.token) {
				login(response.data.user, response.data.token);
			} else {
				setError("Invalid staff credentials");
			}
		} catch (err) {
			setError(err.message || "An error occurred during staff login");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm border-t-4 border-indigo-600">
				<div className="flex justify-end">
					<Link to="/login" className="text-xs font-semibold text-blue-600 hover:text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full transition-colors border border-blue-100 flex items-center gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
						</svg>
						Patient Portal
					</Link>
				</div>
				<div>
					<h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
						MediLab Staff Portal
					</h2>
					<p className="mt-2 text-center text-sm text-slate-600">
						Health Officer & Technician Sign-in
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4 rounded-md shadow-sm">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email or Employee ID</label>
							<input
								id="email"
								name="email"
								type="text"
								required
								value={formData.email}
								onChange={handleChange}
								className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
								placeholder="Email address or Employee ID"
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								value={formData.password}
								onChange={handleChange}
								className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
								placeholder="Password"
							/>
						</div>
					</div>

					{error && <p className="text-sm text-rose-500">{error}</p>}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
						>
							{loading ? "Verifying..." : "Staff Sign in"}
						</button>
					</div>

					<div className="text-center">
						<Link
							to="/staff/register"
							className="text-sm font-medium text-indigo-600 hover:text-indigo-500 underline decoration-dotted"
						>
							Register as Staff Member
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}

export default StaffLoginPage;
