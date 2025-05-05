import express from 'express';
import { check } from 'express-validator';
import multer from 'multer';
import documentController from '../controllers/document.controller';
import validateRequest from '../middleware/validate-request';

const router = express.Router();

// Configure multer for memory storage (files will be streamed to S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only common document formats
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, JPEG, and PNG files are allowed.'));
    }
  }
});

// Get all documents
router.get('/', documentController.getAllDocuments);

// Get documents by employer ID
router.get('/employer/:employerId', documentController.getDocumentsByEmployerId);

// Get document by ID
router.get('/:id', documentController.getDocumentById);

// Upload a new document
router.post(
  '/',
  upload.single('file'),
  [
    check('title').not().isEmpty().withMessage('Title is required'),
    check('employerId').not().isEmpty().withMessage('Employer ID is required'),
    check('documentType').not().isEmpty().withMessage('Document type is required'),
    validateRequest
  ],
  documentController.uploadDocument
);

// Update document metadata
router.put(
  '/:id',
  [
    check('title').optional(),
    check('documentType').optional(),
    validateRequest
  ],
  documentController.updateDocument
);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

export default router; 