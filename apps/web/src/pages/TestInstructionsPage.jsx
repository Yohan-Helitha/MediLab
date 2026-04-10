import React, { useEffect, useMemo, useState } from "react";
import { HiPencilSquare, HiTrash } from "react-icons/hi2";
import { fetchTests } from "../api/testApi";
import {
	fetchTestInstructions,
	createTestInstruction,
	updateTestInstruction,
	deleteTestInstruction,
} from "../api/testInstructionApi";
import Modal from "../components/Modal";
import ToastMessage from "../components/ToastMessage";

function TestInstructionsPage() {
	const [instructions, setInstructions] = useState([]);
	const [allTests, setAllTests] = useState([]);
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [form, setForm] = useState({
		diagnosticTestId: "",
		languageCode: "en",
		preText: "",
		postText: "",
	});
	const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		const load = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const [testsData, instrData] = await Promise.all([
					fetchTests(),
					fetchTestInstructions(),
				]);
				setAllTests(testsData);
				setInstructions(instrData);
			} catch (err) {
				setError(err.message || "Failed to load test instructions");
			} finally {
				setIsLoading(false);
			}
		};
		load();
	}, []);

	// Tests that don't yet have instructions (used when creating new ones)
	const availableTestsForNew = useMemo(() => {
		const usedIds = new Set(
			instructions
				.map((instr) => instr.diagnosticTestId && instr.diagnosticTestId._id)
				.filter(Boolean)
		);
		return allTests.filter((t) => !usedIds.has(t._id));
	}, [allTests, instructions]);

	const openModalForCreate = () => {
		const defaultTestId = availableTestsForNew[0]?._id || "";
		setEditingItem(null);
		setForm({
			diagnosticTestId: defaultTestId,
			languageCode: "en",
			preText: "",
			postText: "",
		});
		setIsModalOpen(true);
	};

	const openModalForEdit = (item) => {
		setEditingItem(item);
		setForm({
			diagnosticTestId: item.diagnosticTestId?._id || "",
			languageCode: item.languageCode || "en",
			preText: (item.preTestInstructions || []).join("\n\n"),
			postText: (item.postTestInstructions || []).join("\n\n"),
		});
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.diagnosticTestId) {
			setError("Please select a test");
			return;
		}
		const payload = {
			diagnosticTestId: form.diagnosticTestId,
			languageCode: form.languageCode,
			preTestInstructions: form.preText
				.split(/\n{2,}/)
				.map((s) => s.trim())
				.filter(Boolean),
			postTestInstructions: form.postText
				.split(/\n{2,}/)
				.map((s) => s.trim())
				.filter(Boolean),
		};

		try {
			let saved;
			if (editingItem) {
				saved = await updateTestInstruction(editingItem._id, payload);
			} else {
				saved = await createTestInstruction(payload);
			}
			// Ensure diagnosticTestId is populated for display
			const test = allTests.find((t) => t._id === payload.diagnosticTestId);
			const enriched = { ...saved, diagnosticTestId: test || saved.diagnosticTestId };
			setInstructions((prev) => {
				const others = prev.filter((i) => i._id !== enriched._id);
				return [enriched, ...others];
			});
			closeModal();
			setToastMessage({
				type: "success",
				text: editingItem
					? "Test instructions updated successfully."
					: "Test instructions created successfully.",
			});
		} catch (err) {
			setError(err.message || "Failed to save instructions");
		}
	};

	const handleDelete = async (item) => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete these instructions?"
		);
		if (!confirmDelete) return;
		try {
			await deleteTestInstruction(item._id);
			setInstructions((prev) => prev.filter((i) => i._id !== item._id));
			setToastMessage({
				type: "success",
				text: "Test instructions deleted successfully.",
			});
		} catch (err) {
			setError(err.message || "Failed to delete instructions");
		}
	};

	const filteredInstructions = useMemo(() => {
		const term = search.toLowerCase();
		if (!term) return instructions;
		return instructions.filter((instr) => {
			const testName = instr.diagnosticTestId?.name || "";
			const pre = (instr.preTestInstructions || []).join(" ");
			const post = (instr.postTestInstructions || []).join(" ");
			return (
				testName.toLowerCase().includes(term) ||
				pre.toLowerCase().includes(term) ||
				post.toLowerCase().includes(term)
			);
		});
	}, [instructions, search]);

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
						Test Instructions
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Manage preparation and post-test instructions for diagnostic tests.
					</p>
				</div>
				<button
					type="button"
					onClick={openModalForCreate}
					disabled={availableTestsForNew.length === 0}
					className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
				>
					+ Add Instructions
				</button>
			</header>

			<div className="max-w-xl">
				<input
					type="text"
					placeholder="Search by test name or instructions..."
					className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			{error && (
				<div className="rounded-md bg-rose-50 px-4 py-2 text-sm text-rose-700">
					{error}
				</div>
			)}

			<div className="space-y-4">
				{isLoading ? (
					<div className="px-4 py-6 text-sm text-slate-500">
						Loading instructions...
					</div>
				) : filteredInstructions.length === 0 ? (
					<div className="px-4 py-6 text-sm text-slate-500">
						No instructions found.
					</div>
				) : (
					filteredInstructions.map((instr) => (
						<TestInstructionCard
							key={instr._id}
							instruction={instr}
							onEdit={() => openModalForEdit(instr)}
							onDelete={() => handleDelete(instr)}
						/>
					))
				)}
			</div>

			<Modal
				isOpen={isModalOpen}
				title={editingItem ? "Edit Test Instructions" : "Add Test Instructions"}
				onClose={closeModal}
			>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label className="block text-xs font-medium text-slate-700">
							Select Test
						</label>
						<select
							name="diagnosticTestId"
							value={form.diagnosticTestId}
							onChange={handleFormChange}
							disabled={!!editingItem}
							className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						>
							{(editingItem ? allTests : availableTestsForNew).map((test) => (
								<option key={test._id} value={test._id}>
									{test.name}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-2">
						<label className="block text-xs font-medium text-slate-700">
							Fasting Required
						</label>
						<select
							name="languageCode"
							value={form.languageCode}
							onChange={handleFormChange}
							className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
						>
							<option value="en">No — No fasting needed</option>
							<option value="si">Yes — Fasting required</option>
						</select>
					</div>
					<div className="space-y-2">
						<label className="block text-xs font-medium text-slate-700">
							Preparation Steps
						</label>
						<textarea
							name="preText"
							value={form.preText}
							onChange={handleFormChange}
							rows={4}
							className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
							placeholder="Describe the preparation steps the patient should follow before the test..."
						/>
					</div>
					<div className="space-y-2">
						<label className="block text-xs font-medium text-slate-700">
							Post-test Precautions
						</label>
						<textarea
							name="postText"
							value={form.postText}
							onChange={handleFormChange}
							rows={4}
							className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
							placeholder="Describe any precautions the patient should take after the test..."
						/>
					</div>
					<div className="flex justify-end gap-3 pt-2">
						<button
							type="button"
							onClick={closeModal}
							className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
						>
							{editingItem ? "Save changes" : "Add Instructions"}
						</button>
					</div>
				</form>
			</Modal>
		</div>
	);
}

function TestInstructionCard({ instruction, onEdit, onDelete }) {
	const testName = instruction.diagnosticTestId?.name || "Unnamed test";
	const fastingLabel =
		instruction.languageCode === "en" ? "No Fasting" : "Fasting Required";

	return (
		<div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<h2 className="text-base font-semibold text-slate-900">
						{testName}
					</h2>
					<div className="mt-1 flex items-center gap-2 text-[11px] font-medium">
						<span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
							{fastingLabel}
						</span>
					</div>
					<div className="mt-4 space-y-3 text-xs text-slate-600">
						<div>
							<div className="mb-1 font-semibold text-slate-800">
								PREPARATION
							</div>
							<p>
								{(instruction.preTestInstructions || []).join(" ") ||
									"No preparation instructions provided."}
							</p>
						</div>
						<div>
							<div className="mb-1 font-semibold text-slate-800">
								POST-TEST
							</div>
							<p>
								{(instruction.postTestInstructions || []).join(" ") ||
									"No post-test instructions provided."}
							</p>
						</div>
					</div>
				</div>
				<div className="mt-1 flex flex-col items-end gap-3 text-slate-400">
					<button
						type="button"
						onClick={onEdit}
						className="hover:text-slate-600"
						aria-label="Edit instructions"
					>
						<HiPencilSquare className="h-5 w-5" />
					</button>
					<button
						type="button"
						onClick={onDelete}
						className="hover:text-rose-500"
						aria-label="Delete instructions"
					>
						<HiTrash className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default TestInstructionsPage;

