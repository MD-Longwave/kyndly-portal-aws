import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
import { AuthProvider, UserRole } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Check if the app is running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Interface for Protected Route props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

// Protected Route component using Cognito authentication
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRoles 
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();
  
  // In development mode, allow all access
  if (isDevelopment) {
    return <>{children}</>;
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are required, check if the user has at least one
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // If all checks pass, render the children
  return <>{children}</>;
};

function AppContent() {
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
        <Route path="/unauthorized" element={
          <div className="flex h-screen items-center justify-center bg-secondary-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
              <p className="mb-4">You don't have permission to access this resource.</p>
              <button 
                onClick={() => window.history.back()} 
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Go Back
              </button>
            </div>
          </div>
        } />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Quote routes */}
          <Route path="/quotes" element={<QuotesList />} />
          <Route path="/quotes/:id" element={<QuoteDetails />} />
          <Route path="/quotes/new" element={<NewQuote />} />
          
          {/* Document routes */}
          <Route path="/documents" element={<DocumentsList />} />
          
          {/* Other routes */}
          <Route path="/sold-cases" element={<SoldCases />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/kynd-choice" element={<KyndChoice />} />
          <Route path="/knowledge-center" element={<KnowledgeCenter />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'tpa_admin']}>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 