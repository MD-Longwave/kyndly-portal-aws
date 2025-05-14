const configManager = require('./configManager');
const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const USER_POOL_ID = process.env.USER_POOL_ID;

// Helper to format the API response
const formatResponse = (statusCode, body, event) => {
  // Get origin from the list of allowed origins
  const allowedOrigins = [
    'https://clean-main.dw8hkdzhqger0.amplifyapp.com',
    'http://localhost:3000',
    'https://main.d18ljut2zt91m5.amplifyapp.com',
    'https://dev.kyndly.com',
    'https://app.kyndly.com'
  ];
  
  // Get the origin from the request headers
  const requestOrigin = event?.headers?.origin || event?.headers?.Origin || '';
  
  // Check if the request origin is in the allowed list
  const isAllowedOrigin = allowedOrigins.includes(requestOrigin);
  
  // Use the request origin if it's allowed, otherwise use the first allowed origin
  const origin = isAllowedOrigin ? requestOrigin : allowedOrigins[0];
  
  // Make sure to log the origin we're using
  console.log(`Using origin: ${origin} for response`);
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-Date,x-api-key',
      'Access-Control-Allow-Credentials': 'true'
    },
    body: JSON.stringify(body)
  };
};

// Get user's TPA ID from Cognito token
const getTpaIdFromToken = async (event) => {
  try {
    // Extract token from Authorization header 
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    
    if (!authHeader) {
      console.error('No Authorization header found');
      throw new Error('No authorization token provided');
    }
    
    // Handle 'Bearer TOKEN' format
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    if (!token) {
      console.error('Token not found in Authorization header');
      throw new Error('No authorization token provided');
    }
    
    console.log(`Token found (first 15 chars): ${token.substring(0, 15)}...`);
    
    // Get user attributes from Cognito
    const userInfo = await cognito.getUser({
      AccessToken: token
    }).promise();
    
    // Find the tpa_id attribute
    const tpaIdAttr = userInfo.UserAttributes.find(attr => attr.Name === 'custom:tpa_id');
    if (!tpaIdAttr) {
      console.error('No custom:tpa_id attribute found in user attributes');
      throw new Error('User does not have a TPA ID');
    }
    
    console.log(`Found TPA ID: ${tpaIdAttr.Value}`);
    return tpaIdAttr.Value;
  } catch (error) {
    console.error('Error getting TPA ID from token:', error);
    throw error;
  }
};

// Check if user is an admin
const isAdmin = async (event) => {
  try {
    // Extract token from Authorization header
    const token = event.headers.Authorization?.split(' ')[1];
    if (!token) {
      return false;
    }
    
    // Get user info from Cognito
    const userInfo = await cognito.getUser({
      AccessToken: token
    }).promise();
    
    // Check user groups
    const groups = await cognito.adminListGroupsForUser({
      UserPoolId: USER_POOL_ID,
      Username: userInfo.Username
    }).promise();
    
    return groups.Groups.some(group => group.GroupName === 'ADMIN');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get all TPAs (admin only)
const getAllTpas = async (event) => {
  try {
    const admin = await isAdmin(event);
    if (!admin) {
      return formatResponse(403, { error: 'Permission denied' }, event);
    }
    
    const config = await configManager.getConfig();
    return formatResponse(200, config.tpas, event);
  } catch (error) {
    console.error('Error getting TPAs:', error);
    return formatResponse(500, { error: error.message }, event);
  }
};

// Get the current user's TPA info
const getCurrentTpa = async (event) => {
  try {
    // First check if admin
    const admin = await isAdmin(event);
    
    let tpaId;
    if (admin && event.queryStringParameters?.tpaId) {
      // Admin can specify which TPA to view
      tpaId = event.queryStringParameters.tpaId;
    } else if (admin && event.queryStringParameters?.id) {
      // Also check for 'id' parameter
      tpaId = event.queryStringParameters.id;
    } else {
      // Regular user gets their own TPA
      tpaId = await getTpaIdFromToken(event);
    }
    
    const tpa = await configManager.getTpaById(tpaId);
    if (!tpa) {
      return formatResponse(404, { error: 'TPA not found' }, event);
    }
    
    return formatResponse(200, tpa, event);
  } catch (error) {
    console.error('Error getting current TPA:', error);
    return formatResponse(500, { error: error.message }, event);
  }
};

// Add or update a broker
const updateBroker = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name } = body;
    
    if (!name) {
      return formatResponse(400, { error: 'Broker name is required' }, event);
    }
    
    // First check if admin
    const admin = await isAdmin(event);
    
    let tpaId;
    if (admin && body.tpaId) {
      // Admin can specify which TPA to update
      tpaId = body.tpaId;
    } else {
      // Regular user updates their own TPA
      tpaId = await getTpaIdFromToken(event);
    }
    
    // Generate broker ID if not provided
    const brokerId = body.id || `broker_${Date.now()}`;
    
    await configManager.updateBroker(tpaId, {
      id: brokerId,
      name,
      ...body
    });
    
    return formatResponse(200, { 
      message: 'Broker updated successfully', 
      brokerId
    }, event);
  } catch (error) {
    console.error('Error updating broker:', error);
    return formatResponse(500, { error: error.message }, event);
  }
};

