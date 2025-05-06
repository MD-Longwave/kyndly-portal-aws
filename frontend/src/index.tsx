import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { cognitoConfig } from './config/cognito';

// Configure Amplify with the centralized configuration
Amplify.configure({
  // Use the aws-exports.js file as the base configuration
  ...awsconfig,
  
  // Override with environment-specific values if provided
  Auth: {
    region: cognitoConfig.REGION,
    userPoolId: cognitoConfig.USER_POOL_ID,
    userPoolWebClientId: cognitoConfig.APP_CLIENT_ID,
    identityPoolId: cognitoConfig.IDENTITY_POOL_ID,
    oauth: {
      domain: cognitoConfig.DOMAIN,
      scope: cognitoConfig.OAUTH.SCOPE,
      redirectSignIn: cognitoConfig.OAUTH.REDIRECT_SIGN_IN,
      redirectSignOut: cognitoConfig.OAUTH.REDIRECT_SIGN_OUT,
      responseType: cognitoConfig.OAUTH.RESPONSE_TYPE
    }
  }
});

// Check the environment - if this is an S3 hosted site, we need to use HashRouter
// for proper route handling on page refresh
const isS3Hosted = process.env.REACT_APP_USE_HASH_ROUTER === 'true';
const Router = isS3Hosted ? HashRouter : BrowserRouter;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 