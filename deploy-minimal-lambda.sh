#!/bin/bash
# Script to create a minimal Lambda deployment package

# Exit on error
set -e

LAMBDA_FUNCTION_NAME="kyndly-ichra-api"
ROLE_NAME="kyndly-lambda-role"
S3_BUCKET="kyndly-deployments" # Bucket for Lambda code
REGION="us-east-2"
SENDER_EMAIL="notifications@kyndly.com"

# Create a temporary directory for the minimal package
echo "Creating minimal package directory..."
rm -rf lambda-minimal
mkdir -p lambda-minimal

# Create minimal package.json
cat > lambda-minimal/package.json << EOF
{
  "name": "kyndly-ichra-api-minimal",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "serverless-http": "^3.2.0",
    "aws-sdk": "^2.1420.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0"
  }
}
EOF

# Create minimal index.js handler
cat > lambda-minimal/index.js << EOF
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
      Key: \`\${quoteId}/quote.json\`,
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
            Data: \`A new quote has been submitted with ID: \${quoteId}\`
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
EOF

# Install dependencies
echo "Installing dependencies..."
cd lambda-minimal
npm install --production

# Create zip file
echo "Creating zip file..."
zip -r ../function-minimal.zip . -q

# Go back to original directory
cd ..

# Check if S3 bucket exists, create if not
bucket_exists=$(aws s3api list-buckets --query "Buckets[?Name=='$S3_BUCKET'].Name" --output text)
if [ -z "$bucket_exists" ]; then
  echo "Creating S3 bucket $S3_BUCKET..."
  aws s3api create-bucket \
    --bucket $S3_BUCKET \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION
else
  echo "S3 bucket $S3_BUCKET already exists."
fi

# Upload to S3
echo "Uploading to S3..."
aws s3 cp function-minimal.zip s3://$S3_BUCKET/

# Check if Lambda function exists
function_exists=$(aws lambda list-functions --query "Functions[?FunctionName=='$LAMBDA_FUNCTION_NAME'].FunctionName" --output text)

if [ -z "$function_exists" ]; then
  echo "Creating new Lambda function..."
  
  # Get role ARN
  ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
  
  aws lambda create-function \
    --function-name $LAMBDA_FUNCTION_NAME \
    --runtime nodejs18.x \
    --handler index.handler \
    --role $ROLE_ARN \
    --code S3Bucket=$S3_BUCKET,S3Key=function-minimal.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment "Variables={SES_EMAIL_SENDER=$SENDER_EMAIL,S3_BUCKET_NAME=kyndly-ichra-documents}"
else
  # Update existing function
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --s3-bucket $S3_BUCKET \
    --s3-key function-minimal.zip
  
  # Update function configuration
  aws lambda update-function-configuration \
    --function-name $LAMBDA_FUNCTION_NAME \
    --handler index.handler \
    --timeout 30 \
    --memory-size 512 \
    --environment "Variables={SES_EMAIL_SENDER=$SENDER_EMAIL,S3_BUCKET_NAME=kyndly-ichra-documents}"
fi

echo "Lambda deployment completed successfully!" 