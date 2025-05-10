import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

// Define the user role type
export type UserRole = 'admin' | 'kyndly_staff' | 'tpa_admin' | 'tpa_user';

// Define the organization type
type OrganizationType = 'kyndly' | 'tpa';

// Define the organization interface
interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
}

// Define the user interface
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  roles: UserRole[];
  organization: Organization;
  permissions: string[];
}

// Define the auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void | { challengeName: string, challengeUser: any }>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  getIdToken: () => Promise<string | null>;
  forgotPassword: (username: string) => Promise<void>;
  confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<void>;
  completeNewPasswordChallenge: (user: any, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider properties
interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Function to convert Cognito user to our User interface
  const mapCognitoUserToUser = async (cognitoUser: CognitoUser): Promise<User> => {
    // Get the current session
    const session = await Auth.currentSession();
    
    // Get the ID token
    const idToken = session.getIdToken();
    const payload = idToken.decodePayload();
    
    // Extract custom attributes
    const username = payload['cognito:username'] || '';
    const email = payload.email || '';
    const name = payload.name || '';
    const roles = payload['custom:roles'] ? JSON.parse(payload['custom:roles']) : [];
    const permissions = payload['custom:permissions'] ? JSON.parse(payload['custom:permissions']) : [];
    const orgId = payload['custom:organization_id'] || '';
    const orgName = payload['custom:organization_name'] || '';
    const orgType = payload['custom:organization_type'] || 'tpa';
    
    return {
      id: username,
      username,
      email,
      name,
      roles,
      permissions,
      organization: {
        id: orgId,
        name: orgName,
        type: orgType as OrganizationType
      }
    };
  };

  // Function to check if the current user has a specific role
  const hasRole = (roleToCheck: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roleToCheck)) {
      return roleToCheck.some(role => user.roles.includes(role));
    }
    
    return user.roles.includes(roleToCheck);
  };

  // Function to check if the current user has specific permissions
  const hasPermission = (permissionToCheck: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(permissionToCheck)) {
      return permissionToCheck.some(permission => 
        user.permissions.includes(permission)
      );
    }
    
    return user.permissions.includes(permissionToCheck);
  };

  // Function to get the current user's ID token
  const getIdToken = async (): Promise<string | null> => {
    try {
      console.log('AuthContext: Getting ID token...');
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      console.log(`AuthContext: Token retrieved successfully (length: ${token.length}, first 15 chars: ${token.substring(0, 15)}...)`);
      
      // Get the payload for debugging
      const payload = session.getIdToken().decodePayload();
      console.log('AuthContext: Token payload:', payload);
      
      // Specifically log TPA and employer IDs if present
      if (payload['custom:tpa_id']) {
        console.log(`AuthContext: Found custom:tpa_id = ${payload['custom:tpa_id']}`);
      } else {
        console.warn('AuthContext: No custom:tpa_id found in token');
      }
      
      if (payload['custom:employer_id']) {
        console.log(`AuthContext: Found custom:employer_id = ${payload['custom:employer_id']}`);
      } else {
        console.warn('AuthContext: No custom:employer_id found in token');
      }
      
      return token;
    } catch (error) {
      console.error('AuthContext: Error getting ID token:', error);
      return null;
    }
  };

  // Function to login
  const login = async (username: string, password: string): Promise<void | { challengeName: string, challengeUser: any }> => {
    setIsLoading(true);
    
    try {
      const cognitoUser = await Auth.signIn(username, password);
      
      // Check if this is a "forced password change" situation
      if (cognitoUser.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('User needs to set a new password');
        setIsLoading(false);
        // Return the challenge information to handle in the login UI
        return {
          challengeName: cognitoUser.challengeName,
          challengeUser: cognitoUser
        };
      }
      
      // Normal login flow
      const user = await mapCognitoUserToUser(cognitoUser);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to logout
  const logout = async (): Promise<void> => {
    try {
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Function to initiate forgot password flow
  const forgotPassword = async (username: string): Promise<void> => {
    try {
      await Auth.forgotPassword(username);
    } catch (error) {
      console.error('Error initiating forgot password:', error);
      throw error;
    }
  };

  // Function to confirm forgot password with verification code
  const confirmForgotPassword = async (
    username: string,
    code: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
    } catch (error) {
      console.error('Error confirming forgot password:', error);
      throw error;
    }
  };

  // Function to complete the new password challenge when a user is forced to change password
  const completeNewPasswordChallenge = async (challengeUser: any, newPassword: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('Completing new password challenge');
      const cognitoUser = await Auth.completeNewPassword(
        challengeUser,
        newPassword
      );
      
      console.log('Password change successful, user authenticated');
      const user = await mapCognitoUserToUser(cognitoUser);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing new password challenge:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh the current user from Cognito
  const refreshUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const user = await mapCognitoUserToUser(cognitoUser);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check the user's auth state when the component mounts
  useEffect(() => {
    const checkUser = async (): Promise<void> => {
      setIsLoading(true);
      
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        const user = await mapCognitoUserToUser(cognitoUser);
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('User not authenticated:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    // Set up Amplify Hub listener for auth events
    const listener = (data: any) => {
      switch (data.payload.event) {
        case 'signIn':
          checkUser();
          break;
        case 'signOut':
          setUser(null);
          setIsAuthenticated(false);
          break;
        default:
          break;
      }
    };
    
    Hub.listen('auth', listener);
    
    // Clean up the listener
    return () => Hub.remove('auth', listener);
  }, [navigate]);
  
  // Create the auth context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    hasRole,
    hasPermission,
    getIdToken,
    forgotPassword,
    confirmForgotPassword,
    completeNewPasswordChallenge,
    refreshUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 