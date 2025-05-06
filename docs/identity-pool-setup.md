# Setting Up Cognito Identity Pool for S3 Access

This guide explains how to set up an Amazon Cognito identity pool that works with your user pools and groups to provide role-based access to your S3 data.

## Step 1: Configure Identity Pool Trust

1. In the AWS Console, navigate to Amazon Cognito > Identity pools > Create identity pool
2. Enter a name for your identity pool (e.g., "KyndlyIdentityPool")
3. Under "Authentication providers":
   - Check "Authenticated access" (this should be selected by default)
   - Select "Amazon Cognito user pool"
   - Enter your User Pool ID (found in the user pool details page)
   - Enter your App client ID (create one in your user pool if needed)

## Step 2: Configure Permissions

1. For authenticated users, select "Create a new IAM role" and provide a role name (e.g., "KyndlyCognitoAuthRole")
2. For guest users (if applicable), you can select "Create a new IAM role" or "Deny" depending on your requirements
3. Click "Next" to review and create the identity pool

## Step 3: Configure Role Mapping (after creating the identity pool)

1. After creating the identity pool, go to the identity pool dashboard
2. Select "Identity Pool Settings" > "Authenticated role selection"
3. Choose "Choose role from token"
4. Set "Role resolution" to "DENY"
5. Under "Role mapping", configure mappings between your user pool groups and IAM roles:
   - tpa_users group → TPAUserRole (role with access to their TPA's data)
   - employer_users group → EmployerUserRole (role with access to their employer's data)
   - kyndly_admins group → AdminRole (role with full access)

## Step 4: Add the IAM Policies to the Roles

For each role created, modify the attached policy to match the access pattern needed:

### TPAUserRole Policy
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
        "arn:aws:s3:::kyndly-ichra-documents/submissions/${cognito-identity.amazonaws.com:sub:tpa_id}/*"
      ]
    }
  ]
}
```

### EmployerUserRole Policy
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
        "arn:aws:s3:::kyndly-ichra-documents/submissions/${cognito-identity.amazonaws.com:sub:tpa_id}/${cognito-identity.amazonaws.com:sub:employer_id}/*"
      ]
    }
  ]
}
```

### AdminRole Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::kyndly-ichra-documents/submissions/*"
      ]
    }
  ]
}
```

These settings will allow you to link your Cognito user pool groups with appropriate IAM roles for accessing your S3 data according to your partitioning strategy. 