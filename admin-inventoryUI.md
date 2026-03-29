2. Proposed Admin UI structure

Given this backend, I’d organize the admin inventory UI like this:

Inventory Overview (existing AdminInventoryDashboard, now global)

- Scope: shows global equipment inventory (no per-lab stocks).
- Data source: InventoryStock (one row per Equipment ID).
- Columns: Equipment, Type, Available Qty, Minimum Threshold, Status, Actions.
- Status: computed from availableQuantity vs minimumThreshold.
- Actions:
	- Restock → POST /api/inventory/restock with { equipmentId, quantity }.
	- (Optional later) View stock transactions from StockTransaction.

Equipment Catalog

- Page: /admin/inventory/equipment (already implemented).
- CRUD on Equipment model:
	- List: name, type (CONSUMABLE/REUSABLE), isActive.
	- Create/edit: name, type, description, isActive, plus:
		- initialQuantity (number, default 0): creates initial InventoryStock.availableQuantity.
		- minimumThreshold (number, default 0): sets InventoryStock.minimumThreshold.
- Backend wiring:
	- POST /api/equipment now accepts initialQuantity and minimumThreshold and
		initializes InventoryStock for the created equipment.
	- InventoryStock is global per equipment; UI no longer needs to choose a lab.


Test Equipment Requirements

- Page: /admin/inventory/requirements (already implemented).
- Layout:
	- Left: list/search TestType (name, category).
	- Right: table of TestEquipmentRequirement for selected test:
		- Columns: Equipment, Type, Quantity per Test, Active, Actions.
- Backend wiring (unchanged conceptually):
	- GET /api/inventory/requirements?testTypeId=...
	- POST /api/inventory/requirements
	- PUT /api/inventory/requirements/:id
	- DELETE /api/inventory/requirements/:id
- These requirements are global; inventory deduction is the same regardless of lab.


(Optional later) Inventory Activity / Alerts

- “Low stock” panel summarizing items below threshold (global list).
- “Recent inventory transactions” (from StockTransaction) for audits.

Booking → Inventory interaction (via routes)

- When a booking is marked COMPLETED in the booking module, it should call:
	- POST /api/inventory/deduct-after-completion/:bookingId
		- Auth: health officer (same as other protected routes).
		- Behavior: server looks up Booking.diagnosticTestId, loads active
			TestEquipmentRequirement rows, and deducts quantityPerTest from
			InventoryStock.availableQuantity for each required equipment.
- There is no separate “reserve” step anymore; deduction happens only when the
	booking actually completes.
If this organization matches what you have in mind, reply “proceed” (and tell me which page(s) you want first: stock overview wiring, equipment catalog, or test-requirements UI), and I’ll implement the React UI and API wiring accordingly.

GPT-5.1 • 1x