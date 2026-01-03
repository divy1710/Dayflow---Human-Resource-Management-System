import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const applyLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Check for overlapping leaves
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId: req.user!.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });

    if (overlapping) {
      throw new AppError('You already have a leave request for these dates', 400);
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: req.user!.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    });

    res.status(201).json({ status: 'success', data: { leave } });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where: any = { userId: req.user!.id };

    if (status) {
      where.status = status;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.leaveRequest.count({ where });

    res.json({
      status: 'success',
      data: {
        leaves,
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

export const getAllLeaves = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.leaveRequest.count({ where });

    res.json({
      status: 'success',
      data: {
        leaves,
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

export const getLeaveById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    // Employees can only view their own leaves
    if (req.user!.role === 'EMPLOYEE' && leave.userId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({ status: 'success', data: { leave } });
  } catch (error) {
    next(error);
  }
};

export const approveLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Leave request is not pending', 400);
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        comments,
      },
    });

    // Update leave balance
    const days = Math.ceil(
      (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    await prisma.leaveBalance.updateMany({
      where: {
        userId: leave.userId,
        leaveType: leave.leaveType,
        year: new Date().getFullYear(),
      },
      data: {
        used: { increment: days },
        remaining: { decrement: days },
      },
    });

    res.json({ status: 'success', data: { leave: updated } });
  } catch (error) {
    next(error);
  }
};

export const rejectLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Leave request is not pending', 400);
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: req.user!.id,
        approvedAt: new Date(),
        comments,
      },
    });

    res.json({ status: 'success', data: { leave: updated } });
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const leave = await prisma.leaveRequest.findUnique({ where: { id } });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.userId !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Only pending leave requests can be cancelled', 400);
    }

    await prisma.leaveRequest.delete({ where: { id } });

    res.json({ status: 'success', message: 'Leave request cancelled' });
  } catch (error) {
    next(error);
  }
};

export const getLeaveBalance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const year = new Date().getFullYear();

    let balances = await prisma.leaveBalance.findMany({
      where: {
        userId: req.user!.id,
        year,
      },
    });

    // If no balances exist, create default ones
    if (balances.length === 0) {
      const defaultBalances = [
        { leaveType: 'PAID' as const, total: 20 },
        { leaveType: 'SICK' as const, total: 10 },
        { leaveType: 'CASUAL' as const, total: 5 },
        { leaveType: 'UNPAID' as const, total: 30 },
      ];

      await prisma.leaveBalance.createMany({
        data: defaultBalances.map((b) => ({
          userId: req.user!.id,
          leaveType: b.leaveType,
          total: b.total,
          used: 0,
          remaining: b.total,
          year,
        })),
      });

      balances = await prisma.leaveBalance.findMany({
        where: { userId: req.user!.id, year },
      });
    }

    res.json({ status: 'success', data: { balances } });
  } catch (error) {
    next(error);
  }
};
