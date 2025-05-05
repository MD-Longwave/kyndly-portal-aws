const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const s3 = new AWS.S3();
const ses = new AWS.SES({ region: 'us-east-2' });

// Environment variables
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'kyndly-ichra-documents';
const SES_EMAIL_SENDER = process.env.SES_EMAIL_SENDER || 'notifications@kyndly.com';

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Quote submission endpoint
app.post('/quotes', async (req, res) => {
  try {
    console.log('Received quote submission:', req.body);
    
    // Generate a unique ID for this quote
    const quoteId = uuidv4();
    
    // Store the quote in S3
    const quoteParams = {
      Bucket: S3_BUCKET_NAME,
      Key: `${quoteId}/quote.json`,
      Body: JSON.stringify(req.body),
      ContentType: 'application/json'
    };
    
    await s3.putObject(quoteParams).promise();
    
    // Send notification email
    const emailParams = {
      Source: SES_EMAIL_SENDER,
      Destination: {
        ToAddresses: ['admin@kyndly.com']
      },
      Message: {
        Subject: {
          Data: 'New Quote Submission'
        },
        Body: {
          Text: {
            Data: `A new quote has been submitted with ID: ${quoteId}`
          }
        }
      }
    };
    
    await ses.sendEmail(emailParams).promise();
    
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
