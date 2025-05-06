import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Quote from '../models/quote.model';
import s3Service from '../services/s3.service';
import sesService from '../services/ses.service';
import zapierService from '../services/zapier.service';
import logger from '../config/logger';

// Define types for file uploads
interface FileUpload {
  data: Buffer;
  name: string;
  mimetype: string;
}

// Define request type with files property for multer
interface FileRequest extends Request {
  files?: {
    [fieldname: string]: FileUpload | FileUpload[];
  };
  user?: any;
}

/**
 * Quote controller
 */
const quoteController = {
  /**
   * Create a new quote with file uploads
   * @param req - Express request
   * @param res - Express response
   */
  createQuote: async (req: FileRequest, res: Response): Promise<void> => {
    try {
      const {
        transperraRep,
        contactType,
        companyName,
        ichraEffectiveDate,
        pepm,
        currentFundingStrategy,
        targetDeductible,
        targetHSA,
        brokerName,
        brokerEmail,
        priorityLevel,
        additionalNotes,
        tpaId,
        employerId,
        isGLI
      } = req.body;

      // Validate required fields
      if (!tpaId || !employerId || !transperraRep || !companyName || !ichraEffectiveDate) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: tpaId, employerId, transperraRep, companyName, and ichraEffectiveDate are required'
        });
        return;
      }

      // Get the ID token from the request object
      const idToken = req.headers.authorization?.split(' ')[1];

      // Generate a unique submission ID for this quote
      const submissionId = uuidv4();
      
      // Handle file uploads if present
      let censusFileKey: string | undefined = undefined;
      let planComparisonFileKey: string | undefined = undefined;

      // Process census file
      if (req.files && req.files.censusFile) {
        const censusFile = Array.isArray(req.files.censusFile) 
          ? req.files.censusFile[0] 
          : req.files.censusFile;
          
        const fileUploadResult = await s3Service.uploadQuoteFile(
          censusFile.data,
          censusFile.name,
          tpaId,
          employerId,
          censusFile.mimetype,
          submissionId,
          idToken
        );
        censusFileKey = fileUploadResult.key;
      }

      // Process plan comparison file
      if (req.files && req.files.planComparisonFile) {
        const planComparisonFile = Array.isArray(req.files.planComparisonFile) 
          ? req.files.planComparisonFile[0] 
          : req.files.planComparisonFile;
          
        const fileUploadResult = await s3Service.uploadQuoteFile(
          planComparisonFile.data,
          planComparisonFile.name,
          tpaId,
          employerId,
          planComparisonFile.mimetype,
          submissionId,
          idToken
        );
        planComparisonFileKey = fileUploadResult.key;
      }

      // Convert targetDeductible to a number or undefined (not null)
      const parsedTargetDeductible = targetDeductible ? parseInt(targetDeductible) : undefined;

      // Create quote record with file paths
      const quote = await Quote.create({
        transperraRep,
        contactType,
        companyName,
        ichraEffectiveDate,
        pepm: parseFloat(pepm) || 70.00,
        currentFundingStrategy,
        targetDeductible: parsedTargetDeductible,
        targetHSA,
        brokerName,
        brokerEmail,
        priorityLevel: priorityLevel || 'earliest',
        additionalNotes,
        tpaId,
        employerId,
        submissionId,
        censusFileKey,
        planComparisonFileKey,
        isGLI: isGLI === 'true' || isGLI === true,
        status: 'new'
      });

      // Trigger email notification to Kyndly team
      try {
        await sesService.notifyKyndlyTeam(quote);
      } catch (error) {
        logger.error('Failed to send notification email:', error);
        // Continue processing even if email fails
      }

      // Trigger Zapier workflow to integrate with Google workspace
      try {
        await zapierService.triggerQuoteSubmission(quote);
      } catch (error) {
        logger.error('Failed to trigger Zapier workflow:', error);
        // Continue processing even if Zapier integration fails
      }

      // Return success response
      res.status(201).json({
        success: true,
        quoteId: quote.id,
        message: 'Quote created successfully',
        data: quote
      });
    } catch (error: any) {
      logger.error('Error creating quote:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create quote',
        error: error.message
      });
    }
  },

  /**
   * Get all quotes (optionally filtered by TPA ID)
   * @param req - Express request
   * @param res - Express response
   */
  getQuotes: async (req: FileRequest, res: Response): Promise<void> => {
    try {
      const { tpaId, employerId } = req.query;
      
      // Build filter based on query parameters and user role
      let filter: any = {};
      
      // Get the ID token from the request object
      const idToken = req.headers.authorization?.split(' ')[1];
      
      // If user is in a specific role, apply appropriate filtering
      const user = req.user;
      
      if (user) {
        // Filter by TPA ID if user is a TPA user and not a kyndly_admin
        if (user.groups?.includes('tpa_users') && !user.groups?.includes('kyndly_admins')) {
          filter.tpaId = user.tpaId;
        }
        
        // Filter by employer ID if user is an employer user
        if (user.groups?.includes('employer_users') && !user.groups?.includes('kyndly_admins')) {
          filter.tpaId = user.tpaId;
          filter.employerId = user.employerId;
        }
      }
      
      // Apply additional filters from query parameters (if not already set by role)
      if (tpaId && !filter.tpaId) {
        filter.tpaId = tpaId;
      }
      
      if (employerId && !filter.employerId) {
        filter.employerId = employerId;
      }
      
      // Use Sequelize findAll since we're using Sequelize
      const quotes = await Quote.findAll({
        where: filter,
        order: [['createdAt', 'DESC']]
      });
      
      // For each quote, generate signed URLs for file access
      const quotesWithUrls = await Promise.all(quotes.map(async (quote) => {
        const quoteData = quote.toJSON();
        
        // Generate signed URLs for file access if keys exist
        if (quoteData.censusFileKey) {
          quoteData.censusFileUrl = await s3Service.getSignedUrl(quoteData.censusFileKey, 3600, idToken);
        }
        
        if (quoteData.planComparisonFileKey) {
          quoteData.planComparisonFileUrl = await s3Service.getSignedUrl(quoteData.planComparisonFileKey, 3600, idToken);
        }
        
        return quoteData;
      }));
      
      res.status(200).json({
        success: true,
        count: quotesWithUrls.length,
        data: quotesWithUrls
      });
    } catch (error: any) {
      logger.error('Error getting quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve quotes',
        error: error.message
      });
    }
  },

  /**
   * Get quotes with additional filtering options
   * @param req - Express request
   * @param res - Express response
   */
  getQuotesWithFilters: async (req: Request, res: Response): Promise<void> => {
    try {
      const { tpaId, status, startDate, endDate, employerId } = req.query;
      
      // Build where clause based on provided filters
      const whereClause: any = {};
      
      if (tpaId) {
        whereClause.tpaId = String(tpaId);
      }
      
      if (employerId) {
        whereClause.employerId = String(employerId);
      }
      
      if (status) {
        whereClause.status = String(status);
      }
      
      // Date range filter for effective date
      if (startDate && endDate) {
        whereClause.ichraEffectiveDate = {
          [Symbol.for('gte')]: new Date(String(startDate)),
          [Symbol.for('lte')]: new Date(String(endDate))
        };
      } else if (startDate) {
        whereClause.ichraEffectiveDate = {
          [Symbol.for('gte')]: new Date(String(startDate))
        };
      } else if (endDate) {
        whereClause.ichraEffectiveDate = {
          [Symbol.for('lte')]: new Date(String(endDate))
        };
      }
      
      const quotes = await Quote.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json({
        success: true,
        count: quotes.length,
        data: quotes
      });
    } catch (error: any) {
      logger.error('Error fetching quotes with filters:', error);
      res.status(500).json({
        success: false,
        message: 'Could not fetch quotes',
        error: error.message
      });
    }
  },

  /**
   * Get a quote by ID
   * @param req - Express request
   * @param res - Express response
   */
  getQuoteById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const quote = await Quote.findByPk(id);
      
      if (!quote) {
        res.status(404).json({
          success: false,
          message: `Quote with ID ${id} not found`
        });
        return;
      }
      
      // If files exist, generate signed URLs
      let censusFileUrl = null;
      let planComparisonFileUrl = null;
      
      if (quote.censusFileKey) {
        censusFileUrl = await s3Service.getSignedUrl(quote.censusFileKey);
      }
      
      if (quote.planComparisonFileKey) {
        planComparisonFileUrl = await s3Service.getSignedUrl(quote.planComparisonFileKey);
      }
      
      res.status(200).json({
        success: true,
        data: {
          ...quote.toJSON(),
          censusFileUrl,
          planComparisonFileUrl
        }
      });
    } catch (error: any) {
      logger.error(`Error fetching quote by ID: ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        message: 'Could not fetch quote',
        error: error.message
      });
    }
  },

  /**
   * Update a quote status
   * @param req - Express request
   * @param res - Express response
   */
  updateQuoteStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
        return;
      }
      
      const quote = await Quote.findByPk(id);
      
      if (!quote) {
        res.status(404).json({
          success: false,
          message: `Quote with ID ${id} not found`
        });
        return;
      }
      
      quote.status = status as 'new' | 'in_progress' | 'completed' | 'cancelled';
      await quote.save();
      
      res.status(200).json({
        success: true,
        message: 'Quote status updated successfully',
        data: {
          id: quote.id,
          status: quote.status
        }
      });
    } catch (error: any) {
      logger.error(`Error updating quote status: ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        message: 'Could not update quote status',
        error: error.message
      });
    }
  },

  /**
   * Update a quote
   * @param req - Express request
   * @param res - Express response
   */
  updateQuote: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { 
        planType, 
        coverageDetails, 
        employeeCount, 
        effectiveDate, 
        status,
        transperraRep,
        companyName,
        pepm,
        currentFundingStrategy,
        targetDeductible,
        targetHSA,
        brokerName,
        brokerEmail,
        priorityLevel,
        additionalNotes
      } = req.body;
      
      const quote = await Quote.findByPk(id);
      
      if (!quote) {
        res.status(404).json({
          success: false,
          message: `Quote with ID ${id} not found`
        });
        return;
      }
      
      // Use type assertion to avoid TypeScript errors
      const quoteData: any = quote;
      
      // Update quote fields if provided
      if (planType) quoteData.planType = planType;
      if (coverageDetails) quoteData.coverageDetails = coverageDetails;
      if (employeeCount) quoteData.employeeCount = parseInt(employeeCount);
      if (effectiveDate) quoteData.ichraEffectiveDate = new Date(effectiveDate);
      if (status) quoteData.status = status;
      if (transperraRep) quoteData.transperraRep = transperraRep;
      if (companyName) quoteData.companyName = companyName;
      if (pepm) quoteData.pepm = parseFloat(pepm);
      if (currentFundingStrategy) quoteData.currentFundingStrategy = currentFundingStrategy;
      if (targetDeductible) quoteData.targetDeductible = parseInt(targetDeductible);
      if (targetHSA) quoteData.targetHSA = targetHSA;
      if (brokerName) quoteData.brokerName = brokerName;
      if (brokerEmail) quoteData.brokerEmail = brokerEmail;
      if (priorityLevel) quoteData.priorityLevel = priorityLevel;
      if (additionalNotes) quoteData.additionalNotes = additionalNotes;
      
      await quote.save();
      
      res.status(200).json({
        success: true,
        message: 'Quote updated successfully',
        data: quote
      });
    } catch (error: any) {
      logger.error(`Error updating quote: ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        message: 'Could not update quote',
        error: error.message
      });
    }
  },

  /**
   * Delete a quote
   * @param req - Express request
   * @param res - Express response
   */
  deleteQuote: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const quote = await Quote.findByPk(id);
      
      if (!quote) {
        res.status(404).json({
          success: false,
          message: `Quote with ID ${id} not found`
        });
        return;
      }
      
      // Delete associated files from S3 if they exist
      if (quote.censusFileKey) {
        await s3Service.deleteFile(quote.censusFileKey);
      }
      
      if (quote.planComparisonFileKey) {
        await s3Service.deleteFile(quote.planComparisonFileKey);
      }
      
      // Delete quote record
      await quote.destroy();
      
      res.status(200).json({
        success: true,
        message: 'Quote deleted successfully'
      });
    } catch (error: any) {
      logger.error(`Error deleting quote: ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        message: 'Could not delete quote',
        error: error.message
      });
    }
  }
};

export default quoteController; 