import { Router } from 'express';
import {
  getMySalary,
  getAllSalaries,
  getSalaryByUser,
  updateSalary,
  createSalary,
} from '../controllers/salary.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Employee routes
router.get('/my', getMySalary);

// Admin routes
router.get('/', authorize('ADMIN', 'HR'), getAllSalaries);
router.get('/user/:userId', authorize('ADMIN', 'HR'), getSalaryByUser);
router.post('/', authorize('ADMIN', 'HR'), createSalary);
router.put('/:userId', authorize('ADMIN', 'HR'), updateSalary);

export default router;
