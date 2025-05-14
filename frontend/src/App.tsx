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
import { featureAccess } from './config/accessConfig';

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
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.dashboard as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            
            {/* Quote routes */}
            <Route path="/quotes" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <QuotesList />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.quotes as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            <Route path="/quotes/:id" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <QuoteDetails />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.quotes as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            <Route path="/quotes/new" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <NewQuote />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.quotes as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            
            {/* Document routes */}
            <Route path="/documents" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <DocumentsList />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.documents as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            
            {/* Other routes */}
            <Route path="/sold-cases" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <SoldCases />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.soldcases as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            <Route path="/enrollments" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <Enrollments />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.enrollments as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            <Route path="/kynd-choice" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <KyndChoice />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.kyndchoice as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            <Route path="/knowledge-center" element={
              <ProtectedRoute>
                <RoleRoute 
                  element={
                    <PageTransition>
                      <KnowledgeCenter />
                    </PageTransition>
                  }
                  requiredRoles={featureAccess.knowledgecenter as UserRole[]}
                  fallbackPath="/unauthorized"
                />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <PageTransition>
                  <UserProfile />
                </PageTransition>
              </ProtectedRoute>
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
                    requiredRoles={featureAccess.adminpanel as UserRole[]}
                    fallbackPath="/unauthorized"
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