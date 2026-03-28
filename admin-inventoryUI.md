2. Proposed Admin UI structure

Given this backend, I’d organize the admin inventory UI like this:

Inventory Overview (existing AdminInventoryDashboard)

Filters: health center (lab), test type (optional).
Table backed by InventoryStock:
Columns: Equipment, Type, Available, Reserved, Minimum Threshold, Status, Actions.
Status: computed from availableQuantity vs minimumThreshold.
Actions:
Restock button → calls /api/inventory/restock and refreshes.
View stock transactions (optional later) linking to a simple log for that equipment.

Equipment Catalog

New page under Admin (e.g. /admin/inventory/equipment or a tab on the same route).
CRUD on Equipment:
List: name, type (CONSUMABLE/REUSABLE), isActive.
Use your AdminEquipmentForm for create/edit, wired to /api/equipment (or equivalent).
Soft-disable via isActive.


Test Equipment Requirements

New page (e.g. /admin/inventory/requirements).
Layout:
Left: list/search of TestType (name, category).
Right: table of requirements for the selected test:
Columns: Equipment, Type, Quantity per Test, Active, Actions.
Uses /api/inventory/requirements?testTypeId=... (GET) and POST/PUT/DELETE to manage rows.
Add/edit requirement modal: chooses equipmentId, enters quantityPerTest, toggles isActive.


(Optional later) Inventory Activity / Alerts

“Low stock” panel summarizing items below threshold per lab.
“Recent inventory transactions” (from StockTransaction) for audits.
If this organization matches what you have in mind, reply “proceed” (and tell me which page(s) you want first: stock overview wiring, equipment catalog, or test-requirements UI), and I’ll implement the React UI and API wiring accordingly.

GPT-5.1 • 1x