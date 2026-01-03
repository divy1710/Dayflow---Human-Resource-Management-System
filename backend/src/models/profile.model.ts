import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument {
  _id?: mongoose.Types.ObjectId;
  name: string;
  type: string;
  url: string;
  createdAt?: Date;
}

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
  department?: string;
  designation?: string;
  joiningDate?: Date;
  employmentType?: string;
  documents: IDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    dateOfBirth: Date,
    profilePicture: String,
    department: String,
    designation: String,
    joiningDate: Date,
    employmentType: String,
    documents: [documentSchema],
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);
