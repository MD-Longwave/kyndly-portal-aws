import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router-dom';
import kyndlyLogo from '../assets/images/Kyndly-Temp-web-logo-blue.png';

const Login: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Check if we're in development mode with unconfigured Auth0
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDev = process.env.NODE_ENV === 'development';
  const isAuth0Configured = 
    process.env.REACT_APP_AUTH0_DOMAIN && 
    process.env.REACT_APP_AUTH0_CLIENT_ID;
  
  const handleLogin = async () => {
    if (!isAuth0Configured) {
      // In development mode without Auth0, redirect directly to dashboard
      navigate('/dashboard');
    } else {
      // Regular Auth0 login for production or configured Auth0
      await loginWithRedirect({ appState: { returnTo: '/dashboard' } });
    }
  };

  if (isLoading && isAuth0Configured) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated && isAuth0Configured) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen bg-secondary-800">
      <div className="m-auto w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="bg-white p-2 rounded-md inline-block mb-4">
            <img src={kyndlyLogo} alt="Kyndly" className="h-16 mx-auto" />
          </div>
          <p className="text-lg text-secondary-800">
            ICHRA Management Portal
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-md bg-mint p-4 text-sm text-secondary-800">
            <p>
              Welcome to the Kyndly ICHRA Portal. Please log in to access your dashboard.
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full rounded-md bg-primary-500 py-3 px-4 text-center font-medium text-white shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Sign in
          </button>

          <div className="text-center text-sm text-neutral-500">
            <p>
              {!isAuth0Configured 
                ? 'Development Mode - No Authentication Required' 
                : 'Secure login powered by Auth0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 