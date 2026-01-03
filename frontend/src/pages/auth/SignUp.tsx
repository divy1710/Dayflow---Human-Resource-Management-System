import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores';
import { otpService } from '../../services';
import './auth.css';

type Step = 'form' | 'otp' | 'verified';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp, isLoading, error, clearError } = useAuthStore();
  
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'EMPLOYEE',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    setValidationError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value.slice(-1);
    setOtpDigits(newOtpDigits);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtpDigits = [...otpDigits];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtpDigits[index] = char;
    });
    setOtpDigits(newOtpDigits);
    
    // Focus last filled input or next empty one
    const lastIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[lastIndex]?.focus();
  };

  const sendOtp = async () => {
    if (!formData.email) {
      setValidationError('Please enter your email first');
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      setValidationError('Please enter your name');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    
    try {
      await otpService.sendOtp(formData.email);
      setStep('otp');
      setResendTimer(60);
      setOtpSuccess('OTP sent to your email!');
      setTimeout(() => setOtpSuccess(''), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setOtpError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setOtpError('Please enter complete OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await otpService.verifyOtp(formData.email, otp);
      setStep('verified');
      setOtpSuccess('Email verified successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setOtpError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    
    setOtpLoading(true);
    setOtpError('');
    setOtpDigits(['', '', '', '', '', '']);
    
    try {
      await otpService.sendOtp(formData.email);
      setResendTimer(60);
      setOtpSuccess('OTP resent successfully!');
      setTimeout(() => setOtpSuccess(''), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setOtpError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'form') {
      await sendOtp();
      return;
    }

    if (step === 'otp') {
      await verifyOtp();
      return;
    }

    // Final signup after OTP verification
    try {
      await signUp({
        employeeId: `EMP${Date.now()}`,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as 'ADMIN' | 'EMPLOYEE',
      });
      navigate('/dashboard');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-logo">
          <span>DayFlow</span>
          <p>Human Resource Management System</p>
        </div>

        {/* Progress indicator */}
        <div className="signup-progress">
          <div className={`progress-step ${step === 'form' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <span>Details</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${step === 'otp' ? 'active' : step === 'verified' ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Verify</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${step === 'verified' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Complete</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || validationError || otpError) && (
            <div className="auth-error">{error || validationError || otpError}</div>
          )}
          {otpSuccess && <div className="auth-success">{otpSuccess}</div>}

          {step === 'form' && (
            <>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="role-select"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin/HR</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password :-</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={otpLoading}>
                {otpLoading ? (
                  <>
                    <Loader2 size={20} className="spin" /> Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail size={20} /> Send OTP to Verify Email
                  </>
                )}
              </button>
            </>
          )}

          {step === 'otp' && (
            <div className="otp-section">
              <div className="otp-icon">
                <Mail size={48} />
              </div>
              <h3>Verify Your Email</h3>
              <p>We've sent a 6-digit OTP to</p>
              <p className="otp-email">{formData.email}</p>
              
              <div className="otp-inputs">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="otp-input"
                  />
                ))}
              </div>

              <button type="submit" className="auth-button" disabled={otpLoading}>
                {otpLoading ? (
                  <>
                    <Loader2 size={20} className="spin" /> Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <p className="resend-text">
                Didn't receive the code?{' '}
                {resendTimer > 0 ? (
                  <span className="resend-timer">Resend in {resendTimer}s</span>
                ) : (
                  <button type="button" className="resend-btn" onClick={resendOtp} disabled={otpLoading}>
                    Resend OTP
                  </button>
                )}
              </p>

              <button
                type="button"
                className="back-btn"
                onClick={() => setStep('form')}
              >
                ← Back to form
              </button>
            </div>
          )}

          {step === 'verified' && (
            <div className="otp-section verified-section">
              <div className="verified-icon">
                <CheckCircle size={64} />
              </div>
              <h3>Email Verified!</h3>
              <p>Your email has been successfully verified.</p>
              <p>Click below to complete your registration.</p>

              {error && <div className="auth-error" style={{ marginTop: '16px' }}>{error}</div>}

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="spin" /> Creating Account...
                  </>
                ) : (
                  'Complete Sign Up'
                )}
              </button>
            </div>
          )}
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
