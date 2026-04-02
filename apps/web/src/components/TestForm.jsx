import React, { useEffect, useState } from "react";

// Form for creating or editing a Test Type.
// initialValues lets us pre-fill fields when editing.
function TestForm({ onSubmit, onCancel, initialValues, submitLabel }) {
	const [formData, setFormData] = useState(() => ({
		name: initialValues?.name || "",
		code: initialValues?.code || "",
		category: initialValues?.category || "Blood Chemistry",
		entryMethod: initialValues?.entryMethod || "form",
		discriminatorType: initialValues?.discriminatorType || "BloodGlucose",
		description: initialValues?.description || "",
	}));

	useEffect(() => {
		setFormData({
			name: initialValues?.name || "",
			code: initialValues?.code || "",
			category: initialValues?.category || "Blood Chemistry",
			entryMethod: initialValues?.entryMethod || "form",
			discriminatorType:
				initialValues?.discriminatorType || "BloodGlucose",
			description: initialValues?.description || "",
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
						Test Name
					</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						placeholder="Enter test name"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						required
					/>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Test Code
					</label>
					<input
						type="text"
						name="code"
						value={formData.code}
						onChange={handleChange}
						placeholder="e.g. GLUCOSE_FAST"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm uppercase focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						required
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Category
					</label>
					<select
						name="category"
						value={formData.category}
						onChange={handleChange}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						required
					>
						<option>Blood Chemistry</option>
						<option>Hematology</option>
						<option>Imaging</option>
						<option>Cardiology</option>
						<option>Clinical Pathology</option>
						<option>Other</option>
					</select>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Entry Method
					</label>
					<select
						name="entryMethod"
						value={formData.entryMethod}
						onChange={handleChange}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						required
					>
						<option value="form">Form</option>
						<option value="upload">Upload</option>
					</select>
				</div>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-slate-700">
					Result Template Type
				</label>
				<select
					name="discriminatorType"
					value={formData.discriminatorType}
					onChange={handleChange}
					className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
					required
				>
					<option value="BloodGlucose">Blood Glucose</option>
					<option value="Hemoglobin">Hemoglobin</option>
					<option value="BloodPressure">Blood Pressure</option>
					<option value="Pregnancy">Pregnancy</option>
					<option value="XRay">X-Ray</option>
					<option value="ECG">ECG</option>
					<option value="Ultrasound">Ultrasound</option>
					<option value="AutomatedReport">Automated Report</option>
				</select>
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-slate-700">
					Description
				</label>
				<textarea
					name="description"
					value={formData.description}
					onChange={handleChange}
					placeholder="Short description of the test"
					className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
					rows={3}
				/>
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
					{submitLabel || "Create Test"}
				</button>
			</div>
		</form>
	);
}

export default TestForm;

