import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import app from './server';

// Create serverless handler from Express app
const handler = serverless(app);

// Lambda handler function
export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Pass the event and context to the serverless handler
  return await handler(event, context);
}; 