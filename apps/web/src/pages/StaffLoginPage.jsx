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
				const userWithRole = { ...response.data.user, userType: "staff" };
				login(userWithRole, response.data.token);
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
		<div className="h-screen w-full flex overflow-hidden bg-white">
			{/* Left Side: Image */}
			<div className="hidden lg:block lg:w-1/2 relative h-full">
				<img
					src="/images/login-register/lab.png"
					alt="Medical Staff"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-teal-900/10" />
				
			</div>

			{/* Right Side: Form */}
<div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-slate-50/50 h-full">
<div className="w-full max-w-md">
<div className="flex flex-col items-center">
<div className="w-full flex justify-end mb-1">
<Link 
to="/login" 
className="group inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1 text-[10px] font-bold text-teal-600 border border-teal-100 transition-all hover:bg-teal-100 hover:scale-105 active:scale-95"
>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform">
<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>
Patient Portal
</Link>
</div>

<div className="text-center space-y-1">
<div className="flex justify-center mb-1">
<img src="/images/logo.png" alt="MediLab Logo" className="h-10 w-auto drop-shadow-sm" />
</div>
<h2 className="text-2xl font-bold tracking-tight text-slate-900">
MediLab Staff
</h2>
							<p className="text-slate-500 text-sm font-medium">
								Health Officer & Lab Technician Sign-in
							</p>
						</div>
					</div>

					<form className="space-y-4" onSubmit={handleSubmit}>
<div className="space-y-3 p-4">
<div className="space-y-1">
<label htmlFor="email" className="text-[11px] font-bold text-slate-700 ml-1 uppercase">
Email
</label>
<input
id="email"
name="email"
type="text"
required
value={formData.email}
onChange={handleChange}
className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-sm"
placeholder="Enter your Email"
/>
</div>
<div className="space-y-1">
<label htmlFor="password" className="text-[11px] font-bold text-slate-700 ml-1 uppercase">
Password
</label>
<input
id="password"
name="password"
type="password"
required
value={formData.password}
onChange={handleChange}
className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-medium text-sm"
placeholder="••••••••"
/>
</div>
</div>

						{error && (
							<div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 animate-shake">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-500">
									<path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
								</svg>
								<p className="text-xs font-semibold text-rose-600">{error}</p>
							</div>
						)}

						<div className="pt-2 flex justify-center">
<button
type="submit"
disabled={loading}
className="group relative flex w-48 justify-center rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 hover:bg-teal-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:translate-y-0"
>
								{loading ? (
									<span className="flex items-center gap-2">
										<svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										Processing...
									</span>
								) : "Staff Sign in"}
							</button>
						</div>

						<div className="text-center pt-4">
							<p className="text-slate-500 font-medium text-sm">
								New to the portal?{" "}
								<Link
									to="/staff/register"
									className="text-teal-600 font-bold hover:text-teal-800 transition-colors inline-flex items-center gap-1 group"
								>
									Create account
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform">
										<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
									</svg>
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default StaffLoginPage;
