import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveBalance,
} from '../controllers/leave.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Employee routes
router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/balance', getLeaveBalance);
router.delete('/:id', cancelLeave);

// Admin routes
router.get('/', authorize('ADMIN'), getAllLeaves);
router.get('/:id', getLeaveById);
router.put('/:id/approve', authorize('ADMIN'), approveLeave);
router.put('/:id/reject', authorize('ADMIN'), rejectLeave);

export default router;
