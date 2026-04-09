import { getAdminOverview } from './admin.service.js';

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