// Add or update an employer
const updateEmployer = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, brokerId } = body;
    
    if (!name || !brokerId) {
      return formatResponse(400, { error: 'Employer name and broker ID are required' }, event);
    }
    
    // First check if admin
    const admin = await isAdmin(event);
    
    let tpaId;
    if (admin && body.tpaId) {
      // Admin can specify which TPA to update
      tpaId = body.tpaId;
    } else {
      // Regular user updates their own TPA
      tpaId = await getTpaIdFromToken(event);
    }
    
    // Generate employer ID if not provided
    const employerId = body.id || `employer_${Date.now()}`;
    
    await configManager.updateEmployer(tpaId, brokerId, {
      id: employerId,
      name,
      ...body
    });
    
    return formatResponse(200, { 
      message: 'Employer updated successfully', 
      employerId 
    }, event);
  } catch (error) {
    console.error('Error updating employer:', error);
    return formatResponse(500, { error: error.message }, event);
  }
};

// Delete a broker
const deleteBroker = async (event) => {
  try {
    const { brokerId } = event.pathParameters || {};
    
    if (!brokerId) {
      return formatResponse(400, { error: 'Broker ID is required' }, event);
    }
    
    // First check if admin
    const admin = await isAdmin(event);
    
    let tpaId;
    if (admin && event.queryStringParameters?.tpaId) {
      // Admin can specify which TPA to update
      tpaId = event.queryStringParameters.tpaId;
    } else {
      // Regular user updates their own TPA
      tpaId = await getTpaIdFromToken(event);
    }
    
    await configManager.deleteBroker(tpaId, brokerId);
    
    return formatResponse(200, { message: 'Broker deleted successfully' }, event);
  } catch (error) {
    console.error('Error deleting broker:', error);
    return formatResponse(500, { error: error.message }, event);
  }
};

// Delete an employer
const deleteEmployer = async (event) => {
  try {
    const { brokerId, employerId } = event.pathParameters || {};
    
    if (!brokerId || !employerId) {
      return formatResponse(400, { error: 'Broker ID and Employer ID are required' }, event);
    }
    
    // First check if admin
    const admin = await isAdmin(event);
    
    let tpaId;
    if (admin && event.queryStringParameters?.tpaId) {
      // Admin can specify which TPA to update
      tpaId = event.queryStringParameters.tpaId;
    } else {
      // Regular user updates their own TPA
      tpaId = await getTpaIdFromToken(event);
    }
    
    await configManager.deleteEmployer(tpaId, brokerId, employerId);
    
    return formatResponse(200, { message: 'Employer deleted successfully' }, event);
  } catch (error) {
    console.error('Error deleting employer:', error);
    return formatResponse(500, { error: error.message }, event);
  }
};

