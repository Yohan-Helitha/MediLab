import React, { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";
import AdminEquipmentForm from "../components/AdminEquipmentForm";
import { fetchLabs } from "../api/labApi";
import { fetchInventoryStock, restockInventory } from "../api/inventoryApi";

function AdminInventoryDashboard() {
	const [labs, setLabs] = useState([]);
	const [selectedLabId, setSelectedLabId] = useState("");
	const [equipmentItems, setEquipmentItems] = useState([]);
	const [isLoadingLabs, setIsLoadingLabs] = useState(false);
	const [isLoadingInventory, setIsLoadingInventory] = useState(false);
	const [error, setError] = useState("");
	const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
	const [editingEquipment] = useState(null);
	const [isRestocking, setIsRestocking] = useState(false);
	const [restockTarget, setRestockTarget] = useState(null);
	const [restockQuantity, setRestockQuantity] = useState("10");

	useEffect(() => {
		let isMounted = true;
		setIsLoadingLabs(true);
		fetchLabs()
			.then((data) => {
				if (!isMounted) return;
				setLabs(data || []);
				if (data && data.length > 0) {
					setSelectedLabId((prev) => prev || data[0]._id);
				}
			})
			.catch((err) => {
				console.error("Failed to load labs", err);
				if (isMounted) setError(err.message || "Failed to load labs");
			})
			.finally(() => {
				if (isMounted) setIsLoadingLabs(false);
			});
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!selectedLabId) {
			setEquipmentItems([]);
			return;
		}

		let isMounted = true;
		setIsLoadingInventory(true);
		setError("");
		fetchInventoryStock(selectedLabId)
			.then((data) => {
				if (!isMounted) return;
				const items = (data.items || []).map((row) => ({
					id: row._id,
					name: row.equipmentId?.name || "Unknown equipment",
					type: row.equipmentId?.type || "-",
					availableQuantity: row.availableQuantity ?? 0,
					reservedQuantity: row.reservedQuantity ?? 0,
					minimumThreshold: row.minimumThreshold ?? 0,
					equipmentId: row.equipmentId?._id || null,
				}));
				setEquipmentItems(items);
			})
			.catch((err) => {
				console.error("Failed to load inventory", err);
				if (isMounted)
					setError(err.message || "Failed to load inventory for the lab");
			})
			.finally(() => {
				if (isMounted) setIsLoadingInventory(false);
			});
		return () => {
			isMounted = false;
		};
	}, [selectedLabId]);

	const hasLowStock = useMemo(
		() =>
			equipmentItems.some(
				(item) => item.availableQuantity <= item.minimumThreshold,
			),
		[equipmentItems],
	);

	const handleCreateEquipment = (formData) => {
		const newEquipment = {
			id: Date.now(),
			name: formData.name,
			type: formData.type,
			availableQuantity: 0,
			reservedQuantity: 0,
			minimumThreshold: 0,
		};
		setEquipmentItems((prev) => [...prev, newEquipment]);
		setIsEquipmentModalOpen(false);
	};

	const handleOpenRestock = (item) => {
		setRestockTarget(item);
		setRestockQuantity("10");
		setIsRestocking(true);
	};

	const handleConfirmRestock = async (event) => {
		if (event) event.preventDefault();
		if (!restockTarget || !selectedLabId) {
			setIsRestocking(false);
			return;
		}
		const quantityNumber = parseInt(restockQuantity, 10);
		if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
			alert("Please enter a valid positive quantity to restock.");
			return;
		}
		try {
			await restockInventory({
				healthCenterId: selectedLabId,
				equipmentId: restockTarget.equipmentId,
				quantity: quantityNumber,
			});
			setIsRestocking(false);
			setRestockTarget(null);
			setRestockQuantity("10");
			setIsLoadingInventory(true);
			const data = await fetchInventoryStock(selectedLabId);
			const items = (data.items || []).map((row) => ({
				id: row._id,
				name: row.equipmentId?.name || "Unknown equipment",
				type: row.equipmentId?.type || "-",
				availableQuantity: row.availableQuantity ?? 0,
				reservedQuantity: row.reservedQuantity ?? 0,
				minimumThreshold: row.minimumThreshold ?? 0,
				equipmentId: row.equipmentId?._id || null,
			}));
			setEquipmentItems(items);
		} catch (err) {
			console.error("Failed to restock equipment", err);
			alert(err.message || "Failed to restock equipment.");
		} finally {
			setIsLoadingInventory(false);
		}
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
				<div className="flex items-center gap-3">
					<div>
						<label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
							Health Center
						</label>
						<select
							className="mt-1 w-52 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
							value={selectedLabId}
							onChange={(e) => setSelectedLabId(e.target.value)}
							disabled={isLoadingLabs}
						>
							{isLoadingLabs && <option>Loading labs...</option>}
							{!isLoadingLabs && labs.length === 0 && (
								<option value="">No labs available</option>
							)}
							{!isLoadingLabs && labs.length > 0 && (
								<>
									{labs.map((lab) => (
										<option key={lab._id} value={lab._id}>
											{lab.name}
										</option>
									))}
								</>
							)}
						</select>
					</div>
					<button
						type="button"
						className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
						onClick={() => setIsEquipmentModalOpen(true)}
					>
						+ Add New Equipment
					</button>
				</div>
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

				{error && (
					<div className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
						{error}
					</div>
				)}

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
					{isLoadingInventory && (
						<div className="py-4 text-sm text-slate-500">
							Loading inventory...
						</div>
					)}
					{!isLoadingInventory && equipmentItems.length === 0 && (
						<div className="py-4 text-sm text-slate-500">
							No inventory records found for this health center.
						</div>
					)}
					{!isLoadingInventory &&
						equipmentItems.map((item) => (
							<EquipmentRow
								key={item.id}
								item={item}
								onRestock={() => handleOpenRestock(item)}
							/>
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

			<Modal
				isOpen={isRestocking}
				title="Restock Equipment"
				onClose={() => {
					setIsRestocking(false);
					setRestockTarget(null);
				}}
			>
				<form onSubmit={handleConfirmRestock} className="space-y-4">
					<p className="text-sm text-slate-700">
						Enter the quantity to add to
						{" "}
						<span className="font-medium">
							{restockTarget?.name || "selected equipment"}
						</span>
						.
					</p>
					<div>
						<label className="block text-xs font-medium text-slate-600">
							Quantity to add
						</label>
						<input
							type="number"
							min="1"
							className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
							value={restockQuantity}
							onChange={(e) => setRestockQuantity(e.target.value)}
						/>
					</div>
					<div className="flex justify-end gap-2">
						<button
							type="button"
							className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
							onClick={() => {
								setIsRestocking(false);
								setRestockTarget(null);
							}}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
						>
							Confirm Restock
						</button>
					</div>
				</form>
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

function EquipmentRow({ item, onRestock }) {
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
						onClick={onRestock}
					>
						Restock
					</button>
				</div>
			</div>
		</div>
	);
}

export default AdminInventoryDashboard;
