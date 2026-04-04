import React, { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import { fetchTestTypes } from "../api/testApi";
import { fetchEquipment } from "../api/equipmentApi";
import {
	fetchTestEquipmentRequirements,
	upsertTestEquipmentRequirement,
	deactivateTestEquipmentRequirement,
} from "../api/inventoryRequirementsApi";

function AdminTestEquipmentRequirements() {
	const [testTypes, setTestTypes] = useState([]);
	const [selectedTestTypeId, setSelectedTestTypeId] = useState("");
	const [requirements, setRequirements] = useState([]);
	const [equipmentOptions, setEquipmentOptions] = useState([]);
	const [isLoadingTests, setIsLoadingTests] = useState(false);
	const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRequirement, setEditingRequirement] = useState(null);

	useEffect(() => {
		let isMounted = true;
		setIsLoadingTests(true);
		setError("");
		Promise.all([fetchTestTypes(), fetchEquipment()])
			.then(([tests, equipment]) => {
				if (!isMounted) return;
				setTestTypes(tests || []);
				setEquipmentOptions(equipment || []);
				if (tests && tests.length > 0) {
					setSelectedTestTypeId((prev) => prev || tests[0]._id);
				}
			})
			.catch((err) => {
				console.error("Failed to load tests or equipment", err);
				if (isMounted)
					setError(err.message || "Failed to load tests or equipment.");
			})
			.finally(() => {
				if (isMounted) setIsLoadingTests(false);
			});
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!selectedTestTypeId) {
			setRequirements([]);
			return;
		}
		let isMounted = true;
		setIsLoadingRequirements(true);
		setError("");
		fetchTestEquipmentRequirements(selectedTestTypeId)
			.then((data) => {
				if (!isMounted) return;
				setRequirements(data.items || []);
			})
			.catch((err) => {
				console.error("Failed to load requirements", err);
				if (isMounted)
					setError(err.message || "Failed to load equipment requirements.");
			})
			.finally(() => {
				if (isMounted) setIsLoadingRequirements(false);
			});
		return () => {
			isMounted = false;
		};
	}, [selectedTestTypeId]);

	const filteredTests = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return testTypes;
		return testTypes.filter((t) => {
			const nameMatch = t.name?.toLowerCase().includes(term);
			const categoryMatch = t.category?.toLowerCase().includes(term);
			return nameMatch || categoryMatch;
		});
	}, [testTypes, searchTerm]);

	const selectedTestType = useMemo(
		() => testTypes.find((t) => t._id === selectedTestTypeId) || null,
		[testTypes, selectedTestTypeId],
	);

	const openCreateModal = () => {
		setEditingRequirement(null);
		setIsModalOpen(true);
	};

	const openEditModal = (req) => {
		setEditingRequirement(req);
		setIsModalOpen(true);
	};

	const handleSubmitRequirement = async (formData) => {
		if (!selectedTestTypeId) return;
		try {
			const payload = {
				id: editingRequirement?._id,
				testTypeId: selectedTestTypeId,
				equipmentId: formData.equipmentId,
				quantityPerTest: Number(formData.quantityPerTest),
				isActive: formData.isActive,
			};
			const result = await upsertTestEquipmentRequirement(payload);
			const saved = result.requirement || result; // controller wraps as { requirement }
			setRequirements((prev) => {
				const existingIndex = prev.findIndex((r) => r._id === saved._id);
				if (existingIndex >= 0) {
					const copy = [...prev];
					copy[existingIndex] = saved;
					return copy;
				}
				return [...prev, saved];
			});
			setIsModalOpen(false);
			setEditingRequirement(null);
		} catch (err) {
			console.error("Failed to save requirement", err);
			alert(err.message || "Failed to save equipment requirement.");
		}
	};

	const handleDeactivate = async (id) => {
		if (!window.confirm("Deactivate this requirement?")) return;
		try {
			const result = await deactivateTestEquipmentRequirement(id);
			const updated = result.requirement || result;
			setRequirements((prev) =>
				prev.map((r) => (r._id === updated._id ? updated : r)),
			);
		} catch (err) {
			console.error("Failed to deactivate requirement", err);
			alert(err.message || "Failed to deactivate requirement.");
		}
	};

	return (
		<div className="grid gap-6 md:grid-cols-12">
			<section className="md:col-span-4 rounded-xl bg-white p-4 shadow-sm">
				<h2 className="text-sm font-semibold text-slate-800">
					Test Types
				</h2>
				<p className="mt-1 text-xs text-slate-500">
					Select a diagnostic test to configure required equipment.
				</p>
				<div className="mt-3">
					<input
						type="text"
						placeholder="Search by name or category..."
						className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
					{isLoadingTests && (
						<div className="py-2 text-xs text-slate-500">
							Loading test types...
						</div>
					)}
					{!isLoadingTests && filteredTests.length === 0 && (
						<div className="py-2 text-xs text-slate-500">
							No test types found.
						</div>
					)}
					{!isLoadingTests &&
						filteredTests.map((t) => {
							const isActive = t._id === selectedTestTypeId;
							return (
								<button
									key={t._id}
									type="button"
									className={`flex w-full flex-col rounded-lg px-3 py-2 text-left text-xs ${
										isActive
											? "bg-teal-50 text-teal-900"
											: "hover:bg-slate-50 text-slate-700"
									}`}
									onClick={() => setSelectedTestTypeId(t._id)}
								>
									<span className="font-medium">{t.name}</span>
									<span className="mt-0.5 text-[11px] text-slate-500">
										{t.category || "Uncategorized"}
									</span>
								</button>
							);
						})}
				</div>
			</section>

			<section className="md:col-span-8 rounded-xl bg-white p-4 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h2 className="text-sm font-semibold text-slate-800">
							Required Equipment
						</h2>
						<p className="mt-1 text-xs text-slate-500">
							Configure what equipment and quantity is reserved for
							{" "}
							<span className="font-medium">
								{selectedTestType?.name || "the selected test"}
							</span>
							.
						</p>
					</div>
					<button
						type="button"
						className="rounded-md bg-teal-600 px-4 py-2 text-xs font-medium text-white hover:bg-teal-700"
						onClick={openCreateModal}
						disabled={!selectedTestTypeId}
					>
						+ Add Requirement
					</button>
				</div>

				{error && (
					<div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
						{error}
					</div>
				)}

				<div className="hidden border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:block">
					<div className="grid grid-cols-12 gap-4">
						<div className="col-span-4">Equipment</div>
						<div className="col-span-2">Type</div>
						<div className="col-span-2">Quantity / Test</div>
						<div className="col-span-2">Status</div>
						<div className="col-span-2 text-right">Actions</div>
					</div>
				</div>

				<div className="divide-y divide-slate-50">
					{isLoadingRequirements && (
						<div className="py-4 text-sm text-slate-500">
							Loading requirements...
						</div>
					)}
					{!isLoadingRequirements && requirements.length === 0 && (
						<div className="py-4 text-sm text-slate-500">
							No equipment requirements defined for this test.
						</div>
					)}
					{!isLoadingRequirements &&
						requirements.map((req) => (
							<RequirementRow
								key={req._id}
								req={req}
								onEdit={() => openEditModal(req)}
								onDeactivate={() => handleDeactivate(req._id)}
							/>
						))}
				</div>
			</section>

			<RequirementModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingRequirement(null);
				}}
				equipmentOptions={equipmentOptions}
				initialValues={editingRequirement}
				onSubmit={handleSubmitRequirement}
			/>
		</div>
	);
}

