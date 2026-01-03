import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

// Create transporter lazily to ensure env vars are loaded
const getTransporter = (): Transporter => {
  if (transporter) return transporter;
  
  // For Gmail with App Password
  if (process.env.SMTP_HOST === 'smtp.gmail.com') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // For other SMTP providers
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  return transporter;
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"DayFlow HRMS" <noreply@dayflow.com>',
    to: email,
    subject: 'Verify Your Email - DayFlow HRMS',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #1a1a2e; color: #e2e8f0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .card { background-color: #16213e; border-radius: 12px; padding: 40px; }
          .logo { text-align: center; color: #a855f7; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
          .otp-box { background-color: #2d3748; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #a855f7; letter-spacing: 8px; }
          .message { color: #a0aec0; line-height: 1.6; }
          .footer { text-align: center; color: #718096; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">DayFlow</div>
            <p class="message">Hello,</p>
            <p class="message">Thank you for registering with DayFlow HRMS. Please use the following OTP to verify your email address:</p>
            <div class="otp-box">
              <span class="otp-code">${otp}</span>
            </div>
            <p class="message">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <p class="message">If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DayFlow HRMS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await getTransporter().sendMail(mailOptions);
};

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
