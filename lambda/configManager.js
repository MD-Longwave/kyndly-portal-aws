const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const CONFIG_BUCKET = process.env.CONFIG_BUCKET || 'kyndly-ichra-config';
const CONFIG_KEY = 'kyndly-config.json';

// Get the configuration from S3
exports.getConfig = async () => {
  try {
    const params = {
      Bucket: CONFIG_BUCKET,
      Key: CONFIG_KEY,
      // Add RequestPayer parameter to ensure we get the latest version and not a cached copy
      RequestPayer: 'requester'
    };

    // Add a cache-busting header 
    const timestamp = new Date().getTime();
    const data = await s3.getObject(params, { 
      responseHeaders: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'x-timestamp': timestamp.toString()
      }
    }).promise();
    
    console.log(`Retrieved configuration file at timestamp: ${timestamp}`);
    return JSON.parse(data.Body.toString());
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      // If the file doesn't exist, create a default one
      const defaultConfig = {
        tpas: []
      };
      await exports.saveConfig(defaultConfig);
      return defaultConfig;
    }
    throw error;
  }
};

// Save the configuration to S3
exports.saveConfig = async (config) => {
  const params = {
    Bucket: CONFIG_BUCKET,
    Key: CONFIG_KEY,
    Body: JSON.stringify(config, null, 2),
    ContentType: 'application/json'
  };

  await s3.putObject(params).promise();
  return config;
};

// Get TPA by ID
exports.getTpaById = async (tpaId) => {
  const config = await exports.getConfig();
  return config.tpas.find(tpa => tpa.id === tpaId);
};

// Add or update a TPA
exports.updateTpa = async (tpaData) => {
  const config = await exports.getConfig();
  const tpaIndex = config.tpas.findIndex(tpa => tpa.id === tpaData.id);
  
  if (tpaIndex >= 0) {
    config.tpas[tpaIndex] = { 
      ...config.tpas[tpaIndex], 
      ...tpaData,
      // Keep the existing brokers if not provided
      brokers: tpaData.brokers || config.tpas[tpaIndex].brokers
    };
  } else {
    // New TPA
    config.tpas.push({
      ...tpaData,
      brokers: tpaData.brokers || []
    });
  }
  
  return await exports.saveConfig(config);
};

// Add or update a broker for a TPA
exports.updateBroker = async (tpaId, brokerData) => {
  const config = await exports.getConfig();
  const tpaIndex = config.tpas.findIndex(tpa => tpa.id === tpaId);
  
  if (tpaIndex < 0) {
    throw new Error(`TPA with ID ${tpaId} not found`);
  }
  
  const brokerIndex = config.tpas[tpaIndex].brokers.findIndex(broker => broker.id === brokerData.id);
  
  if (brokerIndex >= 0) {
    config.tpas[tpaIndex].brokers[brokerIndex] = {
      ...config.tpas[tpaIndex].brokers[brokerIndex],
      ...brokerData,
      // Keep the existing employers if not provided
      employers: brokerData.employers || config.tpas[tpaIndex].brokers[brokerIndex].employers
    };
  } else {
    // New broker
    config.tpas[tpaIndex].brokers.push({
      ...brokerData,
      employers: brokerData.employers || []
    });
  }
  
  return await exports.saveConfig(config);
};

// Add or update an employer for a broker
exports.updateEmployer = async (tpaId, brokerId, employerData) => {
  const config = await exports.getConfig();
  const tpaIndex = config.tpas.findIndex(tpa => tpa.id === tpaId);
  
  if (tpaIndex < 0) {
    throw new Error(`TPA with ID ${tpaId} not found`);
  }
  
  const brokerIndex = config.tpas[tpaIndex].brokers.findIndex(broker => broker.id === brokerId);
  
  if (brokerIndex < 0) {
    throw new Error(`Broker with ID ${brokerId} not found for TPA ${tpaId}`);
  }
  
  const employerIndex = config.tpas[tpaIndex].brokers[brokerIndex].employers.findIndex(
    employer => employer.id === employerData.id
  );
  
  if (employerIndex >= 0) {
    config.tpas[tpaIndex].brokers[brokerIndex].employers[employerIndex] = {
      ...config.tpas[tpaIndex].brokers[brokerIndex].employers[employerIndex],
      ...employerData
    };
  } else {
    // New employer
    config.tpas[tpaIndex].brokers[brokerIndex].employers.push(employerData);
  }
  
  return await exports.saveConfig(config);
};

// Delete a broker
exports.deleteBroker = async (tpaId, brokerId) => {
  const config = await exports.getConfig();
  const tpaIndex = config.tpas.findIndex(tpa => tpa.id === tpaId);
  
  if (tpaIndex < 0) {
    throw new Error(`TPA with ID ${tpaId} not found`);
  }
  
  config.tpas[tpaIndex].brokers = config.tpas[tpaIndex].brokers.filter(
    broker => broker.id !== brokerId
  );
  
  return await exports.saveConfig(config);
};

// Delete an employer
exports.deleteEmployer = async (tpaId, brokerId, employerId) => {
  const config = await exports.getConfig();
  const tpaIndex = config.tpas.findIndex(tpa => tpa.id === tpaId);
  
  if (tpaIndex < 0) {
    throw new Error(`TPA with ID ${tpaId} not found`);
  }
  
  const brokerIndex = config.tpas[tpaIndex].brokers.findIndex(broker => broker.id === brokerId);
  
  if (brokerIndex < 0) {
    throw new Error(`Broker with ID ${brokerId} not found for TPA ${tpaId}`);
  }
  
  config.tpas[tpaIndex].brokers[brokerIndex].employers = 
    config.tpas[tpaIndex].brokers[brokerIndex].employers.filter(
      employer => employer.id !== employerId
    );
  
  return await exports.saveConfig(config);
}; 