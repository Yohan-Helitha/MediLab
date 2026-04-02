import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
	const { login } = useAuth();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
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
			// Patient registration
			const patientData = {
				full_name: `${formData.firstName} ${formData.lastName}`,
				email: formData.email,
				password: formData.password,
				contact_number: formData.phone
			};
			
			const response = await authApi.registerPatient(patientData);

			if (response && response.success && response.data.token) {
				login(response.data.user, response.data.token);
			} else {
				setError("Patient registration failed");
			}
		} catch (err) {
			setError(err.message || "An error occurred during registration");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm">
				<div className="flex justify-end">
					<Link to="/staff/register" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors border border-indigo-100 flex items-center gap-1.5">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
						</svg>
						Join as Staff
					</Link>
				</div>
				<div>
					<h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
						MediLab Portal
					</h2>
					<p className="mt-2 text-center text-sm text-slate-600">
						Create your patient account
					</p>
				</div>
				<form className="mt-8 space-y-4" onSubmit={handleSubmit}>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								required
								value={formData.firstName}
								onChange={handleChange}
								className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 sm:text-sm"
								placeholder="First Name"
							/>
						</div>
						<div>
							<label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								required
								value={formData.lastName}
								onChange={handleChange}
								className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 sm:text-sm"
								placeholder="Last Name"
							/>
						</div>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							value={formData.email}
							onChange={handleChange}
							className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 sm:text-sm"
							placeholder="Email address"
						/>
					</div>

					<div>
						<label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							required
							value={formData.phone}
							onChange={handleChange}
							className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 sm:text-sm"
							placeholder="07XXXXXXXX"
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
							className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 sm:text-sm"
							placeholder="Password"
						/>
					</div>

					{error && <p className="text-sm text-rose-500">{error}</p>}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
						>
							{loading ? "Registering..." : "Register as patient"}
						</button>
					</div>

					<div className="text-center">
						<Link
							to="/login"
							className="text-sm font-medium text-blue-600 hover:text-blue-500 underline decoration-dotted"
						>
							Already have an account? Log in
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}

export default RegisterPage;
