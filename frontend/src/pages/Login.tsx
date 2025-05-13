import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import kyndlyLogo from '../assets/images/Kyndly-Temp-web-logo-blue.png';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/ui/FormElements';
import { ExclamationTriangleIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

// Define types for the forgot password form state
type ForgotPasswordStep = 'initial' | 'code';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, forgotPassword, confirmForgotPassword, completeNewPasswordChallenge } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // New password challenge state
  const [newPasswordRequired, setNewPasswordRequired] = useState(false);
  const [challengeUser, setChallengeUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('initial');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmNewPassword, setForgotConfirmNewPassword] = useState('');
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
      const result = await login(username, password);
      
      // Check if this is a forced password change
      if (result && result.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('New password required for user');
        setNewPasswordRequired(true);
        setChallengeUser(result.challengeUser);
        setIsLoading(false);
        return;
      }
      
      // Normal login flow will navigate in the AuthContext
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
  
  // Handle completing the new password challenge
  const handleCompleteNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError(null);
    setIsLoading(true);
    
    if (!newPassword || !confirmNewPassword) {
      setNewPasswordError('Both fields are required');
      setIsLoading(false);
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setNewPasswordError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!validatePassword(newPassword)) {
      setNewPasswordError(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      setIsLoading(false);
      return;
    }
    
    try {
      // Complete the new password challenge
      if (challengeUser) {
        await completeNewPasswordChallenge(challengeUser, newPassword);
      }
    } catch (error: any) {
      console.error('Error completing new password challenge:', error);
      setNewPasswordError(error.message || 'Failed to set new password. Please try again.');
    } finally {
      setIsLoading(false);
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
    
    if (!forgotPasswordEmail || !verificationCode || !forgotNewPassword) {
      setForgotPasswordError('All fields are required');
      setIsLoading(false);
      return;
    }
    
    if (forgotNewPassword !== forgotConfirmNewPassword) {
      setForgotPasswordError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!validatePassword(forgotNewPassword)) {
      setForgotPasswordError(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Confirming new password for:', forgotPasswordEmail);
      await confirmForgotPassword(forgotPasswordEmail, verificationCode, forgotNewPassword);
      
      // Close the modal and show success message on login screen
      setShowForgotPassword(false);
      setForgotPasswordStep('initial');
      setForgotPasswordEmail('');
      setVerificationCode('');
      setForgotNewPassword('');
      setForgotConfirmNewPassword('');
      setForgotPasswordSuccess('Password reset successful. You can now log in with your new password.');
    } catch (error: any) {
      console.error('Confirm forgot password error:', error);
      
      // Handle specific Cognito error cases
      if (error.code === 'CodeMismatchException') {
        setForgotPasswordError('Invalid verification code. Please try again.');
      } else if (error.code === 'ExpiredCodeException') {
        setForgotPasswordError('Verification code has expired. Please request a new one.');
      } else if (error.code === 'InvalidPasswordException') {
        setForgotPasswordError('Password does not meet complexity requirements.');
      } else {
        setForgotPasswordError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Close forgot password modal
  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('initial');
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
  };
  
  // Render new password form
  const renderNewPasswordForm = () => {
    return (
      <form onSubmit={handleCompleteNewPassword} className="space-y-6">
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={() => setNewPasswordRequired(false)}
            className="inline-flex items-center mr-4 text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back
          </button>
          <h2 className="text-xl font-semibold text-night dark:text-white">Create New Password</h2>
        </div>
        
        {newPasswordError && (
          <div className="rounded-brand bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
            <p className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <span>{newPasswordError}</span>
            </p>
          </div>
        )}
        
        <div className="rounded-brand bg-sky-50 dark:bg-sky-900/20 p-4 text-sm text-night-800 dark:text-white">
          <p>
            You need to create a new password before continuing. Please choose a strong password that meets the requirements.
          </p>
        </div>
        
        <Input
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <p className="mt-1 -mb-2 text-xs text-gray-500 dark:text-gray-400">
          Password must have at least 8 characters with uppercase, lowercase, number, and special character.
        </p>
        
        <Input
          label="Confirm New Password"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
        >
          Set New Password
        </Button>
      </form>
    );
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-moss to-night">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
      </div>
    );
  }
  
  // Forgot password modal
  const renderForgotPasswordModal = () => {
    return (
      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative p-8 bg-white dark:bg-night-800 rounded-brand shadow-xl max-w-md w-full mx-4">
          <button 
            onClick={closeForgotPasswordModal}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <h2 className="text-xl font-semibold mb-6 text-night dark:text-white">Reset Password</h2>
          
          {forgotPasswordError && (
            <div className="rounded-brand bg-red-50 dark:bg-red-900/20 p-4 mb-4 text-sm text-red-700 dark:text-red-300">
              <p className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <span>{forgotPasswordError}</span>
              </p>
            </div>
          )}
          
          {forgotPasswordSuccess && (
            <div className="rounded-brand bg-green-50 dark:bg-green-900/20 p-4 mb-4 text-sm text-green-700 dark:text-green-300">
              <p>{forgotPasswordSuccess}</p>
            </div>
          )}
          
          {forgotPasswordStep === 'initial' ? (
            <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
              <p className="text-sm text-night-600 dark:text-night-200 mb-4">
                Enter your username and we'll send you a verification code to reset your password.
              </p>
              
              <Input
                label="Username"
                type="text"
                required
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your username"
              />
              
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Send Verification Code
              </Button>
            </form>
          ) :
            <form onSubmit={handleForgotPasswordConfirm} className="space-y-4">
              <p className="text-sm text-night-600 dark:text-night-200 mb-4">
                Enter the verification code sent to your email and your new password.
              </p>
              
              <Input
                label="Verification Code"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the 6-digit code"
              />
              
              <Input
                label="New Password"
                type="password"
                required
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password must have at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
              
              <Input
                label="Confirm New Password"
                type="password"
                required
                value={forgotConfirmNewPassword}
                onChange={(e) => setForgotConfirmNewPassword(e.target.value)}
                placeholder="Confirm your password"
              />
              
              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Reset Password
              </Button>
            </form>
          }
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-moss to-night dark:from-night-950 dark:to-night-800">
      <div className="m-auto w-full max-w-md px-4">
        <div className="bg-white dark:bg-night-800 rounded-brand shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="bg-white dark:bg-night-700 p-3 rounded-full inline-block mb-4">
              <img src={kyndlyLogo} alt="Kyndly" className="h-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-night dark:text-white">
              ICHRA Management Portal
            </h1>
            <p className="text-sm text-night-600 dark:text-night-200 mt-1">
              Simplifying health benefit administration
            </p>
          </div>

          {newPasswordRequired ? (
            renderNewPasswordForm()
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="rounded-brand bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
                  <p className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    <span>{loginError}</span>
                  </p>
                </div>
              )}
              
              {forgotPasswordSuccess && (
                <div className="rounded-brand bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-700 dark:text-green-300">
                  <p>{forgotPasswordSuccess}</p>
                </div>
              )}
              
              <div className="rounded-brand bg-sky-50 dark:bg-night-700 p-4 text-sm text-night-800 dark:text-white">
                <p>
                  Welcome to the Kyndly ICHRA Portal. Please log in with your credentials to access your dashboard.
                </p>
              </div>

              <Input
                label="Username or Email"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotPasswordEmail(username);
                    }}
                    className="font-medium text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 bg-seafoam hover:bg-seafoam-600 transition-colors duration-300 font-medium text-white shadow-md"
              >
                Sign in
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p>Development Mode - Form validation enabled but authentication is simulated</p>
                </div>
              )}
              
              <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-4">
                <p>
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {showForgotPassword && !newPasswordRequired && renderForgotPasswordModal()}
    </div>
  );
};

export default Login;