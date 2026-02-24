import Visit from "../models/Visit.js";

class VisitService {
  async getAllVisits(query = {}) {
    const { page = 1, limit = 10, ...filter } = query;
    const skip = (page - 1) * limit;
    
    const visits = await Visit.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ visit_date: -1 });
    
    const total = await Visit.countDocuments(filter);
    
    return {
      visits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getVisitById(id) {
    const visit = await Visit.findById(id);
    if (!visit) {
      throw new Error("Visit not found");
    }
    return visit;
  }

  async createVisit(visitData) {
    const visit = new Visit(visitData);
    await visit.save();
    return visit;
  }

  async updateVisit(id, updateData) {
    const visit = await Visit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!visit) {
      throw new Error("Visit not found");
    }
    return visit;
  }

  async deleteVisit(id) {
    const visit = await Visit.findByIdAndDelete(id);
    if (!visit) {
      throw new Error("Visit not found");
    }
    return visit;
  }
}

export default new VisitService();