// Get all users from S3 Config
const getUsers = async (event) => {
  try {
    // First check if admin
    const admin = await isAdmin(event);
    
    let tpaId;
    if (admin && event.queryStringParameters?.tpaId) {
      // Admin can specify which TPA to view
      tpaId = event.queryStringParameters.tpaId;
    } else {
      // Regular user gets their own TPA
      try {
        tpaId = await getTpaIdFromToken(event);
      } catch (e) {
        console.error('Error getting TPA ID:', e);
        return formatResponse(401, { error: "Unauthorized - Unable to get TPA ID" }, event);
      }
    }
    
    console.log(`Getting users for TPA ID: ${tpaId}`);
    
    // Get the TPA configuration from S3
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3();
    
    // S3 bucket and key constants
    const CONFIG_BUCKET = 'kyndly-ichra-config-dev';
    const CONFIG_KEY = 'config.json';
    
    try {
      console.log(`Fetching config from s3://${CONFIG_BUCKET}/${CONFIG_KEY}`);
      
      // Get the config file from S3
      const configResponse = await s3.getObject({
        Bucket: CONFIG_BUCKET,
        Key: CONFIG_KEY
      }).promise();
      
      if (!configResponse || !configResponse.Body) {
        console.error('Empty response from S3');
        return formatResponse(500, { error: "Failed to retrieve configuration" }, event);
      }
      
      let configData;
      try {
        configData = JSON.parse(configResponse.Body.toString('utf-8'));
        console.log(`Config data retrieved successfully, structure: ${Object.keys(configData).join(', ')}`);
      } catch (parseError) {
        console.error('Error parsing config JSON:', parseError);
        return formatResponse(500, { error: "Invalid configuration format" }, event);
      }
      
      // Find the TPA in the config
      if (!configData.tpas || !Array.isArray(configData.tpas)) {
        console.warn('No TPAs found in config data');
        return formatResponse(200, { users: [] }, event);
      }
      
      const tpa = configData.tpas.find(t => t.id === tpaId);
      if (!tpa) {
        console.warn(`TPA with ID ${tpaId} not found in config`);
        return formatResponse(404, { error: `TPA with ID ${tpaId} not found` }, event);
      }
      
      console.log(`Found TPA: ${tpa.id} (${tpa.name})`);
      console.log(`TPA has ${tpa.brokers?.length || 0} brokers`);
      
      // Create a list of users based on the brokers and employers in the TPA
      const users = [];
      
      // Add a default TPA admin user
      users.push({
        username: `admin_${tpa.id}`,
        email: `admin@${tpa.id}.com`,
        name: `${tpa.name} Admin`,
        role: 'tpa_admin',
        tpaId: tpa.id,
        tpaName: tpa.name,
        enabled: true,
        status: 'CONFIRMED'
      });
      
      // If there are brokers, create a user for each broker
      if (tpa.brokers && Array.isArray(tpa.brokers)) {
        for (const broker of tpa.brokers) {
          console.log(`Processing broker: ${broker.id} (${broker.name})`);
          console.log(`Broker has ${broker.employers?.length || 0} employers`);
          
          // Create a user for the broker
          users.push({
            username: `broker_${broker.id}`,
            email: `${broker.id}@example.com`,
            name: broker.name,
            role: 'broker',
            tpaId: tpa.id,
            tpaName: tpa.name,
            brokerId: broker.id,
            brokerName: broker.name,
            enabled: true,
            status: 'CONFIRMED'
          });
          
          // If the broker has employers, create a user for each employer
          if (broker.employers && Array.isArray(broker.employers)) {
            for (const employer of broker.employers) {
              console.log(`Processing employer: ${employer.id} (${employer.name})`);
              
              users.push({
                username: `employer_${employer.id}`,
                email: `${employer.id}@example.com`,
                name: employer.name,
                role: 'employer',
                tpaId: tpa.id,
                tpaName: tpa.name,
                brokerId: broker.id,
                brokerName: broker.name,
                employerId: employer.id,
                employerName: employer.name,
                enabled: true,
                status: 'CONFIRMED'
              });
            }
          }
        }
      }
      
      console.log(`Found ${users.length} users for TPA ${tpaId}`);
      return formatResponse(200, { users }, event);
    } catch (s3Error) {
      console.error('Error accessing S3:', s3Error);
      return formatResponse(500, { error: `Error accessing configuration: ${s3Error.message}` }, event);
    }
  } catch (error) {
    console.error('Error in getUsers:', error);
    return formatResponse(500, { error: `Error getting users: ${error.message}` }, event);
  }
};

// Main handler function
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return formatResponse(200, {}, event);
  }
  
  const path = event.path;
  const method = event.httpMethod;
  
  try {
    // Parse the path to handle parameters in the URL
    const pathParts = path.split('/').filter(p => p);
    console.log('Path parts:', pathParts);
    
    // Route the request to the appropriate handler
    if (path === '/api/tpas' && method === 'GET') {
      return await getAllTpas(event);
    } else if (path === '/api/tpa' && method === 'GET') {
      return await getCurrentTpa(event);
    } else if (path.startsWith('/api/tpa/') && method === 'GET') {
      // Handle tpaId in the path
      event.queryStringParameters = event.queryStringParameters || {};
      event.queryStringParameters.tpaId = pathParts[2];
      return await getCurrentTpa(event);
    } else if (path === '/api/users' && method === 'GET') {
      return await getUsers(event);
    } else if (path === '/api/brokers' && method === 'POST') {
      return await updateBroker(event);
    } else if (path === '/api/employers' && method === 'POST') {
      return await updateEmployer(event);
    } else if (path.match(/^\/api\/brokers\/[\w-]+$/) && method === 'DELETE') {
      return await deleteBroker(event);
    } else if (path.match(/^\/api\/brokers\/[\w-]+\/employers\/[\w-]+$/) && method === 'DELETE') {
      return await deleteEmployer(event);
    }
    
    return formatResponse(404, { error: 'Route not found' }, event);
  } catch (error) {
    console.error('Error processing request:', error);
    return formatResponse(500, { error: 'Internal server error' }, event);
  }
}; 