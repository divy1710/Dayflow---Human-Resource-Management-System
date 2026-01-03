import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

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

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { documents: true },
    });

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
    const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'HR';

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

    // Fields that only admin can update
    const adminOnlyFields = { department, designation, joiningDate, employmentType };
    
    // Fields that employees can update
    const employeeFields = { firstName, lastName, phone, address, city, state, country, zipCode, dateOfBirth };

    const updateData = isAdmin 
      ? { ...employeeFields, ...adminOnlyFields }
      : employeeFields;

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
    );

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData,
      include: { documents: true },
    });

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
    // TODO: Implement file upload with multer
    const { profilePicture } = req.body;

    const profile = await prisma.profile.update({
      where: { userId: req.user!.id },
      data: { profilePicture },
    });

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

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    const document = await prisma.document.create({
      data: {
        profileId: profile.id,
        name,
        type,
        url,
      },
    });

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

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { profile: true },
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    // Check if user owns this document or is admin
    if (
      document.profile.userId !== req.user!.id &&
      req.user!.role === 'EMPLOYEE'
    ) {
      throw new AppError('Access denied', 403);
    }

    await prisma.document.delete({ where: { id: documentId } });

    res.json({ status: 'success', message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
