import { Response, NextFunction } from 'express';
import { Attendance, Profile } from '../models/index.js';
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
    const existing = await Attendance.findOne({
      userId: req.user!.id,
      date: today,
    });

    if (existing) {
      throw new AppError('Already checked in today', 400);
    }

    const attendance = await Attendance.create({
      userId: req.user!.id,
      date: today,
      checkIn: new Date(),
      status: 'PRESENT',
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

    const attendance = await Attendance.findOne({
      userId: req.user!.id,
      date: today,
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

    attendance.checkOut = checkOutTime;
    attendance.workHours = Math.round(workHours * 100) / 100;
    attendance.status = workHours < 4 ? 'HALF_DAY' : 'PRESENT';
    await attendance.save();

    res.json({ status: 'success', data: { attendance } });
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
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { userId: req.user!.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const attendances = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(query);

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
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};

    if (date) {
      const queryDate = new Date(date as string);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    if (userId) {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const attendances = await Attendance.find(query)
      .populate({
        path: 'userId',
        select: '-password',
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get profiles for users
    const userIds = attendances.map(a => a.userId);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const attendancesWithProfiles = attendances.map(att => ({
      ...att.toObject(),
      user: {
        ...att.userId,
        profile: profileMap.get((att.userId as any)._id?.toString()) || null,
      },
    }));

    const total = await Attendance.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        attendances: attendancesWithProfiles,
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

    const query: any = { userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const attendances = await Attendance.find(query).sort({ date: -1 });

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

    const updateData: any = { status, notes };
    if (checkIn) updateData.checkIn = new Date(checkIn);
    if (checkOut) updateData.checkOut = new Date(checkOut);

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!attendance) {
      throw new AppError('Attendance not found', 404);
    }

    res.json({ status: 'success', data: { attendance } });
  } catch (error) {
    next(error);
  }
};
