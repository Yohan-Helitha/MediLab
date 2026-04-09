import React, { useEffect, useState } from "react";

// Form for creating or editing a Lab.
// initialValues lets us pre-fill fields when editing.
function LabForm({ onSubmit, onCancel, initialValues, submitLabel }) {
	const [formData, setFormData] = useState(() => ({
		name: initialValues?.name || "",
		district: initialValues?.district || "",
		phoneNumber: initialValues?.phoneNumber || "",
		addressLine1: initialValues?.addressLine1 || "",
		operatingHoursDisplay: initialValues?.operatingHoursDisplay || "",
		operationalStatus: initialValues?.operationalStatus || "OPEN",
	}));

	useEffect(() => {
		setFormData({
			name: initialValues?.name || "",
			district: initialValues?.district || "",
			phoneNumber: initialValues?.phoneNumber || "",
			addressLine1: initialValues?.addressLine1 || "",
			operatingHoursDisplay:
				initialValues?.operatingHoursDisplay || "",
			operationalStatus: initialValues?.operationalStatus || "OPEN",
		});
	}, [initialValues]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (onSubmit) {
			onSubmit(formData);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Lab Name
					</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						placeholder="Enter lab name"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						required
					/>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						District
					</label>
					<input
						type="text"
						name="district"
						value={formData.district}
						onChange={handleChange}
						placeholder="District name"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Contact Number
					</label>
					<input
						type="tel"
						name="phoneNumber"
						value={formData.phoneNumber}
						onChange={handleChange}
						placeholder="+1 (555) 000-0000"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Address
					</label>
					<input
						type="text"
						name="addressLine1"
						value={formData.addressLine1}
						onChange={handleChange}
						placeholder="Full address"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Operating Hours
					</label>
					<input
						type="text"
						name="operatingHoursDisplay"
						value={formData.operatingHoursDisplay}
						onChange={handleChange}
						placeholder="e.g. 08:30 AM - 05:30 PM"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Status
					</label>
					<select
						name="operationalStatus"
						value={formData.operationalStatus}
						onChange={handleChange}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					>
						<option value="OPEN">Open</option>
						<option value="CLOSED">Closed</option>
						<option value="HOLIDAY">Holiday</option>
						<option value="MAINTENANCE">Maintenance</option>
					</select>
				</div>
			</div>

			<div className="mt-4 flex justify-end gap-3">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
				>
					{submitLabel || "Create Lab"}
				</button>
			</div>
		</form>
	);
}

export default LabForm;

