import { getAdminOverview, listHealthOfficers } from './admin.service.js';

export const getAdminOverviewController = async (req, res, next) => {
  try {
    const windowHours = req.query.windowHours;
    const limit = req.query.limit;

    const data = await getAdminOverview({ windowHours, limit });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const listHealthOfficersController = async (req, res, next) => {
  try {
    const role = req.query.role;
    const items = await listHealthOfficers({ role });
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
};
