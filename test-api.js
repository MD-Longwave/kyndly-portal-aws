// Test script for the quotes API with detailed debugging

const API_KEY = 'EOpsK0PFHivt1qB5pbGH1GHRPKzFeG27ooU4KX8f';
const API_URL = 'https://3ein5nfb8k.execute-api.us-east-2.amazonaws.com/prod';

// You would need to replace this with a valid JWT token from your application
// Get this by copying from browser's network tab during a real request
const JWT_TOKEN = 'YOUR_ACTUAL_JWT_TOKEN_HERE';

async function testAPI() {
  console.log('Testing API endpoints...');
  
  // Test request with all headers
  const headersWithAuth = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'x-api-key': API_KEY
  };
  
  // Test request with only API key
  const headersApiKeyOnly = {
    'x-api-key': API_KEY
  };
  
  // Tests to run
  const tests = [
    { name: 'GET /api/quotes with all headers', url: `${API_URL}/api/quotes`, headers: headersWithAuth },
    { name: 'GET /api/quotes with API key only', url: `${API_URL}/api/quotes`, headers: headersApiKeyOnly },
    { name: 'GET /quotes with all headers', url: `${API_URL}/quotes`, headers: headersWithAuth },
    { name: 'GET /quotes with API key only', url: `${API_URL}/quotes`, headers: headersApiKeyOnly },
    { name: 'OPTIONS /api/quotes', url: `${API_URL}/api/quotes`, method: 'OPTIONS', headers: headersWithAuth }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\nRunning test: ${test.name}`);
      console.log(`Request URL: ${test.url}`);
      console.log('Request headers:', test.headers);
      
      const response = await fetch(test.url, { 
        method: test.method || 'GET',
        headers: test.headers
      });
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (response.status !== 204) { // If not NO CONTENT
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          console.log('Response body (JSON):', json);
        } catch {
          console.log('Response body (text):', text);
        }
      }
    } catch (error) {
      console.error(`Error in test ${test.name}:`, error);
    }
  }
}

// Run the tests
testAPI().catch(err => console.error('Test failed:', err));

/*
How to run this script:
1. In Node.js: First install fetch if needed with "npm install node-fetch", then run with "node test-api.js"
2. In browser console: Copy and paste this code into browser's developer console and replace JWT_TOKEN
*/ 