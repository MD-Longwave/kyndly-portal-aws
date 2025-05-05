#!/bin/bash
# Script to create and deploy the backend to AWS Lambda

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

# Check if Lambda function exists
function_exists=$(aws lambda list-functions --query "Functions[?FunctionName=='kyndly-ichra-api'].FunctionName" --output text)

if [ -z "$function_exists" ]; then
  echo "Creating new Lambda function..."
  aws lambda create-function \
    --function-name kyndly-ichra-api \
    --runtime nodejs18.x \
    --handler lambda.lambdaHandler \
    --role arn:aws:iam::$(aws sts get-caller-identity --query 'Account' --output text):role/kyndly-lambda-role \
    --zip-file fileb://function.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment "Variables={SES_EMAIL_SENDER=your-sender-email@example.com,S3_BUCKET_NAME=kyndly-ichra-documents}"
  
  # Create function URL (to make it accessible via HTTP)
  echo "Creating function URL..."
  aws lambda create-function-url-config \
    --function-name kyndly-ichra-api \
    --auth-type NONE
else
  # Update existing function
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name kyndly-ichra-api \
    --zip-file fileb://function.zip
fi

echo "Deployment completed successfully!" 