import FamilyRelationship from "../models/FamilyRelationship.js";
import FamilyMember from "../models/FamilyMember.js";

class FamilyRelationshipService {
  // Helper method to get reciprocal relationship type
  getReciprocalRelationship(relationshipType) {
    const reciprocals = {
      'husband': 'wife',
      'wife': 'husband',
      'father': 'son', // father -> child becomes child -> father
      'mother': 'daughter', // mother -> child becomes child -> mother
      'son': 'father', // son -> parent becomes parent -> son
      'daughter': 'mother', // daughter -> parent becomes parent -> daughter
      'brother': 'sister',
      'sister': 'brother',
      'grandfather': 'grandson',
      'grandmother': 'granddaughter',
      'grandson': 'grandfather',
      'granddaughter': 'grandmother'
    };
    return reciprocals[relationshipType];
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
    const reciprocalType = this.getReciprocalRelationship(relationship_type);
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
    const reciprocalType = this.getReciprocalRelationship(familyRelationship.relationship_type);
    if (reciprocalType) {
      await FamilyRelationship.findOneAndDelete({
        family_member1_id: familyRelationship.family_member2_id,
        family_member2_id: familyRelationship.family_member1_id,
        relationship_type: reciprocalType
      });
    }

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
        foreignField: "family_member_id"
      },
      {
        path: "family_member2_id",
        model: "FamilyMember",
        localField: "family_member2_id",
        foreignField: "family_member_id"
      }
    ]);

    const familyTree = {
      member: await FamilyMember.findOne({ family_member_id: familyMemberId }),
      relationships: relationships.map(rel => {
        // Compare using the actual family_member_id field from populated object
        const member1Id = rel.family_member1_id?.family_member_id || rel.family_member1_id;
        const member2Id = rel.family_member2_id?.family_member_id || rel.family_member2_id;
        const isMainMemberFirst = member1Id === familyMemberId;
        
        return {
          id: rel._id,
          relatedMember: isMainMemberFirst ? rel.family_member2_id : rel.family_member1_id,
          relationship: isMainMemberFirst 
            ? rel.relationship_type 
            : this.getReciprocalRelationship(rel.relationship_type)
        };
      })
    };

    return familyTree;
  }
}

export default new FamilyRelationshipService();