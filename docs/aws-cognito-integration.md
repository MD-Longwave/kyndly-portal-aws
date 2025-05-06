# AWS Cognito Integration for Kyndly ICHRA Portal

## Overview

This document summarizes the integration of AWS Cognito for authentication and authorization in the Kyndly ICHRA Portal application. We've replaced the previous Auth0 implementation with AWS Cognito to better align with the AWS Amplify architecture.

## Role-Based Access Control Structure

We've implemented a comprehensive role-based access control (RBAC) system with the following roles:

1. **Admin** - Full system access, including user management and system settings
2. **Kyndly Staff** - Kyndly team members with access to all employer accounts
3. **TPA Admin** - Third-Party Administrator with team management capabilities
4. **TPA User** - Basic TPA user with access to assigned employer accounts

## Implementation Components

### 1. Authentication Context

- Created `AuthContext.tsx` to provide authentication state and methods throughout the application
- Implemented login, logout, and session management using AWS Amplify Auth
- Added methods for checking roles and permissions

### 2. Permission Handling

- Created `usePermission.ts` hook for checking user permissions and roles
- Implemented helper functions for role checks: `isAdmin`, `isKyndlyTeam`, `isTpaAdmin`, `isTpaUser`
- Utility functions for checking specific permissions: `hasPermission`

### 3. Cognito Configuration

- Created `cognito.ts` configuration file with environment-specific settings
- Added role definitions and permission mappings
- Set up configuration for OAuth and authentication flows

### 4. API Integration

- Created `api.ts` utility for making authenticated API requests
- Implemented request interceptors to add authentication tokens
- Added response interceptors to handle authentication errors

### 5. Protected Routes

- Updated the `ProtectedRoute` component in `App.tsx` to check for authentication and roles
- Added route-specific role requirements for sensitive sections
- Implemented redirect to login when authentication is missing

### 6. User Interface

- Updated `Login.tsx` to support Cognito authentication
- Modified `UserProfile.tsx` to display user data from Cognito
- Updated `AppLayout.tsx` to show current user information and handle logout

## Custom Attributes in Cognito

We've configured the following custom attributes in Cognito to store user metadata:

- `custom:roles` - Array of user roles as a JSON string
- `custom:permissions` - Array of user permissions as a JSON string
- `custom:organization_id` - Organization identifier
- `custom:organization_name` - Organization display name
- `custom:organization_type` - Organization type (kyndly or tpa)

## Next Steps

1. **Deploy Cognito Infrastructure**: Follow instructions in `cognito-setup.md` to set up the AWS Cognito User Pool with appropriate settings and custom attributes.

2. **Create Initial Users**: Create admin and test users in the Cognito User Pool to validate roles and permissions.

3. **Update API Gateway**: Configure API Gateway to validate Cognito JWT tokens for API authorization.

4. **Update Lambda Functions**: Modify Lambda functions to extract user information from Cognito tokens for authorization checks.

5. **Test Access Control**: Thoroughly test the application with different user roles to ensure proper access control.

## References

- [AWS Amplify Authentication Documentation](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [AWS Cognito Developer Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [Implementing Secure Authentication with AWS Cognito](https://aws.amazon.com/blogs/mobile/implementing-secure-and-scalable-authentication-using-amazon-cognito/) 