import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  // State: 1 = Email, 2 = Phone, 3 = Reset, 'success' = Done
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [resetToken, setResetToken] = useState('');
  const [userId, setUserId] = useState('');

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    // Simple transition to step 2
    setStep(2);
  };

  const handleVerifyStep2 = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/users/forgotpassword', { email, phone });
      if (data.success) {
        toast.success(data.message || 'Identity verified!');
        setUserId(data.data.userId);
        setResetToken(data.data.resetToken);
        setStep(3); // Go to reset password
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed. Please check your details.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.put(`/users/resetpassword/${userId}/${resetToken}`, { 
        password: newPassword 
      });
      if (data.success) {
        setStep('success');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-32 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-dark-card rounded-2xl shadow-glow-orange border border-dark-border p-8 animate-fadeIn relative z-10 transition-all duration-300">
          
          {step !== 'success' && (
            <div className="text-center mb-8 animate-fadeIn">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-orange p-4 rounded-2xl shadow-glow-orange flex items-center justify-center">
                  {step === 1 && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {step === 2 && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  {step === 3 && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  )}
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-text-primary">
                {step === 1 && "Identify Account"}
                {step === 2 && "Verify Identity"}
                {step === 3 && "Reset Password"}
              </h2>
              <p className="text-text-secondary mt-2">
                {step === 1 && "Enter your email address to find your account."}
                {step === 2 && "Enter your registered phone number to verify your identity."}
                {step === 3 && "Please enter your new secure password below."}
              </p>
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-text-primary font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-muted hover:border-primary/50 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-gradient-orange text-white py-3 rounded-lg hover:shadow-glow-orange transition-all font-semibold btn-orange-glow"
              >
                Next Step
              </button>
            </form>
          )}

          {/* STEP 2: Phone Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyStep2} className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-text-primary font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-muted hover:border-primary/50 transition-all"
                  placeholder="07XXXXXXXX"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-gradient-orange text-white py-3 rounded-lg hover:shadow-glow-orange transition-all font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none btn-orange-glow"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Identity'
                )}
              </button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                >
                  Go Back
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: New Passwords */}
          {step === 3 && (
            <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-text-primary font-medium mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-muted hover:border-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-text-primary font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary placeholder-text-muted hover:border-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-gradient-orange text-white py-3 rounded-lg hover:shadow-glow-orange transition-all font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none btn-orange-glow"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
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
              <h3 className="text-2xl font-bold text-text-primary mb-3">Password Updated</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                Your password has been successfully updated! You will be automatically redirected to the login page.
              </p>
              <div className="flex items-center justify-center text-primary font-medium">
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
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-dark-border"></div>
            </div>
          )}
          {step !== 'success' && (
            <div className="text-center mt-2">
              <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-1 group">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
