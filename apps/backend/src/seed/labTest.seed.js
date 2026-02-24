import mongoose from 'mongoose';
import LabTest from '../modules/lab/labTest.model.js';
import Lab from '../modules/lab/lab.model.js';
import TestType from '../modules/test/testType.model.js';

async function seedLabTests() {
	await mongoose.connect('mongodb://localhost:27017/medilab');
	const labs = await Lab.find();
	const tests = await TestType.find();

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
