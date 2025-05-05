# Kyndly ICHRA Portal Production Deployment Guide

This guide provides instructions for deploying the Kyndly ICHRA Portal application to AWS Amplify for production use.

## Prerequisites

- AWS Account with administrator access
- AWS CLI installed and configured
- Node.js v18 or higher
- Git

## Architecture Overview

The application consists of:

- **Frontend**: Next.js React application hosted on AWS Amplify
- **Backend**: Express.js API running on AWS Lambda
- **Storage**: S3 for document storage with specific partitioning
- **Authentication**: Auth0 for user management
- **Email Notifications**: AWS SES
- **External Integration**: Zapier webhook to Google Workspace

## Deployment Steps

### 1. AWS Environment Setup

#### Create S3 Buckets

```bash
# Create document storage bucket
aws s3api create-bucket --bucket kyndly-ichra-documents --region us-east-2 --create-bucket-configuration LocationConstraint=us-east-2

# Create deployment bucket for Lambda code
aws s3api create-bucket --bucket kyndly-deployments --region us-east-2 --create-bucket-configuration LocationConstraint=us-east-2
```

#### Configure S3 CORS for Browser Uploads

```bash
aws s3api put-bucket-cors --bucket kyndly-ichra-documents --cors-configuration '{
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
```

#### Set Up SES for Email Notifications

```bash
# Verify sender email
aws ses verify-email-identity --email-address your-email@domain.com --region us-east-2

# Verify recipient email
aws ses verify-email-identity --email-address recipient@domain.com --region us-east-2
```

### 2. Auth0 Configuration

1. Create a new Auth0 tenant or use an existing one
2. Set up a new API with the audience `https://api.kyndly.com`
3. Create a new application of type "Single Page Application"
4. Configure the following settings for your application:
   - Allowed Callback URLs: `https://your-amplify-domain.amplifyapp.com/callback`
   - Allowed Logout URLs: `https://your-amplify-domain.amplifyapp.com`
   - Allowed Web Origins: `https://your-amplify-domain.amplifyapp.com`
5. Note your Auth0 Domain and Client ID for environment variables

### 3. Zapier Webhook Setup

1. Create a new Zap in Zapier
2. Choose "Webhook by Zapier" as the trigger
3. Select "Catch Hook" as the event
4. Copy the webhook URL for your environment variables
5. Configure actions to connect to Google Workspace (Sheets, Forms, etc.)

### 4. Environment Variables Setup

Create a `.env` file in the backend directory with the following values:

```
# AWS Configuration
AWS_REGION=us-east-2
AWS_S3_BUCKET=kyndly-ichra-documents

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.kyndly.com

# SES Configuration
SES_SENDER_EMAIL=your-verified-email@domain.com
SES_NOTIFICATION_EMAIL=recipient@domain.com

# Zapier Webhook
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-id
```

### 5. Lambda Function Deployment

```bash
# Build and package the Lambda function
npm run build
cd backend && npm run build && cd ..
mkdir -p dist/backend
cp -r backend/dist/* dist/backend/
cp -r backend/node_modules dist/backend/
cd dist/backend && zip -r ../../lambda-function.zip . && cd ../..

# Upload to S3
aws s3 cp lambda-function.zip s3://kyndly-deployments/

# Create Lambda function
aws lambda create-function \
  --function-name KyndlyApiLambda \
  --runtime nodejs18.x \
  --handler dist/lambda.lambdaHandler \
  --role arn:aws:iam::your-account-id:role/kyndly-lambda-role \
  --code S3Bucket=kyndly-deployments,S3Key=lambda-function.zip \
  --timeout 30 \
  --memory-size 1024 \
  --environment Variables="{AWS_REGION=us-east-2,AWS_S3_BUCKET=kyndly-ichra-documents,AUTH0_DOMAIN=your-tenant.auth0.com,AUTH0_AUDIENCE=https://api.kyndly.com,SES_SENDER_EMAIL=your-verified-email@domain.com,ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-id}"
```

### 6. API Gateway Setup

```bash
# Create API Gateway
aws apigateway create-rest-api --name KyndlyApi --region us-east-2

# Get the API ID
API_ID=$(aws apigateway get-rest-apis --query "items[?name=='KyndlyApi'].id" --output text)

# Get the root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/'].id" --output text)

# Create a proxy resource
aws apigateway create-resource --rest-api-id $API_ID --parent-id $ROOT_RESOURCE_ID --path-part "{proxy+}"

# Get the proxy resource ID
PROXY_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/{proxy+}'].id" --output text)

# Create ANY method for the proxy resource
aws apigateway put-method --rest-api-id $API_ID --resource-id $PROXY_RESOURCE_ID --http-method ANY --authorization-type NONE

# Set up Lambda integration
aws apigateway put-integration --rest-api-id $API_ID --resource-id $PROXY_RESOURCE_ID --http-method ANY --type AWS_PROXY --integration-http-method POST --uri arn:aws:apigateway:us-east-2:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-2:your-account-id:function:KyndlyApiLambda/invocations

# Deploy the API
aws apigateway create-deployment --rest-api-id $API_ID --stage-name prod
```

### 7. AWS Amplify Frontend Deployment

1. Connect your GitHub repository to AWS Amplify
2. Add environment variables in Amplify Console:
   - `REACT_APP_API_URL`: URL of your API Gateway
   - `REACT_APP_AUTH0_DOMAIN`: Your Auth0 domain
   - `REACT_APP_AUTH0_CLIENT_ID`: Your Auth0 client ID
   - `REACT_APP_AUTH0_AUDIENCE`: Your Auth0 API audience

3. Configure build settings with the amplify.yml file:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - cd backend
        - npm ci
        - npm run build
        - npm prune --production
        - cd ..
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/build
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

4. Start the build and deployment process

### 8. Setting Up Custom Domain (Optional)

```bash
# Register a domain in Route53 or use an existing domain
aws amplify create-domain-association \
  --app-id your-amplify-app-id \
  --domain-name yourdomain.com \
  --sub-domain-settings subDomainSetting={prefix=www,branchName=main}
```

## Verify Deployment

1. Visit your Amplify app URL to confirm the frontend is working
2. Test login functionality with Auth0
3. Verify quotes submission works end-to-end
4. Confirm emails are being sent via SES
5. Check that files are properly partitioned in S3
6. Verify Zapier integration is sending data to Google Workspace

## Monitoring and Logging

- Set up CloudWatch Logs to monitor Lambda function logs
- Set up CloudWatch Alarms for monitoring application performance
- Set up X-Ray for tracing requests through the application

## Security Considerations

- Ensure proper IAM permissions are in place
- Set up CORS correctly to prevent unauthorized access
- Use environment variables for sensitive information
- Implement rate limiting on your API Gateway
- Enable AWS Shield for DDoS protection 