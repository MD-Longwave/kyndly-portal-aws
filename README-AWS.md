# Kyndly ICHRA AWS Migration

This is the AWS version of the Kyndly ICHRA application, migrated from the original Vercel deployment. This repository contains all the code and configurations necessary for deploying the application on AWS Amplify.

## Differences from Vercel Deployment

- Hosting: AWS Amplify instead of Vercel
- Storage: AWS S3 for file storage
- Authentication: Auth0 with enhanced role-based access control (with option to use AWS Cognito)
- Backend: API Gateway and Lambda functions instead of standalone Express server

## Implemented Changes

1. Created AWS Amplify configuration files:
   - `amplify.yml` in root directory
   - `aws-exports.js` in the frontend for Amplify configuration
   - Backend Lambda configuration in `amplify/backend`

2. Updated application code:
   - Integrated Amplify SDK in the frontend
   - Adapted Express backend to work as Lambda functions
   - Updated S3 service to work with Amplify Storage

3. Created deployment documentation in `DEPLOYMENT.md`

## Development Setup

1. Install AWS Amplify CLI:
   ```
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. Clone this repository:
   ```
   git clone <repository-url>
   cd kyndly-aws
   ```

3. Initialize Amplify:
   ```
   amplify init
   ```

4. Add AWS resources:
   ```
   amplify add auth
   amplify add storage
   amplify add api
   ```

5. Start the development server:
   ```
   cd frontend
   npm install
   npm start
   ```

## Deployment

Follow the detailed instructions in `DEPLOYMENT.md` for step-by-step deployment guidance.

Quick deployment:
```
amplify publish
```

## AWS Resources

This application uses the following AWS resources:
- AWS Amplify for hosting and deployment
- Amazon S3 for file storage
- API Gateway and Lambda for serverless backend
- Optionally AWS Cognito (can be used alongside or instead of Auth0)

## Config Files

- `amplify.yml`: Build and deployment configuration
- `aws-exports.js`: AWS resources configuration
- Lambda function mapped to `backend/src/lambda.ts`
