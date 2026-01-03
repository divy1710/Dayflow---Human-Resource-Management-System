import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadDocument,
  deleteDocument,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.get('/:userId', getProfile);
router.put('/', updateProfile);
router.put('/:userId', updateProfile);
router.post('/picture', uploadProfilePicture);
router.post('/documents', uploadDocument);
router.delete('/documents/:documentId', deleteDocument);

export default router;
