import { Request, Response, NextFunction } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define extended request type with user property
interface AuthRequest extends Request {
  user?: any;
}

// Auth0 configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

// Auth middleware
const authMiddleware = {
  /**
   * Authenticate using Auth0 JWT validation
   */
  authenticate: jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: AUTH0_AUDIENCE,
    issuer: `https://${AUTH0_DOMAIN}/`,
    algorithms: ['RS256']
  }),

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
      
      // Skip check for admin users
      if (user && user.permissions && user.permissions.includes('admin:all')) {
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
  }
};

export default authMiddleware; 