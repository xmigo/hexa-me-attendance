import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

const router = Router();

// Get all users (admin/manager/hr only)
router.get('/', authenticate, authorize('admin', 'manager', 'hr'), async (req: AuthRequest, res: Response, next) => {
  try {
    const { search, department, role, isActive, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { employeeId: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (department) {
      where.department = department;
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit as string),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(count / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user!;

    // Users can only view their own profile unless they're admin/manager/hr
    if (userId !== requestingUser.id && !['admin', 'manager', 'hr'].includes(requestingUser.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      employeeId,
      department,
      jobTitle,
      role,
      startDate
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Missing required fields', 400);
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          ...(employeeId ? [{ employeeId }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User with this email or employee ID already exists', 409);
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      employeeId,
      department,
      jobTitle,
      role: role || 'employee',
      startDate: startDate ? new Date(startDate) : undefined
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          jobTitle: user.jobTitle,
          biometricEnrolled: user.biometricEnrolled
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.params.id;
    const requestingUser = req.user!;

    // Users can only update their own profile unless they're admin/manager
    if (userId !== requestingUser.id && !['admin', 'manager'].includes(requestingUser.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const {
      firstName,
      lastName,
      phone,
      department,
      jobTitle,
      role,
      isActive,
      emergencyContact
    } = req.body;

    // Only admins can change role and isActive
    if (requestingUser.role !== 'admin') {
      delete req.body.role;
      delete req.body.isActive;
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone !== undefined ? phone : user.phone,
      department: department !== undefined ? department : user.department,
      jobTitle: jobTitle !== undefined ? jobTitle : user.jobTitle,
      role: role !== undefined ? role : user.role,
      isActive: isActive !== undefined ? isActive : user.isActive,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : user.emergencyContact
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          jobTitle: user.jobTitle
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Soft delete by setting isActive to false
    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;


