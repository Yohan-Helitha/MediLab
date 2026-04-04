import mongoose from "mongoose";
import FamilyRelationship from "../models/FamilyRelationship.js";
import FamilyMember from "../models/FamilyMember.js";

class FamilyRelationshipService {
  getReciprocalRelationship(relationshipType, targetGender) {
    if (!relationshipType) return null;
    const type = relationshipType.toLowerCase();
    
    if (['father', 'mother', 'parent'].includes(type)) {
      if (targetGender === 'Male') return 'son';
      if (targetGender === 'Female') return 'daughter';
      return 'child';
    }
    
    if (['son', 'daughter', 'child'].includes(type)) {
      if (targetGender === 'Male') return 'father';
      if (targetGender === 'Female') return 'mother';
      return 'parent';
    }
    
    if (['husband', 'wife', 'spouse'].includes(type)) {
      if (targetGender === 'Male') return 'husband';
      if (targetGender === 'Female') return 'wife';
      return 'spouse';
    }

    if (['brother', 'sister', 'sibling'].includes(type)) {
      if (targetGender === 'Male') return 'brother';
      if (targetGender === 'Female') return 'sister';
      return 'sibling';
    }
    
    if (['grandfather', 'grandmother', 'grandparent'].includes(type)) {
      if (targetGender === 'Male') return 'grandson';
      if (targetGender === 'Female') return 'granddaughter';
      return 'grandchild';
    }
    
    if (['grandson', 'granddaughter', 'grandchild'].includes(type)) {
      if (targetGender === 'Male') return 'grandfather';
      if (targetGender === 'Female') return 'grandmother';
      return 'grandparent';
    }

    return type;
  }

