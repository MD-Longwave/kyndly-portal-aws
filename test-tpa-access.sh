#!/bin/bash

# Test script for TPA access

USER_POOL_ID="us-east-2_WVTGKPX0l"
CLIENT_ID="53ua5mcufomh760j8ptp6af0qq"
IDENTITY_POOL_ID="us-east-2:3adb832a-4b01-46e2-a8d3-71857f413d74"
REGION="us-east-2"
USERNAME="tpa-test-user"
PASSWORD="Test@123!"

echo "Testing S3 access for $USERNAME"

# Authenticate user
echo "Authenticating user..."
auth_result=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id $USER_POOL_ID \
  --client-id $CLIENT_ID \
  --auth-flow ADMIN_USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=$USERNAME,PASSWORD=$PASSWORD)

id_token=$(echo $auth_result | grep -o '"IdToken": "[^"]*"' | cut -d'"' -f4)
echo "Successfully authenticated. Token received."

# Get credentials from Cognito Identity
echo "Getting temporary AWS credentials..."
creds_result=$(aws cognito-identity get-id \
  --identity-pool-id $IDENTITY_POOL_ID \
  --logins "{\"cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID\":\"$id_token\"}")

identity_id=$(echo $creds_result | grep -o '"IdentityId": "[^"]*"' | cut -d'"' -f4)
echo "Identity ID: $identity_id"

creds=$(aws cognito-identity get-credentials-for-identity \
  --identity-id $identity_id \
  --logins "{\"cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID\":\"$id_token\"}")

# Extract credentials
access_key=$(echo $creds | grep -o '"AccessKeyId": "[^"]*"' | cut -d'"' -f4)
secret_key=$(echo $creds | grep -o '"SecretKey": "[^"]*"' | cut -d'"' -f4)
session_token=$(echo $creds | grep -o '"SessionToken": "[^"]*"' | cut -d'"' -f4)

echo "Successfully obtained temporary credentials:"
echo "Access Key: ${access_key:0:5}..."
echo "Secret Key: ${secret_key:0:5}..."

# Test S3 operation
export AWS_ACCESS_KEY_ID=$access_key
export AWS_SECRET_ACCESS_KEY=$secret_key
export AWS_SESSION_TOKEN=$session_token

echo "Testing TPA-level access..."
aws s3 ls s3://kyndly-ichra-documents/submissions/test-tpa-123/

# Also try the direct file access
echo "Testing direct file access..."
aws s3 cp s3://kyndly-ichra-documents/submissions/test-tpa-123/test-file.txt -

echo "Test completed." 