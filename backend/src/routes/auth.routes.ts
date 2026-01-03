import { Router } from 'express';
import {
  signUp,
  signIn,
  signOut,
  getMe,
  refreshToken,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { signUpSchema, signInSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', validate(signUpSchema), signUp);
router.post('/signin', validate(signInSchema), signIn);
router.post('/signout', signOut);
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshToken);

export default router;
