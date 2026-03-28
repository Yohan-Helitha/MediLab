import React, { useState } from "react";
import Modal from "../components/Modal";
import AdminEquipmentForm from "../components/AdminEquipmentForm";

function AdminInventoryDashboard() {
	const [equipmentItems, setEquipmentItems] = useState([
		{
			id: 1,
			name: "Syringe Pack (5ml)",
			type: "CONSUMABLE",
			availableQuantity: 120,
			reservedQuantity: 40,
			minimumThreshold: 80,
		},
		{
			id: 2,
			name: "Nitrile Gloves (Medium)",
			type: "CONSUMABLE",
			availableQuantity: 60,
			reservedQuantity: 30,
			minimumThreshold: 100,
		},
		{
			id: 3,
			name: "ECG Machine",
			type: "REUSABLE",
			availableQuantity: 4,
			reservedQuantity: 1,
			minimumThreshold: 3,
		},
		{
			id: 4,
			name: "Rapid Test Kits (COVID-19)",
			type: "CONSUMABLE",
			availableQuantity: 25,
			reservedQuantity: 10,
			minimumThreshold: 50,
		},
		{
			id: 5,
			name: "Centrifuge Tubes",
			type: "CONSUMABLE",
			availableQuantity: 150,
			reservedQuantity: 20,
			minimumThreshold: 60,
		},
	]);

	const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
	const [editingEquipment] = useState(null);

	const hasLowStock = equipmentItems.some((item) =>
		item.availableQuantity <= item.minimumThreshold,
	);

	const handleCreateEquipment = (formData) => {
		const newEquipment = {
			id: Date.now(),
			name: formData.name,
			type: formData.type,
			availableQuantity: 0,
			reservedQuantity: 0,
			minimumThreshold: 0,
			// description and isActive are captured in the form; they can be
			// wired to the backend later when APIs are available.
		};
		setEquipmentItems((prev) => [...prev, newEquipment]);
		setIsEquipmentModalOpen(false);
	};

	return (
		<div className="space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Inventory Management
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Track critical lab equipment levels and restock before shortages.
					</p>
				</div>
				<button
					type="button"
					className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
					onClick={() => setIsEquipmentModalOpen(true)}
				>
					+ Add New Equipment
				</button>
			</header>

			<section className="rounded-xl bg-white p-4 shadow-sm">
				<div className="mb-5 flex items-center justify-between gap-4">
					<div>
						<h2 className="text-sm font-semibold text-slate-800">
							Equipment Overview
						</h2>
						<p className="text-xs text-slate-500">
							Monitor available and reserved quantities across key lab items.
						</p>
					</div>
					{hasLowStock && (
						<p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
							Some items are below their safety threshold and need restocking.
						</p>
					)}
				</div>

				{/* Table header */}
				<div className="hidden border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:block">
					<div className="grid grid-cols-12 gap-4">
						<div className="col-span-3">Equipment Name</div>
						<div className="col-span-2">Type</div>
						<div className="col-span-2">Available Qty</div>
						<div className="col-span-2">Reserved Qty</div>
						<div className="col-span-1">Minimum Threshold</div>
						<div className="col-span-1">Status</div>
						<div className="col-span-1 text-right">Actions</div>
					</div>
				</div>

				<div className="divide-y divide-slate-50">
					{equipmentItems.map((item) => (
						<EquipmentRow key={item.id} item={item} />
					))}
				</div>
			</section>

			<Modal
				isOpen={isEquipmentModalOpen}
				title={editingEquipment ? "Edit Equipment" : "Add New Equipment"}
				onClose={() => setIsEquipmentModalOpen(false)}
			>
				<AdminEquipmentForm
					initialValues={editingEquipment || undefined}
					submitLabel={editingEquipment ? "Save Changes" : "Create Equipment"}
					onCancel={() => setIsEquipmentModalOpen(false)}
					onSubmit={handleCreateEquipment}
				/>
			</Modal>
		</div>
	);
}

function getStatusBadgeClasses(isLow) {
	if (isLow) {
		return "bg-rose-100 text-rose-700";
	}
	return "bg-emerald-100 text-emerald-700";
}

function EquipmentRow({ item }) {
	const isLow = item.availableQuantity <= item.minimumThreshold;

	return (
		<div className="py-3 text-sm text-slate-700">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
				<div className="md:col-span-3">
					<div className="font-medium text-slate-900">{item.name}</div>
					<p className="mt-0.5 text-xs text-slate-500">
						{isLow ? "Low stock." : "Stock within safe range."}
					</p>
				</div>
				<div className="md:col-span-2">
					<span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
						{item.type}
					</span>
				</div>
				<div className="md:col-span-2">
					<div className="font-medium text-slate-900">
						{item.availableQuantity}
					</div>
				</div>
				<div className="md:col-span-2">
					<div className="text-sm text-slate-800">
						{item.reservedQuantity}
					</div>
				</div>
				<div className="md:col-span-1">
					<div className="text-sm text-slate-800">
						{item.minimumThreshold}
					</div>
				</div>
				<div className="md:col-span-1 flex items-center">
					<span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(isLow)}`}>
						{isLow ? "Low" : "OK"}
					</span>
				</div>
				<div className="md:col-span-1 flex items-center justify-end">
					<button
						type="button"
						className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
					>
						Restock
					</button>
				</div>
			</div>
		</div>
	);
}

export default AdminInventoryDashboard;
