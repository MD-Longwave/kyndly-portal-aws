import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import kyndlyLogo from '../assets/images/Kyndly-Temp-web-logo-blue.png';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const from = location.state?.from?.pathname || '/dashboard';

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
      } else {
        setLoginError(error.message || 'An error occurred during login. Please try again.');
      }
    }
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

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
              className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
              className="mt-1 block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
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
    </div>
  );
};

export default Login; 