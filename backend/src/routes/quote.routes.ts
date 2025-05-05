import express from 'express';
import { check } from 'express-validator';
import quoteController from '../controllers/quote.controller';
import validateRequest from '../middleware/validate-request';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @route   GET /api/quotes
 * @desc    Get all quotes (filtered by TPA ID if provided)
 * @access  Private
 */
router.get('/', authMiddleware.authenticate, quoteController.getQuotes);

/**
 * @route   GET /api/quotes/:id
 * @desc    Get a quote by ID
 * @access  Private
 */
router.get('/:id', authMiddleware.authenticate, quoteController.getQuoteById);

/**
 * @route   POST /api/quotes
 * @desc    Create a new quote with file uploads
 * @access  Private
 */
router.post('/', authMiddleware.authenticate, quoteController.createQuote);

/**
 * @route   PATCH /api/quotes/:id/status
 * @desc    Update a quote status
 * @access  Private
 */
router.patch('/:id/status', authMiddleware.authenticate, quoteController.updateQuoteStatus);

// Get quotes with filters
router.get('/filter', quoteController.getQuotesWithFilters);

// Update a quote
router.put(
  '/:id',
  [
    check('planType').optional(),
    check('coverageDetails').optional(),
    check('employeeCount').optional().isInt({ min: 1 }).withMessage('Valid employee count is required'),
    check('effectiveDate').optional().isISO8601().toDate().withMessage('Valid effective date is required'),
    check('status').optional().isIn(['pending', 'approved', 'rejected', 'processing']).withMessage('Valid status is required'),
    validateRequest
  ],
  quoteController.updateQuote
);

// Delete a quote
router.delete('/:id', quoteController.deleteQuote);

export default router; 