import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Member from "./modules/patient/models/Member.js";

async function seedMembers() {
  try {
    await connectDB();

    console.log("[member-seed] Clearing existing members...");
    await Member.deleteMany({});

    console.log("[member-seed] Creating sample members...");

    const members = await Member.insertMany([
      {
        household_id: "ANU-PADGNDIV-00001",
        full_name: "John Doe",
        address: "123 Test Street, Colombo",
        contact_number: "0711111111",
        nic: "901234567V",
        password_hash: "hashed-password-placeholder",
        date_of_birth: new Date("1990-01-01"),
        gender: "male",
        gn_division: "Test GN Division 1",
        district: "Colombo",
        disability_status: false,
        pregnancy_status: false,
      },
      {
        household_id: "ANU-PADGNDIV-00002",
        full_name: "Jane Smith",
        address: "456 Sample Road, Gampaha",
        contact_number: "0722222222",
        nic: "911234568V",
        password_hash: "hashed-password-placeholder",
        date_of_birth: new Date("1991-02-02"),
        gender: "female",
        gn_division: "Test GN Division 2",
        district: "Gampaha",
        disability_status: false,
        pregnancy_status: true,
      },
    ]);

    console.log("[member-seed] Seeded members:");
    members.forEach((m) => {
      console.log(
        `[member-seed] _id=${m._id.toString()} member_id=${m.member_id} full_name=${m.full_name}`,
      );
    });
  } catch (err) {
    console.error("[member-seed] Error while seeding members:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("[member-seed] MongoDB connection closed.");
  }
}

seedMembers();
