# Kyndly ICHRA AWS Deployment Guide

This guide provides step-by-step instructions for deploying the Kyndly ICHRA application on AWS Amplify.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed
4. AWS Amplify CLI installed (`npm install -g @aws-amplify/cli`)

## Initial Setup

1. Configure Amplify CLI with your AWS account:
   ```
   amplify configure
   ```

2. Initialize Amplify in the project:
   ```
   amplify init
   ```
   When prompted, provide the following details:
   - Name of the project: kyndly-ichra
   - Environment: dev (or your preferred environment name)
   - Default editor: (Choose your preferred editor)
   - Type of app: javascript
   - JavaScript framework: react
   - Source directory path: frontend/src
   - Distribution directory path: frontend/build
   - Build command: npm run build
   - Start command: npm start

## Adding AWS Resources

### Add Authentication

1. Add authentication to your Amplify project:
   ```
   amplify add auth
   ```
   Select the default configuration or customize as needed for your requirements. 
   
   Note: If you're continuing to use Auth0, you'll need to configure the Auth0 settings in your environment variables.

### Add Storage

1. Add S3 storage:
   ```
   amplify add storage
   ```
   Choose "Content" for storage type and follow the prompts to configure access permissions.

### Add API

1. Add API Gateway and Lambda function:
   ```
   amplify add api
   ```
   Choose "REST" for API type and follow the prompts.

## Deployment

1. Build the project:
   ```
   cd frontend
   npm run build
   ```

2. Deploy to AWS:
   ```
   amplify publish
   ```

3. After deployment, Amplify will provide the URL for your deployed application.

## Post-Deployment Configuration

1. Update the Auth0 application settings:
   - Login to Auth0 Dashboard
   - Select your application
   - Update Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins with your Amplify app URL

2. Update environment variables in the AWS Lambda console:
   - Find your Lambda function in the AWS Console
   - Add or update the environment variables for Auth0 configuration

## Troubleshooting

- If you encounter CORS issues, verify the API Gateway CORS configuration
- For authentication issues, check both Cognito and Auth0 configurations
- For storage issues, verify S3 bucket permissions 