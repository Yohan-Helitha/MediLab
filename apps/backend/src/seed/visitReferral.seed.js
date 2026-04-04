import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Visit from "../modules/patient/models/Visit.js";
import Referral from "../modules/patient/models/Referral.js";
import Member from "../modules/patient/models/Member.js";
import Household from "../modules/patient/models/Household.js";

async function seedVisitsAndReferrals() {
  try {
    await connectDB();
    console.log("Connected to database for seeding visits and referrals...");

    // 1. Find the specific member by ID
    const memberId = "MEM-ANU-PADGNDIV-2026-00003";
    const member = await Member.findOne({ member_id: memberId });
    
    if (!member) {
      console.error(`Member with ID ${memberId} not found in database. Please ensure the member exists.`);
      process.exit(1);
    }

    console.log(`Found target member: ${member.full_name} (${memberId})`);

    // 2. Clear existing records for THIS SPECIFIC member only
    await Visit.deleteMany({ member_id: memberId });
    
    // 3. Ensure a household exists or use member's household_id
    let householdId = member.household_id;
    if (!householdId) {
      const household = await Household.findOne().sort({ createdAt: 1 });
      householdId = household ? (household.household_id || household._id.toString()) : "HHS-DEFAULT-001";
    }

    console.log(`Using Household ID: ${householdId}`);

    // 4. Create Sample Visits
    const visits = [
      {
        member_id: memberId,
        household_id: householdId,
        visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        visit_type: "OPD",
        reason_for_visit: "Persistent cough and mild fever for 3 days.",
        doctor_notes: "Chest sounds clear on auscultation. Throat is slightly inflamed.",
        diagnosis: "Upper Respiratory Tract Infection (URTI)",
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        created_by_staff_id: "HO-STF-001"
      },
      {
        member_id: memberId,
        household_id: householdId,
        visit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        visit_type: "Mobile clinic",
        reason_for_visit: "Routine blood pressure check-up.",
        doctor_notes: "Patient reports feeling well. BP reading: 130/85 mmHg.",
        diagnosis: "Normal BP with mild hypertension history.",
        follow_up_required: false,
        created_by_staff_id: "HO-STF-002"
      },
      {
        member_id: memberId,
        household_id: householdId,
        visit_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        visit_type: "Home visit",
        reason_for_visit: "Severe joint pain in the right knee.",
        doctor_notes: "Swelling observed. Patient unable to put weight on the leg.",
        diagnosis: "Suspected Ligament Injury",
        follow_up_required: true,
        follow_up_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        created_by_staff_id: "HO-STF-001"
      }
    ];

    const createdVisits = [];
    for (const v of visits) {
      const visit = new Visit(v);
      await visit.save();
      createdVisits.push(visit);
      console.log(`Created Visit: ${visit.visit_id}`);
    }

    // 5. Create Sample Referrals for some visits
    const referrals = [
      {
        visit_id: createdVisits[0].visit_id, // URTI visit
        member_id: memberId,
        referred_to: "District Hospital",
        referral_reason: "For chest X-ray to rule out pneumonia due to persistent fever.",
        urgency_level: "Routine",
        referral_status: "Pending"
      },
      {
        visit_id: createdVisits[2].visit_id, // Knee injury visit
        member_id: memberId,
        referred_to: "Specialist Clinic",
        referral_reason: "Orthopedic consultation for suspected ACL tear. Needs MRI.",
        urgency_level: "Urgent",
        referral_status: "Pending"
      }
    ];

    for (const r of referrals) {
      const referral = new Referral(r);
      await referral.save();
      console.log(`Created Referral: ${referral.referral_id}`);
    }

    console.log("Seeding completed successfully!");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedVisitsAndReferrals();
