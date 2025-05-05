import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
import logger from '../config/logger';
import { Quote } from '../models';

// Load environment variables
dotenv.config();

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

/**
 * Service for SES operations
 */
const sesService = {
  /**
   * Send a notification email to the Kyndly team when a quote is submitted
   * @param quote - The quote object
   */
  notifyKyndlyTeam: async (quote: any): Promise<void> => {
    try {
      const SENDER_EMAIL = process.env.SES_SENDER_EMAIL;
      const RECIPIENT_EMAIL = process.env.KYNDLY_TEAM_EMAIL;
      
      if (!SENDER_EMAIL || !RECIPIENT_EMAIL) {
        logger.error('SES email configuration missing');
        throw new Error('SES email configuration missing');
      }

      // Determine quote type
      const quoteType = quote.isGLI ? 'GLI' : 'Non-GLI';
      
      // Generate Google Drive link (path pattern based on S3 storage)
      // This would be replaced with actual Google Drive folder URL in production
      const driveFolderLink = `https://drive.google.com/drive/folders/${quote.tpaId}/${quote.employerId}/${quote.submissionId}`;
      
      // Format email subject and body according to requirements
      const emailParams = {
        Source: SENDER_EMAIL,
        Destination: {
          ToAddresses: [RECIPIENT_EMAIL]
        },
        Message: {
          Subject: {
            Data: `${quote.priorityLevel}, ${quote.transperraRep}, has submitted a company to quote`
          },
          Body: {
            Text: {
              Data: `${quote.transperraRep} has just submitted a ${quoteType} for ${quote.companyName} click ${driveFolderLink} to access the google drive
              
Plan Effective date: ${new Date(quote.ichraEffectiveDate).toLocaleDateString()}
PEPM: $${quote.pepm}
Target Deductible: ${quote.targetDeductible || 'N/A'}
Current Funding Strategy: ${quote.currentFundingStrategy || 'N/A'}
Broker Name & Email: ${quote.brokerName || 'N/A'} / ${quote.brokerEmail || 'N/A'}
Additional Notes: ${quote.additionalNotes || 'N/A'}`
            }
          }
        }
      };

      const command = new SendEmailCommand(emailParams);
      await sesClient.send(command);
      
      logger.info(`SES notification sent for quote: ${quote.id}`);
    } catch (error: any) {
      logger.error('Error sending SES notification:', error);
      throw new Error(`Failed to send SES notification: ${error.message}`);
    }
  }
};

export default sesService; 