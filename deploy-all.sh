#!/bin/bash
echo "Running deploy script..."
./deploy-minimal-lambda.sh
aws s3 sync frontend/build/ s3://kyndly-ichra-frontend/
