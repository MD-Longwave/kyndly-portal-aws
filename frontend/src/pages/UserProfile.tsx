import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { hasRole, isKyndlyTeam, isTpaAdmin } = usePermission();
  
  // If no user is logged in, show a message
  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 rounded-md p-4">
          <p className="text-yellow-800">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
            {user.username.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {user.roles.map(role => (
                <span 
                  key={role} 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    role === 'admin' ? 'bg-red-100 text-red-800' : 
                    role === 'kyndly_staff' ? 'bg-blue-100 text-blue-800' : 
                    role === 'tpa_admin' ? 'bg-purple-100 text-purple-800' : 
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {role.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Organization Information */}
      {user.organization && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium">Organization Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Organization Name</p>
                <p className="font-medium">{user.organization.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organization Type</p>
                <p className="font-medium capitalize">{user.organization.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{user.organization.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Role-specific information */}
      {isKyndlyTeam && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-4 bg-blue-50">
            <h3 className="text-lg font-medium">Kyndly Team Access</h3>
          </div>
          <div className="p-6">
            <p className="mb-4">As a Kyndly team member, you have access to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All employer accounts</li>
              <li>Quote management system</li>
              <li>Document repository</li>
              {hasRole(['admin']) && (
                <>
                  <li>User management</li>
                  <li>System settings</li>
                </>
              )}
              <li>Reporting dashboard</li>
            </ul>
          </div>
        </div>
      )}
      
      {!isKyndlyTeam && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200 px-6 py-4 bg-purple-50">
            <h3 className="text-lg font-medium">TPA Access</h3>
          </div>
          <div className="p-6">
            <p className="mb-4">As a TPA user, you have access to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your assigned employer accounts</li>
              <li>Quote creation and management</li>
              <li>Document uploads and downloads</li>
              {isTpaAdmin && (
                <>
                  <li>TPA team management</li>
                  <li>Organization settings</li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
      
      {/* Permissions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium">My Permissions</h3>
        </div>
        <div className="p-6">
          {user.permissions && user.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.permissions.map(permission => (
                <span 
                  key={permission} 
                  className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium"
                >
                  {permission}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No specific permissions assigned.</p>
          )}
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> In development mode, user data may be simulated.
            In production, this information will come directly from AWS Cognito.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 