import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateMemberProfile } from "../../api/patientApi";

const MemberProfileForm = ({ onProfileUpdated, onCancel }) => {
	const { user, login } = useAuth();
	const [formData, setFormData] = useState({
		full_name: user?.fullName || user?.firstName || "",
		nic: "",
		address: "",
		gn_division: "",
		district: "",
		date_of_birth: "",
		gender: "male",
		photo: null,
	});
	const [photoPreview, setPhotoPreview] = useState(null);
	const [errors, setErrors] = useState({});
	const [mainError, setMainError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, files } = e.target;
		if (type === "file") {
			const file = files[0];
			if (file) {
				setFormData((prev) => ({ ...prev, photo: file }));
				const reader = new FileReader();
				reader.onloadend = () => {
					setPhotoPreview(reader.result);
				};
				reader.readAsDataURL(file);
			}
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
		// Clear specific error when user starts typing
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMainError("");
		setErrors({});
		setLoading(true);

		const targetId = user?._id || user?.id || user?.profile?._id;
		
		// Use FormData for photo upload
		const form = new FormData();
		form.append("full_name", formData.full_name);
		form.append("nic", formData.nic);
		form.append("address", formData.address);
		form.append("gn_division", formData.gn_division);
		form.append("district", formData.district);
		form.append("gender", formData.gender);
		form.append("isProfileComplete", "true");
		
		if (formData.date_of_birth) {
			form.append("date_of_birth", new Date(formData.date_of_birth).toISOString().split('T')[0]);
		}
		
		if (formData.photo) {
			form.append("photo", formData.photo);
		}

		try {
			const response = await updateMemberProfile(targetId, form);

			if (response.success) {
				// Update AuthContext with new user data
				login(response.data, localStorage.getItem("token"));
				onProfileUpdated();
			}
		} catch (err) {
			if (err.errors) {
				const fieldErrors = {};
				err.errors.forEach(e => {
					fieldErrors[e.path || e.param] = e.msg;
				});
				setErrors(fieldErrors);
			} else {
				setMainError(err.message || "An error occurred while updating profile.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
			<div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col">
				<div className="bg-teal-600 px-6 py-4 text-white rounded-t-2xl shrink-0">
					<h2 className="text-xl font-bold">Complete Your Profile</h2>
					<p className="mt-1 text-sm text-teal-100">
						Please provide the following details to continue using MediLab.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="p-6">
					{mainError && (
						<div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
							{mainError}
						</div>
					)}

					<div className="space-y-4">
						{/* Photo upload and Name in one row to save height */}
						<div className="flex gap-6 items-center pb-4 border-b border-slate-100">
							<div className="relative shrink-0 flex flex-col items-center">
								<div className="h-20 w-20 relative group">
									<div className="h-full w-full overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center transition-all group-hover:border-teal-500">
										{photoPreview ? (
											<img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
											</svg>
										)}
									</div>
									<label className="absolute inset-0 cursor-pointer flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										<input type="file" name="photo" className="hidden" accept="image/*" onChange={handleChange} />
									</label>
								</div>
								<p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Photo</p>
							</div>

							<div className="flex-1">
								<label className="mb-1 block text-sm font-medium text-slate-700">Full Name *</label>
								<input
									type="text"
									name="full_name"
									value={formData.full_name}
									onChange={handleChange}
									className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
										errors.full_name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-teal-500 focus:ring-teal-500"
									}`}
									placeholder="Enter your full name"
									required
								/>
								{errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name}</p>}
								
								<div className="grid grid-cols-2 gap-3 mt-3">
									<div>
										<label className="mb-1 block text-sm font-medium text-slate-700">NIC Number *</label>
										<input
											type="text"
											name="nic"
											value={formData.nic}
											onChange={handleChange}
											className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
												errors.nic ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-teal-500 focus:ring-teal-500"
											}`}
											placeholder="NIC"
											required
										/>
									</div>
									<div>
										<label className="mb-1 block text-sm font-medium text-slate-700">Gender *</label>
										<select
											name="gender"
											value={formData.gender}
											onChange={handleChange}
											className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
											required
										>
											<option value="male">Male</option>
											<option value="female">Female</option>
										</select>
									</div>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-x-4 gap-y-3">
							<div className="col-span-2">
								<label className="mb-1 block text-sm font-medium text-slate-700">Address *</label>
								<input
									type="text"
									name="address"
									value={formData.address}
									onChange={handleChange}
									className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
									placeholder="Home address"
									required
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">GN Division *</label>
								<input
									type="text"
									name="gn_division"
									value={formData.gn_division}
									onChange={handleChange}
									className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
									placeholder="e.g. Maharagama"
									required
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">District *</label>
								<input
									type="text"
									name="district"
									value={formData.district}
									onChange={handleChange}
									className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
									placeholder="e.g. Colombo"
									required
								/>
							</div>

							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth *</label>
								<input
									type="date"
									name="date_of_birth"
									value={formData.date_of_birth}
									onChange={handleChange}
									max={new Date().toISOString().split("T")[0]}
									className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
									required
								/>
							</div>
						</div>
					</div>

					<div className="mt-6 flex pt-4 border-t border-slate-100">
						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50"
						>
							{loading ? "Updating..." : "Complete Profile"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default MemberProfileForm;
