#!/bin/bash
# Comprehensive deployment script for Kyndly ICHRA API

# Exit on error
set -e

# Set variables
LAMBDA_FUNCTION_NAME="kyndly-ichra-api"
ROLE_NAME="kyndly-lambda-role"
S3_BUCKET="kyndly-ichra-documents"
REGION="us-east-2"
SENDER_EMAIL="notifications@kyndly.com" # Replace with your actual verified SES email

echo "Starting Kyndly ICHRA API deployment..."

# Check if S3 bucket exists, create if not
bucket_exists=$(aws s3api list-buckets --query "Buckets[?Name=='$S3_BUCKET'].Name" --output text)
if [ -z "$bucket_exists" ]; then
  echo "Creating S3 bucket $S3_BUCKET..."
  aws s3api create-bucket \
    --bucket $S3_BUCKET \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION
    
  # Configure CORS for the bucket
  echo "Configuring CORS for S3 bucket..."
  aws s3api put-bucket-cors \
    --bucket $S3_BUCKET \
    --cors-configuration '{
      "CORSRules": [
        {
          "AllowedOrigins": ["*"],
          "AllowedHeaders": ["*"],
          "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
          "MaxAgeSeconds": 3000,
          "ExposeHeaders": ["ETag"]
        }
      ]
    }'
else
  echo "S3 bucket $S3_BUCKET already exists."
fi

# Check if IAM role exists, create if not
role_exists=$(aws iam list-roles --query "Roles[?RoleName=='$ROLE_NAME'].RoleName" --output text)
if [ -z "$role_exists" ]; then
  echo "Creating IAM role $ROLE_NAME..."
  
  # Create trust policy document for Lambda
  cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create the role
  aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://trust-policy.json

  # Attach the policy document
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name kyndly-lambda-policy \
    --policy-document file://backend/iam-policy.json
  
  # Also attach the AWSLambdaBasicExecutionRole managed policy
  aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  
  echo "IAM role $ROLE_NAME created successfully."
  
  # Clean up
  rm -f trust-policy.json
  
  # Wait for role to propagate
  echo "Waiting for role to propagate..."
  sleep 10
else
  echo "IAM role $ROLE_NAME already exists."
fi

# Build the backend
echo "Building backend for Lambda deployment..."
cd backend
npm install
npm run build

# Create deployment package
echo "Creating deployment package..."
mkdir -p dist/lambda
cp -r dist/* dist/lambda/
cp package.json dist/lambda/
cd dist/lambda
npm install --production --no-package-lock

# Create zip file
echo "Creating zip file..."
zip -r ../../function.zip .
cd ../..

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

# Check if Lambda function exists
function_exists=$(aws lambda list-functions --query "Functions[?FunctionName=='$LAMBDA_FUNCTION_NAME'].FunctionName" --output text)

if [ -z "$function_exists" ]; then
  echo "Creating new Lambda function..."
  aws lambda create-function \
    --function-name $LAMBDA_FUNCTION_NAME \
    --runtime nodejs18.x \
    --handler lambda.lambdaHandler \
    --role $ROLE_ARN \
    --zip-file fileb://function.zip \
    --timeout 30 \
    --memory-size 512 \
    --environment "Variables={SES_EMAIL_SENDER=$SENDER_EMAIL,S3_BUCKET_NAME=$S3_BUCKET}"
  
  # Create function URL (to make it accessible via HTTP)
  echo "Creating function URL..."
  aws lambda create-function-url-config \
    --function-name $LAMBDA_FUNCTION_NAME \
    --auth-type AWS_IAM
  
  # Get the function URL
  FUNCTION_URL=$(aws lambda get-function-url-config --function-name $LAMBDA_FUNCTION_NAME --query 'FunctionUrl' --output text)
  echo "Lambda function URL: $FUNCTION_URL"
else
  # Update existing function
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://function.zip
  
  # Update function configuration
  aws lambda update-function-configuration \
    --function-name $LAMBDA_FUNCTION_NAME \
    --environment "Variables={SES_EMAIL_SENDER=$SENDER_EMAIL,S3_BUCKET_NAME=$S3_BUCKET}"
    
  # Get the function URL
  FUNCTION_URL=$(aws lambda get-function-url-config --function-name $LAMBDA_FUNCTION_NAME --query 'FunctionUrl' --output text)
  echo "Lambda function URL: $FUNCTION_URL"
fi

echo "Deployment completed successfully!"
echo "Remember to update your frontend API_BASE_URL to: $FUNCTION_URL" 