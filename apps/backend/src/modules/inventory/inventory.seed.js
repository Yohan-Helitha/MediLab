import Equipment from "./equipment.model.js";
import InventoryStock from "./inventoryStock.model.js";
import TestEquipmentRequirement from "./testEquipmentRequirement.model.js";
import StockTransaction from "./stockTransaction.model.js";

// Seed inventory-related data: equipment, test requirements, and stock per lab
export const seedInventory = async ({ labs, testTypes, createdBy }) => {
  console.log("[seed][inventory] Clearing existing inventory data...");

  await Promise.all([
    InventoryStock.deleteMany({}),
    TestEquipmentRequirement.deleteMany({}),
    Equipment.deleteMany({}),
    StockTransaction.deleteMany({}),
  ]);

  console.log("[seed][inventory] Creating equipment items...");

  const [
    glucoseStrip,
    syringe,
    vacutainerTube,
    cbcReagentKit,
  ] = await Equipment.create([
    {
      name: "Glucose Test Strip",
      type: "CONSUMABLE",
      description: "Strip for blood glucose meter",
      createdBy,
    },
    {
      name: "Syringe 5ml",
      type: "REUSABLE",
      description: "Syringe for blood sampling",
      createdBy,
    },
    {
      name: "Vacutainer Tube",
      type: "CONSUMABLE",
      description: "Tube for blood collection",
      createdBy,
    },
    {
      name: "CBC Reagent Kit",
      type: "CONSUMABLE",
      description: "Reagent kit for CBC analyzer",
      createdBy,
    },
  ]);

  console.log("[seed][inventory] Creating test equipment requirements...");

  const [testType1, testType2] = testTypes;

  await TestEquipmentRequirement.create([
    // Fasting Blood Glucose requirements
    {
      testTypeId: testType1._id,
      equipmentId: glucoseStrip._id,
      quantityPerTest: 1,
      isActive: true,
    },
    {
      testTypeId: testType1._id,
      equipmentId: syringe._id,
      quantityPerTest: 1,
      isActive: true,
    },
    // Complete Blood Count requirements
    {
      testTypeId: testType2._id,
      equipmentId: vacutainerTube._id,
      quantityPerTest: 1,
      isActive: true,
    },
    {
      testTypeId: testType2._id,
      equipmentId: cbcReagentKit._id,
      quantityPerTest: 1,
      isActive: true,
    },
  ]);

  console.log("[seed][inventory] Creating inventory stock for each lab...");

  const initialStocks = [];

  for (const lab of labs) {
    for (const equipment of [
      glucoseStrip,
      syringe,
      vacutainerTube,
      cbcReagentKit,
    ]) {
      initialStocks.push({
        healthCenterId: lab._id,
        equipmentId: equipment._id,
        availableQuantity: 100,
        reservedQuantity: 0,
        minimumThreshold: 10,
      });
    }
  }

  await InventoryStock.insertMany(initialStocks);

  console.log("[seed][inventory] Inventory data seeded successfully.");

  return {
    equipment: [glucoseStrip, syringe, vacutainerTube, cbcReagentKit],
  };
};
