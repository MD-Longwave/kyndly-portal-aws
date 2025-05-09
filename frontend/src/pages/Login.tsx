import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import kyndlyLogo from '../assets/images/Kyndly-Temp-web-logo-blue.png';
import { useAuth } from '../contexts/AuthContext';

// Define types for the forgot password form state
type ForgotPasswordStep = 'initial' | 'code';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, forgotPassword, confirmForgotPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('initial');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState<string | null>(null);
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Password validation function
  const validatePassword = (password: string): boolean => {
    // Password should be at least 8 characters with numbers, special chars, uppercase and lowercase
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle login with Cognito
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    
    if (!username || !password) {
      setLoginError('Username and password are required');
      setIsLoading(false);
      return;
    }
    
    try {
      await login(username, password);
      // Navigate will happen in the AuthContext after successful login
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      
      // Handle different Cognito error types
      if (error.code === 'UserNotConfirmedException') {
        setLoginError('Please confirm your account before logging in.');
      } else if (error.code === 'NotAuthorizedException') {
        setLoginError('Incorrect username or password.');
      } else if (error.code === 'UserNotFoundException') {
        setLoginError('User does not exist.');
      } else if (error.code === 'PasswordResetRequiredException') {
        setLoginError('You need to reset your password. Please click on "Forgot your password?" below.');
      } else {
        setLoginError(error.message || 'An error occurred during login. Please try again.');
      }
    }
  };
  
  // Handle initiating forgot password process
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
    setIsLoading(true);
    
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Email is required');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Initiating forgot password for:', forgotPasswordEmail);
      await forgotPassword(forgotPasswordEmail);
      setForgotPasswordStep('code');
      setForgotPasswordSuccess('Verification code sent to your email. Please check your inbox (and spam folder).');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      // Handle specific Cognito error cases
      if (error.code === 'UserNotFoundException') {
        setForgotPasswordError('No account found with this email address.');
      } else if (error.code === 'InvalidParameterException') {
        setForgotPasswordError('Invalid email format. Please enter a valid email address.');
      } else if (error.code === 'LimitExceededException') {
        setForgotPasswordError('Too many attempts. Please try again later.');
      } else {
        setForgotPasswordError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle confirming forgot password with code and new password
  const handleForgotPasswordConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
    setIsLoading(true);
    
    if (!forgotPasswordEmail || !verificationCode || !newPassword) {
      setForgotPasswordError('All fields are required');
      setIsLoading(false);
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setForgotPasswordError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setForgotPasswordError(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Confirming password reset for:', forgotPasswordEmail);
      await confirmForgotPassword(forgotPasswordEmail, verificationCode, newPassword);
      setForgotPasswordSuccess('Password reset successful! You can now login with your new password.');
      
      // Reset the form after a short delay
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordStep('initial');
        // Clear form fields
        setVerificationCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 3000);
    } catch (error: any) {
      console.error('Confirm forgot password error:', error);
      
      // Handle specific Cognito error cases
      if (error.code === 'CodeMismatchException') {
        setForgotPasswordError('Invalid verification code. Please try again or request a new code.');
      } else if (error.code === 'ExpiredCodeException') {
        setForgotPasswordError('Verification code has expired. Please request a new code.');
      } else if (error.code === 'InvalidPasswordException') {
        setForgotPasswordError('Password does not meet requirements. Please use a stronger password.');
      } else if (error.code === 'LimitExceededException') {
        setForgotPasswordError('Too many attempts. Please try again later.');
      } else {
        setForgotPasswordError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resend verification code
  const handleResendCode = async () => {
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
    setIsLoading(true);
    
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Email is required');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Resending verification code to:', forgotPasswordEmail);
      await forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess('New verification code sent to your email');
    } catch (error: any) {
      console.error('Resend code error:', error);
      setForgotPasswordError(error.message || 'Failed to send new code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset forgot password modal state
  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('initial');
    setForgotPasswordEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Forgot password modal
  const renderForgotPasswordModal = () => {
    return (
      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
          <button 
            onClick={closeForgotPasswordModal}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold mb-6">Reset Password</h2>
          
          {forgotPasswordError && (
            <div className="rounded-md bg-red-50 p-4 mb-4 text-sm text-red-700">
              <p>{forgotPasswordError}</p>
            </div>
          )}
          
          {forgotPasswordSuccess && (
            <div className="rounded-md bg-green-50 p-4 mb-4 text-sm text-green-700">
              <p>{forgotPasswordSuccess}</p>
            </div>
          )}
          
          {forgotPasswordStep === 'initial' ? (
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
              <p className="text-sm text-secondary-700 mb-4">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
              
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-secondary-700">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full rounded-md bg-primary-500 py-2 px-4 text-center font-medium text-white shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Send Verification Code
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPasswordConfirm} className="space-y-4">
              <p className="text-sm text-secondary-700 mb-4">
                Enter the verification code sent to your email and your new password.
              </p>
              
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-secondary-700">
                  Verification Code
                </label>
                <input
                  id="verification-code"
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Enter the 6-digit code"
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-secondary-700">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Minimum 8 characters"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must have at least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-secondary-700">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Confirm your password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full rounded-md bg-primary-500 py-2 px-4 text-center font-medium text-white shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Reset Password
              </button>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setForgotPasswordStep('initial')}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Back to email
                </button>
                
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-secondary-800">
      <div className="m-auto w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="bg-white p-2 rounded-md inline-block mb-4">
            <img src={kyndlyLogo} alt="Kyndly" className="h-16 mx-auto" />
          </div>
          <p className="text-lg text-secondary-800 font-medium">
            ICHRA Management Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {loginError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              <p>{loginError}</p>
            </div>
          )}
          
          {forgotPasswordSuccess && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              <p>{forgotPasswordSuccess}</p>
            </div>
          )}
          
          <div className="rounded-md bg-mint p-4 text-sm text-secondary-800">
            <p>
              Welcome to the Kyndly ICHRA Portal. Please log in with your credentials to access your dashboard.
            </p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
              Username or Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button 
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotPasswordEmail(username);
                }}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary-500 py-3 px-4 text-center font-medium text-white shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Sign in
          </button>

          {process.env.NODE_ENV === 'development' && (
            <div className="text-center text-sm text-neutral-500">
              <p>Development Mode - Form validation enabled but authentication is simulated</p>
            </div>
          )}
          
          <div className="text-center text-xs text-neutral-400 mt-4">
            <p>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>
      </div>
      
      {showForgotPassword && renderForgotPasswordModal()}
    </div>
  );
};

export default Login; 