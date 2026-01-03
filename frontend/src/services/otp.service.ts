import api from '../lib/axios';

export const otpService = {
  sendOtp: (email: string) => 
    api.post('/otp/send', { email }),
  
  verifyOtp: (email: string, otp: string) => 
    api.post('/otp/verify', { email, otp }),
};
