import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Quote from '../models/quote.model';
import s3Service from '../services/s3.service';
import sesService from '../services/ses.service';
import zapierService from '../services/zapier.service';
import logger from '../config/logger';

/**
 * Quote controller
 */
const quoteController = {
  /**
   * Create a new quote with file uploads
   * @param req - Express request
   * @param res - Express response
   */
  createQuote: async (req: Request, res: Response): Promise<void> => {
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

      // Generate a unique submission ID for this quote
      const submissionId = uuidv4();
      
      // Handle file uploads if present
      let censusFileKey = null;
      let planComparisonFileKey = null;

      // Process census file
      if (req.files && req.files.censusFile) {
        const censusFile = req.files.censusFile as any;
        const fileUploadResult = await s3Service.uploadQuoteFile(
          censusFile.data,
          censusFile.name,
          tpaId,
          employerId,
          censusFile.mimetype,
          submissionId
        );
        censusFileKey = fileUploadResult.key;
      }

      // Process plan comparison file
      if (req.files && req.files.planComparisonFile) {
        const planComparisonFile = req.files.planComparisonFile as any;
        const fileUploadResult = await s3Service.uploadQuoteFile(
          planComparisonFile.data,
          planComparisonFile.name,
          tpaId,
          employerId,
          planComparisonFile.mimetype,
          submissionId
        );
        planComparisonFileKey = fileUploadResult.key;
      }

      // Create quote record with file paths
      const quote = await Quote.create({
        transperraRep,
        contactType,
        companyName,
        ichraEffectiveDate,
        pepm: parseFloat(pepm) || 70.00,
        currentFundingStrategy,
        targetDeductible: targetDeductible ? parseInt(targetDeductible) : null,
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

      res.status(201).json({
        success: true,
        message: 'Quote created successfully',
        data: {
          id: quote.id,
          submissionId: quote.submissionId
        }
      });
    } catch (error: any) {
      logger.error('Error creating quote:', error);
      res.status(500).json({
        success: false,
        message: 'Could not create quote',
        error: error.message
      });
    }
  },

  /**
   * Get all quotes
   * @param req - Express request
   * @param res - Express response
   */
  getQuotes: async (req: Request, res: Response): Promise<void> => {
    try {
      // Filter by TPA ID if provided
      const { tpaId } = req.query;
      
      const whereClause = tpaId ? { tpaId } : {};
      
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
      logger.error('Error fetching quotes:', error);
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
        message: `Quote status updated to ${status}`,
        data: quote
      });
    } catch (error: any) {
      logger.error(`Error updating quote status: ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        message: 'Could not update quote status',
        error: error.message
      });
    }
  }
};

export default quoteController; 