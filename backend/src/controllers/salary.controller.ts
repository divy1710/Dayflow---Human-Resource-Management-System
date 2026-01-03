import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getMySalary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const salary = await prisma.salary.findUnique({
      where: { userId: req.user!.id },
    });

    if (!salary) {
      return res.json({ status: 'success', data: { salary: null } });
    }

    res.json({ status: 'success', data: { salary } });
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

    const salaries = await prisma.salary.findMany({
      include: {
        user: {
          include: { profile: true },
        },
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.salary.count();

    res.json({
      status: 'success',
      data: {
        salaries,
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

    const salary = await prisma.salary.findUnique({
      where: { userId },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (!salary) {
      throw new AppError('Salary record not found', 404);
    }

    res.json({ status: 'success', data: { salary } });
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
    const existing = await prisma.salary.findUnique({ where: { userId } });

    if (existing) {
      throw new AppError('Salary record already exists for this user', 400);
    }

    const netSalary = basicSalary + (allowances || 0) - (deductions || 0);

    const salary = await prisma.salary.create({
      data: {
        userId,
        basicSalary,
        allowances: allowances || 0,
        deductions: deductions || 0,
        netSalary,
        currency: currency || 'USD',
        paymentFrequency: paymentFrequency || 'MONTHLY',
      },
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

    const existing = await prisma.salary.findUnique({ where: { userId } });

    if (!existing) {
      throw new AppError('Salary record not found', 404);
    }

    const newBasic = basicSalary ?? existing.basicSalary;
    const newAllowances = allowances ?? existing.allowances;
    const newDeductions = deductions ?? existing.deductions;
    const netSalary = newBasic + newAllowances - newDeductions;

    const salary = await prisma.salary.update({
      where: { userId },
      data: {
        basicSalary: newBasic,
        allowances: newAllowances,
        deductions: newDeductions,
        netSalary,
        currency,
        paymentFrequency,
      },
    });

    res.json({ status: 'success', data: { salary } });
  } catch (error) {
    next(error);
  }
};
