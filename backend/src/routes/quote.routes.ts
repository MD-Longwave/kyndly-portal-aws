import express from 'express';
import { check } from 'express-validator';
import multer from 'multer';
import quoteController from '../controllers/quote.controller';
import validateRequest from '../middleware/validate-request';
import authMiddleware from '../middleware/auth.middleware';

const router = express.Router();

// Configure multer for memory storage (files will be streamed to S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

/**
 * @route   GET /api/quotes
 * @desc    Get all quotes (filtered by TPA ID if provided)
 * @access  Private
 */
router.get('/', authMiddleware.authenticate, quoteController.getQuotes);

/**
 * @route   GET /api/quotes/filter
 * @desc    Get quotes with filters
 * @access  Private
 */
router.get('/filter', authMiddleware.authenticate, quoteController.getQuotesWithFilters);

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
router.post('/', 
  authMiddleware.authenticate, 
  upload.fields([
    { name: 'censusFile', maxCount: 1 },
    { name: 'planComparisonFile', maxCount: 1 }
  ]),
  quoteController.createQuote
);

/**
 * @route   PATCH /api/quotes/:id/status
 * @desc    Update a quote status
 * @access  Private
 */
router.patch('/:id/status', authMiddleware.authenticate, quoteController.updateQuoteStatus);

/**
 * @route   PUT /api/quotes/:id
 * @desc    Update a quote
 * @access  Private
 */
router.put(
  '/:id',
  authMiddleware.authenticate,
  [
    check('planType').optional(),
    check('coverageDetails').optional(),
    check('employeeCount').optional().isInt({ min: 1 }).withMessage('Valid employee count is required'),
    check('effectiveDate').optional().isISO8601().toDate().withMessage('Valid effective date is required'),
    check('status').optional().isIn(['new', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required'),
    validateRequest
  ],
  quoteController.updateQuote
);

/**
 * @route   DELETE /api/quotes/:id
 * @desc    Delete a quote
 * @access  Private
 */
router.delete('/:id', authMiddleware.authenticate, quoteController.deleteQuote);

export default router; 