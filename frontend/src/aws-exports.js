const awsmobile = {
    "aws_project_region": "us-east-2",
    "aws_cognito_identity_pool_id": "us-east-2:3adb832a-4b01-46e2-a8d3-71857f413d74",
    "aws_cognito_region": "us-east-2",
    "aws_user_pools_id": "us-east-2_WVTGKPX0l",
    "aws_user_pools_web_client_id": "53ua5mcufomh760j8ptp6af0qq",
    "oauth": {
        "domain": "kyndly-ichra-portal.auth.us-east-2.amazoncognito.com",
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
            "endpoint": "https://api.kyndly.com/dev",
            "region": "us-east-2"
        }
    ],
    "aws_user_files_s3_bucket": "kyndly-ichra-documents",
    "aws_user_files_s3_bucket_region": "us-east-2"
};

export default awsmobile; 