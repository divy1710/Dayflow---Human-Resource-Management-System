import { Router } from 'express';
import { sendOtp, verifyOtp } from '../controllers/otp.controller';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

router.post('/send', validate(sendOtpSchema), sendOtp);
router.post('/verify', validate(verifyOtpSchema), verifyOtp);

export default router;
