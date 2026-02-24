import mongoose from 'mongoose';
import TestInstruction from '../modules/lab/testInstruction.model.js';
import TestType from '../modules/test/testType.model.js';

async function seedTestInstructions() {
	await mongoose.connect('mongodb://localhost:27017/medilab');
	const tests = await TestType.find();

	const instructions = [
		{
			diagnosticTestId: tests[0]._id,
			preTestInstructions: [
				'No special preparation needed. Stay hydrated and drink plenty of water before the test.',
				'Inform the technician of any medications you are currently taking.'
			],
			postTestInstructions: [
				'Apply pressure to the puncture site for 2-3 minutes.',
				'Avoid heavy lifting with the arm used for blood draw for 1 hour.'
			],
			languageCode: 'en',
			isActive: true,
			createdBy: new mongoose.Types.ObjectId()
		},
		{
			diagnosticTestId: tests[1]._id,
			preTestInstructions: [
				'Fast for 9-12 hours before the test. Only water is permitted during the fasting period.',
				'Avoid alcohol for 24 hours prior. Continue prescribed medications unless advised otherwise by your doctor.'
			],
			postTestInstructions: [
				'You may resume normal eating after the blood draw.',
				'Keep the bandage on for at least 30 minutes. Report any excessive bruising to the lab.'
			],
			languageCode: 'en',
			isActive: true,
			createdBy: new mongoose.Types.ObjectId()
		}
	];

	await TestInstruction.deleteMany({});
	await TestInstruction.insertMany(instructions);
	console.log('Test instructions seeded!');
	await mongoose.disconnect();
}

seedTestInstructions();
