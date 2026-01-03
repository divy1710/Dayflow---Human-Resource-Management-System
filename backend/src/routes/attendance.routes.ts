import { Router } from 'express';
import {
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByUser,
  updateAttendance,
  requestRegularization,
  processRegularization,
  markAbsentees,
  getAttendanceStats,
  getRegularizationRequests,
} from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);
router.get('/my', getMyAttendance);
router.get('/stats', getAttendanceStats);
router.post('/regularization', requestRegularization);

// Admin/HR routes
router.get('/', authorize('ADMIN', 'HR'), getAllAttendance);
router.get('/user/:userId', authorize('ADMIN', 'HR'), getAttendanceByUser);
router.put('/:id', authorize('ADMIN', 'HR'), updateAttendance);
router.post('/mark-absentees', authorize('ADMIN', 'HR'), markAbsentees);
router.get('/regularization/requests', authorize('ADMIN', 'HR'), getRegularizationRequests);
router.put('/regularization/:id', authorize('ADMIN', 'HR'), processRegularization);

export default router;
