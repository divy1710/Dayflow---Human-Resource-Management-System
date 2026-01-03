import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const checkIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: req.user!.id,
          date: today,
        },
      },
    });

    if (existing) {
      throw new AppError('Already checked in today', 400);
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: req.user!.id,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT',
      },
    });

    res.status(201).json({ status: 'success', data: { attendance } });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: req.user!.id,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw new AppError('No check-in found for today', 400);
    }

    if (attendance.checkOut) {
      throw new AppError('Already checked out today', 400);
    }

    const checkOutTime = new Date();
    const workHours = attendance.checkIn
      ? (checkOutTime.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60)
      : 0;

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        workHours: Math.round(workHours * 100) / 100,
        status: workHours < 4 ? 'HALF_DAY' : 'PRESENT',
      },
    });

    res.json({ status: 'success', data: { attendance: updated } });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, page = 1, limit = 31 } = req.query;

    const where: any = { userId: req.user!.id };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.attendance.count({ where });

    res.json({
      status: 'success',
      data: {
        attendances,
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

export const getAllAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date, startDate, endDate, userId, status, page = 1, limit = 50 } = req.query;

    const where: any = {};

    if (date) {
      const queryDate = new Date(date as string);
      queryDate.setHours(0, 0, 0, 0);
      where.date = queryDate;
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.attendance.count({ where });

    res.json({
      status: 'success',
      data: {
        attendances,
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

export const getAttendanceByUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json({ status: 'success', data: { attendances } });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, notes } = req.body;

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        notes,
      },
    });

    res.json({ status: 'success', data: { attendance } });
  } catch (error) {
    next(error);
  }
};
