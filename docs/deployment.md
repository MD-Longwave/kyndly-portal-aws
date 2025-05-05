# Kyndly ICHRA Deployment Guide

This guide provides instructions for deploying the Kyndly ICHRA Portal to AWS infrastructure.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js (v16+) and npm/yarn
- Git

## Infrastructure Overview

The Kyndly ICHRA Portal is deployed using the following AWS services:

- **AWS Elastic Beanstalk** - For hosting both the frontend and backend applications
- **Amazon RDS (PostgreSQL)** - For the database
- **AWS S3** - For document storage
- **AWS API Gateway** - For API management
- **AWS Lambda** - For serverless functions
- **AWS CloudFront** - For content delivery (optional)
- **AWS Route 53** - For DNS management (optional)

## Deployment Steps

### 1. Database Setup (RDS)

1. Create a PostgreSQL database instance in Amazon RDS:
   - Engine: PostgreSQL 13+
   - DB Instance Class: db.t3.small (minimum for production)
   - Storage: 20GB+ General Purpose SSD
   - Multi-AZ: Enabled for production, disabled for staging
   - Enable automated backups
   - Configure VPC and security groups appropriately

2. Note the endpoint, port, database name, username, and password for later use.

### 2. S3 Bucket Setup

1. Create an S3 bucket for document storage:
   ```bash
   aws s3api create-bucket --bucket kyndly-ichra-documents --region us-east-1
   ```

2. Enable server-side encryption for the bucket:
   ```bash
   aws s3api put-bucket-encryption \
     --bucket kyndly-ichra-documents \
     --server-side-encryption-configuration '{
         "Rules": [
           {
             "ApplyServerSideEncryptionByDefault": {
               "SSEAlgorithm": "AES256"
             }
           }
         ]
       }'
   ```

3. Configure CORS for the bucket:
   ```bash
   aws s3api put-bucket-cors \
     --bucket kyndly-ichra-documents \
     --cors-configuration '{
         "CORSRules": [
           {
             "AllowedHeaders": ["*"],
             "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
             "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
             "ExposeHeaders": ["ETag"],
             "MaxAgeSeconds": 3000
           }
         ]
       }'
   ```

### 3. IAM Role Setup

1. Create an IAM role for Elastic Beanstalk with the following policies:
   - AmazonS3FullAccess (or a more restricted custom policy)
   - AmazonRDSFullAccess (or a more restricted custom policy)
   - CloudWatchLogsFullAccess
   - AWSLambdaExecute (if using Lambda functions)

### 4. Backend Deployment (Elastic Beanstalk)

1. Build the backend application:
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. Create a `.ebignore` file in the backend directory to exclude unnecessary files:
   ```
   node_modules
   src
   .git
   .env
   ```

3. Create a `Procfile` in the backend directory:
   ```
   web: node dist/server.js
   ```

4. Create a `.elasticbeanstalk/config.yml` file for configuration.

5. Initialize Elastic Beanstalk:
   ```bash
   eb init kyndly-ichra-backend --platform node.js --region us-east-1
   ```

6. Create environment variables in a `.env.production` file:
   ```
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=ichra_portal
   DB_USER=admin
   DB_PASSWORD=your-secure-password
   
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_AUDIENCE=https://api.kyndly.com
   
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=kyndly-ichra-documents
   ```

7. Create and deploy the environment:
   ```bash
   eb create kyndly-ichra-backend-prod --envvars $(cat .env.production | xargs) --single --instance_type t3.small
   ```

### 5. Frontend Deployment (Elastic Beanstalk or S3)

#### Option 1: Elastic Beanstalk (for dynamic content)

1. Build the frontend application:
   ```bash
   cd frontend
   npm install
   REACT_APP_API_URL=https://your-backend-url.elasticbeanstalk.com/api npm run build
   ```

2. Create a `Procfile` in the frontend directory:
   ```
   web: npx serve -s build -l $PORT
   ```

3. Add `serve` to the dependencies in `package.json`.

4. Initialize Elastic Beanstalk:
   ```bash
   eb init kyndly-ichra-frontend --platform node.js --region us-east-1
   ```

5. Create and deploy the environment:
   ```bash
   eb create kyndly-ichra-frontend-prod --single --instance_type t3.small
   ```

#### Option 2: S3 with CloudFront (for static content)

1. Build the frontend application:
   ```bash
   cd frontend
   npm install
   REACT_APP_API_URL=https://your-backend-url.elasticbeanstalk.com/api npm run build
   ```

2. Create an S3 bucket for the frontend:
   ```bash
   aws s3api create-bucket --bucket kyndly-ichra-frontend --region us-east-1
   ```

3. Enable static website hosting:
   ```bash
   aws s3 website s3://kyndly-ichra-frontend/ --index-document index.html --error-document index.html
   ```

4. Upload the build to S3:
   ```bash
   aws s3 sync build/ s3://kyndly-ichra-frontend
   ```

5. Create a CloudFront distribution pointing to the S3 bucket.

### 6. API Gateway Setup (Optional)

1. Create a new API in API Gateway.

2. Create resources and methods that proxy to your Elastic Beanstalk backend.

3. Set up appropriate authorization using Auth0.

4. Deploy the API to a stage (e.g., prod).

### 7. Lambda Function Setup (For Complex Operations)

1. Create Lambda functions for any complex operations:
   - Quote calculation
   - Document processing
   - Scheduled tasks

2. Deploy the Lambda functions:
   ```bash
   cd lambda-functions/quote-calculator
   zip -r function.zip .
   aws lambda create-function --function-name kyndly-quote-calculator \
     --runtime nodejs18.x --handler index.handler \
     --role arn:aws:iam::your-account-id:role/your-lambda-role \
     --zip-file fileb://function.zip
   ```

3. Set up appropriate triggers (API Gateway, S3 events, CloudWatch events).

## Continuous Integration/Deployment (CI/CD)

For automated deployments, consider using:
- AWS CodePipeline
- GitHub Actions
- Jenkins
- CircleCI

Example GitHub Actions workflow:

```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: cd backend && npm install
      
    - name: Build
      run: cd backend && npm run build
      
    - name: Deploy to Elastic Beanstalk
      uses: einaregilsson/beanstalk-deploy@v18
      with:
        aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        application_name: kyndly-ichra-backend
        environment_name: kyndly-ichra-backend-prod
        version_label: ${{ github.sha }}
        region: us-east-1
        deployment_package: ./backend/deploy.zip
```

## Monitoring and Maintenance

1. Set up CloudWatch Alarms for:
   - CPU Utilization
   - Memory Usage
   - RDS Metrics
   - API Gateway Errors
   - Lambda Errors

2. Configure logging:
   - Elastic Beanstalk logs to CloudWatch
   - RDS logs
   - Lambda logs

3. Set up backup policies:
   - RDS automated backups
   - S3 versioning for document storage

## Security Considerations

1. Ensure all data is encrypted at rest:
   - RDS encryption
   - S3 bucket encryption
   - EBS volume encryption

2. Implement proper security groups and network ACLs:
   - Restrict inbound access to necessary ports
   - Use private subnets for RDS

3. Implement HIPAA-compliant security measures:
   - Audit logging
   - Data encryption
   - Access controls
   - Business Associate Agreement (BAA) with AWS

4. Regularly update dependencies and security patches. 