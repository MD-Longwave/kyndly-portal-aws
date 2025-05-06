import { Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';

/**
 * Service for handling AWS Cognito authentication operations
 */
const cognitoService = {
  /**
   * Sign in with username and password
   * @param username - User's username or email
   * @param password - User's password
   * @returns Promise resolving to CognitoUser
   */
  signIn: async (username: string, password: string): Promise<CognitoUser> => {
    return await Auth.signIn(username, password);
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    return await Auth.signOut();
  },

  /**
   * Get the current authenticated user
   * @returns Promise resolving to CognitoUser or null
   */
  getCurrentUser: async (): Promise<CognitoUser | null> => {
    try {
      return await Auth.currentAuthenticatedUser();
    } catch (error) {
      console.log('No current user:', error);
      return null;
    }
  },

  /**
   * Get the current session
   * @returns Promise resolving to CognitoUserSession
   */
  getCurrentSession: async () => {
    return await Auth.currentSession();
  },

  /**
   * Get the current JWT token
   * @returns Promise resolving to JWT token string or null
   */
  getJwtToken: async (): Promise<string | null> => {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error) {
      console.error('Error getting JWT token:', error);
      return null;
    }
  },

  /**
   * Change password for the current user
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.changePassword(user, oldPassword, newPassword);
  },

  /**
   * Request a password reset for a user
   * @param username - Username or email to reset password for
   */
  forgotPassword: async (username: string): Promise<void> => {
    await Auth.forgotPassword(username);
  },

  /**
   * Complete the password reset process
   * @param username - Username or email
   * @param code - Verification code sent to the user
   * @param newPassword - New password
   */
  forgotPasswordSubmit: async (username: string, code: string, newPassword: string): Promise<void> => {
    await Auth.forgotPasswordSubmit(username, code, newPassword);
  },

  /**
   * Update user attributes
   * @param attributes - Object containing the attributes to update
   */
  updateUserAttributes: async (attributes: Record<string, string>): Promise<void> => {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.updateUserAttributes(user, attributes);
  },
};

export default cognitoService; 