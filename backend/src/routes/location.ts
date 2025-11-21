import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { LocationHistory } from '../models/LocationHistory';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Record location (for real-time tracking)
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { latitude, longitude, accuracy, speed, heading } = req.body;
    const userId = req.user!.id;

    if (!latitude || !longitude) {
      throw new AppError('Location coordinates are required', 400);
    }

    const location = await LocationHistory.create({
      userId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: { location }
    });
  } catch (error) {
    next(error);
  }
});

// Get location history
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, limit = 100 } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.timestamp[Op.lte] = new Date(endDate as string);
      }
    }

    const locations = await LocationHistory.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['timestamp', 'DESC']]
    });

    res.json({
      success: true,
      data: { locations }
    });
  } catch (error) {
    next(error);
  }
});

export default router;


