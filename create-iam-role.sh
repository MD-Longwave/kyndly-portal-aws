#!/bin/bash
# Script to create IAM role for Lambda function

# Exit on error
set -e

ROLE_NAME="kyndly-lambda-role"

# Check if role exists
role_exists=$(aws iam list-roles --query "Roles[?RoleName=='$ROLE_NAME'].RoleName" --output text)

if [ -z "$role_exists" ]; then
  echo "Creating IAM role $ROLE_NAME..."
  
  # Create trust policy document for Lambda
  cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  # Create the role
  aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://trust-policy.json

  # Attach the policy document
  aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name kyndly-lambda-policy \
    --policy-document file://backend/iam-policy.json
  
  # Also attach the AWSLambdaBasicExecutionRole managed policy
  aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  
  echo "IAM role $ROLE_NAME created successfully."
  
  # Clean up
  rm -f trust-policy.json
else
  echo "IAM role $ROLE_NAME already exists."
fi 