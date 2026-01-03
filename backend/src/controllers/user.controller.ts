import { Response, NextFunction } from 'express';
import { User, Profile } from '../models/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Get profiles for all users
    const userIds = users.map(u => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const usersWithProfiles = users.map(user => ({
      id: user._id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      profile: profileMap.get(user._id.toString()) || null,
      createdAt: user.createdAt,
    }));

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users: usersWithProfiles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Regular employees can only view their own profile
    if (req.user!.role === 'EMPLOYEE' && req.user!.id !== id) {
      throw new AppError('Access denied', 403);
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Only admins can update user roles
    if (role && req.user!.role !== 'ADMIN') {
      throw new AppError('Only admins can update user roles', 403);
    }

    // Employees can only update themselves
    if (req.user!.role === 'EMPLOYEE' && req.user!.id !== id) {
      throw new AppError('Access denied', 403);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const profile = await Profile.findOne({ userId: user._id });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
          profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);
    await Profile.findOneAndDelete({ userId: id });

    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
