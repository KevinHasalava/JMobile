import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  // State: 1 = Email, 2 = OTP, 3 = Reset, 'success' = Done
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    // Mock identifying account
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      toast.success('Verification code sent');
    }, 800);
  };

  const handleVerifyStep2 = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    // Mock OTP verification
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      toast.success('Identity verified');
    }, 800);
  };

  const handleUpdateStep3 = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Mock updating password
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-dark-bg relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary opacity-5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-8 md:p-10 shadow-xl relative z-10 transition-all duration-300">
        
        {step !== 'success' && (
          <div className="flex flex-col items-center mb-8 animate-fadeIn">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              {step === 1 && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              {step === 2 && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
              {step === 3 && (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-text-primary">
              {step === 1 && "Identify Account"}
              {step === 2 && "Verification"}
              {step === 3 && "Reset Password"}
            </h2>
            <p className="text-text-muted text-sm mt-2 text-center">
              {step === 1 && "Enter your email address to find your account."}
              {step === 2 && "We've sent a 6-digit code to your email."}
              {step === 3 && "Please enter your new password below."}
            </p>
          </div>
        )}

        {/* STEP 1: Email */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-dark-border focus:border-primary rounded-xl px-4 py-3 text-text-primary outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(255,140,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,140,0,0.3)] transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Searching...' : 'Next'}
            </button>
          </form>
        )}

        {/* STEP 2: Verification (OTP) */}
        {step === 2 && (
          <form onSubmit={handleVerifyStep2} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">6-Digit Code</label>
              <input
                type="text"
                required
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // only numbers
                className="w-full bg-[#1a1a1a] border border-dark-border focus:border-primary rounded-xl px-4 py-3 text-text-primary outline-none transition-colors tracking-widest text-center text-xl font-mono"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full bg-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(255,140,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,140,0,0.3)] transition-all ${
                (loading || otp.length !== 6) ? 'opacity-70 cursor-not-allowed shadow-none hover:-translate-y-0' : 'hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}

        {/* STEP 3: New Passwords */}
        {step === 3 && (
          <form onSubmit={handleUpdateStep3} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-dark-border focus:border-primary rounded-xl px-4 py-3 text-text-primary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-dark-border focus:border-primary rounded-xl px-4 py-3 text-text-primary outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(255,140,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,140,0,0.3)] transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {/* SUCCESS STATE */}
        {step === 'success' && (
          <div className="flex flex-col items-center text-center animate-fadeIn py-4">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Password Updated</h3>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Your password has been successfully updated! You will be automatically redirected to the login page.
            </p>
            <div className="flex items-center justify-center text-primary">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting to Login...
            </div>
          </div>
        )}

        {/* Shared Footer Link */}
        {step !== 'success' && (
          <div className="text-center mt-8 pt-6 border-t border-dark-border/50">
            <Link to="/login" className="text-sm text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
