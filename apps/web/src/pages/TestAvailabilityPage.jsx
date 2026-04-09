import React, { useEffect, useMemo, useState } from "react";
import { HiBeaker, HiPencilSquare, HiTrash } from "react-icons/hi2";
import { fetchLabs } from "../api/labApi";
import { fetchTests } from "../api/testApi";
import {
	fetchLabTestsByLab,
	updateLabTestStatus,
	updateLabTest,
	deleteLabTest,
	createLabTest,
} from "../api/labTestApi";
import ToggleSwitch from "../components/ToggleSwitch";
import Modal from "../components/Modal";

function TestAvailabilityPage() {
	const [labs, setLabs] = useState([]);
	const [selectedLabId, setSelectedLabId] = useState("");
	const [labTests, setLabTests] = useState([]);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [isLoadingLabs, setIsLoadingLabs] = useState(false);
	const [isLoadingTests, setIsLoadingTests] = useState(false);
	const [error, setError] = useState(null);
	const [allTests, setAllTests] = useState([]);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingLabTest, setEditingLabTest] = useState(null);
	const [editForm, setEditForm] = useState({
		price: "",
		estimatedResultTimeHours: "",
	});
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [addForm, setAddForm] = useState({
		diagnosticTestId: "",
		price: "",
		estimatedResultTimeHours: "",
	});

	useEffect(() => {
		const loadLabs = async () => {
			setIsLoadingLabs(true);
			setError(null);
			try {
				const data = await fetchLabs();
				setLabs(data);
				if (data.length > 0) {
					setSelectedLabId(data[0]._id);
				}
			} catch (err) {
				setError(err.message || "Failed to load labs");
			} finally {
				setIsLoadingLabs(false);
			}
		};
		loadLabs();
	}, []);

	useEffect(() => {
		const loadTests = async () => {
			try {
				const data = await fetchTests();
				setAllTests(data);
			} catch (err) {
				// keep page usable even if tests fetch fails
				console.error("Failed to load tests", err);
			}
		};
		loadTests();
	}, []);

	useEffect(() => {
		const loadLabTests = async () => {
			if (!selectedLabId) {
				setLabTests([]);
				return;
			}
			setIsLoadingTests(true);
			setError(null);
			try {
				const data = await fetchLabTestsByLab(selectedLabId);
				setLabTests(data);
			} catch (err) {
				setError(err.message || "Failed to load tests for lab");
				setLabTests([]);
			} finally {
				setIsLoadingTests(false);
			}
		};
		loadLabTests();
	}, [selectedLabId]);

	const availableTestsForLab = useMemo(() => {
		const assignedIds = new Set(
			labTests
				.map((t) => t.diagnosticTestId && t.diagnosticTestId._id)
				.filter(Boolean)
		);
		return allTests.filter((t) => !assignedIds.has(t._id));
	}, [allTests, labTests]);

	const openEditModal = (labTest) => {
		setEditingLabTest(labTest);
		setEditForm({
			price:
				labTest.price !== undefined && labTest.price !== null
					? String(labTest.price)
					: "",
			estimatedResultTimeHours:
				labTest.estimatedResultTimeHours !== undefined &&
				labTest.estimatedResultTimeHours !== null
					? String(labTest.estimatedResultTimeHours)
					: "",
		});
		setIsEditModalOpen(true);
	};

	const closeEditModal = () => {
		setIsEditModalOpen(false);
		setEditingLabTest(null);
	};

	const handleEditInputChange = (e) => {
		const { name, value } = e.target;
		setEditForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSaveEdit = async (e) => {
		e.preventDefault();
		if (!editingLabTest) return;

		const price = parseFloat(editForm.price);
		const hours = parseFloat(editForm.estimatedResultTimeHours);

		if (Number.isNaN(price) || Number.isNaN(hours)) {
			setError("Price and result time must be valid numbers");
			return;
		}

		try {
			const updated = await updateLabTest(editingLabTest._id, {
				price,
				estimatedResultTimeHours: hours,
			});
			setLabTests((prev) =>
				prev.map((t) =>
					t._id === updated._id
						? {
							...t,
							price: updated.price,
							estimatedResultTimeHours: updated.estimatedResultTimeHours,
						}
						: t
				)
			);
			closeEditModal();
		} catch (err) {
			setError(err.message || "Failed to update test details");
		}
	};

	const openAddModal = () => {
		if (availableTestsForLab.length === 0) return;
		setAddForm({
			diagnosticTestId: availableTestsForLab[0]._id,
			price: "",
			estimatedResultTimeHours: "",
		});
		setIsAddModalOpen(true);
	};

	const closeAddModal = () => {
		setIsAddModalOpen(false);
	};

	const handleAddInputChange = (e) => {
		const { name, value } = e.target;
		setAddForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSaveAdd = async (e) => {
		e.preventDefault();
		if (!selectedLabId) {
			setError("Please select a lab first");
			return;
		}
		if (!addForm.diagnosticTestId) {
			setError("Please select a test to assign");
			return;
		}

		const price = parseFloat(addForm.price);
		const hours = parseFloat(addForm.estimatedResultTimeHours);

		if (Number.isNaN(price) || Number.isNaN(hours)) {
			setError("Price and result time must be valid numbers");
			return;
		}

		try {
			await createLabTest({
				labId: selectedLabId,
				diagnosticTestId: addForm.diagnosticTestId,
				price,
				estimatedResultTimeHours: hours,
			});
			// refresh list so we get populated diagnosticTestId
			const refreshed = await fetchLabTestsByLab(selectedLabId);
			setLabTests(refreshed);
			setIsAddModalOpen(false);
		} catch (err) {
			setError(err.message || "Failed to add test to lab");
		}
	};

	const handleToggleAvailability = async (labTest) => {
		const newStatus =
			labTest.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
		try {
			await updateLabTestStatus(labTest._id, newStatus);
			setLabTests((prev) =>
				prev.map((t) =>
					t._id === labTest._id
						? { ...t, availabilityStatus: newStatus }
						: t
				)
			);
		} catch (err) {
			setError(err.message || "Failed to update availability");
		}
	};

	const handleDeleteLabTest = async (labTest) => {
		const confirmDelete = window.confirm(
			"Are you sure you want to remove this test from this lab?"
		);
		if (!confirmDelete) return;
		try {
			await deleteLabTest(labTest._id);
			setLabTests((prev) => prev.filter((t) => t._id !== labTest._id));
		} catch (err) {
			setError(err.message || "Failed to delete lab test");
		}
	};

	const filteredTests = useMemo(() => {
		return labTests.filter((t) => {
			const diagnostic = t.diagnosticTestId || {};
			const text = `${diagnostic.name || ""} ${
				diagnostic.code || ""
			} ${diagnostic.category || ""}`.toLowerCase();
			const matchesSearch = text.includes(search.toLowerCase());
			const matchesStatus =
				statusFilter === "ALL" || t.availabilityStatus === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [labTests, search, statusFilter]);

	return (
		<div className="space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">
						Test Availability
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Manage diagnostic tests available at each lab center.
					</p>
				</div>
			</header>

			{/* Filters row */}
			<div className="flex items-center gap-4">
				<div className="w-64">
					<select
						className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						value={selectedLabId}
						onChange={(e) => setSelectedLabId(e.target.value)}
						disabled={isLoadingLabs}
					>
						{labs.length === 0 && (
							<option value="">No labs available</option>
						)}
						{labs.map((lab) => (
							<option key={lab._id} value={lab._id}>
								{lab.name}
							</option>
						))}
					</select>
				</div>
				<div className="flex-1 flex gap-3">
					<input
						type="text"
						placeholder="Search tests by name, code or category..."
						className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<select
						className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						<option value="ALL">All Status</option>
						<option value="AVAILABLE">Available</option>
						<option value="UNAVAILABLE">Unavailable</option>
						<option value="TEMPORARILY_SUSPENDED">Temporarily Suspended</option>
					</select>
				</div>
				<div>
					<button
						type="button"
						onClick={openAddModal}
						disabled={
							!selectedLabId || availableTestsForLab.length === 0
						}
						className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
					>
						Add Test
					</button>
				</div>
			</div>

			{error && (
				<div className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700">
					{error}
				</div>
			)}

			{/* Table header */}
			<div className="rounded-t-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
				<div className="grid grid-cols-12 gap-5">
					<div className="col-span-4">Test Name</div>
					<div className="col-span-3">Description</div>
					<div className="col-span-1">Price</div>
					<div className="col-span-2">Result Time</div>
					<div className="col-span-1 text-center">Status</div>
					<div className="col-span-1 text-right">Actions</div>
				</div>
			</div>

			{/* Rows */}
			<div className="space-y-1 rounded-b-xl bg-white p-2 shadow-sm">
				{isLoadingTests ? (
					<div className="px-4 py-6 text-center text-sm text-slate-500">
						Loading tests...
					</div>
				) : filteredTests.length === 0 ? (
					<div className="px-4 py-6 text-center text-sm text-slate-500">
						No tests found for this lab.
					</div>
				) : (
					filteredTests.map((test) => (
						<TestAvailabilityRow
							key={test._id}
							labTest={test}
							onToggleAvailability={() => handleToggleAvailability(test)}
							onEdit={() => openEditModal(test)}
							onDelete={() => handleDeleteLabTest(test)}
						/>
					))
				)}
			</div>

			<Modal
				isOpen={isEditModalOpen}
				title="Edit Test Settings"
				onClose={closeEditModal}
			>
				<form onSubmit={handleSaveEdit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-slate-700">
								Price (Rs)
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								name="price"
								value={editForm.price}
								onChange={handleEditInputChange}
								className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
								required
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-slate-700">
								Result Time (hours)
							</label>
							<input
								type="number"
								step="0.1"
								min="0"
								name="estimatedResultTimeHours"
								value={editForm.estimatedResultTimeHours}
								onChange={handleEditInputChange}
								className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
								required
							/>
						</div>
					</div>
					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={closeEditModal}
							className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
						>
							Save changes
						</button>
					</div>
				</form>
			</Modal>

			<Modal
				isOpen={isAddModalOpen}
				title="Add Test to Lab"
				onClose={closeAddModal}
			>
				<form onSubmit={handleSaveAdd} className="space-y-4">
					<div className="space-y-3">
						<label className="block text-xs font-medium text-slate-700">
							Select Test
						</label>
						<select
							name="diagnosticTestId"
							value={addForm.diagnosticTestId}
							onChange={handleAddInputChange}
							className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						>
							{availableTestsForLab.map((test) => (
								<option key={test._id} value={test._id}>
									{test.name}
								</option>
							))}
						</select>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-xs font-medium text-slate-700">
								Price (Rs)
							</label>
							<input
								type="number"
								step="0.01"
								min="0"
								name="price"
								value={addForm.price}
								onChange={handleAddInputChange}
								className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
								required
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-slate-700">
								Result Time (hours)
							</label>
							<input
								type="number"
								step="0.1"
								min="0"
								name="estimatedResultTimeHours"
								value={addForm.estimatedResultTimeHours}
								onChange={handleAddInputChange}
								className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
								required
							/>
						</div>
					</div>
					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={closeAddModal}
							className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
						>
							Add test
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

function TestAvailabilityRow({ labTest, onToggleAvailability, onEdit, onDelete }) {
	const diagnostic = labTest.diagnosticTestId || {};
	const isAvailable = labTest.availabilityStatus === "AVAILABLE";

	return (
		<div className="rounded-lg px-4 py-3 hover:bg-slate-50">
			<div className="grid grid-cols-12 items-center gap-5 text-sm text-slate-700">
				<div className="col-span-4 flex items-center gap-3">
					<span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600">
						<HiBeaker className="h-5 w-5" />
					</span>
					<div>
						<div className="font-medium text-slate-900">
							{diagnostic.name || "Unnamed test"}
						</div>
						{diagnostic.code && (
							<div className="text-xs text-slate-500">{diagnostic.code}</div>
						)}
					</div>
				</div>
				<div className="col-span-3 text-xs text-slate-600">
					{diagnostic.description || "No description"}
				</div>
				<div className="col-span-1 text-xs font-medium text-slate-900">
					<span className="text-slate-400">Rs</span>{" "}
					{labTest.price != null ? Number(labTest.price).toFixed(2) : "-"}
				</div>
				<div className="col-span-2 text-xs text-slate-600">
					{labTest.estimatedResultTimeHours != null
						? `${labTest.estimatedResultTimeHours} hours`
						: "-"}
				</div>
				<div className="col-span-1 flex justify-center">
					<ToggleSwitch
						checked={isAvailable}
						onChange={onToggleAvailability}
						label={isAvailable ? "Available" : "Unavailable"}
					/>
				</div>
				<div className="col-span-1 flex justify-end gap-3 text-slate-400">
					<button
						type="button"
						onClick={onEdit}
						className="hover:text-slate-600"
						aria-label="Edit test"
					>
						<HiPencilSquare className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={onDelete}
						className="hover:text-rose-500"
						aria-label="Delete test"
					>
						<HiTrash className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default TestAvailabilityPage;

