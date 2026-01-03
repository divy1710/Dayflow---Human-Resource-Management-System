import { Response, NextFunction } from 'express';
import { Attendance, Profile, User, Leave } from '../models/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';

// Helper function to calculate time difference in minutes
const getMinutesDifference = (time1: Date, time2: Date): number => {
  return Math.abs((time1.getTime() - time2.getTime()) / (1000 * 60));
};

// Helper function to parse time string (HH:mm) and combine with date
const parseTimeWithDate = (date: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

// Helper function to check if date is weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const checkIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { location } = req.body; // Optional: latitude, longitude, address
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if weekend
    if (isWeekend(today)) {
      throw new AppError('Cannot check in on weekends', 400);
    }

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user!.id,
      date: today,
    });

    if (attendance && attendance.checkIn) {
      throw new AppError('Already checked in today', 400);
    }

    // Default shift times (can be customized per user/company)
    const shiftStartTime = '09:00';
    const shiftEndTime = '18:00';
    const expectedWorkHours = 9;
    
    // Calculate if late
    const expectedCheckIn = parseTimeWithDate(today, shiftStartTime);
    const lateArrival = now > expectedCheckIn ? Math.round(getMinutesDifference(now, expectedCheckIn)) : 0;

    // Create or update attendance
    if (attendance) {
      attendance.checkIn = now;
      attendance.status = 'PRESENT';
      attendance.lateArrival = lateArrival;
      attendance.shiftStartTime = shiftStartTime;
      attendance.shiftEndTime = shiftEndTime;
      attendance.expectedWorkHours = expectedWorkHours;
      if (location) {
        attendance.location = {
          ...attendance.location,
          checkIn: location,
        };
      }
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        userId: req.user!.id,
        date: today,
        checkIn: now,
        status: 'PRESENT',
        lateArrival,
        shiftStartTime,
        shiftEndTime,
        expectedWorkHours,
        location: location ? { checkIn: location } : undefined,
      });
    }

    res.status(201).json({ 
      status: 'success', 
      data: { 
        attendance,
        message: lateArrival > 0 ? `You are ${lateArrival} minutes late` : 'On time'
      } 
    });
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
    const { location } = req.body; // Optional: latitude, longitude, address
    const now = new Date();
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

    if (!attendance.checkIn) {
      throw new AppError('Cannot check out without checking in', 400);
    }

    // Calculate work hours (excluding break time)
    let totalBreakMinutes = 0;
    if (attendance.breaks && attendance.breaks.length > 0) {
      totalBreakMinutes = attendance.breaks.reduce((sum, br) => sum + (br.duration || 0), 0);
    }

    const totalMinutesWorked = getMinutesDifference(now, attendance.checkIn) - totalBreakMinutes;
    const workHours = Math.round((totalMinutesWorked / 60) * 100) / 100;

    // Calculate early departure
    const expectedCheckOut = parseTimeWithDate(today, attendance.shiftEndTime || '18:00');
    const earlyDeparture = now < expectedCheckOut ? Math.round(getMinutesDifference(now, expectedCheckOut)) : 0;

    // Calculate overtime
    const expectedHours = attendance.expectedWorkHours || 9;
    const overtimeHours = workHours > expectedHours ? Math.round((workHours - expectedHours) * 100) / 100 : 0;

    // Determine status based on work hours
    let status: 'PRESENT' | 'HALF_DAY' | 'ABSENT' = 'PRESENT';
    if (workHours < 4) {
      status = 'HALF_DAY';
    } else if (workHours >= 4) {
      status = 'PRESENT';
    }

    attendance.checkOut = now;
    attendance.workHours = workHours;
    attendance.overtimeHours = overtimeHours;
    attendance.earlyDeparture = earlyDeparture;
    attendance.status = status;
    if (location) {
      attendance.location = {
        ...attendance.location,
        checkOut: location,
      };
    }
    await attendance.save();

    let message = 'Checked out successfully';
    if (earlyDeparture > 0) {
      message = `Checked out ${earlyDeparture} minutes early`;
    } else if (overtimeHours > 0) {
      message = `Great! You worked ${overtimeHours} hours overtime`;
    }

    res.json({ 
      status: 'success', 
      data: { 
        attendance,
        message
      } 
    });
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

// Start break
export const startBreak = async (
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

    if (!attendance || !attendance.checkIn) {
      throw new AppError('Please check in first before taking a break', 400);
    }

    if (attendance.checkOut) {
      throw new AppError('Cannot start break after checkout', 400);
    }

    // Check if there's an ongoing break
    const ongoingBreak = attendance.breaks?.find(br => !br.endTime);
    if (ongoingBreak) {
      throw new AppError('A break is already in progress', 400);
    }

    if (!attendance.breaks) {
      attendance.breaks = [];\n    }

    attendance.breaks.push({
      startTime: new Date(),
    } as any);

    await attendance.save();

    res.json({ status: 'success', data: { attendance } });
  } catch (error) {
    next(error);
  }
};

