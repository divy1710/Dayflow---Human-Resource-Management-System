import { Response, NextFunction } from 'express';
import { Salary, Profile } from '../models/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getMySalary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const salary = await Salary.findOne({ userId: req.user!.id });

    res.json({ status: 'success', data: { salary: salary || null } });
  } catch (error) {
    next(error);
  }
};

export const getAllSalaries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const salaries = await Salary.find()
      .populate({
        path: 'userId',
        select: '-password',
      })
      .skip(skip)
      .limit(Number(limit));

    // Get profiles for users
    const userIds = salaries.map(s => s.userId);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const salariesWithProfiles = salaries.map(salary => ({
      ...salary.toObject(),
      user: {
        ...salary.userId,
        profile: profileMap.get((salary.userId as any)._id?.toString()) || null,
      },
    }));

    const total = await Salary.countDocuments();

    res.json({
      status: 'success',
      data: {
        salaries: salariesWithProfiles,
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

export const getSalaryByUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const salary = await Salary.findOne({ userId }).populate({
      path: 'userId',
      select: '-password',
    });

    if (!salary) {
      throw new AppError('Salary record not found', 404);
    }

    const profile = await Profile.findOne({ userId });

    res.json({
      status: 'success',
      data: {
        salary: {
          ...salary.toObject(),
          user: {
            ...salary.userId,
            profile,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createSalary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, basicSalary, allowances, deductions, currency, paymentFrequency } = req.body;

    // Check if salary already exists
    const existing = await Salary.findOne({ userId });

    if (existing) {
      throw new AppError('Salary record already exists for this user', 400);
    }

    const netSalary = basicSalary + (allowances || 0) - (deductions || 0);

    const salary = await Salary.create({
      userId,
      basicSalary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      netSalary,
      currency: currency || 'USD',
      paymentFrequency: paymentFrequency || 'MONTHLY',
    });

    res.status(201).json({ status: 'success', data: { salary } });
  } catch (error) {
    next(error);
  }
};

export const updateSalary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { basicSalary, allowances, deductions, currency, paymentFrequency } = req.body;

    const existing = await Salary.findOne({ userId });

    if (!existing) {
      throw new AppError('Salary record not found', 404);
    }

    const newBasic = basicSalary ?? existing.basicSalary;
    const newAllowances = allowances ?? existing.allowances;
    const newDeductions = deductions ?? existing.deductions;
    const netSalary = newBasic + newAllowances - newDeductions;

    const salary = await Salary.findOneAndUpdate(
      { userId },
      {
        basicSalary: newBasic,
        allowances: newAllowances,
        deductions: newDeductions,
        netSalary,
        currency,
        paymentFrequency,
      },
      { new: true }
    );

    res.json({ status: 'success', data: { salary } });
  } catch (error) {
    next(error);
  }
};
