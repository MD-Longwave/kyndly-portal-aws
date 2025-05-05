const awsmobile = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // You'll need to update this with your Cognito Identity Pool ID
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "us-east-1_xxxxxxxxx", // You'll need to update this with your User Pool ID
    "aws_user_pools_web_client_id": "xxxxxxxxxxxxxxxxxxxxxxxxxx", // You'll need to update this with your App Client ID
    "oauth": {
        "domain": "your-domain.auth.us-east-1.amazoncognito.com", // You'll need to update this with your Cognito domain
        "scope": [
            "email",
            "openid",
            "profile"
        ],
        "redirectSignIn": "http://localhost:3000/",
        "redirectSignOut": "http://localhost:3000/",
        "responseType": "code"
    },
    "aws_cloud_logic_custom": [
        {
            "name": "kyndlyApi",
            "endpoint": "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev", // You'll need to update this with your API Gateway endpoint
            "region": "us-east-1"
        }
    ],
    "aws_user_files_s3_bucket": "kyndly-ichra-documents", // You'll need to update this with your S3 bucket name
    "aws_user_files_s3_bucket_region": "us-east-1"
};

export default awsmobile; 