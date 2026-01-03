import mongoose, { Document, Schema } from 'mongoose';

export interface ISalary extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  currency: string;
  paymentFrequency: string;
  createdAt: Date;
  updatedAt: Date;
}

const salarySchema = new Schema<ISalary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentFrequency: {
      type: String,
      enum: ['MONTHLY', 'WEEKLY', 'BI_WEEKLY'],
      default: 'MONTHLY',
    },
  },
  {
    timestamps: true,
  }
);

export const Salary = mongoose.model<ISalary>('Salary', salarySchema);
