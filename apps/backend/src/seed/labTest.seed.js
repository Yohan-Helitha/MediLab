import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import LabTest from '../modules/lab/labTest.model.js';
import Lab from '../modules/lab/lab.model.js';
import TestType from '../modules/test/testType.model.js';

async function seedLabTests() {
	await connectDB();
	const labs = await Lab.find();
	const tests = await TestType.find();

	if (labs.length < 3 || tests.length < 4) {
		console.error(
			`Not enough seed data: found ${labs.length} labs and ${tests.length} test types. ` +
			`Run lab.seed.js and testType.seed.js first to create at least 3 labs and 4 test types.`
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
			labId: labs[0]._id,
			diagnosticTestId: tests[2]._id,
			price: 20.00,
			estimatedResultTimeHours: 12,
			availabilityStatus: 'AVAILABLE',
			isActive: true
		},
		// West Valley Clinic tests
		{
			labId: labs[1]._id,
			diagnosticTestId: tests[0]._id,
			price: 28.00,
			estimatedResultTimeHours: 24,
			availabilityStatus: 'TEMPORARILY_SUSPENDED',
			isActive: true
		},
		{
			labId: labs[1]._id,
			diagnosticTestId: tests[2]._id,
			price: 18.00,
			estimatedResultTimeHours: 10,
			availabilityStatus: 'AVAILABLE',
			isActive: true
		},
		{
			labId: labs[1]._id,
			diagnosticTestId: tests[3]._id,
			price: 60.00,
			estimatedResultTimeHours: 24,
			availabilityStatus: 'UNAVAILABLE',
			isActive: true
		},
		// Eastside Diagnostic tests
		{
			labId: labs[2]._id,
			diagnosticTestId: tests[1]._id,
			price: 40.00,
			estimatedResultTimeHours: 36,
			availabilityStatus: 'AVAILABLE',
			isActive: true
		},
		{
			labId: labs[2]._id,
			diagnosticTestId: tests[2]._id,
			price: 22.00,
			estimatedResultTimeHours: 8,
			availabilityStatus: 'AVAILABLE',
			isActive: true
		},
		{
			labId: labs[2]._id,
			diagnosticTestId: tests[3]._id,
			price: 55.00,
			estimatedResultTimeHours: 24,
			availabilityStatus: 'AVAILABLE',
			isActive: true
		}
	];

	await LabTest.deleteMany({});
	await LabTest.insertMany(labTests);
	console.log('Lab tests seeded!');
	await mongoose.disconnect();
}

seedLabTests();
