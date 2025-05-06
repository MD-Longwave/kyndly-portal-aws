import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define extended request type with user property
interface AuthRequest extends Request {
  user?: any;
}

// AWS Cognito configuration
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID || '';
const COGNITO_REGION = process.env.COGNITO_REGION || 'us-east-2';

// Create a verifier for Cognito tokens
const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  clientId: COGNITO_APP_CLIENT_ID
});

// Auth middleware
const authMiddleware = {
  /**
   * Authenticate using Cognito JWT validation
   */
  authenticate: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;
      
      // Check if authorization header exists
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No authorization token provided'
        });
      }
      
      // Extract the token
      const token = authHeader.split(' ')[1];
      
      // Verify the token
      const payload = await verifier.verify(token);
      
      // Set user object in request
      req.user = {
        sub: payload.sub,
        email: payload.email,
        // Extract group membership from cognito:groups
        groups: payload['cognito:groups'] || [],
        // Extract custom attributes
        tpaId: payload['custom:tpa_id'],
        employerId: payload['custom:employer_id'],
        // Map to match the old Auth0 structure for compatibility
        permissions: payload['custom:permissions'] && typeof payload['custom:permissions'] === 'string' 
          ? JSON.parse(payload['custom:permissions']) 
          : []
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token'
      });
    }
  },

  /**
   * Check if user has required permissions
   * @param permissions - Array of required permissions
   */
  checkPermissions: (permissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const user = req.user;
      
      if (!user || !user.permissions) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      const hasPermission = permissions.some(permission => 
        user.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    };
  },

  /**
   * Check if user belongs to specified TPA
   * Used for TPA-specific data access
   */
  checkTpaAccess: () => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const user = req.user;
      const { tpaId } = req.params;
      
      // Check if user is in kyndly_admins group (full access)
      if (user && user.groups && user.groups.includes('kyndly_admins')) {
        return next();
      }
      
      // Check if user's TPA ID matches requested TPA ID
      if (!user || !user.tpaId || user.tpaId !== tpaId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to TPA data'
        });
      }

      next();
    };
  },
  
  /**
   * Check if user belongs to specified employer
   * Used for employer-specific data access
   */
  checkEmployerAccess: () => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      const user = req.user;
      const { employerId } = req.params;
      
      // Check if user is in kyndly_admins group (full access)
      if (user && user.groups && user.groups.includes('kyndly_admins')) {
        return next();
      }
      
      // Check if user is in tpa_users group (TPA-level access)
      if (user && user.groups && user.groups.includes('tpa_users')) {
        // TPA users can access all employers under their TPA
        return next();
      }
      
      // Check if user's employer ID matches requested employer ID
      if (!user || !user.employerId || user.employerId !== employerId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to employer data'
        });
      }

      next();
    };
  }
};

export default authMiddleware; 