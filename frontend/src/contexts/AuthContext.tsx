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
  roles: UserRole[];
  organization: Organization;
  permissions: string[];
}

// Define the auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  getIdToken: () => Promise<string | null>;
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
    const roles = payload['custom:roles'] ? JSON.parse(payload['custom:roles']) : [];
    const permissions = payload['custom:permissions'] ? JSON.parse(payload['custom:permissions']) : [];
    const orgId = payload['custom:organization_id'] || '';
    const orgName = payload['custom:organization_name'] || '';
    const orgType = payload['custom:organization_type'] || 'tpa';
    
    return {
      id: username,
      username,
      email,
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
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  // Function to login
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const cognitoUser = await Auth.signIn(username, password);
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
    getIdToken
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