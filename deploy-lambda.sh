#!/bin/bash
# Script to deploy the backend to AWS Lambda

# Exit on error
set -e

echo "Building backend for Lambda deployment..."
cd backend
npm run build

# Create deployment package
echo "Creating deployment package..."
mkdir -p dist/lambda
cp -r dist/* dist/lambda/
cp package.json dist/lambda/
cd dist/lambda
npm ci --production

# Create zip file
echo "Creating zip file..."
zip -r ../../function.zip .
cd ../..

# Deploy to Lambda
echo "Deploying to Lambda..."
aws lambda update-function-code \
  --function-name kyndly-ichra-api \
  --zip-file fileb://function.zip

echo "Deployment completed successfully!" 