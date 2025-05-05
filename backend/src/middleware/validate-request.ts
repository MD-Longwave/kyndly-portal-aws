import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to validate request using express-validator
 * This should be used after check() middleware
 */
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => {
        const error = err as any; // Type assertion to handle different versions of express-validator
        return {
          field: error.path || error.param || 'unknown',
          message: error.msg
        };
      })
    });
  }
  
  next();
};

export default validateRequest; 