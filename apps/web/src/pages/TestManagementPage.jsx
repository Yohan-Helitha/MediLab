import React, { useEffect, useState } from "react";
import { HiBeaker, HiPencilSquare, HiTrash } from "react-icons/hi2";
import Modal from "../components/Modal";
import TestForm from "../components/TestForm";
import ToastMessage from "../components/ToastMessage";
import { fetchTests, createTest, updateTest, deleteTest } from "../api/testApi";

function TestManagementPage() {
	const [tests, setTests] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingTest, setEditingTest] = useState(null);
	const [search, setSearch] = useState("");
	const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		fetchTests()
			.then((data) => {
				if (isMounted) {
					setTests(data || []);
				}
			})
			.catch((err) => {
				console.error("Failed to load tests", err);
				alert(err.message || "Failed to load tests. Check console for details.");
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
			code: formData.code,
			category: formData.category,
			entryMethod: formData.entryMethod,
			discriminatorType: formData.discriminatorType,
			description: formData.description || undefined,
		};

		// Backend requires reportTemplate for form-based tests.
		// Auto-generate a sensible default path from the test code
		// so users don't have to type it manually yet.
		if (formData.entryMethod === "form") {
			const codeSlug = (formData.code || formData.name || "report")
				.toString()
				.trim()
				.toLowerCase()
				.replace(/\s+/g, "-");
			payload.reportTemplate = `/templates/${codeSlug}-report-template.json`;
		}

		return payload;
	};

	const handleCreateTest = async (formData) => {
		try {
			const payload = buildPayloadFromForm(formData);
			const created = await createTest(payload);
			setTests((prev) => [...prev, created]);
			setIsModalOpen(false);
		} catch (err) {
			console.error("Failed to create test", err);
			alert(err.message || "Failed to create test. Check console for details.");
		}
	};

	const handleUpdateTest = async (id, formData) => {
		try {
			const payload = buildPayloadFromForm(formData);
			const updated = await updateTest(id, payload);
			setTests((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
			setIsModalOpen(false);
			setEditingTest(null);
			setToastMessage({ type: "success", text: "Test updated successfully." });
		} catch (err) {
			console.error("Failed to update test", err);
			alert(err.message || "Failed to update test. Check console for details.");
		}
	};

	const handleDeleteTest = async (id) => {
		if (!window.confirm("Are you sure you want to delete this test type?")) {
			return;
		}
		try {
			await deleteTest(id);
			setTests((prev) => prev.filter((t) => t._id !== id));
			setToastMessage({ type: "success", text: "Test deleted successfully." });
		} catch (err) {
			console.error("Failed to delete test", err);
			alert(err.message || "Failed to delete test. Check console for details.");
		}
	};

	const filteredTests = tests.filter((t) => {
		if (!search) return true;
		const term = search.toLowerCase();
		return (
			(t.name && t.name.toLowerCase().includes(term)) ||
			(t.code && t.code.toLowerCase().includes(term)) ||
			(t.category && t.category.toLowerCase().includes(term))
		);
	});

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
						Test Management
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Manage the master list of diagnostic tests.
					</p>
				</div>
				<button
					onClick={() => {
						setEditingTest(null);
						setIsModalOpen(true);
					}}
					className="rounded-md bg-teal-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-700"
				>
					+ Add New Test
				</button>
			</header>

			<div className="rounded-xl bg-white p-4 shadow-sm">
				<input
					type="text"
					placeholder="Search tests by name, code, or category..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
				/>
			</div>

			<div className="rounded-t-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-6">Test</div>
					<div className="col-span-5">Category & Method</div>
					<div className="col-span-1 text-right">Actions</div>
				</div>
			</div>

			<div className="space-y-1 rounded-b-xl bg-white p-2 shadow-sm">
				{isLoading && (
					<div className="px-4 py-3 text-sm text-slate-500">
						Loading tests...
					</div>
				)}
				{!isLoading && filteredTests.length === 0 && (
					<div className="px-4 py-3 text-sm text-slate-500">
						No tests found.
					</div>
				)}
				{!isLoading &&
					filteredTests.map((test) => (
						<TestRow
							key={test._id}
							data={test}
							onEdit={() => {
								setEditingTest(test);
								setIsModalOpen(true);
							}}
							onDelete={() => handleDeleteTest(test._id)}
						/>
					))}
			</div>

			<Modal
				isOpen={isModalOpen}
				title={editingTest ? "Edit Test" : "Add New Test"}
				onClose={() => {
					setIsModalOpen(false);
					setEditingTest(null);
				}}
			>
				<TestForm
					initialValues={buildInitialFormValues(editingTest)}
					submitLabel={editingTest ? "Save Changes" : "Create Test"}
					onCancel={() => {
						setIsModalOpen(false);
						setEditingTest(null);
					}}
					onSubmit={(data) => {
						if (editingTest) {
							return handleUpdateTest(editingTest._id, data);
						}
						return handleCreateTest(data);
					}}
				/>
			</Modal>
		</div>
	);
}

function buildInitialFormValues(test) {
	if (!test) return undefined;
	return {
		name: test.name || "",
		code: test.code || "",
		category: test.category || "Blood Chemistry",
		entryMethod: test.entryMethod || "form",
		discriminatorType: test.discriminatorType || "BloodGlucose",
		description: test.description || "",
	};
}

function TestRow({ data, onEdit, onDelete }) {
	const { name, code, category, entryMethod, description } = data;
	return (
		<div className="rounded-lg px-4 py-3 hover:bg-slate-50">
			<div className="grid grid-cols-12 items-center gap-4 text-sm text-slate-700">
				<div className="col-span-6 flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600">
						<HiBeaker className="h-5 w-5" />
					</div>
					<div>
						<div className="font-medium text-slate-900">{name}</div>
						<div className="text-xs text-slate-500">{code}</div>
						{description && (
							<div className="mt-0.5 line-clamp-1 text-xs text-slate-500">
								{description}
							</div>
						)}
					</div>
				</div>
				<div className="col-span-5 text-xs text-slate-600">
					<div>{category}</div>
					<div className="text-slate-500">
						{entryMethod === "upload" ? "Upload" : "Form"} based
					</div>
				</div>
				<div className="col-span-1 flex justify-end gap-3 text-slate-400">
					<button
						onClick={onEdit}
						className="hover:text-slate-600"
						aria-label="Edit test"
					>
						<HiPencilSquare className="h-4 w-4" />
					</button>
					<button
						onClick={onDelete}
						className="hover:text-rose-500"
						aria-label="Delete test"
					>
						<HiTrash className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default TestManagementPage;

