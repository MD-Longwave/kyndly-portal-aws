// AWS Cognito Configuration
export const cognitoConfig = {
  // Cognito User Pool Region
  REGION: process.env.REACT_APP_AWS_REGION || 'us-east-2',
  
  // Cognito User Pool ID
  USER_POOL_ID: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'us-east-2_WVTGKPX0l',
  
  // Cognito App Client ID
  APP_CLIENT_ID: process.env.REACT_APP_COGNITO_APP_CLIENT_ID || '53ua5mcufomh760j8ptp6af0qq',
  
  // Cognito Identity Pool ID
  IDENTITY_POOL_ID: process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID || 'us-east-2:3adb832a-4b01-46e2-a8d3-71857f413d74',
  
  // Cognito Domain
  DOMAIN: process.env.REACT_APP_COGNITO_DOMAIN || 'kyndly-ichra-portal.auth.us-east-2.amazoncognito.com',
  
  // OAuth Configuration
  OAUTH: {
    // OAuth Scopes
    SCOPE: ['email', 'openid', 'profile'],
    
    // Redirect URLs
    REDIRECT_SIGN_IN: process.env.REACT_APP_REDIRECT_SIGN_IN || 'http://localhost:3000/',
    REDIRECT_SIGN_OUT: process.env.REACT_APP_REDIRECT_SIGN_OUT || 'http://localhost:3000/',
    
    // Response Type
    RESPONSE_TYPE: 'code'
  }
};

// Role Definitions
export const ROLES = {
  // Administrator role with full system access
  ADMIN: 'admin',
  
  // Kyndly staff role for internal team members
  KYNDLY_STAFF: 'kyndly_staff',
  
  // TPA (Third-Party Administrator) admin role
  TPA_ADMIN: 'tpa_admin',
  
  // TPA regular user role
  TPA_USER: 'tpa_user'
};

// Permission Definitions
export const PERMISSIONS = {
  // Employer permissions
  EMPLOYERS: {
    READ: 'read:employers',
    WRITE: 'write:employers',
    DELETE: 'delete:employers'
  },
  
  // Quote permissions
  QUOTES: {
    READ: 'read:quotes',
    WRITE: 'write:quotes',
    DELETE: 'delete:quotes'
  },
  
  // Document permissions
  DOCUMENTS: {
    READ: 'read:documents',
    WRITE: 'write:documents',
    DELETE: 'delete:documents'
  },
  
  // User management permissions
  USERS: {
    READ: 'read:users',
    WRITE: 'write:users',
    DELETE: 'delete:users'
  },
  
  // System settings permissions
  SETTINGS: {
    READ: 'read:settings',
    WRITE: 'write:settings'
  }
};

// Role to Permission Mapping
export const ROLE_PERMISSIONS = {
  // Admin has all permissions
  [ROLES.ADMIN]: Object.values(PERMISSIONS).flatMap(permGroup => Object.values(permGroup)),
  
  // Kyndly staff has most permissions except user management and settings
  [ROLES.KYNDLY_STAFF]: [
    ...Object.values(PERMISSIONS.EMPLOYERS),
    ...Object.values(PERMISSIONS.QUOTES),
    ...Object.values(PERMISSIONS.DOCUMENTS),
    PERMISSIONS.USERS.READ
  ],
  
  // TPA admin has TPA-specific permissions plus user management for their org
  [ROLES.TPA_ADMIN]: [
    PERMISSIONS.EMPLOYERS.READ,
    PERMISSIONS.EMPLOYERS.WRITE,
    ...Object.values(PERMISSIONS.QUOTES),
    ...Object.values(PERMISSIONS.DOCUMENTS),
    PERMISSIONS.USERS.READ,
    PERMISSIONS.USERS.WRITE
  ],
  
  // TPA user has basic read/write permissions but no user management
  [ROLES.TPA_USER]: [
    PERMISSIONS.EMPLOYERS.READ,
    PERMISSIONS.QUOTES.READ,
    PERMISSIONS.QUOTES.WRITE,
    PERMISSIONS.DOCUMENTS.READ,
    PERMISSIONS.DOCUMENTS.WRITE
  ]
}; 