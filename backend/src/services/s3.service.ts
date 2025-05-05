import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// S3 bucket name
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'kyndly-ichra-documents';

/**
 * Service for S3 operations
 */
const s3Service = {
  /**
   * Upload a file to S3
   * @param fileBuffer - The file buffer to upload
   * @param key - The S3 key (path) to store the file
   * @param contentType - The MIME type of the file
   */
  uploadFile: async (fileBuffer: Buffer, key: string, contentType: string): Promise<string> => {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      // Generate a signed URL for reading the file
      const signedUrl = await s3Service.getSignedUrl(key);
      
      logger.info(`File uploaded to S3: ${key}`);
      
      return signedUrl;
    } catch (error: any) {
      logger.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  },

  /**
   * Upload a quote file to S3 following the partitioning strategy
   * @param fileBuffer - The file buffer to upload
   * @param fileName - Original file name
   * @param tpaId - ID of the TPA
   * @param employerId - ID of the employer
   * @param contentType - The MIME type of the file
   * @param submissionId - Optional submission ID (generated if not provided)
   */
  uploadQuoteFile: async (
    fileBuffer: Buffer, 
    fileName: string, 
    tpaId: string, 
    employerId: string, 
    contentType: string,
    submissionId?: string
  ): Promise<{ key: string; url: string; submissionId: string }> => {
    try {
      // Generate submission ID if not provided
      const actualSubmissionId = submissionId || uuidv4();
      
      // Create the S3 key following the partition strategy:
      // s3://bucket-name/submissions/{tpa_id}/{employer_id}/{submission_id}/file.pdf
      const key = `submissions/${tpaId}/${employerId}/${actualSubmissionId}/${fileName}`;
      
      const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      // Generate a signed URL for reading the file
      const signedUrl = await s3Service.getSignedUrl(key);
      
      logger.info(`Quote file uploaded to S3: ${key}`);
      
      return {
        key,
        url: signedUrl,
        submissionId: actualSubmissionId
      };
    } catch (error: any) {
      logger.error('Error uploading quote file to S3:', error);
      throw new Error(`Failed to upload quote file: ${error.message}`);
    }
  },

  /**
   * Get a signed URL for a file in S3
   * @param key - The S3 key (path) of the file
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   */
  getSignedUrl: async (key: string, expiresIn = 3600): Promise<string> => {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: key
      };

      const command = new PutObjectCommand(params);
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      
      return signedUrl;
    } catch (error: any) {
      logger.error('Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  },

  /**
   * Delete a file from S3
   * @param key - The S3 key (path) of the file to delete
   */
  deleteFile: async (key: string): Promise<void> => {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: key
      };

      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
      
      logger.info(`File deleted from S3: ${key}`);
    } catch (error: any) {
      logger.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
};

export default s3Service; 