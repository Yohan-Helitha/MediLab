import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Lab from '../modules/lab/lab.model.js';

const labs = [
	{
		name: 'North Rural Center',
		addressLine1: '123 Health Way',
		district: 'North District',
		province: 'Northern',
		phoneNumber: '+1 (555) 123-4567',
		operationalStatus: 'OPEN',
		isActive: true
	},
	{
		name: 'West Valley Clinic',
		addressLine1: '456 Valley Rd',
		district: 'West District',
		province: 'Western',
		phoneNumber: '+1 (555) 987-6543',
		operationalStatus: 'CLOSED',
		isActive: true
	},
	{
		name: 'Eastside Diagnostic',
		addressLine1: '789 East Blvd',
		district: 'East District',
		province: 'Eastern',
		phoneNumber: '+1 (555) 456-7890',
		operationalStatus: 'HOLIDAY',
		isActive: true
	}
];

async function seedLabs() {
	await connectDB();
	await Lab.deleteMany({});
	await Lab.insertMany(labs);
	console.log('Labs seeded!');
	await mongoose.disconnect();
}

seedLabs();
