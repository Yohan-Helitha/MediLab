import Booking from '../booking/booking.model.js';
import FinanceTransaction from '../finance/financeTransaction.model.js';
import InventoryStock from '../inventory/inventoryStock.model.js';
import Equipment from '../inventory/equipment.model.js';
import Auth from '../auth/auth.model.js';
import Member from '../patient/models/Member.js';
import HealthOfficer from '../auth/healthOfficer.model.js';

const toPositiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
};

const makeShortCode = (prefix, objectId, chars = 4) => {
  const raw = String(objectId || '');
  const suffix = raw.length >= chars ? raw.slice(-chars) : raw;
  return `${prefix}-${suffix.toUpperCase()}`;
};

export const getAdminOverview = async ({ windowHours = 24, limit = 3 } = {}) => {
  const safeWindowHours = toPositiveInt(windowHours, 24);
  const safeLimit = Math.min(toPositiveInt(limit, 3), 10);

  const cutoff = new Date(Date.now() - safeWindowHours * 60 * 60 * 1000);

  const [revenueAgg] = await FinanceTransaction.aggregate([
    { $match: { paymentStatus: 'PAID' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    { $project: { _id: 0, totalRevenue: 1 } },
  ]).exec();

  const [lowStockCountAgg] = await InventoryStock.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            { $gt: ['$minimumThreshold', 0] },
            { $lte: ['$availableQuantity', '$minimumThreshold'] },
          ],
        },
      },
    },
    { $count: 'count' },
  ]).exec();

  const [totalBookings, totalUsers] = await Promise.all([
    Booking.countDocuments({ isActive: true }).exec(),
    Auth.countDocuments({ isActive: true }).exec(),
  ]);

  const metrics = {
    totalRevenue: revenueAgg?.totalRevenue || 0,
    totalBookings: totalBookings || 0,
    totalUsers: totalUsers || 0,
    lowStockItems: lowStockCountAgg?.count || 0,
  };

  const [bookingRows, paymentRows, lowStockRows, userRows] = await Promise.all([
    Booking.find({ isActive: true, createdAt: { $gte: cutoff } })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select('patientNameSnapshot status createdAt')
      .lean()
      .exec(),

    FinanceTransaction.find({ createdAt: { $gte: cutoff } })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .select('bookingId paymentStatus paymentMethod createdAt')
      .lean()
      .exec(),

    InventoryStock.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gt: ['$minimumThreshold', 0] },
              { $lte: ['$availableQuantity', '$minimumThreshold'] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: Equipment.collection.name,
          localField: 'equipmentId',
          foreignField: '_id',
          as: 'equipment',
        },
      },
      { $unwind: { path: '$equipment', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          severity: { $subtract: ['$minimumThreshold', '$availableQuantity'] },
        },
      },
      { $sort: { severity: -1, updatedAt: -1 } },
      { $limit: safeLimit },
      {
        $project: {
          _id: 0,
          equipmentId: 1,
          equipmentName: '$equipment.name',
          availableQuantity: 1,
          minimumThreshold: 1,
          updatedAt: 1,
        },
      },
    ]).exec(),

    Auth.aggregate([
      { $match: { isActive: true, createdAt: { $gte: cutoff } } },
      { $sort: { createdAt: -1 } },
      { $limit: safeLimit },
      {
        $lookup: {
          from: Member.collection.name,
          localField: 'profileId',
          foreignField: '_id',
          as: 'member',
        },
      },
      {
        $lookup: {
          from: HealthOfficer.collection.name,
          localField: 'profileId',
          foreignField: '_id',
          as: 'officer',
        },
      },
      {
        $addFields: {
          profileName: {
            $ifNull: [
              { $arrayElemAt: ['$member.full_name', 0] },
              { $arrayElemAt: ['$officer.fullName', 0] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          role: 1,
          profileName: 1,
          createdAt: 1,
        },
      },
    ]).exec(),
  ]);

  const recentBookings = (bookingRows || []).map((b) => ({
    id: String(b._id),
    title: `${makeShortCode('BK', b._id)} - ${b.patientNameSnapshot || 'Unknown'}`,
    status: b.status || '-',
    timestamp: b.createdAt,
  }));

  const recentPayments = (paymentRows || []).map((p) => ({
    id: String(p._id),
    title: `Invoice for ${makeShortCode('BK', p.bookingId)}`,
    status: p.paymentStatus || '-',
    timestamp: p.createdAt,
  }));

  const lowStockItems = (lowStockRows || []).map((s) => {
    const available = Number.isFinite(Number(s.availableQuantity))
      ? Number(s.availableQuantity)
      : 0;
    const threshold = Number.isFinite(Number(s.minimumThreshold))
      ? Number(s.minimumThreshold)
      : 0;

    let status = 'Low stock';
    if (available <= 0) status = 'Out of stock';

    return {
      id: String(s.equipmentId),
      title: s.equipmentName || makeShortCode('EQ', s.equipmentId),
      status,
      timestamp: s.updatedAt,
      meta: {
        availableQuantity: available,
        minimumThreshold: threshold,
      },
    };
  });

  const recentUsers = (userRows || []).map((u) => ({
    id: String(u._id),
    title: u.profileName || u.email || 'Unknown user',
    status: u.role || '-',
    timestamp: u.createdAt,
  }));

  return {
    metrics,
    recent: {
      bookings: recentBookings,
      payments: recentPayments,
      lowStock: lowStockItems,
      users: recentUsers,
    },
    windowHours: safeWindowHours,
    generatedAt: new Date().toISOString(),
  };
};
