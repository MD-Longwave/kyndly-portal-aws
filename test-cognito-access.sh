#!/bin/bash

# This script tests the Cognito authentication and S3 access for different users

USER_POOL_ID="us-east-2_WVTGKPX0l"
CLIENT_ID="53ua5mcufomh760j8ptp6af0qq"
IDENTITY_POOL_ID="us-east-2:3adb832a-4b01-46e2-a8d3-71857f413d74"
REGION="us-east-2"

# Function to authenticate user and test S3 access
test_user_access() {
  local username=$1
  local password=$2
  local description=$3
  
  echo "========================================"
  echo "Testing $description ($username)"
  echo "========================================"
  
  # Authenticate user
  echo "Authenticating user..."
  auth_result=$(aws cognito-idp admin-initiate-auth \
    --user-pool-id $USER_POOL_ID \
    --client-id $CLIENT_ID \
    --auth-flow ADMIN_USER_PASSWORD_AUTH \
    --auth-parameters USERNAME=$username,PASSWORD=$password)
  
  if [ $? -ne 0 ]; then
    echo "Authentication failed for $username"
    return
  fi
  
  id_token=$(echo $auth_result | grep -o '"IdToken": "[^"]*"' | cut -d'"' -f4)
  echo "Successfully authenticated"
  
  # Get credentials from Cognito Identity
  echo "Getting temporary AWS credentials..."
  creds_result=$(aws cognito-identity get-id \
    --identity-pool-id $IDENTITY_POOL_ID \
    --logins "{\"cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID\":\"$id_token\"}")
  
  if [ $? -ne 0 ]; then
    echo "Failed to get identity ID"
    return
  fi
  
  identity_id=$(echo $creds_result | grep -o '"IdentityId": "[^"]*"' | cut -d'"' -f4)
  
  creds=$(aws cognito-identity get-credentials-for-identity \
    --identity-id $identity_id \
    --logins "{\"cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID\":\"$id_token\"}")
  
  if [ $? -ne 0 ]; then
    echo "Failed to get credentials"
    return
  fi
  
  # Extract credentials
  access_key=$(echo $creds | grep -o '"AccessKeyId": "[^"]*"' | cut -d'"' -f4)
  secret_key=$(echo $creds | grep -o '"SecretKey": "[^"]*"' | cut -d'"' -f4)
  session_token=$(echo $creds | grep -o '"SessionToken": "[^"]*"' | cut -d'"' -f4)
  
  echo "Successfully obtained temporary credentials"
  
  # Test S3 access for TPA level
  echo "Testing access to TPA level file..."
  aws s3 cp s3://kyndly-ichra-documents/submissions/test-tpa-123/test-file.txt ./test-output.txt \
    --region $REGION \
    AWS_ACCESS_KEY_ID=$access_key \
    AWS_SECRET_ACCESS_KEY=$secret_key \
    AWS_SESSION_TOKEN=$session_token 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "✅ Can access TPA level file"
    cat ./test-output.txt
    rm ./test-output.txt
  else
    echo "❌ Cannot access TPA level file"
  fi
  
  # Test S3 access for Employer level
  echo "Testing access to Employer level file..."
  aws s3 cp s3://kyndly-ichra-documents/submissions/test-tpa-123/test-employer-456/test-file.txt ./test-output.txt \
    --region $REGION \
    AWS_ACCESS_KEY_ID=$access_key \
    AWS_SECRET_ACCESS_KEY=$secret_key \
    AWS_SESSION_TOKEN=$session_token 2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "✅ Can access Employer level file"
    cat ./test-output.txt
    rm ./test-output.txt
  else
    echo "❌ Cannot access Employer level file"
  fi
  
  echo ""
}

# Test access for each user type
test_user_access "tpa-test-user" "Test@123!" "TPA User"
test_user_access "employer-test-user" "Test@123!" "Employer User"
test_user_access "admin-test-user" "Test@123!" "Admin User"

echo "Test completed." 