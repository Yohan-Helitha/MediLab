import React from "react";

function LabManagementPage() {
	// Simple static layout matching the Lab Management screenshot
	return (
		<div className="space-y-6">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-900">
						Lab Management
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						Manage registered diagnostic centers and their details.
					</p>
				</div>
				<button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
					+ Add New Lab
				</button>
			</header>

			{/* Search bar */}
			<div className="rounded-xl bg-white p-4 shadow-sm">
				<input
					type="text"
					placeholder="Search labs by name or district..."
					className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
				<LabRow
					name="North Rural Center"
					district="North District"
					phone="+1 (555) 123-4567"
					address="123 Health Way, Northville"
					hours="08:00 AM - 05:00 PM"
					status="Open"
					statusColor="bg-emerald-100 text-emerald-700"
				/>
				<LabRow
					name="West Valley Clinic"
					district="West District"
					phone="+1 (555) 987-6543"
					address="456 Valley Rd, Westside"
					hours="09:00 AM - 06:00 PM"
					status="Closed"
					statusColor="bg-rose-100 text-rose-700"
				/>
				<LabRow
					name="Eastside Diagnostic"
					district="East District"
					phone="+1 (555) 456-7890"
					address="789 East Blvd, Easttown"
					hours="08:00 AM - 04:00 PM"
					status="Holiday"
					statusColor="bg-amber-100 text-amber-700"
				/>
			</div>
		</div>
	);
}

function LabRow({ name, district, phone, address, hours, status, statusColor }) {
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
					<button className="hover:text-slate-600">✏️</button>
					<button className="hover:text-rose-500">🗑️</button>
				</div>
			</div>
		</div>
	);
}

export default LabManagementPage;

