import Equipment from "./equipment.model.js";

export const listEquipment = async () => {
	return Equipment.find({}).sort({ name: 1 }).exec();
};

export const createEquipment = async (data) => {
	const equipment = new Equipment(data);
	return equipment.save();
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
