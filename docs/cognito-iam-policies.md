# IAM Policies for Cognito-Based S3 Access Control

This document provides example IAM policies that implement access control based on Cognito user pools and groups, aligned with our S3 partitioning strategy.

## Overview

Our S3 partitioning strategy uses the following key structure:
```
s3://kyndly-ichra-documents/submissions/{tpa_id}/{employer_id}/{submission_id}/file.pdf
```

We'll create IAM policies that:
1. Restrict TPA users to access only their TPA's data
2. Restrict Employer users to access only their specific employer data
3. Allow Kyndly admins full access to all submissions

## Trust Relationships for Role Assumption

First, each role needs a trust relationship that allows Cognito to assume the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "cognito-identity.amazonaws.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "cognito-identity.amazonaws.com:aud": "us-east-2_XXXXXXXXXXXX"
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated"
        }
      }
    }
  ]
}
```

## TPA Users IAM Policy

TPA users should only have access to submissions from their own TPA:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::kyndly-ichra-documents",
        "arn:aws:s3:::kyndly-ichra-documents/submissions/${cognito:sub:tpa_id}/*"
      ],
      "Condition": {
        "StringEquals": {
          "cognito:groups": "tpa_users"
        }
      }
    }
  ]
}
```

## Employer Users IAM Policy

Employer users should only have access to submissions for their specific employer:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::kyndly-ichra-documents",
        "arn:aws:s3:::kyndly-ichra-documents/submissions/${cognito:sub:tpa_id}/${cognito:sub:employer_id}/*"
      ],
      "Condition": {
        "StringEquals": {
          "cognito:groups": "employer_users"
        }
      }
    }
  ]
}
```

## Kyndly Admin IAM Policy

Kyndly admins should have full access to all submissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::kyndly-ichra-documents",
        "arn:aws:s3:::kyndly-ichra-documents/submissions/*"
      ],
      "Condition": {
        "StringEquals": {
          "cognito:groups": "kyndly_admins"
        }
      }
    }
  ]
}
```

## Implementation Steps

1. Create these IAM roles in the AWS Console
2. Configure the trust relationship for each role
3. Attach the appropriate policy to each role
4. Associate each role with the corresponding Cognito user group
5. Set up an identity pool to provide temporary credentials based on group membership

## Frontend Integration

When a user signs in via Cognito, the frontend application should:

1. Receive and store the ID token
2. Use the Cognito Identity Pool to exchange the ID token for temporary AWS credentials
3. Use those credentials to make S3 API calls

The S3 service will then enforce the access restrictions based on the user's group and attributes.

Example frontend code:

```javascript
// After user signs in with Cognito
const getS3Credentials = async (idToken) => {
  const credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    Logins: {
      'cognito-idp.us-east-2.amazonaws.com/us-east-2_XXXXXXXXXXXX': idToken
    }
  });
  
  await credentials.getPromise();
  
  // Now configure the S3 client with these credentials
  const s3 = new AWS.S3({
    credentials: credentials
  });
  
  return s3;
};

// Example S3 operation - this will only succeed if the user has permission
const listUserDocuments = async (s3Client, tpaId, employerId) => {
  const params = {
    Bucket: 'kyndly-ichra-documents',
    Prefix: `submissions/${tpaId}/${employerId}/`
  };
  
  return await s3Client.listObjectsV2(params).promise();
};
``` 