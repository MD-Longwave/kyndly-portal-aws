const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize AWS services
const s3 = new AWS.S3();
const ses = new AWS.SES({ region: 'us-east-2' });

// Environment variables
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'kyndly-ichra-documents';
const SES_EMAIL_SENDER = process.env.SES_EMAIL_SENDER || 'mike@longwave.solutions';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'x-api-key']
}));

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Api-Key, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// We still need these for non-multipart requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: process.env.NODE_ENV });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Kyndly ICHRA API is running',
    version: '1.0.0'
  });
});

// Quote submission endpoint with file upload handling
app.post('/quotes', upload.fields([
  { name: 'censusFile', maxCount: 1 },
  { name: 'planComparisonFile', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received quote submission with files');
    
    // Generate a unique ID for this quote
    const quoteId = uuidv4();
    
    // Create a proper JSON object from the form data
    const quoteData = {
      id: quoteId,
      timestamp: new Date().toISOString(),
      ...req.body,
      files: {}
    };
    
    console.log('Form data fields:', Object.keys(req.body));
    
    // Handle file uploads
    if (req.files) {
      console.log('Files received:', Object.keys(req.files));
      
      // Upload each file to S3 and store the reference
      for (const [fieldName, fileArray] of Object.entries(req.files)) {
        const file = fileArray[0]; // Get the first file for each field
        console.log(`Processing file: ${fieldName}, name: ${file.originalname}, size: ${file.size} bytes`);
        
        // Upload to S3
        const s3FileName = `${quoteId}/${fieldName}-${file.originalname}`;
        const fileUploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: s3FileName,
          Body: file.buffer,
          ContentType: file.mimetype
        };
        
        await s3.putObject(fileUploadParams).promise();
        console.log(`Uploaded ${fieldName} to S3: ${s3FileName}`);
        
        // Add file reference to quote data
        quoteData.files[fieldName] = {
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          s3Key: s3FileName
        };
      }
    } else {
      console.log('No files received in the form submission');
    }
    
    // Store the quote JSON in S3
    const quoteParams = {
      Bucket: S3_BUCKET_NAME,
      Key: `${quoteId}/quote.json`,
      Body: JSON.stringify(quoteData, null, 2),
      ContentType: 'application/json'
    };
    
    await s3.putObject(quoteParams).promise();
    console.log(`Stored quote data in S3: ${quoteId}/quote.json`);
    
    // Send notification email
    const emailParams = {
      Source: SES_EMAIL_SENDER,
      Destination: {
        ToAddresses: ['mike@longwave.solutions']
      },
      Message: {
        Subject: {
          Data: 'New Quote Submission'
        },
        Body: {
          Text: {
            Data: `A new quote has been submitted with ID: ${quoteId}. You can view the details in the S3 bucket: ${S3_BUCKET_NAME}/${quoteId}/`
          }
        }
      }
    };
    
    await ses.sendEmail(emailParams).promise();
    console.log('Sent notification email');
    
    res.status(200).json({ 
      success: true, 
      message: 'Quote submitted successfully',
      quoteId
    });
  } catch (error) {
    console.error('Error submitting quote:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting quote',
      error: error.message
    });
  }
});

// Get quotes endpoint
app.get('/quotes', async (req, res) => {
  try {
    // List all quote files from S3
    const listParams = {
      Bucket: S3_BUCKET_NAME,
      Prefix: '',
      Delimiter: '/'
    };
    
    const data = await s3.listObjectsV2(listParams).promise();
    const quoteIds = data.CommonPrefixes.map(prefix => prefix.Prefix.replace('/', ''));
    
    res.status(200).json({
      success: true,
      quotes: quoteIds
    });
  } catch (error) {
    console.error('Error listing quotes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error listing quotes', 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

// Export serverless handler
exports.handler = serverless(app); 