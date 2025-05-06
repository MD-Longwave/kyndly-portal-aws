# AWS Cognito Setup for Kyndly ICHRA Portal

This guide provides step-by-step instructions for setting up AWS Cognito with role-based access control for the Kyndly ICHRA Portal application.

## Overview

The Kyndly ICHRA application uses AWS Cognito for authentication and authorization with the following role structure:

1. **Admin** - Full system access, can manage users and system settings
2. **Kyndly Staff** - Kyndly team members with access to all employer accounts
3. **TPA Admin** - Third-Party Administrator with team management capabilities
4. **TPA User** - Basic TPA user with access to assigned employer accounts

## Step 1: Create a User Pool

1. Log in to the AWS Management Console
2. Navigate to Amazon Cognito
3. Click "Create user pool"
4. For sign-in options, select "Email" and optionally "Username"
5. Under password policy, choose "Cognito defaults" or a custom policy
6. For MFA, select "Optional MFA" to allow administrators to enforce MFA
7. Select "Enable self-registration" if you want to allow users to sign up themselves
8. Configure the required attributes (email is recommended as a required attribute)
9. Configure message delivery (email via Amazon SES is recommended)
10. Integrate your app by creating an app client:
    - Name: "KyndlyICHRAPortal"
    - Generate a client secret
    - Set the callback URL to your application URL (e.g., `https://dw8hkdzhqger0.amplifyapp.com/`)
    - Set the sign-out URL to your application logout URL
11. Review and create the user pool

## Step 2: Set Up Custom Attributes

1. In your newly created user pool, go to the "Attributes" tab
2. Add the following custom attributes:

| Name | Type | Mutable |
|------|------|---------|
| custom:roles | String | Yes |
| custom:organization_id | String | Yes |
| custom:organization_name | String | Yes |
| custom:organization_type | String | Yes |
| custom:permissions | String | Yes |

## Step 3: Create Groups for User Roles

1. In your user pool, go to the "Groups" tab
2. Create the following groups:
   - admin
   - kyndly_staff
   - tpa_admin
   - tpa_user

## Step 4: Create Initial Admin User

1. In your user pool, go to the "Users" tab
2. Click "Create user"
3. Enter the user details:
   - Email: [admin's email]
   - Temporary password: [secure password]
   - Mark email as verified
4. After creation, add the user to the "admin" group
5. Set custom attributes for the user:
   ```json
   {
     "custom:roles": "[\"admin\"]",
     "custom:organization_id": "kyndly-main",
     "custom:organization_name": "Kyndly Health",
     "custom:organization_type": "kyndly",
     "custom:permissions": "[\"read:employers\", \"write:employers\", \"delete:employers\", \"read:quotes\", \"write:quotes\", \"delete:quotes\", \"read:documents\", \"write:documents\", \"delete:documents\", \"read:users\", \"write:users\", \"delete:users\", \"read:settings\", \"write:settings\"]"
   }
   ```

## Step 5: Update AWS Exports Configuration

Update the `aws-exports.js` file in your project with the correct Cognito configuration:

```javascript
const awsmobile = {
    "aws_project_region": "us-east-1", // Your AWS region
    "aws_cognito_identity_pool_id": "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Your Cognito Identity Pool ID
    "aws_cognito_region": "us-east-1", // Your Cognito region
    "aws_user_pools_id": "us-east-1_xxxxxxxxx", // Your User Pool ID
    "aws_user_pools_web_client_id": "xxxxxxxxxxxxxxxxxxxxxxxxxx", // Your App Client ID
    "oauth": {
        "domain": "your-domain.auth.us-east-1.amazoncognito.com", // Your Cognito domain
        "scope": [
            "email",
            "openid",
            "profile"
        ],
        "redirectSignIn": "https://dw8hkdzhqger0.amplifyapp.com/", // Your Amplify app URL
        "redirectSignOut": "https://dw8hkdzhqger0.amplifyapp.com/", // Your Amplify app URL
        "responseType": "code"
    },
    // Other configurations remain the same
};
```

## Step 6: Set Up AWS Amplify Environment Variables

In your AWS Amplify Console, add the following environment variables:

| Variable | Value |
|----------|-------|
| REACT_APP_AWS_REGION | us-east-1 |
| REACT_APP_COGNITO_USER_POOL_ID | us-east-1_xxxxxxxxx |
| REACT_APP_COGNITO_APP_CLIENT_ID | xxxxxxxxxxxxxxxxxxxxxxxxxx |
| REACT_APP_COGNITO_IDENTITY_POOL_ID | us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| REACT_APP_COGNITO_DOMAIN | your-domain.auth.us-east-1.amazoncognito.com |
| REACT_APP_REDIRECT_SIGN_IN | https://dw8hkdzhqger0.amplifyapp.com/ |
| REACT_APP_REDIRECT_SIGN_OUT | https://dw8hkdzhqger0.amplifyapp.com/ |

## Step 7: Managing Users and Permissions

### Adding New Kyndly Staff

1. Create a new user in the Cognito User Pool
2. Add the user to the "kyndly_staff" group
3. Set custom attributes:
   ```json
   {
     "custom:roles": "[\"kyndly_staff\"]",
     "custom:organization_id": "kyndly-main",
     "custom:organization_name": "Kyndly Health",
     "custom:organization_type": "kyndly",
     "custom:permissions": "[\"read:employers\", \"write:employers\", \"delete:employers\", \"read:quotes\", \"write:quotes\", \"delete:quotes\", \"read:documents\", \"write:documents\", \"delete:documents\", \"read:users\"]"
   }
   ```

### Adding New TPA Admin

1. Create a new user in the Cognito User Pool
2. Add the user to the "tpa_admin" group
3. Set custom attributes:
   ```json
   {
     "custom:roles": "[\"tpa_admin\"]",
     "custom:organization_id": "tpa-123", // Unique TPA ID
     "custom:organization_name": "Example TPA",
     "custom:organization_type": "tpa",
     "custom:permissions": "[\"read:employers\", \"write:employers\", \"read:quotes\", \"write:quotes\", \"delete:quotes\", \"read:documents\", \"write:documents\", \"delete:documents\", \"read:users\", \"write:users\"]"
   }
   ```

### Adding New TPA User

1. Create a new user in the Cognito User Pool
2. Add the user to the "tpa_user" group
3. Set custom attributes:
   ```json
   {
     "custom:roles": "[\"tpa_user\"]",
     "custom:organization_id": "tpa-123", // Same TPA ID as their admin
     "custom:organization_name": "Example TPA",
     "custom:organization_type": "tpa",
     "custom:permissions": "[\"read:employers\", \"read:quotes\", \"write:quotes\", \"read:documents\", \"write:documents\"]"
   }
   ```

## Step 8: Testing the Authentication

1. Log out of the application
2. Attempt to log in with your admin credentials
3. Verify that you have access to all sections of the application
4. Create and test users with different roles to verify that role-based access controls are working correctly

## Advanced Configuration

### Setting Up MFA (Multi-Factor Authentication)

1. In your user pool, navigate to "MFA and verifications"
2. Enable MFA as "Optional" or "Required"
3. Select the MFA methods (SMS, email, or authenticator apps)

### Custom Domain

1. In your user pool, navigate to "App integration" > "Domain name"
2. Choose "Use your domain" and enter your custom domain
3. Follow the steps to configure your domain with AWS Certificate Manager

### Password Policies

1. In your user pool, navigate to "Sign-in experience" > "Password policy"
2. Configure the password complexity requirements according to your security standards 