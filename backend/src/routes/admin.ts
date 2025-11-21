import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { AttendanceRecord } from '../models/AttendanceRecord';
import { User } from '../models/User';
import { WorkZone } from '../models/WorkZone';
import { LocationHistory } from '../models/LocationHistory';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';
import { io } from '../server';

const router = Router();

// Dashboard statistics
router.get('/dashboard', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's check-ins
    const todayCheckins = await AttendanceRecord.count({
      where: {
        type: 'checkin',
        timestamp: {
          [Op.gte]: today
        }
      }
    });

    // Currently checked in (checked in but not checked out today)
    const checkedInUsers = await AttendanceRecord.findAll({
      where: {
        type: 'checkin',
        timestamp: {
          [Op.gte]: today
        }
      },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId']
      }]
    });

    const checkedOutToday = await AttendanceRecord.findAll({
      where: {
        type: 'checkout',
        timestamp: {
          [Op.gte]: today
        }
      },
      attributes: ['userId']
    });

    const checkedOutUserIds = new Set(checkedOutToday.map(r => r.userId));
    const currentlyCheckedIn = checkedInUsers.filter(r => !checkedOutUserIds.has(r.userId));

    // Violations today
    const violationsToday = await AttendanceRecord.count({
      where: {
        isViolation: true,
        timestamp: {
          [Op.gte]: today
        }
      }
    });

    // Total active users
    const totalUsers = await User.count({
      where: { isActive: true }
    });

    // Total work zones
    const totalZones = await WorkZone.count({
      where: { isActive: true }
    });

    res.json({
      success: true,
      data: {
        todayCheckins,
        currentlyCheckedIn: currentlyCheckedIn.length,
        currentlyCheckedInUsers: currentlyCheckedIn.map(r => ({
          user: r.user,
          checkinTime: r.timestamp
        })),
        violationsToday,
        totalUsers,
        totalZones
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get real-time locations (for map view)
router.get('/realtime-locations', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { userIds } = req.query;

    const where: any = {};
    if (userIds) {
      where.userId = (userIds as string).split(',');
    }

    // Get latest location for each user
    const latestLocations = await LocationHistory.findAll({
      where,
      attributes: [
        'userId',
        'latitude',
        'longitude',
        'accuracy',
        'timestamp',
        [LocationHistory.sequelize!.fn('MAX', LocationHistory.sequelize!.col('timestamp')), 'maxTimestamp']
      ],
      group: ['userId', 'latitude', 'longitude', 'accuracy', 'timestamp'],
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId']
      }],
      order: [['timestamp', 'DESC']],
      limit: 100
    });

    res.json({
      success: true,
      data: { locations: latestLocations }
    });
  } catch (error) {
    next(error);
  }
});

export default router;


