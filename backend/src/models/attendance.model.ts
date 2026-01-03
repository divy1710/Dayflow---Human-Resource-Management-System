import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'PENDING' | 'HOLIDAY' | 'WEEKEND';
  workHours?: number;
  overtimeHours?: number;
  lateArrival?: number; // minutes late
  earlyDeparture?: number; // minutes early
  breaks?: {
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes
  }[];
  shiftStartTime?: string; // HH:mm format
  shiftEndTime?: string; // HH:mm format
  expectedWorkHours?: number;
  isRegularized?: boolean;
  regularizationReason?: string;
  regularizationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  location?: {
    checkIn?: { latitude: number; longitude: number; address?: string };
    checkOut?: { latitude: number; longitude: number; address?: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'PENDING', 'HOLIDAY', 'WEEKEND'],
      default: 'PENDING',
    },
    workHours: Number,
    overtimeHours: Number,
    lateArrival: Number,
    earlyDeparture: Number,
    breaks: [{
      startTime: Date,
      endTime: Date,
      duration: Number,
    }],
    shiftStartTime: { type: String, default: '09:00' },
    shiftEndTime: { type: String, default: '18:00' },
    expectedWorkHours: { type: Number, default: 9 },
    isRegularized: { type: Boolean, default: false },
    regularizationReason: String,
    regularizationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    notes: String,
    location: {
      type: {
        checkIn: {
          latitude: Number,
          longitude: Number,
          address: String,
        },
        checkOut: {
          latitude: Number,
          longitude: Number,
          address: String,
        },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique attendance per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ userId: 1, status: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
