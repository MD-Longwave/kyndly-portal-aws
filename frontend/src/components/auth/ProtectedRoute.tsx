import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingScreen from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Always call hooks at the top level
  const { isAuthenticated, isLoading } = useAuth0();
  
  // Check if we're in development mode with unconfigured Auth0
  const isDev = process.env.NODE_ENV === 'development';
  const isAuth0Configured = 
    process.env.REACT_APP_AUTH0_DOMAIN !== 'dev-example.auth0.com' && 
    process.env.REACT_APP_AUTH0_CLIENT_ID !== 'your-auth0-client-id';
  
  // In development with unconfigured Auth0, bypass authentication check
  if (isDev && !isAuth0Configured) {
    return <>{children}</>;
  }
  
  // Regular Auth0 protection for production or configured Auth0
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 