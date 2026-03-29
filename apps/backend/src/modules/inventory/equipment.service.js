import Equipment from "./equipment.model.js";
import InventoryStock from "./inventoryStock.model.js";

export const listEquipment = async () => {
	return Equipment.find({}).sort({ name: 1 }).exec();
};

export const createEquipment = async (data, { initialQuantity = 0, minimumThreshold = 0, createdBy = null } = {}) => {
	const equipment = new Equipment(data);
	const saved = await equipment.save();

	// Initialize global inventory stock for this equipment
	await InventoryStock.findOneAndUpdate(
		{ equipmentId: saved._id },
		{
			$setOnInsert: {
				availableQuantity: initialQuantity,
				reservedQuantity: 0,
			},
			$max: { minimumThreshold },
		},
		{ upsert: true, new: true, setDefaultsOnInsert: true },
	);

	return saved;
};

export const updateEquipment = async (id, data) => {
	return Equipment.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: true,
	}).exec();
};

export const softDeleteEquipment = async (id) => {
	return Equipment.findByIdAndUpdate(
		id,
		{ isActive: false },
		{ new: true },
	).exec();
};

export default {
	listEquipment,
	createEquipment,
	updateEquipment,
	softDeleteEquipment,
};