// End break
export const endBreak = async (
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

    if (!attendance || !attendance.breaks || attendance.breaks.length === 0) {
      throw new AppError('No break to end', 400);
    }

    const ongoingBreak = attendance.breaks.find(br => !br.endTime);
    if (!ongoingBreak) {
      throw new AppError('No active break found', 400);
    }

    const now = new Date();
    ongoingBreak.endTime = now;
    ongoingBreak.duration = Math.round(getMinutesDifference(now, ongoingBreak.startTime));

    await attendance.save();

    res.json({ status: 'success', data: { attendance } });
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

    const updateData: any = { notes };
    
    if (status) updateData.status = status;
    if (checkIn) {
      updateData.checkIn = new Date(checkIn);
      // Recalculate late arrival if check-in is updated
      const attendance = await Attendance.findById(id);
      if (attendance) {
        const expectedCheckIn = parseTimeWithDate(attendance.date, attendance.shiftStartTime || '09:00');
        const newCheckIn = new Date(checkIn);
        updateData.lateArrival = newCheckIn > expectedCheckIn ? 
          Math.round(getMinutesDifference(newCheckIn, expectedCheckIn)) : 0;
      }
    }
    
    if (checkOut) {
      updateData.checkOut = new Date(checkOut);
      // Recalculate work hours and other metrics
      const attendance = await Attendance.findById(id);
      if (attendance && attendance.checkIn) {
        const checkInTime = checkIn ? new Date(checkIn) : attendance.checkIn;
        const checkOutTime = new Date(checkOut);
        
        let totalBreakMinutes = 0;
        if (attendance.breaks && attendance.breaks.length > 0) {
          totalBreakMinutes = attendance.breaks.reduce((sum, br) => sum + (br.duration || 0), 0);
        }
        
        const totalMinutesWorked = getMinutesDifference(checkOutTime, checkInTime) - totalBreakMinutes;
        updateData.workHours = Math.round((totalMinutesWorked / 60) * 100) / 100;
        
        const expectedCheckOut = parseTimeWithDate(attendance.date, attendance.shiftEndTime || '18:00');
        updateData.earlyDeparture = checkOutTime < expectedCheckOut ? 
          Math.round(getMinutesDifference(checkOutTime, expectedCheckOut)) : 0;
        
        const expectedHours = attendance.expectedWorkHours || 9;
        updateData.overtimeHours = updateData.workHours > expectedHours ? 
          Math.round((updateData.workHours - expectedHours) * 100) / 100 : 0;
      }
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', '-password');

    if (!attendance) {
      throw new AppError('Attendance not found', 404);
    }

    res.json({ status: 'success', data: { attendance } });
  } catch (error) {
    next(error);
  }
};