function RequirementRow({ req, onEdit, onDeactivate }) {
	const equipmentName = req.equipmentId?.name || "Unknown equipment";
	const equipmentType = req.equipmentId?.type || "-";
	const isActive = req.isActive;
	const statusLabel = isActive ? "Active" : "Inactive";
	const statusClasses = isActive
		? "bg-emerald-100 text-emerald-700"
		: "bg-slate-100 text-slate-600";

	return (
		<div className="py-3 text-sm text-slate-700">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
				<div className="md:col-span-4">
					<div className="font-medium text-slate-900">{equipmentName}</div>
				</div>
				<div className="md:col-span-2">
					<span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
						{equipmentType}
					</span>
				</div>
				<div className="md:col-span-2">
					<div className="font-medium text-slate-900">
						{req.quantityPerTest}
					</div>
				</div>
				<div className="md:col-span-2 flex items-center">
					<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses}`}>
						{statusLabel}
					</span>
				</div>
				<div className="md:col-span-2 flex items-center justify-end gap-2">
					<button
						type="button"
						className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
						onClick={onEdit}
					>
						Edit
					</button>
					<button
						type="button"
						className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
						onClick={onDeactivate}
					>
						Deactivate
					</button>
				</div>
			</div>
		</div>
	);
}

function RequirementModal({ isOpen, onClose, equipmentOptions, initialValues, onSubmit }) {
	const [formData, setFormData] = useState(() => ({
		equipmentId: initialValues?.equipmentId?._id || "",
		quantityPerTest: initialValues?.quantityPerTest?.toString() || "1",
		isActive: initialValues?.isActive ?? true,
	}));

	useEffect(() => {
		setFormData({
			equipmentId: initialValues?.equipmentId?._id || "",
			quantityPerTest: initialValues?.quantityPerTest?.toString() || "1",
			isActive: initialValues?.isActive ?? true,
		});
	}, [initialValues]);

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		if (!formData.equipmentId) {
			alert("Please select equipment.");
			return;
		}
		if (!formData.quantityPerTest || Number(formData.quantityPerTest) <= 0) {
			alert("Quantity per test must be greater than zero.");
			return;
		}
		onSubmit(formData);
	};

	return (
		<Modal isOpen={isOpen} title={initialValues ? "Edit Requirement" : "Add Requirement"} onClose={onClose}>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-xs font-medium text-slate-600">
						Equipment
					</label>
					<select
						name="equipmentId"
						className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						value={formData.equipmentId}
						onChange={handleChange}
					>
						<option value="">Select equipment...</option>
						{equipmentOptions.map((e) => (
							<option key={e._id} value={e._id}>
								{e.name} ({e.type})
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-xs font-medium text-slate-600">
						Quantity per test
					</label>
					<input
						name="quantityPerTest"
						type="number"
						min="1"
						className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						value={formData.quantityPerTest}
						onChange={handleChange}
					/>
				</div>
				<div className="flex items-center gap-2">
					<input
						id="req-is-active"
						name="isActive"
						type="checkbox"
						className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
						checked={formData.isActive}
						onChange={handleChange}
					/>
					<label
						htmlFor="req-is-active"
						className="text-xs text-slate-700"
					>
						Active for this test
					</label>
				</div>
				<div className="flex justify-end gap-2">
					<button
						type="button"
						className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
					>
						Save Requirement
					</button>
				</div>
			</form>
		</Modal>
	);
}

export default AdminTestEquipmentRequirements;
