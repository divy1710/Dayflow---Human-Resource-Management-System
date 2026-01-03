import { Response, NextFunction } from 'express';
import { LeaveRequest, LeaveBalance, Profile } from '../models/index.js';
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
    const overlapping = await LeaveRequest.findOne({
      userId: req.user!.id,
      status: { $in: ['PENDING', 'APPROVED'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (overlapping) {
      throw new AppError('You already have a leave request for these dates', 400);
    }

    const leave = await LeaveRequest.create({
      userId: req.user!.id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
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
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { userId: req.user!.id };

    if (status) {
      query.status = status;
    }

    const leaves = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await LeaveRequest.countDocuments(query);

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
    const { status, userId, leaveType, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (userId) {
      query.userId = userId;
    }

    if (leaveType) {
      query.leaveType = leaveType;
    }

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'userId',
        select: 'employeeId email',
        populate: {
          path: 'profile',
          select: 'firstName lastName department designation'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await LeaveRequest.countDocuments(query);

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

    const leave = await LeaveRequest.findById(id).populate({
      path: 'userId',
      select: '-password',
    });

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    // Employees can only view their own leaves
    if (req.user!.role === 'EMPLOYEE' && (leave.userId as any)._id.toString() !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const profile = await Profile.findOne({ userId: leave.userId });

    res.json({
      status: 'success',
      data: {
        leave: {
          ...leave.toObject(),
          user: {
            ...leave.userId,
            profile,
          },
        },
      },
    });
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

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Leave request is not pending', 400);
    }

    leave.status = 'APPROVED';
    leave.approvedBy = req.user!.id as any;
    leave.approvedAt = new Date();
    leave.comments = comments;
    await leave.save();

    // Update leave balance
    const days = Math.ceil(
      (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    await LeaveBalance.findOneAndUpdate(
      {
        userId: leave.userId,
        leaveType: leave.leaveType,
        year: new Date().getFullYear(),
      },
      {
        $inc: { used: days, remaining: -days },
      }
    );

    res.json({ status: 'success', data: { leave } });
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

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Leave request is not pending', 400);
    }

    leave.status = 'REJECTED';
    leave.approvedBy = req.user!.id as any;
    leave.approvedAt = new Date();
    leave.comments = comments;
    await leave.save();

    res.json({ status: 'success', data: { leave } });
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

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.userId.toString() !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Only pending leave requests can be cancelled', 400);
    }

    await LeaveRequest.findByIdAndDelete(id);

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

    let balances = await LeaveBalance.find({
      userId: req.user!.id,
      year,
    });

    // If no balances exist, create default ones
    if (balances.length === 0) {
      const defaultBalances = [
        { leaveType: 'PAID' as const, total: 20 },
        { leaveType: 'SICK' as const, total: 10 },
        { leaveType: 'CASUAL' as const, total: 5 },
        { leaveType: 'UNPAID' as const, total: 30 },
      ];

      await LeaveBalance.insertMany(
        defaultBalances.map((b) => ({
          userId: req.user!.id,
          leaveType: b.leaveType,
          total: b.total,
          used: 0,
          remaining: b.total,
          year,
        }))
      );

      balances = await LeaveBalance.find({ userId: req.user!.id, year });
    }

    res.json({ status: 'success', data: { balances } });
  } catch (error) {
    next(error);
  }
};