// Request regularization for attendance
export const requestRegularization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date, reason, checkIn, checkOut } = req.body;

    if (!date || !reason) {
      throw new AppError('Date and reason are required', 400);
    }

    const requestDate = new Date(date);
    requestDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      userId: req.user!.id,
      date: requestDate,
    });

    if (!attendance) {
      // Create new attendance record for regularization
      attendance = new Attendance({
        userId: req.user!.id,
        date: requestDate,
        status: 'PENDING',
        isRegularized: true,
        regularizationReason: reason,
        regularizationStatus: 'PENDING',
      });
    } else {
      attendance.isRegularized = true;
      attendance.regularizationReason = reason;
      attendance.regularizationStatus = 'PENDING';
    }

    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);

    await attendance.save();

    res.json({ 
      status: 'success', 
      data: { attendance },
      message: 'Regularization request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Approve or reject regularization (Admin/HR only)
export const processRegularization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      throw new AppError('Invalid action. Must be APPROVED or REJECTED', 400);
    }

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      throw new AppError('Attendance record not found', 404);
    }

    if (!attendance.isRegularized) {
      throw new AppError('This is not a regularization request', 400);
    }

    attendance.regularizationStatus = action;
    attendance.approvedBy = req.user!.id as any;
    attendance.approvedAt = new Date();
    
    if (action === 'APPROVED') {
      // Recalculate metrics if approved
      if (attendance.checkIn && attendance.checkOut) {
        let totalBreakMinutes = 0;
        if (attendance.breaks && attendance.breaks.length > 0) {
          totalBreakMinutes = attendance.breaks.reduce((sum, br) => sum + (br.duration || 0), 0);
        }
        
        const totalMinutesWorked = getMinutesDifference(attendance.checkOut, attendance.checkIn) - totalBreakMinutes;
        attendance.workHours = Math.round((totalMinutesWorked / 60) * 100) / 100;
        
        const expectedCheckIn = parseTimeWithDate(attendance.date, attendance.shiftStartTime || '09:00');
        attendance.lateArrival = attendance.checkIn > expectedCheckIn ? 
          Math.round(getMinutesDifference(attendance.checkIn, expectedCheckIn)) : 0;
        
        const expectedCheckOut = parseTimeWithDate(attendance.date, attendance.shiftEndTime || '18:00');
        attendance.earlyDeparture = attendance.checkOut < expectedCheckOut ? 
          Math.round(getMinutesDifference(attendance.checkOut, expectedCheckOut)) : 0;
        
        const expectedHours = attendance.expectedWorkHours || 9;
        attendance.overtimeHours = attendance.workHours > expectedHours ? 
          Math.round((attendance.workHours - expectedHours) * 100) / 100 : 0;
        
        attendance.status = attendance.workHours >= 4 ? 'PRESENT' : 'HALF_DAY';
      } else if (attendance.checkIn) {
        attendance.status = 'HALF_DAY';\n      } else {
        attendance.status = 'PRESENT';\n      }
    } else {
      attendance.status = 'ABSENT';
    }
    
    if (notes) attendance.notes = notes;

    await attendance.save();

    res.json({ 
      status: 'success', 
      data: { attendance },
      message: `Regularization ${action.toLowerCase()} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Mark employees absent who didn't check in (cron job or manual trigger)
export const markAbsentees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Don't mark absent for weekends
    if (isWeekend(targetDate)) {
      return res.json({ 
        status: 'success', 
        message: 'Skipped: Target date is a weekend',
        data: { marked: 0 }
      });
    }

    // Get all active employees
    const allEmployees = await User.find({ 
      role: { $in: ['EMPLOYEE', 'HR'] }
    });

    // Get attendance records for the date
    const existingAttendances = await Attendance.find({ date: targetDate });
    const attendedUserIds = existingAttendances.map(a => a.userId.toString());

    // Check for approved leaves
    const approvedLeaves = await Leave.find({
      status: 'APPROVED',
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
    });
    const onLeaveUserIds = approvedLeaves.map(l => l.userId.toString());

    // Mark absent for employees who didn't check in and are not on leave
    const absentEmployees = allEmployees.filter(emp => 
      !attendedUserIds.includes(emp._id.toString()) &&
      !onLeaveUserIds.includes(emp._id.toString())
    );

    const absentRecords = await Attendance.insertMany(
      absentEmployees.map(emp => ({
        userId: emp._id,
        date: targetDate,
        status: 'ABSENT',
        notes: 'Auto-marked absent',
      }))
    );

    // Mark leave status for employees on approved leave
    const leaveRecords = await Attendance.insertMany(
      approvedLeaves
        .filter(leave => !attendedUserIds.includes(leave.userId.toString()))
        .map(leave => ({
          userId: leave.userId,
          date: targetDate,
          status: 'LEAVE',
          notes: `On ${leave.leaveType} leave`,
        }))
    );

    res.json({ 
      status: 'success', 
      data: { 
        marked: absentRecords.length + leaveRecords.length,
        absent: absentRecords.length,
        onLeave: leaveRecords.length,
        date: targetDate
      },
      message: `Marked ${absentRecords.length} employees as absent and ${leaveRecords.length} on leave`
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance statistics
export const getAttendanceStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, userId } = req.query;
    const targetUserId = userId || req.user!.id;

    const query: any = { userId: targetUserId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    } else {
      // Default to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query.date = { $gte: firstDay, $lte: lastDay };
    }

    const attendances = await Attendance.find(query);

    const stats = {
      totalDays: attendances.length,
      present: attendances.filter(a => a.status === 'PRESENT').length,
      absent: attendances.filter(a => a.status === 'ABSENT').length,
      halfDay: attendances.filter(a => a.status === 'HALF_DAY').length,
      leave: attendances.filter(a => a.status === 'LEAVE').length,
      pending: attendances.filter(a => a.status === 'PENDING').length,
      totalWorkHours: attendances.reduce((sum, a) => sum + (a.workHours || 0), 0),
      totalOvertimeHours: attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
      averageWorkHours: 0,
      lateArrivals: attendances.filter(a => (a.lateArrival || 0) > 0).length,
      earlyDepartures: attendances.filter(a => (a.earlyDeparture || 0) > 0).length,
      attendanceRate: 0,
    };

    const workingDays = stats.totalDays - stats.leave;
    stats.averageWorkHours = workingDays > 0 ? 
      Math.round((stats.totalWorkHours / workingDays) * 100) / 100 : 0;
    
    stats.attendanceRate = workingDays > 0 ? 
      Math.round(((stats.present + stats.halfDay * 0.5) / workingDays) * 100 * 100) / 100 : 0;

    res.json({ status: 'success', data: { stats } });
  } catch (error) {
    next(error);
  }
};

// Get regularization requests (Admin/HR only)
export const getRegularizationRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { isRegularized: true };
    
    if (status) {
      query.regularizationStatus = status;
    }

    const requests = await Attendance.find(query)
      .populate('userId', '-password')
      .populate('approvedBy', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        requests,
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
