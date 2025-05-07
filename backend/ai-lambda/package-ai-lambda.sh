#!/bin/bash

# This script creates a Lambda package specifically for the AI functionality
# It leverages the existing compiled code but packages only what's needed for AI routes
echo "Creating AI Lambda package..."

# Ensure we're in the right directory
cd "$(dirname "$0")"/..

# Build TypeScript files if not already built
echo "Building TypeScript..."
npm run build

# Create and clean directories
echo "Setting up packaging directories..."
rm -rf ai-lambda-pkg
mkdir -p ai-lambda-pkg

# Copy necessary compiled files
echo "Copying Lambda files..."
cp -r dist/config ai-lambda-pkg/
cp -r dist/controllers ai-lambda-pkg/
cp -r dist/routes ai-lambda-pkg/
cp -r dist/services ai-lambda-pkg/
cp -r dist/middleware ai-lambda-pkg/

# Create AI Lambda specific handler
echo "Creating AI Lambda handler..."
cat > ai-lambda-pkg/index.js << 'EOL'
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const dotenv = require('dotenv');
const aiRoutes = require('./routes/ai.routes');
const logger = require('./config/logger');

// Load environment variables
dotenv.config();

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
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// Log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes - only include AI routes for this Lambda
app.use('/', aiRoutes.default);  // Note the .default for CommonJS require of ES module

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'AI Lambda',
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export the serverless handler
exports.handler = serverless(app);
EOL

# Create package.json for the Lambda
echo "Creating package.json..."
cat > ai-lambda-pkg/package.json << 'EOL'
{
  "name": "kyndly-ai-lambda",
  "version": "1.0.0",
  "description": "AI Lambda for Kyndly ICHRA",
  "main": "index.js",
  "dependencies": {
    "aws-jwt-verify": "^5.1.0",
    "aws-sdk": "^2.1420.0",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "serverless-http": "^3.2.0",
    "winston": "^3.10.0"
  }
}
EOL

# Install dependencies
echo "Installing dependencies..."
cd ai-lambda-pkg
npm install --production

# Create the zip file
echo "Creating Lambda zip package..."
cd ..
rm -f ai-lambda.zip
zip -r ai-lambda.zip ai-lambda-pkg

# Clean up
echo "Cleaning up temporary files..."
rm -rf ai-lambda-pkg

echo "AI Lambda package created at ai-lambda.zip"
echo "You can now deploy this package to AWS Lambda." 