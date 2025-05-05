# Secure API Deployment Guide for Kyndly ICHRA

This document outlines the secure deployment approach for the Kyndly ICHRA application API.

## Security Architecture

The API is secured using the following architecture:

1. **Lambda Function**: Core business logic runs as an AWS Lambda function
2. **API Gateway**: Acts as a secure front door to the Lambda function
3. **API Keys**: Required for all API access
4. **CORS Configuration**: Properly configured to only allow approved origins
5. **IAM Permissions**: Least privilege access for all AWS resources

## Deployment Components

### Lambda Function

The Lambda function runs the Node.js/Express backend code and handles all business logic. The function is deployed with:

- Proper IAM role with minimal permissions
- Environment variables for configuration
- Timeout and memory settings optimized for workload

### API Gateway

The API Gateway provides:

- API key validation for all requests
- Usage plans to limit request rates
- CORS configuration for browser security
- Request/response validation

### S3 Storage

Document storage is secured with:

- Proper bucket policies
- Path-based access control
- Server-side encryption
- Partitioning by quote ID

## Deployment Process

1. Create required IAM roles with least privilege permissions
2. Deploy the Lambda function
3. Create API Gateway with API key requirement
4. Configure usage plans and throttling
5. Set up proper CORS for browser access
6. Update frontend to include API key in requests

## Environment Variables

The frontend requires these environment variables:

```
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-2.amazonaws.com/prod
REACT_APP_API_KEY=your-api-key-here
```

The backend requires these environment variables:

```
SES_EMAIL_SENDER=notifications@kyndly.com
S3_BUCKET_NAME=kyndly-ichra-documents
```

## Security Considerations

- API keys should be stored securely and rotated regularly
- All sensitive data should be encrypted in transit and at rest
- Access to AWS resources should follow the principle of least privilege
- Regular security audits should be conducted
- Authentication and authorization should be added for user-specific endpoints

## Monitoring and Logging

- CloudWatch logs are enabled for the Lambda function
- API Gateway access logs are configured
- Request/response validation is in place
- Error handling includes appropriate logging 