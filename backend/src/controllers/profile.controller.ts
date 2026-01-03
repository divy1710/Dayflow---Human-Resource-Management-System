import { Response, NextFunction } from 'express';
import { Profile } from '../models/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId || req.user!.id;

    // Employees can only view their own profile
    if (req.user!.role === 'EMPLOYEE' && req.user!.id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    res.json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId || req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    // Employees can only update their own profile
    if (!isAdmin && req.user!.id !== userId) {
      throw new AppError('Access denied', 403);
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      dateOfBirth,
      department,
      designation,
      joiningDate,
      employmentType,
    } = req.body;

    // Fields that employees can update
    const employeeFields: any = { firstName, lastName, phone, address, city, state, country, zipCode, dateOfBirth };
    
    // Fields that only admin can update
    const adminOnlyFields: any = { department, designation, joiningDate, employmentType };

    const updateData = isAdmin 
      ? { ...employeeFields, ...adminOnlyFields }
      : employeeFields;

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const profile = await Profile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    res.json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { profilePicture } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user!.id },
      { profilePicture },
      { new: true }
    );

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    res.json({ status: 'success', data: { profile } });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, type, url } = req.body;

    const profile = await Profile.findOne({ userId: req.user!.id });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    const document = {
      _id: new mongoose.Types.ObjectId(),
      name,
      type,
      url,
      createdAt: new Date(),
    };

    profile.documents.push(document);
    await profile.save();

    res.status(201).json({ status: 'success', data: { document } });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId } = req.params;

    const profile = await Profile.findOne({ userId: req.user!.id });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    const docIndex = profile.documents.findIndex(
      (doc) => doc._id?.toString() === documentId
    );

    if (docIndex === -1) {
      throw new AppError('Document not found', 404);
    }

    profile.documents.splice(docIndex, 1);
    await profile.save();

    res.json({ status: 'success', message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
