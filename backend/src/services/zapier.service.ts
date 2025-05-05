import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../config/logger';

// Load environment variables
dotenv.config();

/**
 * Service for Zapier integrations
 */
const zapierService = {
  /**
   * Trigger a Zapier workflow to integrate with Google Workspace
   * @param quote - The quote object
   */
  triggerQuoteSubmission: async (quote: any): Promise<void> => {
    try {
      const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;
      
      if (!ZAPIER_WEBHOOK_URL) {
        logger.error('ZAPIER_WEBHOOK_URL environment variable not configured');
        throw new Error('Zapier webhook URL not configured');
      }

      // Structure the data as expected by the Google Form
      const data = {
        tpaId: quote.tpaId,
        employerId: quote.employerId,
        submissionId: quote.submissionId,
        companyName: quote.companyName,
        transperraRep: quote.transperraRep,
        contactType: quote.contactType,
        ichraEffectiveDate: quote.ichraEffectiveDate,
        pepm: quote.pepm,
        currentFundingStrategy: quote.currentFundingStrategy || '',
        targetDeductible: quote.targetDeductible || '',
        targetHSA: quote.targetHSA || '',
        brokerName: quote.brokerName || '',
        brokerEmail: quote.brokerEmail || '',
        priorityLevel: quote.priorityLevel,
        additionalNotes: quote.additionalNotes || '',
        censusFileKey: quote.censusFileKey || '',
        planComparisonFileKey: quote.planComparisonFileKey || '',
        dateSubmitted: new Date().toISOString()
      };

      // Send data to Zapier webhook
      await axios.post(ZAPIER_WEBHOOK_URL, data);
      
      logger.info(`Zapier webhook triggered for quote: ${quote.id}`);
    } catch (error: any) {
      logger.error('Error triggering Zapier webhook:', error);
      throw new Error(`Failed to trigger Zapier workflow: ${error.message}`);
    }
  }
};

export default zapierService; 