import { Router } from 'express';
import { Shift, UserShift, Overtime, User } from '../models';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Get all shifts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const shifts = await Shift.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: shifts
    });
  } catch (error) {
    next(error);
  }
});

// Get single shift
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const shift = await Shift.findByPk(req.params.id);

    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    res.json({
      success: true,
      data: shift
    });
  } catch (error) {
    next(error);
  }
});

// Create shift
router.post('/', authenticate, authorize('admin', 'hr'), async (req, res, next) => {
  try {
    const {
      name,
      description,
      startTime,
      endTime,
      workDays,
      color,
      allowedLateMinutes,
      allowedEarlyDepartureMinutes,
      overtimeMultiplier
    } = req.body;

    const shift = await Shift.create({
      name,
      description,
      startTime,
      endTime,
      workDays,
      color,
      allowedLateMinutes,
      allowedEarlyDepartureMinutes,
      overtimeMultiplier,
      isActive: true
    });

    res.status(201).json({
      success: true,
      data: shift,
      message: 'Shift created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update shift
router.put('/:id', authenticate, authorize('admin', 'hr'), async (req, res, next) => {
  try {
    const shift = await Shift.findByPk(req.params.id);

    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    const {
      name,
      description,
      startTime,
      endTime,
      workDays,
      color,
      allowedLateMinutes,
      allowedEarlyDepartureMinutes,
      overtimeMultiplier,
      isActive
    } = req.body;

    await shift.update({
      name,
      description,
      startTime,
      endTime,
      workDays,
      color,
      allowedLateMinutes,
      allowedEarlyDepartureMinutes,
      overtimeMultiplier,
      isActive
    });

    res.json({
      success: true,
      data: shift,
      message: 'Shift updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete shift
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const shift = await Shift.findByPk(req.params.id);

    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    // Check if shift is assigned to any users
    const assignmentCount = await UserShift.count({
      where: { shiftId: req.params.id, isActive: true }
    });

    if (assignmentCount > 0) {
      throw new AppError('Cannot delete shift that is assigned to employees', 400);
    }

    await shift.destroy();

    res.json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get shift assignments
router.get('/:id/assignments', authenticate, async (req, res, next) => {
  try {
    const assignments = await UserShift.findAll({
      where: { shiftId: req.params.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId', 'department']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
});

// Assign shift to user
router.post('/assignments', authenticate, authorize('admin', 'hr', 'manager'), async (req, res, next) => {
  try {
    const { userId, shiftId, effectiveFrom, effectiveTo } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if shift exists
    const shift = await Shift.findByPk(shiftId);
    if (!shift) {
      throw new AppError('Shift not found', 404);
    }

    // Deactivate previous active assignments for this user
    await UserShift.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );

    // Create new assignment
    const assignment = await UserShift.create({
      userId,
      shiftId,
      effectiveFrom: effectiveFrom || new Date(),
      effectiveTo,
      isActive: true
    });

    const assignmentWithDetails = await UserShift.findByPk(assignment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId']
        },
        {
          model: Shift,
          as: 'shift'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: assignmentWithDetails,
      message: 'Shift assigned successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user's current shift
router.get('/user/:userId/current', authenticate, async (req, res, next) => {
  try {
    const assignment = await UserShift.findOne({
      where: {
        userId: req.params.userId,
        isActive: true
      },
      include: [
        {
          model: Shift,
          as: 'shift'
        }
      ]
    });

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
});

// Get overtime records
router.get('/overtime/records', authenticate, async (req, res, next) => {
  try {
    const { status, userId, startDate, endDate } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate && endDate) {
      where.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const overtimeRecords = await Overtime.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'employeeId']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: overtimeRecords
    });
  } catch (error) {
    next(error);
  }
});

// Approve/Reject overtime
router.put('/overtime/:id/approve', authenticate, authorize('admin', 'hr', 'manager'), async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Invalid status. Must be approved or rejected', 400);
    }

    const overtime = await Overtime.findByPk(req.params.id);

    if (!overtime) {
      throw new AppError('Overtime record not found', 404);
    }

    await overtime.update({
      status,
      notes,
      approvedBy: req.user!.id,
      approvedAt: new Date()
    });

    res.json({
      success: true,
      data: overtime,
      message: `Overtime ${status} successfully`
    });
  } catch (error) {
    next(error);
  }
});

export default router;
