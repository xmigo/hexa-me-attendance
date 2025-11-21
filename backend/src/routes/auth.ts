import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/redis';
import { authenticate } from '../middleware/auth';

const router = Router();

// Helper route to show available endpoints (GET requests)
router.get('/login', (req: Request, res: Response) => {
  res.status(405).json({
    error: 'Method not allowed',
    message: 'This endpoint requires POST method',
    example: {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'user@example.com',
        password: 'yourpassword'
      }
    }
  });
});

// Register new user (admin only in production)
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { email, password, firstName, lastName, role, employeeId, department, jobTitle } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Missing required fields', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'employee',
      employeeId,
      department,
      jobTitle
    });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh:${user.id}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );

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
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in Redis
    await redisClient.setEx(
      `refresh:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

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
          jobTitle: user.jobTitle,
          biometricEnrolled: user.biometricEnrolled
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { id: string };

    const storedToken = await redisClient.get(`refresh:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await redisClient.setEx(
      `refresh:${user.id}`,
      7 * 24 * 60 * 60,
      newRefreshToken
    );

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req: any, res: Response, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = req.user.id;

    // Blacklist token
    if (token) {
      const decoded = jwt.decode(token) as { exp?: number };
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisClient.setEx(`blacklist:${token}`, ttl, '1');
        }
      }
    }

    // Remove refresh token
    await redisClient.del(`refresh:${userId}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: any, res: Response, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
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

function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

function generateRefreshToken(user: User): string {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

export default router;


