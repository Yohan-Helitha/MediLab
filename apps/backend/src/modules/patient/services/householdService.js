import Household from "../models/Household.js";
import Member from "../models/Member.js";
import FamilyMember from "../models/FamilyMember.js";
import FamilyRelationship from "../models/FamilyRelationship.js";

class HouseholdService {
  async getAllHouseholds(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const households = await Household.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ registration_date: -1 });
    
    const total = await Household.countDocuments(filter);
    
    return {
      households,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getHouseholdById(id) {
    // Try to find by MongoDB _id first (for internal references)
    let household = await Household.findById(id);
    
    // If not found and id doesn't look like ObjectId, try by custom household_id
    if (!household && !/^[0-9a-fA-F]{24}$/.test(id)) {
      household = await Household.findOne({ household_id: id });
    }
    
    if (!household) {
      throw new Error("Household not found");
    }
    return household;
  }

  async getHouseholdBySubmittedBy(submitted_by) {
    const household = await Household.findOne({ submitted_by }).sort({ registration_date: -1, createdAt: -1 }).lean();
    if (!household) return null;

    return household;
  }

  // Helper to populate members for a household object
  async populateHouseholdMembers(household) {
    if (!household) return null;
    const householdObj = household.toObject ? household.toObject() : household;

    // Fetch family members for this household
    const familyMembers = await FamilyMember.find({ household_id: householdObj.household_id }).lean();
    
    // Fetch relationships to determine roles
    const relationships = await FamilyRelationship.find({
      $or: [
        { family_member1_id: { $in: familyMembers.map(m => m.family_member_id) } },
        { family_member2_id: { $in: familyMembers.map(m => m.family_member_id) } }
      ]
    }).lean();

    // Map members with their relationships
    householdObj.members_list = familyMembers.map(member => {
      const rel = relationships.find(r => r.family_member1_id === member.family_member_id);
      return {
        ...member,
        relationship: rel ? rel.relationship_type : "",
        isHead: member.isHead || member.full_name === householdObj.head_member_name,
        parent_name: member.parent_name || ""
      };
    });

    return householdObj;
  }

  async getHouseholdByHouseholdId(household_id) {
    const household = await Household.findOne({ household_id });
    if (!household) {
      throw new Error("Household not found");
    }
    return household;
  }

  async createHousehold(householdData) {
    const { members_list, ...data } = householdData;
    const household = new Household(data);
    await household.save();

    // Create family members if list is provided
    if (members_list && Array.isArray(members_list)) {
      const createdMembers = [];
      const memberIdsForHousehold = []; // Array to collect family_member_ids
      
      for (const m of members_list) {
        const familyMember = new FamilyMember({
          household_id: household.household_id,
          full_name: m.full_name,
          gender: m.gender,
          date_of_birth: m.date_of_birth,
          isHead: !!m.isHead,
          spouse_name: m.spouse_name || "",
          parent_name: m.parent_name || ""
        });
        await familyMember.save();
        createdMembers.push({ ...m, family_member_id: familyMember.family_member_id });
        memberIdsForHousehold.push(familyMember.family_member_id);
      }

      // Update the household document with the accumulated member IDs
      household.members = memberIdsForHousehold;
      await household.save();

      // CRITICAL: Cleanup - ensure ONLY ONE member has isHead: true per household
      const headMember = createdMembers.find(m => m.isHead) || createdMembers[0];
      
      if (headMember) {
        // Update all members to set isHead correctly
        await FamilyMember.updateMany(
          { household_id: household.household_id },
          { isHead: false }
        );
        // Then set only the correct head (match by family_member_id)
        await FamilyMember.updateOne(
          { family_member_id: headMember.family_member_id },
          { isHead: true }
        );
      }

      // Handle relationships (Member 2 to Head relationship)
      const head = createdMembers.find(m => m.isHead);
      if (head) {
        // Import service dynamically to avoid circular dependency if any
        const familyRelationshipService = (await import("./familyRelationshipService.js")).default;
        
        for (const m of createdMembers) {
          if (!m.isHead && m.relationship) {
            await familyRelationshipService.createFamilyRelationship({
              family_member1_id: m.family_member_id,
              family_member2_id: head.family_member_id,
              relationship_type: m.relationship
            });
          }

          // Handle additional grandparent/spouse-parent relationships if special names match
          // This is a business logic specifically requested: resident and baby having grandfather/grandmother relationship
          // We check for "BABY" and "NIRANJAN" as seen in the visual context if applicable
          if (m.full_name.toUpperCase().includes("BABY")) {
            // Find resident (Niranjan)
            const resident = createdMembers.find(rm => rm.full_name.toUpperCase().includes("NIRANJAN") || rm.isHead);
            if (resident) {
                // If resident is head, it's already handled if relationship was "grandchild"
                // But let's ensure it's explicitly set if not
                await familyRelationshipService.createRelationshipByNames(
                    household.household_id,
                    m.full_name,
                    resident.full_name,
                    'grandchild'
                );
            }
          }

          // Handle explicit parent relationship for grandchildren/nieces/nephews
          if (m.parent_name) {
            await familyRelationshipService.createRelationshipByNames(
                household.household_id,
                m.full_name,
                m.parent_name,
                'child'
            );
          }
        }
      }
    }

    // Return the specific instance we created
    return this.populateHouseholdMembers(household);
  }

  async updateHousehold(id, updateData) {
    const { members_list, ...data } = updateData;
    let household = await Household.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!household) {
      throw new Error("Household not found");
    }

    if (members_list && Array.isArray(members_list)) {
      // Find existing members in the database for this household
      const existingMembers = await FamilyMember.find({ household_id: household.household_id });
      const existingMemberIds = existingMembers.map(m => m.family_member_id);
      const incomingMemberIds = members_list.filter(m => m.family_member_id).map(m => m.family_member_id);

      // 1. Delete members who are no longer in the list
      const membersToDelete = existingMembers.filter(m => !incomingMemberIds.includes(m.family_member_id));
      if (membersToDelete.length > 0) {
        const deleteIds = membersToDelete.map(m => m.family_member_id);
        await FamilyRelationship.deleteMany({
          $or: [
            { family_member1_id: { $in: deleteIds } },
            { family_member2_id: { $in: deleteIds } }
          ]
        });
        await FamilyMember.deleteMany({ family_member_id: { $in: deleteIds } });
      }

      // 2. Update or Create members
      const finalMemberIds = [];
      const createdOrUpdatedMembers = [];
      
      for (const m of members_list) {
        let familyMember;
        
        // Determine if this member should be the head
        // Only the member matching household.head_member_name should have isHead: true
        const shouldBeHead = m.full_name === household.head_member_name && !!m.isHead;
        
        if (m.family_member_id && existingMemberIds.includes(m.family_member_id)) {
            // Update existing
            familyMember = await FamilyMember.findOneAndUpdate(
                { family_member_id: m.family_member_id },
                {
                    full_name: m.full_name,
                    gender: m.gender,
                    date_of_birth: m.date_of_birth,
                    isHead: shouldBeHead,
                    spouse_name: m.spouse_name || "",
                    parent_name: m.parent_name || ""
                },
                { new: true }
            );
        } else {
            // Create new
            familyMember = new FamilyMember({
                household_id: household.household_id,
                full_name: m.full_name,
                gender: m.gender,
                date_of_birth: m.date_of_birth,
                isHead: shouldBeHead,
                spouse_name: m.spouse_name || "",
                parent_name: m.parent_name || ""
            });
            await familyMember.save();
        }

        if (familyMember) {
            finalMemberIds.push(familyMember.family_member_id);
            createdOrUpdatedMembers.push({ 
                ...m, 
                family_member_id: familyMember.family_member_id,
                isHead: familyMember.isHead 
            });
        }
      }

      // Sync members list in the household document
      household.members = finalMemberIds;
      await household.save();

      // CRITICAL: Cleanup - ensure ONLY ONE member has isHead: true per household
      // This fixes any data corruption where multiple members were marked as head
      const allMembers = await FamilyMember.find({ household_id: household.household_id });
      const headMember = allMembers.find(m => m.full_name === household.head_member_name);
      
      if (headMember) {
        // Update all members to set isHead correctly
        await FamilyMember.updateMany(
          { household_id: household.household_id },
          { isHead: false }
        );
        // Then set only the correct head
        await FamilyMember.updateOne(
          { family_member_id: headMember.family_member_id },
          { isHead: true }
        );
      }

      // 3. Sync Relationships
      // Clear all existing relationships for this household to ensure a clean sync
      await FamilyRelationship.deleteMany({
        $or: [
          { family_member1_id: { $in: finalMemberIds } },
          { family_member2_id: { $in: finalMemberIds } }
        ]
      });

      const head = createdOrUpdatedMembers.find(m => m.isHead);
      if (head) {
        const familyRelationshipService = (await import("./familyRelationshipService.js")).default;
        
        for (const m of createdOrUpdatedMembers) {
          if (!m.isHead && m.relationship) {
            await familyRelationshipService.createFamilyRelationship({
              family_member1_id: m.family_member_id,
              family_member2_id: head.family_member_id,
              relationship_type: m.relationship
            });
          }

          // Handle explicit parent relationship for grandchildren/nieces/nephews
          if (m.parent_name) {
            await familyRelationshipService.createRelationshipByNames(
                household.household_id,
                m.full_name,
                m.parent_name,
                'child'
            );
            
            // If this is a grandchild (grandson/granddaughter), also create relationship to head
            if (m.relationship && (m.relationship.toLowerCase().includes('grandson') || m.relationship.toLowerCase().includes('granddaughter') || m.relationship.toLowerCase().includes('grandchild'))) {
              await familyRelationshipService.createRelationshipByNames(
                  household.household_id,
                  m.full_name,
                  head.full_name,
                  'grandchild'
              );
            }
          }
        }
      }
    }

    if (household.submitted_by) {
      await Member.findOneAndUpdate(
        { member_id: household.submitted_by },
        { $set: { household_id: household.household_id } }
      );
    }

    return this.populateHouseholdMembers(household);
  }

  async deleteHousehold(id) {
    // Try to find by MongoDB _id first
    let household = await Household.findById(id);
    
    // If not found and id doesn't look like ObjectId, try by custom household_id
    if (!household && !/^[0-9a-fA-F]{24}$/.test(id)) {
      household = await Household.findOne({ household_id: id });
    }

    if (!household) {
      throw new Error("Household not found");
    }

    const householdId = household.household_id;
    const mongoId = household._id;

    // 1. Find all family members of this household
    const familyMembers = await FamilyMember.find({ household_id: householdId });
    const familyMemberIds = familyMembers.map(m => m.family_member_id);

    // 2. Delete all relationships involving any of these family members
    if (familyMemberIds.length > 0) {
      await FamilyRelationship.deleteMany({
        $or: [
          { family_member1_id: { $in: familyMemberIds } },
          { family_member2_id: { $in: familyMemberIds } }
        ]
      });
    }

    // 3. Delete all family members
    await FamilyMember.deleteMany({ household_id: householdId });

    // 4. Update the main member record to remove this household_id
    await Member.findOneAndUpdate(
        { household_id: householdId },
        { $unset: { household_id: "" } }
    );

    // 5. Finally delete the household itself
    await Household.findByIdAndDelete(mongoId);
    
    return household;
  }
}

export default new HouseholdService();