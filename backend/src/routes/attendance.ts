import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AttendanceRecord } from '../models/AttendanceRecord';
import { WorkZone } from '../models/WorkZone';
import { LocationHistory } from '../models/LocationHistory';
import { validateLocation } from '../utils/geofence';
import { AppError } from '../middleware/errorHandler';
import { io } from '../server';
import { Op } from 'sequelize';

const router = Router();

// Check-in
router.post('/checkin', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { latitude, longitude, accuracy, biometricType, biometricVerified } = req.body;
    const userId = req.user!.id;

    if (!latitude || !longitude) {
      throw new AppError('Location coordinates are required', 400);
    }

    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingCheckin = await AttendanceRecord.findOne({
      where: {
        userId,
        type: 'checkin',
        timestamp: {
          [Op.gte]: today
        }
      }
    });

    if (existingCheckin) {
      throw new AppError('Already checked in today', 400);
    }

    // Get all active work zones
    const zones = await WorkZone.findAll({
      where: { isActive: true }
    });

    // Validate location against geofences
    const locationValidation = validateLocation(
      { lat: latitude, lng: longitude },
      zones.map(zone => ({
        id: zone.id,
        zoneType: zone.zoneType,
        centerLat: zone.centerLat ? parseFloat(zone.centerLat.toString()) : undefined,
        centerLng: zone.centerLng ? parseFloat(zone.centerLng.toString()) : undefined,
        radius: zone.radius || undefined,
        coordinates: zone.coordinates || undefined,
        isRestricted: zone.isRestricted,
        bufferDistance: zone.bufferDistance
      }))
    );

    // Find the work zone user is in (if any)
    let workZoneId: string | undefined;
    if (locationValidation.isValid) {
      for (const zone of zones) {
        let isInZone = false;
        if (zone.zoneType === 'circle' && zone.centerLat && zone.centerLng) {
          const distance = Math.sqrt(
            Math.pow(latitude - parseFloat(zone.centerLat.toString()), 2) +
            Math.pow(longitude - parseFloat(zone.centerLng.toString()), 2)
          ) * 111000; // Approximate conversion
          isInZone = distance <= ((zone.radius || 0) + zone.bufferDistance);
        }
        if (isInZone && !zone.isRestricted) {
          workZoneId = zone.id;
          break;
        }
      }
    }

    // Create attendance record
    const attendanceRecord = await AttendanceRecord.create({
      userId,
      type: 'checkin',
      timestamp: new Date(),
      latitude,
      longitude,
      accuracy,
      workZoneId,
      isWithinZone: locationValidation.isValid,
      biometricVerified: biometricVerified || false,
      biometricType: biometricType || undefined,
      isViolation: !locationValidation.isValid || locationValidation.isInRestrictedZone,
      violationReason: locationValidation.violationReason
    });

    // Save location history
    await LocationHistory.create({
      userId,
      latitude,
      longitude,
      accuracy,
      timestamp: new Date()
    });

    // Emit real-time update
    io.emit('attendance-update', {
      userId,
      type: 'checkin',
      timestamp: attendanceRecord.timestamp,
      isViolation: attendanceRecord.isViolation
    });

    res.status(201).json({
      success: true,
      data: {
        attendance: attendanceRecord,
        locationValidation: {
          isValid: locationValidation.isValid,
          isInRestrictedZone: locationValidation.isInRestrictedZone,
          nearestZone: locationValidation.nearestZone,
          violationReason: locationValidation.violationReason
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check-out
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { latitude, longitude, accuracy, biometricType, biometricVerified, notes } = req.body;
    const userId = req.user!.id;

    if (!latitude || !longitude) {
      throw new AppError('Location coordinates are required', 400);
    }

    // Check if user has checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkin = await AttendanceRecord.findOne({
      where: {
        userId,
        type: 'checkin',
        timestamp: {
          [Op.gte]: today
        }
      },
      order: [['timestamp', 'DESC']]
    });

    if (!checkin) {
      throw new AppError('No check-in found for today', 400);
    }

    // Check if already checked out
    const existingCheckout = await AttendanceRecord.findOne({
      where: {
        userId,
        type: 'checkout',
        timestamp: {
          [Op.gte]: today
        }
      }
    });

    if (existingCheckout) {
      throw new AppError('Already checked out today', 400);
    }

    // Get work zones for validation
    const zones = await WorkZone.findAll({
      where: { isActive: true }
    });

    const locationValidation = validateLocation(
      { lat: latitude, lng: longitude },
      zones.map(zone => ({
        id: zone.id,
        zoneType: zone.zoneType,
        centerLat: zone.centerLat ? parseFloat(zone.centerLat.toString()) : undefined,
        centerLng: zone.centerLng ? parseFloat(zone.centerLng.toString()) : undefined,
        radius: zone.radius || undefined,
        coordinates: zone.coordinates || undefined,
        isRestricted: zone.isRestricted,
        bufferDistance: zone.bufferDistance
      }))
    );

    // Create checkout record
    const attendanceRecord = await AttendanceRecord.create({
      userId,
      type: 'checkout',
      timestamp: new Date(),
      latitude,
      longitude,
      accuracy,
      isWithinZone: locationValidation.isValid,
      biometricVerified: biometricVerified || false,
      biometricType: biometricType || undefined,
      notes,
      isViolation: !locationValidation.isValid || locationValidation.isInRestrictedZone,
      violationReason: locationValidation.violationReason
    });

    // Save location history
    await LocationHistory.create({
      userId,
      latitude,
      longitude,
      accuracy,
      timestamp: new Date()
    });

    // Calculate working hours
    const workingHours = (attendanceRecord.timestamp.getTime() - checkin.timestamp.getTime()) / (1000 * 60 * 60);

    // Emit real-time update
    io.emit('attendance-update', {
      userId,
      type: 'checkout',
      timestamp: attendanceRecord.timestamp,
      workingHours
    });

    res.status(201).json({
      success: true,
      data: {
        attendance: attendanceRecord,
        workingHours: workingHours.toFixed(2),
        locationValidation
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get today's attendance status
router.get('/today', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await AttendanceRecord.findAll({
      where: {
        userId,
        timestamp: {
          [Op.gte]: today
        }
      },
      order: [['timestamp', 'ASC']]
    });

    const checkin = records.find(r => r.type === 'checkin');
    const checkout = records.find(r => r.type === 'checkout');

    let workingHours = null;
    if (checkin && checkout) {
      workingHours = (checkout.timestamp.getTime() - checkin.timestamp.getTime()) / (1000 * 60 * 60);
    }

    res.json({
      success: true,
      data: {
        checkin: checkin || null,
        checkout: checkout || null,
        workingHours: workingHours ? workingHours.toFixed(2) : null,
        isCheckedIn: !!checkin && !checkout
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get attendance history
router.get('/history', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, limit = 30 } = req.query;

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

    const records = await AttendanceRecord.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['timestamp', 'DESC']]
    });

    res.json({
      success: true,
      data: { records }
    });
  } catch (error) {
    next(error);
  }
});

export default router;


