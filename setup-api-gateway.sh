#!/bin/bash
# Script to set up API Gateway with proper security for Lambda function

# Exit on error
set -e

# Set variables
LAMBDA_FUNCTION_NAME="kyndly-ichra-api"
API_NAME="kyndly-ichra-api"
REGION="us-east-2"
STAGE_NAME="prod"

echo "Setting up API Gateway for $LAMBDA_FUNCTION_NAME..."

# Get Lambda function ARN
LAMBDA_ARN=$(aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)

# Create REST API
echo "Creating REST API..."
API_ID=$(aws apigateway create-rest-api \
  --name $API_NAME \
  --description "API for Kyndly ICHRA Application" \
  --region $REGION \
  --endpoint-configuration types=REGIONAL \
  --query 'id' --output text)

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[?path==`/`].id' \
  --output text)

# Create proxy resource with {proxy+}
echo "Creating proxy resource..."
PROXY_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_RESOURCE_ID \
  --path-part "{proxy+}" \
  --query 'id' \
  --output text)

# Create ANY method for the proxy resource
echo "Creating ANY method..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method ANY \
  --authorization-type "NONE" \
  --api-key-required

# Create Lambda integration for the ANY method
echo "Setting up Lambda integration..."
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PROXY_RESOURCE_ID \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Create method for the root resource
echo "Creating method for root resource..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method ANY \
  --authorization-type "NONE" \
  --api-key-required

# Create Lambda integration for the root resource
echo "Setting up Lambda integration for root resource..."
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $ROOT_RESOURCE_ID \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Create API key
echo "Creating API key..."
API_KEY_ID=$(aws apigateway create-api-key \
  --name "kyndly-ichra-key" \
  --description "API Key for Kyndly ICHRA Application" \
  --enabled \
  --query 'id' \
  --output text)

# Deploy the API
echo "Deploying the API..."
DEPLOYMENT_ID=$(aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $STAGE_NAME \
  --description "Deployment for Kyndly ICHRA API" \
  --query 'id' \
  --output text)

# Create usage plan
echo "Creating usage plan..."
USAGE_PLAN_ID=$(aws apigateway create-usage-plan \
  --name "kyndly-ichra-usage-plan" \
  --description "Usage plan for Kyndly ICHRA API" \
  --api-stages "apiId=$API_ID,stage=$STAGE_NAME" \
  --quota "limit=1000,offset=0,period=MONTH" \
  --throttle "rateLimit=10,burstLimit=20" \
  --query 'id' \
  --output text)

# Add API key to usage plan
echo "Adding API key to usage plan..."
aws apigateway create-usage-plan-key \
  --usage-plan-id $USAGE_PLAN_ID \
  --key-id $API_KEY_ID \
  --key-type API_KEY

# Add Lambda permission for API Gateway
echo "Adding Lambda permission for API Gateway..."
aws lambda add-permission \
  --function-name $LAMBDA_FUNCTION_NAME \
  --statement-id apigateway-test \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:$REGION:$(aws sts get-caller-identity --query 'Account' --output text):$API_ID/*/*/*"

# Configure CORS for API Gateway
echo "Configuring CORS..."
aws apigateway put-gateway-response \
  --rest-api-id $API_ID \
  --response-type DEFAULT_4XX \
  --response-parameters "{\"gatewayresponse.header.Access-Control-Allow-Origin\":\"'*'\",\"gatewayresponse.header.Access-Control-Allow-Headers\":\"'*'\",\"gatewayresponse.header.Access-Control-Allow-Methods\":\"'*'\"}"

aws apigateway put-gateway-response \
  --rest-api-id $API_ID \
  --response-type DEFAULT_5XX \
  --response-parameters "{\"gatewayresponse.header.Access-Control-Allow-Origin\":\"'*'\",\"gatewayresponse.header.Access-Control-Allow-Headers\":\"'*'\",\"gatewayresponse.header.Access-Control-Allow-Methods\":\"'*'\"}"

# Get API key value
API_KEY_VALUE=$(aws apigateway get-api-key \
  --api-key $API_KEY_ID \
  --include-value \
  --query 'value' \
  --output text)

# Display the API endpoint URL and key
echo ""
echo "======================================"
echo "API Gateway setup complete!"
echo "API Endpoint URL: https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME"
echo "API Key: $API_KEY_VALUE"
echo "======================================"
echo ""
echo "Update your frontend API_BASE_URL to: https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME"
echo "Save the API key securely for frontend authentication." 