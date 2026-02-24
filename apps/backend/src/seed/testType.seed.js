import mongoose from 'mongoose';
import TestType from '../modules/test/testType.model.js';

const testTypes = [
	{
		name: 'Complete Blood Count (CBC)',
		code: 'CBC',
		category: 'Hematology',
		description: 'Evaluates overall health and detects a wide range of disorders.',
		entryMethod: 'form',
		discriminatorType: 'BloodGlucose',
		isRoutineMonitoringRecommended: false,
		isActive: true
	},
	{
		name: 'Lipid Profile',
		code: 'LIPID',
		category: 'Biochemistry',
		description: 'Measures cholesterol and triglycerides to assess cardiovascular risk.',
		entryMethod: 'form',
		discriminatorType: 'BloodGlucose',
		isRoutineMonitoringRecommended: true,
		recommendedFrequency: 'annually',
		recommendedFrequencyInDays: 365,
		isActive: true
	},
	{
		name: 'Blood Glucose (Fasting)',
		code: 'GLUCOSE',
		category: 'Biochemistry',
		description: 'Measures blood sugar levels after an overnight fast.',
		entryMethod: 'form',
		discriminatorType: 'BloodGlucose',
		isRoutineMonitoringRecommended: true,
		recommendedFrequency: 'quarterly',
		recommendedFrequencyInDays: 90,
		isActive: true
	}
];

async function seedTestTypes() {
	await mongoose.connect('mongodb://localhost:27017/medilab');
	await TestType.deleteMany({});
	await TestType.insertMany(testTypes);
	console.log('Test types seeded!');
	await mongoose.disconnect();
}

seedTestTypes();
