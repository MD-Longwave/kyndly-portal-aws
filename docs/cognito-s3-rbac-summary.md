# Cognito and S3 Role-Based Access Control Implementation

This document summarizes the implementation of role-based access control (RBAC) for S3 data in the Kyndly application using Amazon Cognito and AWS IAM.

## Overview

We've implemented a secure, scalable, and organized storage system for quote submissions from TPAs on behalf of various employers. This system:

1. Uses a structured S3 key naming and partitioning strategy
2. Leverages Cognito user pools and groups for authentication
3. Maps Cognito groups to IAM roles with specific permissions
4. Enforces appropriate access controls at each level of the hierarchy

## S3 Partitioning Strategy

Files are stored in a hierarchical structure:
```
s3://kyndly-ichra-documents/submissions/{tpa_id}/{employer_id}/{submission_id}/file.pdf
```

## Cognito Configuration

### User Pools
- Created `KyndlyUserPool` with user groups:
  - `tpa_users`: Third-party administrators
  - `employer_users`: Employer administrators
  - `kyndly_admins`: Kyndly admin users

### Identity Pool
- Created `KyndlyIdentityPool` that maps Cognito user groups to IAM roles:
  - `tpa_users` → `KyndlyTPAUserRole`
  - `employer_users` → `KyndlyEmployerUserRole`
  - `kyndly_admins` → `KyndlyAdminRole`

## IAM Roles and Policies

### KyndlyTPAUserRole
- Can access only their TPA's data
- Can list and read files in their TPA's folder

### KyndlyEmployerUserRole
- Can access only their employer's data
- Cannot access other employers' data
- Cannot access TPA-level data

### KyndlyAdminRole
- Has full access to all submissions
- Can create, read, update, and delete files

## Test Results

We've created test scripts to verify access control:

1. `test-tpa-access.sh`: Verifies TPA user access
2. `test-employer-access.sh`: Verifies employer user access
3. `test-admin-access.sh`: Verifies admin user access

All tests confirmed that the role-based access control is functioning as expected.

## Integration with Application

To integrate this RBAC system with the Kyndly application:

1. Authenticate users with Cognito user pools
2. Assign users to the appropriate groups based on their role
3. Use the Cognito identity pool to obtain temporary AWS credentials
4. Use those credentials to access S3 according to the user's role

This implementation ensures that TPAs can only access their own data, employers can only access their specific data, and admins have full access, creating a secure and well-organized system for managing quote submissions. 