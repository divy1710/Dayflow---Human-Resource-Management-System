import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByUser,
  updateAttendance,
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);

// Admin routes
router.get('/', authorize('ADMIN', 'HR'), getAllAttendance);
router.get('/user/:userId', authorize('ADMIN', 'HR'), getAttendanceByUser);
router.put('/:id', authorize('ADMIN', 'HR'), updateAttendance);

export default router;