  // Validate relationship logic
  async validateRelationship(familyMember1Id, familyMember2Id, relationshipType) {
    // Check if family members exist
    const familyMember1 = await FamilyMember.findOne({ family_member_id: familyMember1Id });
    const familyMember2 = await FamilyMember.findOne({ family_member_id: familyMember2Id });
    
    if (!familyMember1 || !familyMember2) {
      throw new Error("One or both family members not found");
    }

    // Prevent self-relationships
    if (familyMember1Id === familyMember2Id) {
      throw new Error("A person cannot have a relationship with themselves");
    }

    // Check gender consistency for spouse relationships
    if ((relationshipType === 'husband' && familyMember1.gender !== 'Male') ||
        (relationshipType === 'wife' && familyMember1.gender !== 'Female')) {
      throw new Error(`Gender inconsistency: ${relationshipType} relationship requires appropriate gender`);
    }

    // Check for existing relationship between these members
    const existingRelationship = await FamilyRelationship.findOne({
      $or: [
        { family_member1_id: familyMember1Id, family_member2_id: familyMember2Id },
        { family_member1_id: familyMember2Id, family_member2_id: familyMember1Id }
      ]
    });

    return { familyMember1, familyMember2, existingRelationship };
  }
  async getAllFamilyRelationships(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const familyRelationships = await FamilyRelationship.find(filter)
      .populate({
        path: "family_member1_id",
        model: "FamilyMember",
        localField: "family_member1_id",
        foreignField: "family_member_id"
      })
      .populate({
        path: "family_member2_id",
        model: "FamilyMember",
        localField: "family_member2_id",
        foreignField: "family_member_id"
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await FamilyRelationship.countDocuments(filter);
    
    return {
      familyRelationships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getFamilyRelationshipById(id) {
    const familyRelationship = await FamilyRelationship.findById(id)
      .populate({
        path: "family_member1_id",
        model: "FamilyMember",
        localField: "family_member1_id",
        foreignField: "family_member_id"
      })
      .populate({
        path: "family_member2_id",
        model: "FamilyMember",
        localField: "family_member2_id",
        foreignField: "family_member_id"
      });
    if (!familyRelationship) {
      throw new Error("Family relationship not found");
    }
    return familyRelationship;
  }

  async createFamilyRelationship(familyRelationshipData) {
    const { family_member1_id, family_member2_id, relationship_type } = familyRelationshipData;
    
    // Validate the relationship
    const { familyMember1, familyMember2, existingRelationship } = await this.validateRelationship(
      family_member1_id, family_member2_id, relationship_type
    );

    if (existingRelationship) {
      throw new Error("A relationship already exists between these family members");
    }

    // Create the primary relationship
    const familyRelationship = new FamilyRelationship(familyRelationshipData);
    await familyRelationship.save();

    // Create the reciprocal relationship (bidirectional)
    const reciprocalType = this.getReciprocalRelationship(relationship_type, familyMember1.gender);
    if (reciprocalType) {
      const reciprocalRelationship = new FamilyRelationship({
        family_member1_id: family_member2_id,
        family_member2_id: family_member1_id,
        relationship_type: reciprocalType
      });
      await reciprocalRelationship.save();
    }

    return await familyRelationship.populate([
      {
        path: "family_member1_id",
        model: "FamilyMember",
        localField: "family_member1_id",
        foreignField: "family_member_id"
      },
      {
        path: "family_member2_id",
        model: "FamilyMember",
        localField: "family_member2_id",
        foreignField: "family_member_id"
      }
    ]);
  }

  async updateFamilyRelationship(id, updateData) {
    const familyRelationship = await FamilyRelationship.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: "family_member1_id",
      model: "FamilyMember",
      localField: "family_member1_id",
      foreignField: "family_member_id"
    }).populate({
      path: "family_member2_id",
      model: "FamilyMember",
      localField: "family_member2_id",
      foreignField: "family_member_id"
    });
    
    if (!familyRelationship) {
      throw new Error("Family relationship not found");
    }
    return familyRelationship;
  }

  async deleteFamilyRelationship(id) {
    const familyRelationship = await FamilyRelationship.findById(id);
    if (!familyRelationship) {
      throw new Error("Family relationship not found");
    }

    // Find and delete the reciprocal relationship
    await FamilyRelationship.findOneAndDelete({
      family_member1_id: familyRelationship.family_member2_id,
      family_member2_id: familyRelationship.family_member1_id
    });

    // Delete the primary relationship
    await FamilyRelationship.findByIdAndDelete(id);
    return familyRelationship;
  }

  // Get family tree structure for a specific member
  async getFamilyTree(familyMemberId) {
    const relationships = await FamilyRelationship.find({
      $or: [{ family_member1_id: familyMemberId }, { family_member2_id: familyMemberId }]
    }).populate([
      {
        path: "family_member1_id",
        model: "FamilyMember",
        localField: "family_member1_id",
        foreignField: "family_member_id",
        justOne: true
      },
      {
        path: "family_member2_id",
        model: "FamilyMember",
        localField: "family_member2_id",
        foreignField: "family_member_id",
        justOne: true
      }
    ]);

    const familyTree = {
      member: await this._enrichMemberData(await FamilyMember.findOne({ family_member_id: familyMemberId })),
      relationships: []
    };

    // Deduplicate relationships to ensure each related member appears only once
    const seenMemberIds = new Set();
    
    for (const rel of relationships) {
        const m1 = rel.family_member1_id;
        const m2 = rel.family_member2_id;
        const m1Id = m1?.family_member_id || m1;
        const m2Id = m2?.family_member_id || m2;

        const isMainMemberFirst = (m1Id === familyMemberId);
        let relatedMember = isMainMemberFirst ? m2 : m1;
        
        // Ensure relatedMember is a full object and enriched
        if (typeof relatedMember === 'string') {
            relatedMember = await FamilyMember.findOne({ family_member_id: relatedMember });
        }
        relatedMember = await this._enrichMemberData(relatedMember);

        const relatedId = relatedMember?.family_member_id;

        if (relatedId && !seenMemberIds.has(relatedId)) {
            seenMemberIds.add(relatedId);
            
            let finalRelationship = "";
            if (!isMainMemberFirst) {
              finalRelationship = rel.relationship_type;
            } else {
              finalRelationship = this.getReciprocalRelationship(rel.relationship_type, relatedMember.gender);
            }

            familyTree.relationships.push({
              id: rel._id,
              relatedMember: relatedMember,
              relationship: finalRelationship
            });
        }
    }

    return familyTree;
  }

  // Internal helper to enrich FamilyMember with main Member data (like diseases/photo)
  async _enrichMemberData(familyMember) {
    if (!familyMember) return null;
    
    // Convert to plain object if it's a Mongoose document
    const memberObj = familyMember.toObject ? familyMember.toObject() : { ...familyMember };
    
    // Look for a corresponding member in the main Member collection
    // We match by full_name and household_id as a reliable link
    const mainMember = await mongoose.model("Member").findOne({
      full_name: memberObj.full_name,
      household_id: memberObj.household_id
    }).select('diseases photo member_id').lean();

    if (mainMember) {
      // Merge important fields if they exist in main member collection
      return {
        ...memberObj,
        diseases: mainMember.diseases || memberObj.diseases || [],
        photo: mainMember.photo || memberObj.photo,
        linked_system_id: mainMember.member_id,
        isSystemUser: true
      };
    }

    return memberObj;
  }
}

export default new FamilyRelationshipService();