import React from "react";
import { HiBeaker, HiPencilSquare, HiTrash } from "react-icons/hi2";

const SAMPLE_AVAILABILITY = [
	{
		id: 1,
		name: "Complete Blood Count (CBC)",
		description: "Evaluates overall health and detects a wide range of disorders.",
		price: 25,
		resultTime: "24 hours",
		status: "AVAILABLE",
	},
	{
		id: 2,
		name: "Lipid Profile",
		description: "Measures cholesterol and triglycerides to assess heart risk.",
		price: 45,
		resultTime: "24-48 hours",
		status: "TEMPORARILY_SUSPENDED",
	},
	{
		id: 3,
		name: "Blood Glucose (Fasting)",
		description: "Measures blood sugar levels after an overnight fast.",
		price: 15,
		resultTime: "12 hours",
		status: "UNAVAILABLE",
	},
];

function TestAvailabilityPage() {
	return (
		<div className="space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Test Availability
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Manage diagnostic tests available at each lab center.
					</p>
				</div>
			</header>

			{/* Filters row */}
			<div className="flex gap-4">
				<div className="w-64">
					<select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
						<option>North Rural Center</option>
						<option>West Valley Clinic</option>
						<option>Eastside Diagnostic</option>
					</select>
				</div>
				<div className="flex-1">
					<input
						type="text"
						placeholder="Search tests by name or description..."
						className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
					/>
				</div>
			</div>

			{/* Table header */}
			<div className="rounded-t-xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
				<div className="grid grid-cols-12 gap-4">
					<div className="col-span-4">Test Name</div>
					<div className="col-span-4">Description</div>
					<div className="col-span-1">Price</div>
					<div className="col-span-2">Result Time</div>
					<div className="col-span-1 text-right">Actions</div>
				</div>
			</div>

			{/* Rows */}
			<div className="space-y-1 rounded-b-xl bg-white p-2 shadow-sm">
				{SAMPLE_AVAILABILITY.map((test) => (
					<TestAvailabilityRow key={test.id} test={test} />
				))}
			</div>
		</div>
	);
}

function TestAvailabilityRow({ test }) {
	return (
		<div className="rounded-lg px-4 py-3 hover:bg-slate-50">
			<div className="grid grid-cols-12 items-center gap-4 text-sm text-slate-700">
				<div className="col-span-4 flex items-center gap-3">
					<span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600">
						<HiBeaker className="h-5 w-5" />
					</span>
					<div>
						<div className="font-medium text-slate-900">{test.name}</div>
					</div>
				</div>
				<div className="col-span-4 text-xs text-slate-600">
					{test.description}
				</div>
				<div className="col-span-1 text-xs font-medium text-slate-900">
					<span className="text-slate-400">$</span> {test.price.toFixed(2)}
				</div>
				<div className="col-span-2 text-xs text-slate-600">
					{test.resultTime}
				</div>
				<div className="col-span-1 flex justify-end gap-3 text-slate-400">
					<button className="hover:text-slate-600" aria-label="Edit test">
						<HiPencilSquare className="h-5 w-5" />
					</button>
					<button className="hover:text-rose-500" aria-label="Delete test">
						<HiTrash className="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	);
}

export default TestAvailabilityPage;

