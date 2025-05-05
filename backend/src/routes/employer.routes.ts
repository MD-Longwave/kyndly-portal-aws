import express from 'express';
import { check } from 'express-validator';
import employerController from '../controllers/employer.controller';
import validateRequest from '../middleware/validate-request';

const router = express.Router();

// Get all employers
router.get('/', employerController.getAllEmployers);

// Get employer by ID
router.get('/:id', employerController.getEmployerById);

// Create a new employer
router.post(
  '/',
  [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('contactPerson').not().isEmpty().withMessage('Contact person is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('phone').not().isEmpty().withMessage('Phone number is required'),
    check('address').not().isEmpty().withMessage('Address is required'),
    check('employeeCount').isInt({ min: 1 }).withMessage('Valid employee count is required'),
    validateRequest
  ],
  employerController.createEmployer
);

// Update an employer
router.put(
  '/:id',
  [
    check('name').optional(),
    check('contactPerson').optional(),
    check('email').optional().isEmail().withMessage('Valid email is required'),
    check('phone').optional(),
    check('address').optional(),
    check('employeeCount').optional().isInt({ min: 1 }).withMessage('Valid employee count is required'),
    validateRequest
  ],
  employerController.updateEmployer
);

// Delete an employer
router.delete('/:id', employerController.deleteEmployer);

export default router; 