import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import LabTest from '../modules/lab/labTest.model.js';
import Lab from '../modules/lab/lab.model.js';
import TestType from '../modules/test/testType.model.js';

async function seedLabTests() {
	await connectDB();
	const labs = await Lab.find();
	const tests = await TestType.find();

	if (labs.length < 2 || tests.length < 3) {
		console.error(
			`Not enough seed data: found ${labs.length} labs and ${tests.length} test types. ` +
			`Run lab.seed.js and testType.seed.js first to create at least 2 labs and 3 test types.`
		);
		await mongoose.disconnect();
		process.exit(1);
	}

	const labTests = [
		{
			labId: labs[0]._id,
			diagnosticTestId: tests[0]._id,
			price: 25.00,
			estimatedResultTimeHours: 24,
			availabilityStatus: 'AVAILABLE',
			isActive: true
		},
		{
			labId: labs[0]._id,
			diagnosticTestId: tests[1]._id,
			price: 45.00,
			estimatedResultTimeHours: 48,
			availabilityStatus: 'AVAILABLE',
			isActive: true
		},
		{
			labId: labs[1]._id,
			diagnosticTestId: tests[2]._id,
			price: 15.00,
			estimatedResultTimeHours: 12,
			availabilityStatus: 'UNAVAILABLE',
			isActive: true
		}
	];

	await LabTest.deleteMany({});
	await LabTest.insertMany(labTests);
	console.log('Lab tests seeded!');
	await mongoose.disconnect();
}

seedLabTests();
