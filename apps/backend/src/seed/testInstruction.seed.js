import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import TestInstruction from '../modules/lab/testInstruction.model.js';
import TestType from '../modules/test/testType.model.js';

async function seedTestInstructions() {
	await connectDB();
	const tests = await TestType.find();

	if (tests.length < 4) {
		console.error(
			`Not enough test types found: ${tests.length}. ` +
			`Run testType.seed.js first so at least 4 test types exist before seeding instructions.`
		);
		await mongoose.disconnect();
		process.exit(1);
	}

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
		},
		{
			diagnosticTestId: tests[2]._id,
			preTestInstructions: [
				'Fast for at least 8 hours before the blood glucose test.',
				'Avoid sugary drinks and strenuous exercise the day before the test.'
			],
			postTestInstructions: [
				'You may eat and drink normally after the test unless your doctor advises otherwise.',
				'If you feel dizzy or lightheaded, sit down and inform the staff.'
			],
			languageCode: 'en',
			isActive: true,
			createdBy: new mongoose.Types.ObjectId()
		},
		{
			diagnosticTestId: tests[3]._id,
			preTestInstructions: [
				'Remove any metal objects from the chest area before the X-ray.',
				'Inform the radiographer if you are pregnant or suspect you may be.'
			],
			postTestInstructions: [
				'No special care is needed after a standard chest X-ray.',
				'Follow up with your doctor to discuss the report and findings.'
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
