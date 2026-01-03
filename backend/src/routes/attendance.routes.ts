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

// Admin routes
router.get('/', authorize('ADMIN'), getAllAttendance);
router.get('/user/:userId', authorize('ADMIN'), getAttendanceByUser);
router.put('/:id', authorize('ADMIN'), updateAttendance);
router.post('/mark-absentees', authorize('ADMIN'), markAbsentees);
router.get('/regularization/requests', authorize('ADMIN'), getRegularizationRequests);
router.put('/regularization/:id', authorize('ADMIN'), processRegularization);

export default router;
