import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import TestType from '../modules/test/testType.model.js';

const testTypes = [
	{
		name: 'Complete Blood Count (CBC)',
		code: 'CBC',
		category: 'Hematology',
		description: 'Evaluates overall health and detects a wide range of disorders.',
		entryMethod: 'form',
		discriminatorType: 'BloodGlucose',
		reportTemplate: '/templates/cbc-report-template.json',
		isRoutineMonitoringRecommended: false,
		isActive: true
	},
	{
		name: 'Lipid Profile',
		code: 'LIPID',
		category: 'Blood Chemistry',
		description: 'Measures cholesterol and triglycerides to assess cardiovascular risk.',
		entryMethod: 'form',
		discriminatorType: 'BloodGlucose',
		reportTemplate: '/templates/lipid-profile-report-template.json',
		isRoutineMonitoringRecommended: true,
		recommendedFrequency: 'annually',
		recommendedFrequencyInDays: 365,
		isActive: true
	},
	{
		name: 'Blood Glucose (Fasting)',
		code: 'GLUCOSE',
		category: 'Blood Chemistry',
		description: 'Measures blood sugar levels after an overnight fast.',
		entryMethod: 'form',
		discriminatorType: 'BloodGlucose',
		reportTemplate: '/templates/blood-glucose-fasting-report-template.json',
		isRoutineMonitoringRecommended: true,
		recommendedFrequency: 'quarterly',
		recommendedFrequencyInDays: 90,
		isActive: true
	}
];

async function seedTestTypes() {
	await connectDB();
	await TestType.deleteMany({});
	await TestType.insertMany(testTypes);
	console.log('Test types seeded!');
	await mongoose.disconnect();
}

seedTestTypes();
