import React, { useEffect, useState } from "react";
import { HiPencilSquare, HiTrash } from "react-icons/hi2";
import Modal from "../components/Modal";
import LabForm from "../components/LabForm";
import ToastMessage from "../components/ToastMessage";
import { fetchLabs, createLab, updateLab, deleteLab } from "../api/labApi";

function getLabFormErrorMessage(error) {
	// Prefer specific validation messages from the backend when available
	if (error && Array.isArray(error.errors) && error.errors.length > 0) {
		const phoneError = error.errors.find((e) => e.param === "phoneNumber");
		if (phoneError) {
			// Use a user-friendly message for contact number validation
			return "Contact number must have exactly 10 digits.";
		}
		// Fallback: join all validation messages
		return error.errors.map((e) => e.msg).join("; ");
	}
	return (
		(error && error.message) ||
		"Failed to save lab. Please check the form and try again."
	);
}

function LabManagementPage() {
	const [isLabModalOpen, setIsLabModalOpen] = useState(false);
	const [editingLab, setEditingLab] = useState(null);
	const [labs, setLabs] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [formError, setFormError] = useState(null);
	const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		fetchLabs()
			.then((data) => {
				if (isMounted) {
					setLabs(data || []);
				}
			})
			.catch((err) => {
				console.error("Failed to load labs", err);
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});
		return () => {
			isMounted = false;
		};
	}, []);

	const buildPayloadFromForm = (formData) => {
		const payload = {
			name: formData.name,
			district: formData.district,
			phoneNumber: formData.phoneNumber || undefined,
			addressLine1: formData.addressLine1 || undefined,
			operationalStatus: formData.operationalStatus,
		};

		// Optional operating hours parsing: accept formats like
		// "08:30 - 17:30" or "08:30 AM - 5:30 PM".
		if (formData.operatingHoursDisplay) {
			const to24Hour = (value) => {
				if (!value) return undefined;
				// Normalize dots to colons and trim
				let v = value.replace(/\./g, ":").trim();
				const match = v.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
				if (!match) return undefined;
				let hour = parseInt(match[1], 10);
				const minute = parseInt(match[2], 10);
				const suffix = match[3] ? match[3].toUpperCase() : null;
				if (suffix === "AM") {
					if (hour === 12) hour = 0;
				} else if (suffix === "PM") {
					if (hour < 12) hour += 12;
				}
				if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
					return undefined;
				}
				return `${hour.toString().padStart(2, "0")}:${minute
						.toString()
						.padStart(2, "0")}`;
			};

			const parts = formData.operatingHoursDisplay
				.split("-")
				.map((p) => p.trim());
			if (parts.length === 2) {
				const openTime = to24Hour(parts[0]);
				const closeTime = to24Hour(parts[1]);
				if (openTime && closeTime) {
					payload.operatingHours = [
						{
							day: "General",
							openTime,
							closeTime,
						},
					];
				}
			}
		}

		return payload;
	};

	const handleCreateLab = async (formData) => {
		try {
			setFormError(null);
			const payload = buildPayloadFromForm(formData);
			const created = await createLab(payload);
			setLabs((prev) => [...prev, created]);
			setIsLabModalOpen(false);
			setToastMessage({ type: "success", text: "Lab created successfully." });
		} catch (err) {
			console.error("Failed to create lab", err);
			setFormError(getLabFormErrorMessage(err));
		}
	};

	const handleUpdateLab = async (labId, formData) => {
		try {
			setFormError(null);
			const payload = buildPayloadFromForm(formData);
			const updated = await updateLab(labId, payload);
			setLabs((prev) => prev.map((lab) => (lab._id === updated._id ? updated : lab)));
			setIsLabModalOpen(false);
			setEditingLab(null);
			setToastMessage({ type: "success", text: "Lab updated successfully." });
		} catch (err) {
			console.error("Failed to update lab", err);
			setFormError(getLabFormErrorMessage(err));
		}
	};

	const handleDeleteLab = async (labId) => {
		if (!window.confirm("Are you sure you want to delete this lab?")) {
			return;
		}
		try {
			await deleteLab(labId);
			setLabs((prev) => prev.filter((lab) => lab._id !== labId));
			setToastMessage({ type: "success", text: "Lab deleted successfully." });
		} catch (err) {
			console.error("Failed to delete lab", err);
			alert(err.message || "Failed to delete lab. Check console for details.");
		}
	};

	const filteredLabs = labs.filter((lab) => {
		if (!searchTerm) return true;
		const term = searchTerm.toLowerCase();
		const name = (lab.name || "").toLowerCase();
		const district = (lab.district || "").toLowerCase();
		return name.includes(term) || district.includes(term);
	});

	// Simple static layout matching the Lab Management screenshot
	return (
		<div className="space-y-6">
			<ToastMessage
				type={toastMessage.type}
				text={toastMessage.text}
				onClose={() => setToastMessage({ type: "", text: "" })}
			/>
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">
						Lab Management
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Manage registered diagnostic centers and their details.
					</p>
				</div>
				<button
					onClick={() => {
						setEditingLab(null);
						setIsLabModalOpen(true);
					}}
					className="rounded-md bg-teal-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-700"
				>
					+ Add New Lab
				</button>
			</header>

			{/* Search bar */}
			<div className="rounded-xl bg-white p-4 shadow-sm">
				<input
					type="text"
					placeholder="Search labs by name or district..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
				/>
			</div>

			{/* Table header */}
			<div className="rounded-t-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-4">Lab Name</div>
					<div className="col-span-3">Contact Info</div>
					<div className="col-span-3">Operating Hours</div>
					<div className="col-span-1">Status</div>
					<div className="col-span-1 text-right">Actions</div>
				</div>
			</div>

			{/* Static lab rows */}
			<div className="space-y-1 rounded-b-xl bg-white p-2 shadow-sm">
				{isLoading && (
					<div className="px-4 py-3 text-sm text-slate-500">
						Loading labs...
					</div>
				)}
				{!isLoading && filteredLabs.length === 0 && (
					<div className="px-4 py-3 text-sm text-slate-500">
						No labs found.
					</div>
				)}
				{!isLoading &&
					filteredLabs.map((lab) => {
						const firstOperating = lab.operatingHours && lab.operatingHours[0];
						const hours = firstOperating
							? `${firstOperating.openTime} - ${firstOperating.closeTime}`
							: "";
						return (
							<LabRow
								key={lab._id}
								id={lab._id}
								name={lab.name}
								district={lab.district}
								phone={lab.phoneNumber}
								address={lab.addressLine1}
								hours={hours}
								status={lab.operationalStatus}
								statusColor={getStatusColor(lab.operationalStatus)}
								onEdit={() => {
									setEditingLab(lab);
									setIsLabModalOpen(true);
								}}
								onDelete={() => handleDeleteLab(lab._id)}
							/>
						);
					})}
			</div>

			<Modal
				isOpen={isLabModalOpen}
				title={editingLab ? "Edit Lab" : "Add New Lab"}
				onClose={() => {
					setIsLabModalOpen(false);
					setEditingLab(null);
				}}
			>
				<LabForm
					initialValues={buildInitialFormValues(editingLab)}
					submitLabel={editingLab ? "Save Changes" : "Create Lab"}
						// Inline error message shown above the form fields
						errorMessage={formError}
					onCancel={() => {
						setIsLabModalOpen(false);
						setEditingLab(null);
							setFormError(null);
					}}
					onSubmit={(data) => {
						if (editingLab) {
							return handleUpdateLab(editingLab._id, data);
						}
						return handleCreateLab(data);
					}}
				/>
			</Modal>
		</div>
	);
}

