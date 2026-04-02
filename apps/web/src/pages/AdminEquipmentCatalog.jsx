import React, { useEffect, useState } from "react";
import Modal from "../components/Modal";
import AdminEquipmentForm from "../components/AdminEquipmentForm";
import {
	fetchEquipment,
	createEquipment,
	updateEquipment,
	softDeleteEquipment,
} from "../api/equipmentApi";

function AdminEquipmentCatalog() {
	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		setError("");
		fetchEquipment()
			.then((data) => {
				if (!isMounted) return;
				setItems(data || []);
			})
			.catch((err) => {
				console.error("Failed to load equipment", err);
				if (isMounted) setError(err.message || "Failed to load equipment");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});
		return () => {
			isMounted = false;
		};
	}, []);

	const openCreateModal = () => {
		setEditingItem(null);
		setIsModalOpen(true);
	};

	const openEditModal = (item) => {
		setEditingItem(item);
		setIsModalOpen(true);
	};

	const handleSubmitForm = async (formData) => {
		try {
			if (editingItem) {
				const updated = await updateEquipment(editingItem._id, formData);
				setItems((prev) =>
					prev.map((it) => (it._id === updated._id ? updated : it)),
				);
			} else {
				const created = await createEquipment(formData);
				setItems((prev) => [...prev, created]);
			}
			setIsModalOpen(false);
			setEditingItem(null);
		} catch (err) {
			console.error("Failed to save equipment", err);
			alert(err.message || "Failed to save equipment.");
		}
	};

	const handleSoftDelete = async (id) => {
		if (!window.confirm("Disable this equipment? It will no longer be active.")) {
			return;
		}
		try {
			const updated = await softDeleteEquipment(id);
			setItems((prev) =>
				prev.map((it) => (it._id === updated._id ? updated : it)),
			);
		} catch (err) {
			console.error("Failed to disable equipment", err);
			alert(err.message || "Failed to disable equipment.");
		}
	};

	return (
		<div className="space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Equipment Catalog
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Manage master list of lab equipment used across all centers.
					</p>
				</div>
				<button
					type="button"
					className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
					onClick={openCreateModal}
				>
					+ Add Equipment
				</button>
			</header>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-sm font-semibold text-slate-800">
						Equipment List
					</h2>
				</div>
				{error && (
					<div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
						{error}
					</div>
				)}

				<div className="hidden border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:block">
					<div className="grid grid-cols-12 gap-4">
						<div className="col-span-5">Name</div>
						<div className="col-span-2">Type</div>
						<div className="col-span-3">Description</div>
						<div className="col-span-1">Status</div>
						<div className="col-span-1 text-right">Actions</div>
					</div>
				</div>

				<div className="divide-y divide-slate-50">
					{isLoading && (
						<div className="py-4 text-sm text-slate-500">Loading equipment...</div>
					)}
					{!isLoading && items.length === 0 && (
						<div className="py-4 text-sm text-slate-500">
							No equipment defined yet.
						</div>
					)}
					{!isLoading &&
						items.map((item) => (
							<EquipmentRow
								key={item._id}
								item={item}
								onEdit={() => openEditModal(item)}
								onSoftDelete={() => handleSoftDelete(item._id)}
							/>
						))}
				</div>
			</section>

			<Modal
				isOpen={isModalOpen}
				title={editingItem ? "Edit Equipment" : "Add Equipment"}
				onClose={() => {
					setIsModalOpen(false);
					setEditingItem(null);
				}}
			>
				<AdminEquipmentForm
					initialValues={editingItem || undefined}
					submitLabel={editingItem ? "Save Changes" : "Create Equipment"}
					onCancel={() => {
						setIsModalOpen(false);
						setEditingItem(null);
					}}
					onSubmit={handleSubmitForm}
				/>
			</Modal>
		</div>
	);
}

function EquipmentRow({ item, onEdit, onSoftDelete }) {
	const statusLabel = item.isActive ? "Active" : "Disabled";
	const statusClasses = item.isActive
		? "bg-emerald-100 text-emerald-700"
		: "bg-slate-100 text-slate-600";

	return (
		<div className="py-3 text-sm text-slate-700">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
				<div className="md:col-span-5">
					<div className="font-medium text-slate-900">{item.name}</div>
				</div>
				<div className="md:col-span-2">
					<span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
						{item.type}
					</span>
				</div>
				<div className="md:col-span-3">
					<p className="text-xs text-slate-600">
						{item.description || "—"}
					</p>
				</div>
				<div className="md:col-span-1 flex items-center">
					<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses}`}>
						{statusLabel}
					</span>
				</div>
				<div className="md:col-span-1 flex items-center justify-end gap-2">
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
						onClick={onSoftDelete}
					>
						Disable
					</button>
				</div>
			</div>
		</div>
	);
}

export default AdminEquipmentCatalog;
