#!/bin/bash
# Script to create a smaller Lambda deployment package

# Exit on error
set -e

LAMBDA_FUNCTION_NAME="kyndly-ichra-api"
ROLE_NAME="kyndly-lambda-role"
S3_BUCKET="kyndly-deployments" # Bucket for Lambda code
REGION="us-east-2"
SENDER_EMAIL="notifications@kyndly.com"

echo "Building backend for Lambda deployment..."
cd backend
npm run build

# Create a temporary directory for the slim package
echo "Creating slim package..."
mkdir -p dist/lambda-slim
cp -r dist/* dist/lambda-slim/

# Copy only necessary files
cp package.json dist/lambda-slim/

# Create production dependencies file
echo "Installing production dependencies..."
cd dist/lambda-slim

# Create .npmrc file to avoid installing dev dependencies
echo "production=true" > .npmrc
echo "only=prod" >> .npmrc

# Install with --no-package-lock and production flag
npm install --no-package-lock --production

# Remove unnecessary files to reduce package size
echo "Removing unnecessary files..."
rm -rf node_modules/*/test/
rm -rf node_modules/*/tests/
rm -rf node_modules/*/docs/
rm -rf node_modules/*/examples/
rm -rf node_modules/*/coverage/
rm -rf node_modules/*/.github/
find node_modules -name "*.md" -type f -delete
find node_modules -name "*.ts" -type f -not -name "*.d.ts" -delete
find node_modules -name "LICENSE" -type f -delete
find node_modules -name "*.map" -type f -delete

# Create zip file
echo "Creating zip file..."
zip -r ../../function-slim.zip . -q

# Go back to original directory
cd ../..

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
aws s3 cp function-slim.zip s3://$S3_BUCKET/

# Check if Lambda function exists
function_exists=$(aws lambda list-functions --query "Functions[?FunctionName=='$LAMBDA_FUNCTION_NAME'].FunctionName" --output text)

if [ -z "$function_exists" ]; then
  echo "Creating new Lambda function..."
  
  # Get role ARN
  ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
  
  aws lambda create-function \
    --function-name $LAMBDA_FUNCTION_NAME \
    --runtime nodejs18.x \
    --handler lambda.lambdaHandler \
    --role $ROLE_ARN \
    --code S3Bucket=$S3_BUCKET,S3Key=function-slim.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment "Variables={SES_EMAIL_SENDER=$SENDER_EMAIL,S3_BUCKET_NAME=kyndly-ichra-documents}"
else
  # Update existing function
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --s3-bucket $S3_BUCKET \
    --s3-key function-slim.zip
  
  # Update function configuration
  aws lambda update-function-configuration \
    --function-name $LAMBDA_FUNCTION_NAME \
    --timeout 30 \
    --memory-size 512 \
    --environment "Variables={SES_EMAIL_SENDER=$SENDER_EMAIL,S3_BUCKET_NAME=kyndly-ichra-documents}"
fi

echo "Lambda deployment completed successfully!" 