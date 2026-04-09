import express from "express";
import { authenticate, checkRole, handleValidationErrors } from "../auth/auth.middleware.js";
import { validateEquipmentPayload } from "./equipment.validation.js";
import equipmentService from "./equipment.service.js";

const router = express.Router();

const protect = authenticate;
const requireAdmin = [protect, checkRole(["Admin", "ADMIN"])];

router.get("/", requireAdmin, async (req, res) => {
	try {
		const items = await equipmentService.listEquipment();
		return res.status(200).json(items);
	} catch (error) {
		console.error("Error listing equipment:", error);
		return res.status(400).json({ message: error.message });
	}
});

router.post(
	"/",
	requireAdmin,
	validateEquipmentPayload,
	handleValidationErrors,
	async (req, res) => {
		try {
			const initialQuantity =
				req.body.initialQuantity !== undefined
					? Number(req.body.initialQuantity)
					: 0;
			const minimumThreshold =
				req.body.minimumThreshold !== undefined
					? Number(req.body.minimumThreshold)
					: 0;

			const payload = {
				name: req.body.name,
				type: req.body.type,
				description: req.body.description,
				isActive: req.body.isActive !== undefined ? req.body.isActive : true,
				createdBy: req.user?.id || null,
			};
			const created = await equipmentService.createEquipment(payload, {
				initialQuantity,
				minimumThreshold,
				createdBy: req.user?.id || null,
			});
			return res.status(201).json(created);
		} catch (error) {
			console.error("Error creating equipment:", error);
			return res.status(400).json({ message: error.message });
		}
	},
);

router.put(
	"/:id",
	requireAdmin,
	validateEquipmentPayload,
	handleValidationErrors,
	async (req, res) => {
		try {
			const updated = await equipmentService.updateEquipment(req.params.id, req.body);
			return res.status(200).json(updated);
		} catch (error) {
			console.error("Error updating equipment:", error);
			return res.status(400).json({ message: error.message });
		}
	},
);

router.delete("/:id", requireAdmin, async (req, res) => {
	try {
		const updated = await equipmentService.softDeleteEquipment(req.params.id);
		return res.status(200).json(updated);
	} catch (error) {
		console.error("Error soft-deleting equipment:", error);
		return res.status(400).json({ message: error.message });
	}
});

export default router;
