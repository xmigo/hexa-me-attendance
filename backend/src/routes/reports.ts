import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AttendanceRecord } from '../models/AttendanceRecord';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize';

const router = Router();

// Get attendance summary
router.get('/attendance-summary', authenticate, authorize('admin', 'manager', 'hr'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { startDate, endDate, department, userId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.timestamp[Op.lte] = new Date(endDate as string);
      }
    }

    if (userId) {
      where.userId = userId;
    }

    const records = await AttendanceRecord.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department'],
        where: department ? { department } : undefined
      }],
      order: [['timestamp', 'DESC']]
    });

    // Group by user and calculate statistics
    const summary: any = {};

    records.forEach(record => {
      const userId = record.userId;
      if (!summary[userId]) {
        summary[userId] = {
          user: record.user,
          checkins: 0,
          checkouts: 0,
          violations: 0,
          totalHours: 0
        };
      }

      if (record.type === 'checkin') {
        summary[userId].checkins++;
      } else if (record.type === 'checkout') {
        summary[userId].checkouts++;
      }

      if (record.isViolation) {
        summary[userId].violations++;
      }
    });

    res.json({
      success: true,
      data: {
        summary: Object.values(summary),
        totalRecords: records.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get violation report
router.get('/violations', authenticate, authorize('admin', 'manager', 'hr'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const where: any = {
      isViolation: true
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.timestamp[Op.lte] = new Date(endDate as string);
      }
    }

    if (userId) {
      where.userId = userId;
    }

    const violations = await AttendanceRecord.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department']
      }],
      order: [['timestamp', 'DESC']]
    });

    res.json({
      success: true,
      data: { violations }
    });
  } catch (error) {
    next(error);
  }
});

// Get daily attendance report
router.get('/daily', authenticate, authorize('admin', 'manager', 'hr'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      throw new AppError('Date is required', 400);
    }

    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const checkins = await AttendanceRecord.findAll({
      where: {
        type: 'checkin',
        timestamp: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department']
      }],
      order: [['timestamp', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        checkins,
        totalCheckins: checkins.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;


