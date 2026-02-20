// Temporary auth middleware stub
// NOTE: Replace this with real authentication logic later.

import mongoose from "mongoose";

// Simple protect middleware that always allows the request through
// and attaches a dummy user object so booking creation works.
export const protect = (req, res, next) => {
  if (!req.user) {
    // Use patientProfileId as a fallback creator if it looks like an ObjectId,
    // otherwise generate a random ObjectId just to satisfy the schema.
    const patientProfileId = req.body?.patientProfileId;

    if (patientProfileId && mongoose.Types.ObjectId.isValid(patientProfileId)) {
      req.user = { id: patientProfileId };
    } else {
      req.user = { id: new mongoose.Types.ObjectId().toString() };
    }
  }

  next();
};

export default { protect };
