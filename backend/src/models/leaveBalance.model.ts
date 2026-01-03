import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveBalance extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  leaveType: 'PAID' | 'SICK' | 'UNPAID' | 'CASUAL';
  total: number;
  used: number;
  remaining: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const leaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['PAID', 'SICK', 'UNPAID', 'CASUAL'],
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    used: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique balance per user per leave type per year
leaveBalanceSchema.index({ userId: 1, leaveType: 1, year: 1 }, { unique: true });

export const LeaveBalance = mongoose.model<ILeaveBalance>('LeaveBalance', leaveBalanceSchema);
