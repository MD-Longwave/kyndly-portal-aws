# OpenAI Integration for ICHRA Knowledge Center

This document outlines the integration of OpenAI with the Kyndly ICHRA Knowledge Center, providing a comprehensive guide on setup, configuration, and usage.

## Overview

The Kyndly ICHRA Knowledge Center uses OpenAI's GPT models to provide expert assistance on Individual Coverage Health Reimbursement Arrangements (ICHRA). The integration consists of:

1. Backend service for secure API communication
2. API endpoints for chat interactions
3. Frontend components for user interface
4. Role-based access controls

## Setup Requirements

### 1. OpenAI API Key

To use the Knowledge Center, you need to obtain an OpenAI API key:

1. Create an account at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys section
3. Generate a new API key
4. Add this key to your environment variables:

```
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o  # or another available model
```

### 2. Backend Configuration

The backend must be configured with the OpenAI API key. Add the following to your `.env` file:

```
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o
```

### 3. Environment Variables

Ensure these environment variables are properly configured in your AWS environment:

- For local development: Add to your `.env` file
- For AWS deployment: Add to your AWS Lambda environment variables or Amplify environment settings

## Architecture

### Backend Components

1. **OpenAI Service (`openai.service.ts`)**
   - Handles API communication with OpenAI
   - Manages message history and context
   - Formats responses

2. **AI Controller (`ai.controller.ts`)**
   - Processes requests from frontend
   - Validates input
   - Handles error states

3. **API Routes (`ai.routes.ts`)**
   - Defines endpoints for AI interactions
   - Implements authentication middleware

### Frontend Components

1. **AI Service (`ai.service.ts`)**
   - Communicates with backend API
   - Manages authentication headers
   - Handles errors and retries

2. **Chat Message Component (`ChatMessage.tsx`)**
   - Renders individual messages
   - Formats AI responses

3. **Chat Input Component (`ChatInput.tsx`)**
   - Handles user input
   - Manages loading states

4. **Knowledge Center Page (`KnowledgeCenter.tsx`)**
   - Combines components
   - Manages conversation state
   - Handles authentication

## Usage

### API Endpoints

The following endpoints are available:

1. `POST /api/ai/chat`
   - Send messages to the AI
   - Requires authentication
   - Parameters:
     - `message`: The user's message
     - `conversationHistory`: Previous messages (optional)

2. `POST /api/ai/ichra-info`
   - Get specific information about ICHRA
   - Requires authentication
   - Parameters:
     - `query`: The specific ICHRA-related query

### User Interface

The Knowledge Center provides:

1. A chat interface for direct interaction with the AI assistant
2. Message history within the session
3. Option to clear conversation
4. Typing indicators and loading states

## Security Considerations

1. **API Key Protection**
   - OpenAI API key is stored only on the backend
   - Key is never exposed to frontend code
   - Environment variables are used for secure storage

2. **Authentication**
   - All AI endpoints require user authentication
   - AWS Cognito or Auth0 integration
   - Role-based access control

3. **Rate Limiting**
   - Usage is monitored and rate-limited
   - Prevents abuse and manages costs

## Cost Management

To control costs associated with the OpenAI API:

1. **Model Selection**
   - Configure the most cost-effective model for your needs
   - Default is `gpt-4o` but can be changed to less expensive models

2. **Token Limits**
   - Set `max_tokens` parameter to limit response length
   - Truncate conversation history for long discussions

3. **Monitoring**
   - Track usage through OpenAI dashboard
   - Set up alerts for unexpected usage patterns

## Troubleshooting

Common issues and solutions:

1. **API Key Invalid**
   - Verify the key is correctly configured in environment variables
   - Check the key hasn't been revoked in OpenAI dashboard

2. **Responses Too Short/Long**
   - Adjust the `max_tokens` parameter in `openai.service.ts`

3. **High Latency**
   - Consider using a different model with faster response times
   - Check for network issues between your server and OpenAI

## AWS Deployment Notes

When deploying to AWS:

1. **Lambda Function Configuration**
   - Increase timeout for Lambda functions (min 10 seconds recommended)
   - Allocate sufficient memory (min 512MB recommended)

2. **Environment Variables**
   - Configure OPENAI_API_KEY in Lambda environment
   - Use AWS Secrets Manager for production environments

3. **CloudWatch Monitoring**
   - Set up alarms for errors and latency
   - Monitor usage patterns

4. **Cost Control**
   - Consider implementing hard limits on API calls
   - Monitor both AWS and OpenAI costs separately 