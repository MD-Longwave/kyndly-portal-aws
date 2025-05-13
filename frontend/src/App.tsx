import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuotesList from './pages/QuotesList';
import QuoteDetails from './pages/QuoteDetails';
import NewQuote from './pages/NewQuote';
import DocumentsList from './pages/DocumentsList';
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import SoldCases from './pages/SoldCases';
import Enrollments from './pages/Enrollments';
import KyndChoice from './pages/KyndChoice';
import KnowledgeCenter from './pages/KnowledgeCenter';
import { AuthProvider, UserRole } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageTransition } from './components/animations';

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

// Add a new RoleRoute component for role-based routing
const RoleRoute: React.FC<{
  element: React.ReactNode;
  requiredRoles: UserRole[];
  fallbackPath?: string;
}> = ({ element, requiredRoles, fallbackPath = "/dashboard" }) => {
  const { hasRole } = useAuth();
  const location = useLocation();
  
  // In development mode, allow all access
  if (isDevelopment) {
    return <>{element}</>;
  }
  
  // Check if user has at least one of the required roles
  const hasRequiredRole = requiredRoles.some(role => hasRole(role));
  
  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }
  
  return <>{element}</>;
};

function AppContent() {
  const [isInitializing, setIsInitializing] = useState(true);
  const location = useLocation();

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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={
            <PageTransition>
              <Login />
            </PageTransition>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={
            <PageTransition>
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
            </PageTransition>
          } />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            } />
            
            {/* Quote routes */}
            <Route path="/quotes" element={
              <PageTransition>
                <QuotesList />
              </PageTransition>
            } />
            <Route path="/quotes/:id" element={
              <PageTransition>
                <QuoteDetails />
              </PageTransition>
            } />
            <Route path="/quotes/new" element={
              <PageTransition>
                <NewQuote />
              </PageTransition>
            } />
            
            {/* Document routes */}
            <Route path="/documents" element={
              <PageTransition>
                <DocumentsList />
              </PageTransition>
            } />
            
            {/* Other routes */}
            <Route path="/sold-cases" element={
              <PageTransition>
                <SoldCases />
              </PageTransition>
            } />
            <Route path="/enrollments" element={
              <PageTransition>
                <Enrollments />
              </PageTransition>
            } />
            <Route path="/kynd-choice" element={
              <PageTransition>
                <KyndChoice />
              </PageTransition>
            } />
            <Route path="/knowledge-center" element={
              <PageTransition>
                <KnowledgeCenter />
              </PageTransition>
            } />
            <Route path="/profile" element={
              <PageTransition>
                <UserProfile />
              </PageTransition>
            } />
            <Route 
              path="/admin-panel" 
              element={
                <ProtectedRoute>
                  <RoleRoute 
                    element={
                      <PageTransition>
                        <AdminPanel />
                      </PageTransition>
                    }
                    requiredRoles={['admin', 'tpa_admin', 'tpa_user', 'tpa']}
                    fallbackPath="/dashboard"
                  />
                </ProtectedRoute>
              } 
            />
          </Route>
          
          <Route path="*" element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>
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