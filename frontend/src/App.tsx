import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployersList from './pages/EmployersList';
import EmployerDetails from './pages/EmployerDetails';
import NewEmployer from './pages/NewEmployer';
import QuotesList from './pages/QuotesList';
import QuoteDetails from './pages/QuoteDetails';
import NewQuote from './pages/NewQuote';
import DocumentsList from './pages/DocumentsList';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import SoldCases from './pages/SoldCases';
import Enrollments from './pages/Enrollments';
import KyndChoice from './pages/KyndChoice';
import KnowledgeCenter from './pages/KnowledgeCenter';

// Check if the app is running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Check if Auth0 credentials are configured
const isAuth0Configured = 
  process.env.REACT_APP_AUTH0_DOMAIN && 
  process.env.REACT_APP_AUTH0_CLIENT_ID;

// Bypass authentication in development if Auth0 is not configured
const bypassAuth = isDevelopment && !isAuth0Configured;

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  
  // Allow access in development when Auth0 is not configured or in production for demo purposes
  if (bypassAuth || process.env.NODE_ENV === 'production') {
    return <>{children}</>;
  }
  
  // Show loading or redirect to login
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-mint">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Simulate initialization delay to ensure all resources are loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-mint">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employers" element={<EmployersList />} />
          <Route path="/employers/:id" element={<EmployerDetails />} />
          <Route path="/employers/new" element={<NewEmployer />} />
          <Route path="/quotes" element={<QuotesList />} />
          <Route path="/quotes/:id" element={<QuoteDetails />} />
          <Route path="/quotes/new" element={<NewQuote />} />
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/sold-cases" element={<SoldCases />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/kynd-choice" element={<KyndChoice />} />
          <Route path="/knowledge-center" element={<KnowledgeCenter />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App; 