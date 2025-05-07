#!/bin/bash

# Build the AI Lambda package
echo "Building AI Lambda package..."

# Create dist directory for Lambda
mkdir -p dist-ai-lambda

# Compile TypeScript
echo "Compiling TypeScript..."
cd ..
npx tsc -p ./tsconfig.json

# Create a temporary directory for the Lambda package
mkdir -p temp-ai-lambda

# Copy the required dist files to temp directory
echo "Copying files to temporary directory..."
cp -r dist/* temp-ai-lambda/
cp -r ai-lambda/ai-lambda.js temp-ai-lambda/

# Install production dependencies in the temp directory
echo "Installing production dependencies..."
cd temp-ai-lambda
npm ci --production

# Create the zip file
echo "Creating Lambda zip package..."
cd ..
zip -r dist-ai-lambda/ai-lambda.zip temp-ai-lambda/*

# Clean up
echo "Cleaning up temporary files..."
rm -rf temp-ai-lambda

echo "AI Lambda package created at dist-ai-lambda/ai-lambda.zip" 