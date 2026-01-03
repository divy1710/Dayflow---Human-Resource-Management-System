import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  tradeId: string;
  employeeName: string;
  site: string;
  department: string;
  designation: string;
  dateOfJoining: Date;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: Date;
  mobile: string;
  pan?: string;
  aadhaar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branch?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated';
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    tradeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    site: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
    },
    aadhaar: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
      default: 'Active',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
employeeSchema.index({ department: 1 });
employeeSchema.index({ site: 1 });
employeeSchema.index({ status: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
