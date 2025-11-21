import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { WorkZone } from '../models/WorkZone';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Get all work zones
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { includeInactive } = req.query;
    const where: any = {};

    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const zones = await WorkZone.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { zones }
    });
  } catch (error) {
    next(error);
  }
});

// Get single work zone
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const zone = await WorkZone.findByPk(req.params.id);

    if (!zone) {
      throw new AppError('Work zone not found', 404);
    }

    res.json({
      success: true,
      data: { zone }
    });
  } catch (error) {
    next(error);
  }
});

// Create work zone (admin/manager only)
router.post('/', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      name,
      description,
      zoneType,
      centerLat,
      centerLng,
      radius,
      coordinates,
      isRestricted,
      department,
      assignedUserIds,
      timeRestrictions,
      bufferDistance
    } = req.body;

    if (!name || !zoneType) {
      throw new AppError('Name and zone type are required', 400);
    }

    if (zoneType === 'circle' && (!centerLat || !centerLng || !radius)) {
      throw new AppError('Center coordinates and radius are required for circle zones', 400);
    }

    if (zoneType === 'polygon' && !coordinates) {
      throw new AppError('Coordinates are required for polygon zones', 400);
    }

    const zone = await WorkZone.create({
      name,
      description,
      zoneType,
      centerLat: centerLat ? parseFloat(centerLat) : undefined,
      centerLng: centerLng ? parseFloat(centerLng) : undefined,
      radius: radius ? parseInt(radius) : undefined,
      coordinates: coordinates ? JSON.stringify(coordinates) : undefined,
      isRestricted: isRestricted || false,
      department,
      assignedUserIds,
      timeRestrictions: timeRestrictions ? JSON.stringify(timeRestrictions) : undefined,
      bufferDistance: bufferDistance || 50
    });

    res.status(201).json({
      success: true,
      data: { zone }
    });
  } catch (error) {
    next(error);
  }
});

// Update work zone (admin/manager only)
router.put('/:id', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response, next) => {
  try {
    const zone = await WorkZone.findByPk(req.params.id);

    if (!zone) {
      throw new AppError('Work zone not found', 404);
    }

    const {
      name,
      description,
      centerLat,
      centerLng,
      radius,
      coordinates,
      isRestricted,
      department,
      assignedUserIds,
      timeRestrictions,
      bufferDistance,
      isActive
    } = req.body;

    await zone.update({
      name: name || zone.name,
      description: description !== undefined ? description : zone.description,
      centerLat: centerLat !== undefined ? parseFloat(centerLat) : zone.centerLat,
      centerLng: centerLng !== undefined ? parseFloat(centerLng) : zone.centerLng,
      radius: radius !== undefined ? parseInt(radius) : zone.radius,
      coordinates: coordinates !== undefined ? JSON.stringify(coordinates) : zone.coordinates,
      isRestricted: isRestricted !== undefined ? isRestricted : zone.isRestricted,
      department: department !== undefined ? department : zone.department,
      assignedUserIds: assignedUserIds !== undefined ? assignedUserIds : zone.assignedUserIds,
      timeRestrictions: timeRestrictions !== undefined ? JSON.stringify(timeRestrictions) : zone.timeRestrictions,
      bufferDistance: bufferDistance !== undefined ? parseInt(bufferDistance) : zone.bufferDistance,
      isActive: isActive !== undefined ? isActive : zone.isActive
    });

    res.json({
      success: true,
      data: { zone }
    });
  } catch (error) {
    next(error);
  }
});

// Delete work zone (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next) => {
  try {
    const zone = await WorkZone.findByPk(req.params.id);

    if (!zone) {
      throw new AppError('Work zone not found', 404);
    }

    await zone.destroy();

    res.json({
      success: true,
      message: 'Work zone deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Validate location against zones
router.post('/validate', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      throw new AppError('Location coordinates are required', 400);
    }

    const zones = await WorkZone.findAll({
      where: { isActive: true }
    });

    const { validateLocation } = await import('../utils/geofence');
    const validation = validateLocation(
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

    res.json({
      success: true,
      data: { validation }
    });
  } catch (error) {
    next(error);
  }
});

export default router;


