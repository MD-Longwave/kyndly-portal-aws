# Setting Up AWS Cognito User Pools for Kyndly Application

This document provides step-by-step instructions for setting up AWS Cognito user pools to support the role-based access control system for the Kyndly application. These user pools will complement our S3 partitioning strategy and provide secure access to resources based on user roles.

## User Roles and Access Patterns

The Kyndly application has three main user roles, each requiring different access permissions:

1. **TPA Users**: Third-party administrators who can access submissions for all employers under their TPA
2. **Employer Users**: Employer administrators who can only access submissions for their specific employer
3. **Kyndly Admins**: Admin users who have full access to all submissions

## Step 1: Create the Main User Pool

1. Sign in to the AWS Management Console and navigate to the Cognito service
2. Click "Create user pool"
3. **Step 1: Configure sign-in experience**
   - For Sign-in options, select "Email"
   - Provider types: Keep "Cognito user pool" as the only option
   - Cognito user pool sign-in options: Check "Email"
   - Click "Next"

4. **Step 2: Configure security requirements**
   - Password policy: Choose "Cognito defaults"
   - Multi-factor authentication: Choose "No MFA" for testing
   - User account recovery: Keep "Enable self-service account recovery" checked
   - Click "Next"

5. **Step 3: Configure sign-up experience**
   - Self-registration: Keep "Enable self-registration" checked
   - Cognito-assisted verification and confirmation:
     - Select "Allow Cognito to automatically send messages to verify and confirm"
     - For Attributes to verify, select "Send email message, verify email address" 
   - Required attributes: Select "email" (minimum requirement)
   - Custom attributes: Add the following custom attributes:
     - Name: "tpa_id", Type: String
     - Name: "employer_id", Type: String 
     - Name: "role", Type: String
   - Click "Next"

6. **Step 4: Configure message delivery**
   - Email provider: Select "Send email with Cognito"
   - From email address: Use "no-reply@verificationemail.com" or your custom sender
   - Click "Next"

7. **Step 5: Integrate your app**
   - User pool name: "KyndlyUserPool"
   - Hosted authentication pages: Uncheck (we'll handle this in our application)
   - Initial app client: 
     - App client name: "KyndlyAppClient"
     - Client secret: Select "Don't generate a client secret"
   - Advanced app client settings: Keep defaults
   - Click "Next"

8. **Step 6: Review and create**
   - Review all settings
   - Click "Create user pool"

## Step 2: Create User Groups for Different Roles

After creating the user pool, we need to create three user groups to represent our access roles:

1. Navigate to your newly created user pool
2. Select the "Groups" tab
3. Click "Create group"

### Create the TPA Users Group

1. **Group name**: "tpa_users"
2. **Description**: "Third-party administrators with access to all employers under their TPA"
3. **IAM role**: (Optional) Select or create a role with permissions to access S3 paths matching `/submissions/${tpa_id}/*`
4. **Precedence**: 100 (Lower numbers have higher precedence)
5. Click "Create group"

### Create the Employer Users Group

1. **Group name**: "employer_users"
2. **Description**: "Employer administrators with access to their specific employer data only"
3. **IAM role**: (Optional) Select or create a role with permissions to access S3 paths matching `/submissions/${tpa_id}/${employer_id}/*`
4. **Precedence**: 200
5. Click "Create group"

### Create the Kyndly Admins Group

1. **Group name**: "kyndly_admins"
2. **Description**: "Kyndly administrators with full access to all submissions"
3. **IAM role**: (Optional) Select or create a role with full access to all submissions
4. **Precedence**: 50 (Highest precedence)
5. Click "Create group"

## Step 3: Create Test Users

For testing purposes, you can create test users for each role:

1. In your user pool, select the "Users" tab
2. Click "Create user"

### Create a TPA Admin Test User

1. **Invitation method**: Select "Send an email invitation"
2. **Email address**: Enter a test email (e.g., "tpa-admin@example.com")
3. **Username**: Will be auto-generated from email, or specify manually
4. **Temporary password**: Auto-generate or specify a password
5. **Phone number**: (Optional)
6. **Confirm user creation**: Click "Create user"
7. After creating the user, select it from the users list
8. Click "Add to group" and add to the "tpa_users" group
9. Click "Add user attributes" and add:
   - **Name**: "custom:tpa_id", **Value**: "test-tpa-123"
   - **Name**: "custom:role", **Value**: "tpa_user"

### Create an Employer Admin Test User

1. Follow the same steps as above but use a different email (e.g., "employer-admin@example.com")
2. Add to the "employer_users" group
3. Add attributes:
   - **Name**: "custom:tpa_id", **Value**: "test-tpa-123"
   - **Name**: "custom:employer_id", **Value**: "test-employer-456"
   - **Name**: "custom:role", **Value**: "employer_user"

### Create a Kyndly Admin Test User

1. Follow the same steps with a different email (e.g., "kyndly-admin@example.com")
2. Add to the "kyndly_admins" group
3. Add attribute:
   - **Name**: "custom:role", **Value**: "kyndly_admin"

## Step 4: Configure App Client

1. In your user pool, select the "App integration" tab
2. Under "App clients and analytics", select your app client
3. Click "Edit"
4. Configure the authentication flows:
   - Check "ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH", and "ALLOW_CUSTOM_AUTH"
5. Click "Save changes"

## Step 5: Integration with S3 Partitioning Strategy

The Cognito setup complements our S3 partitioning strategy:

- TPA users can access all submissions under their TPA prefix (`submissions/${tpa_id}/*`)
- Employer users can only access submissions under their specific employer prefix (`submissions/${tpa_id}/${employer_id}/*`)
- Kyndly admins can access all submissions

The IAM roles assigned to each group should have policies that enforce these access patterns, which match our S3 key structure:

```
s3://kyndly-ichra-documents/submissions/{tpa_id}/{employer_id}/{submission_id}/file.pdf
```

## Next Steps

1. Integrate Cognito authentication in the frontend application
2. Set up identity pool to provide temporary AWS credentials based on user groups
3. Configure IAM roles with appropriate permissions for each user group
4. Test access patterns to ensure proper isolation and security 