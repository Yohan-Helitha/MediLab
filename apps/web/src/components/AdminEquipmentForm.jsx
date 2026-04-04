import React, { useEffect, useState } from "react";

// Form for creating or editing an Equipment record.
// Mirrors the backend equipment model: name, type, description, isActive.
function AdminEquipmentForm({ onSubmit, onCancel, initialValues, submitLabel }) {
	const isEdit = Boolean(initialValues && initialValues._id);

	const [formData, setFormData] = useState(() => ({
		name: initialValues?.name || "",
		type: initialValues?.type || "CONSUMABLE",
		description: initialValues?.description || "",
		isActive: initialValues?.isActive ?? true,
		initialQuantity: "",
		minimumThreshold: "",
	}));

	useEffect(() => {
		setFormData({
			name: initialValues?.name || "",
			type: initialValues?.type || "CONSUMABLE",
			description: initialValues?.description || "",
			isActive: initialValues?.isActive ?? true,
			initialQuantity: "",
			minimumThreshold: "",
		});
	}, [initialValues]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!onSubmit) return;

		const { name, type, description, isActive, initialQuantity, minimumThreshold } =
			formData;

		const payload = {
			name,
			type,
			description,
			isActive,
		};

		// Only send initialQuantity / minimumThreshold when creating
		if (!isEdit) {
			if (initialQuantity !== "" && initialQuantity !== null) {
				payload.initialQuantity = Number(initialQuantity);
			}
			if (minimumThreshold !== "" && minimumThreshold !== null) {
				payload.minimumThreshold = Number(minimumThreshold);
			}
		}

		onSubmit(payload);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="space-y-1 md:col-span-2">
					<label className="text-sm font-medium text-slate-700">
						Equipment Name
					</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						placeholder="e.g. Syringe Pack (5ml)"
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						required
					/>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Type
					</label>
					<select
						name="type"
						value={formData.type}
						onChange={handleChange}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					>
						<option value="CONSUMABLE">Consumable</option>
						<option value="REUSABLE">Reusable</option>
					</select>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium text-slate-700">
						Status
					</label>
					<div className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
						<input
							id="equipment-is-active"
							type="checkbox"
							name="isActive"
							checked={formData.isActive}
							onChange={handleChange}
							className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
						/>
						<label
							htmlFor="equipment-is-active"
							className="select-none text-slate-700"
						>
							Active
						</label>
					</div>
				</div>

				{!isEdit && (
					<>
						<div className="space-y-1">
							<label className="text-sm font-medium text-slate-700">
								Initial Quantity (optional)
							</label>
							<input
								type="number"
								name="initialQuantity"
								min={0}
								step={1}
								value={formData.initialQuantity}
								onChange={handleChange}
								placeholder="e.g. 100"
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-slate-700">
								Minimum Threshold (optional)
							</label>
							<input
								type="number"
								name="minimumThreshold"
								min={0}
								step={1}
								value={formData.minimumThreshold}
								onChange={handleChange}
								placeholder="e.g. 10"
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							/>
						</div>
					</>
				)}
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium text-slate-700">
					Description (optional)
				</label>
				<textarea
					name="description"
					value={formData.description}
					onChange={handleChange}
					rows={3}
					placeholder="Short note about how this equipment is used."
					className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
					{submitLabel || "Create Equipment"}
				</button>
			</div>
		</form>
	);
}

export default AdminEquipmentForm;
