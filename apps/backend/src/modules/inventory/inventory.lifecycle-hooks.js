import Booking from "../booking/booking.model.js";
import TestResult from "../result/testResult.model.js";

import {
  reserveEquipmentForBooking,
  finalizeEquipmentUsageForReleasedResult,
} from "./inventory.service.js";

function isSettingStatusToCompleted(update) {
  if (!update) return false;
  if (update.status === "COMPLETED") return true;
  if (update.$set && update.$set.status === "COMPLETED") return true;
  return false;
}

export function registerInventoryLifecycleHooks() {
  if (globalThis.__MEDILAB_INVENTORY_LIFECYCLE_HOOKS_REGISTERED__) {
    return;
  }

  globalThis.__MEDILAB_INVENTORY_LIFECYCLE_HOOKS_REGISTERED__ = true;

  // Booking COMPLETED -> reserve requirements
  Booking.schema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate();
    if (!isSettingStatusToCompleted(update)) return;

    const query = this.getQuery();
    const bookingId = query?._id;
    if (!bookingId) return;

    await reserveEquipmentForBooking(bookingId, { changedBy: null });
  });

  // TestResult pending -> released -> finalize inventory
  TestResult.schema.pre("save", async function () {
    if (!this.isModified("currentStatus")) return;
    if (this.currentStatus !== "released") return;

    const bookingId = this.bookingId;
    if (!bookingId) return;

    const lastHistory = Array.isArray(this.statusHistory)
      ? this.statusHistory[this.statusHistory.length - 1]
      : null;

    const changedBy = lastHistory?.changedBy || this.enteredBy || null;

    await finalizeEquipmentUsageForReleasedResult(bookingId, { changedBy });
  });
}
