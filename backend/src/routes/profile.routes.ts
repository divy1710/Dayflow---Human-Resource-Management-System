import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload, documentUpload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.get('/:userId', getProfile);
router.put('/', updateProfile);
router.put('/:userId', updateProfile);
router.post('/picture', upload.single('profilePicture'), uploadProfilePicture);
router.post('/documents', documentUpload.single('file'), uploadDocument);
router.get('/documents/:documentId/download', downloadDocument);
router.delete('/documents/:documentId', deleteDocument);

export default router;
