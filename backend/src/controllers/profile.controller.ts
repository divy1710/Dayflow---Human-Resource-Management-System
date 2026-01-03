import { Response, NextFunction } from 'express';
import { Profile, Employee } from '../models/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';
import cloudinary from '../lib/cloudinary.js';
import { Readable } from 'stream';

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

    // Fetch employee data for job details
    const employee = await Employee.findOne({ userId });

    // Merge employee job details with profile
    const profileData = {
      ...profile.toObject(),
      department: employee?.department || profile.department,
      designation: employee?.designation || profile.designation,
      joiningDate: employee?.dateOfJoining || profile.joiningDate,
      employmentType: profile.employmentType,
      site: employee?.site,
      status: employee?.status,
    };

    res.json({ status: 'success', data: { profile: profileData } });
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
      site,
    } = req.body;

    // Fields that all users can update in Profile
    const updateData: any = { 
      firstName, 
      lastName, 
      phone, 
      address, 
      city, 
      state, 
      country, 
      zipCode, 
      dateOfBirth,
      employmentType,
      department,
      designation,
      joiningDate
    };

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Update Profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Update Employee schema job details
    if (department || designation || joiningDate || site) {
      const employeeUpdateData: any = {};
      if (department) employeeUpdateData.department = department;
      if (designation) employeeUpdateData.designation = designation;
      if (joiningDate) employeeUpdateData.dateOfJoining = joiningDate;
      if (site) employeeUpdateData.site = site;

      await Employee.findOneAndUpdate(
        { userId },
        employeeUpdateData,
        { new: true, upsert: true }
      );
    }

    // Fetch updated employee data
    const employee = await Employee.findOne({ userId });

    // Merge employee job details with profile
    const profileData = {
      ...profile.toObject(),
      department: employee?.department || profile.department,
      designation: employee?.designation || profile.designation,
      joiningDate: employee?.dateOfJoining || profile.joiningDate,
      employmentType: profile.employmentType,
      site: employee?.site,
      status: employee?.status,
    };

    res.json({ status: 'success', data: { profile: profileData } });
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
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Upload to Cloudinary
    const uploadStream = (buffer: Buffer): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'dayflow/profiles',
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        const readable = Readable.from(buffer);
        readable.pipe(stream);
      });
    };

    const result = await uploadStream(req.file.buffer);

    // Update profile with new picture URL
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user!.id },
      { profilePicture: result.secure_url },
      { new: true }
    );

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    res.json({ 
      status: 'success', 
      data: { 
        profile,
        imageUrl: result.secure_url 
      } 
    });
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
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { documentType } = req.body;

    const profile = await Profile.findOne({ userId: req.user!.id });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Upload to Cloudinary
    const uploadStream = (buffer: Buffer): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'hrms/documents',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        const readable = Readable.from(buffer);
        readable.pipe(stream);
      });
    };

    const result = await uploadStream(req.file.buffer);

    const document = {
      _id: new mongoose.Types.ObjectId(),
      name: req.file.originalname,
      filename: req.file.originalname,
      type: documentType || 'GENERAL',
      documentType: documentType || 'GENERAL',
      url: result.secure_url,
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

    // Find the profile that contains this document
    const profile = await Profile.findOne({ 
      'documents._id': new mongoose.Types.ObjectId(documentId)
    });

    if (!profile) {
      throw new AppError('Document not found', 404);
    }

    // Check authorization: user can only delete their own documents unless they're admin
    if (req.user!.role !== 'ADMIN' && profile.userId.toString() !== req.user!.id) {
      throw new AppError('Access denied', 403);
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

export const downloadDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId } = req.params;

    // Find profile with the document
    const profile = await Profile.findOne({
      'documents._id': new mongoose.Types.ObjectId(documentId),
    });

    if (!profile) {
      throw new AppError('Document not found', 404);
    }

    // Check authorization
    const isAdmin = req.user!.role === 'ADMIN';
    if (!isAdmin && profile.userId.toString() !== req.user!.id) {
      throw new AppError('Access denied', 403);
    }

    const document = profile.documents.find(
      (doc: any) => doc._id.toString() === documentId
    );

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Redirect to Cloudinary URL
    res.redirect(document.url);
  } catch (error) {
    next(error);
  }
};
