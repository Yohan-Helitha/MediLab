import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../app.js";
import { connectDB } from "../../../config/db.js";
import authService from "../../auth/auth.service.js";
import HealthOfficer from "../../auth/healthOfficer.model.js";
import Lab from "../../lab/lab.model.js";
import TestType from "../../test/testType.model.js";
import Equipment from "../equipment.model.js";
import InventoryStock from "../inventoryStock.model.js";
import TestEquipmentRequirement from "../testEquipmentRequirement.model.js";

const hasDatabaseUrl = !!process.env.DATABASE_URL;

let adminToken;
let adminId;
let labId;
let testTypeId;
let equipmentId;

jest.setTimeout(30000);

const describeIfDb = hasDatabaseUrl ? describe : describe.skip;

describeIfDb("Inventory routes integration", () => {
	beforeAll(async () => {
		await connectDB();

	// Create admin health officer
	const username = "int_admin_inventory";
	const employeeId = "EMP-INT-ADMIN-INV-001";
	const email = "int.admin.inventory@example.com";
	const plainPassword = "IntAdminInventory@123";

	await HealthOfficer.deleteMany({ $or: [{ username }, { employeeId }, { email }] });

	const passwordHash = await authService.hashPassword(plainPassword);

	const officer = await HealthOfficer.create({
		fullName: "Integration Admin Inventory",
		gender: "OTHER",
		employeeId,
		contactNumber: "0777000100",
		email,
		assignedArea: "Integration Area",
		role: "Admin",
		username,
		passwordHash,
		isActive: true,
	});

	adminId = officer._id.toString();

	adminToken = authService.generateToken({
		id: officer._id,
		employeeId: officer.employeeId,
		userType: "healthOfficer",
		role: officer.role,
		fullName: officer.fullName,
	});

	// Create a lab and test type
	const uniqueSuffix = Date.now();

	const lab = await Lab.create({
		name: `Integration Inventory Lab ${uniqueSuffix}`,
		district: "Colombo",
		province: "Western",
		phoneNumber: "0114000000",
		email: "integration.inventory.lab@example.com",
		createdBy: officer._id,
	});
	labId = lab._id.toString();

	const code = `INVINT-${uniqueSuffix}`;
	const testType = await TestType.create({
		name: `Integration Inventory Test ${uniqueSuffix}`,
		code,
		category: "Hematology",
		description: "Integration test type for inventory routes",
		entryMethod: "form",
		discriminatorType: "Hemoglobin",
		isRoutineMonitoringRecommended: false,
		specificParameters: {},
		reportTemplate: "templates/integration-inventory.html",
		isActive: true,
	});
	testTypeId = testType._id.toString();

	// Create equipment and initial stock + requirement
	const equipment = await Equipment.create({
		name: `Integration Syringe 5ml ${uniqueSuffix}`,
		type: "CONSUMABLE",
		description: "Syringe used for integration inventory tests",
		createdBy: adminId,
	});
	equipmentId = equipment._id.toString();

	await InventoryStock.create({
		healthCenterId: lab._id,
		equipmentId: equipment._id,
		availableQuantity: 50,
		reservedQuantity: 0,
		minimumThreshold: 5,
	});
	});

	afterAll(async () => {
		try {
			await mongoose.connection.close();
		} catch (e) {
			// no-op
		}
	});

	it("should reject inventory stock listing without authentication", async () => {
		const res = await request(app).get("/api/inventory/stock");
		expect(res.status).toBe(401);
	});

	it("should allow admin to restock equipment", async () => {
		const res = await request(app)
			.post("/api/inventory/restock")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				healthCenterId: labId,
				equipmentId,
				quantity: 5,
			});

		expect(res.status).toBe(200);
		expect(res.body.message).toBe("Equipment restocked successfully");
	});

	it("should allow admin to configure equipment requirements for a test", async () => {
		const res = await request(app)
			.post("/api/inventory/requirements")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				testTypeId,
				equipmentId,
				quantityPerTest: 2,
				isActive: true,
			});

		expect(res.status).toBe(201);
		expect(res.body.requirement.testTypeId).toBe(testTypeId);
		const returnedEquipmentId =
			res.body.requirement?.equipmentId?._id ?? res.body.requirement?.equipmentId;
		expect(String(returnedEquipmentId)).toBe(equipmentId);

		const listRes = await request(app)
			.get(`/api/inventory/requirements?testTypeId=${testTypeId}`)
			.set("Authorization", `Bearer ${adminToken}`);

		expect(listRes.status).toBe(200);
		expect(Array.isArray(listRes.body.items)).toBe(true);
		// At least one requirement should be returned for this test
		expect(listRes.body.items.length).toBeGreaterThan(0);
	});
});