function buildInitialFormValues(lab) {
	if (!lab) return undefined;
	const firstOperating = lab.operatingHours && lab.operatingHours[0];
	const operatingHoursDisplay = firstOperating
		? `${firstOperating.openTime} - ${firstOperating.closeTime}`
		: "";
	return {
		name: lab.name || "",
		district: lab.district || "",
		phoneNumber: lab.phoneNumber || "",
		addressLine1: lab.addressLine1 || "",
		operatingHoursDisplay,
		operationalStatus: lab.operationalStatus || "OPEN",
	};
}

function getStatusColor(status) {
	switch (status) {
		case "OPEN":
			return "bg-teal-100 text-teal-700";
		case "CLOSED":
			return "bg-rose-100 text-rose-700";
		case "HOLIDAY":
			return "bg-amber-100 text-amber-700";
		case "MAINTENANCE":
			return "bg-slate-100 text-slate-700";
		default:
			return "bg-slate-100 text-slate-700";
	}
}

function LabRow({ name, district, phone, address, hours, status, statusColor, onEdit, onDelete }) {
	return (
		<div className="rounded-lg px-4 py-3 hover:bg-slate-50">
			<div className="grid grid-cols-12 items-center gap-4 text-sm text-slate-700">
				<div className="col-span-4">
					<div className="font-medium text-slate-900">{name}</div>
					<div className="text-xs text-slate-500">{district}</div>
				</div>
				<div className="col-span-3 text-xs">
					<div>{phone}</div>
					<div className="text-slate-500">{address}</div>
				</div>
				<div className="col-span-3 text-xs text-slate-600">{hours}</div>
				<div className="col-span-1">
					<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>
						{status}
					</span>
				</div>
				<div className="col-span-1 flex justify-end gap-3 text-slate-400">
					<button
						onClick={onEdit}
						className="hover:text-slate-600"
						aria-label="Edit lab"
					>
						<HiPencilSquare className="h-4 w-4" />
					</button>
					<button
						onClick={onDelete}
						className="hover:text-rose-500"
						aria-label="Delete lab"
					>
						<HiTrash className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default LabManagementPage;

