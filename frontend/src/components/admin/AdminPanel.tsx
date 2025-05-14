import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getThemeStyles } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

// API URL configuration - using specific API Gateway URL from AWS console
const API_URL = process.env.REACT_APP_API_URL || 'https://3ein5nfb8k.execute-api.us-east-2.amazonaws.com/dev';

interface Employer {
  id: string;
  name: string;
  brokerName?: string;
  brokerId?: string;
}

interface Broker {
  id: string;
  name: string;
  employers?: Employer[];
}

interface TPA {
  id: string;
  name: string;
  brokers?: Broker[];
}

// New interfaces for user management
interface User {
  username: string;
  email: string;
  name: string;
  role: string;
  tpaId?: string;
  brokerId?: string;
  employerId?: string;
}

interface NewUser {
  username: string;
  email: string;
  name: string;
  role: string;
  brokerId?: string;
  tpaId?: string;
  tempPassword: string;
}

const AdminPanel: React.FC = () => {
  const { user, getIdToken } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tpa, setTpa] = useState<TPA | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [brokerDialogOpen, setBrokerDialogOpen] = useState(false);
  const [employerDialogOpen, setEmployerDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [newBroker, setNewBroker] = useState({ name: '' });
  const [newEmployer, setNewEmployer] = useState({ name: '', brokerId: '' });
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  
  // New state for user management
  const [activeTab, setActiveTab] = useState('brokers');
  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    email: '',
    name: '',
    role: 'broker',
    brokerId: '',
    tempPassword: ''
  });
  // Add state for the list of users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Check if user is in admin group
  useEffect(() => {
    // Set admin status based on user role
    if (user) {
      setIsAdmin(user.role === 'admin' || user.role === 'tpa_admin' || user.role === 'tpa_user');
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch TPA data
  useEffect(() => {
    const fetchTpa = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        if (!API_URL) {
          setError("API URL not configured. Please check your environment variables.");
          setLoading(false);
          return;
        }
        
        const token = await getIdToken();
        if (!token) {
          throw new Error("Authentication token not available");
        }
        
        console.log(`Connecting to API: ${API_URL}`);
        
        try {
          const response = await fetch(`${API_URL}/api/tpa`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log("TPA data:", data);  // Log the data for debugging
          setTpa(data);
          setError(null);
        } catch (fetchError: any) {
          if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('Network request failed')) {
            console.error('API connection error:', fetchError);
            setError(`Could not connect to API at ${API_URL}. The API might not be running or might be deployed to a different endpoint.`);
          } else {
            console.error('API error:', fetchError);
            setError(fetchError.message || "Failed to fetch TPA data");
          }
        }
      } catch (err: any) {
        console.error('Error in TPA data fetch process:', err);
        setError(err.message || "Failed to fetch TPA data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTpa();
  }, [user, getIdToken]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        setLoadingUsers(true);
        
        if (!API_URL) {
          setError("API URL not configured. Please check your environment variables.");
          setLoadingUsers(false);
          return;
        }
        
        const token = await getIdToken();
        if (!token) {
          throw new Error("Authentication token not available");
        }
        
        const response = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Users data:", data);
        setUsers(data.users || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [user, getIdToken]);

  // Handle adding a new broker
  const handleAddBroker = async () => {
    try {
      if (!newBroker.name.trim()) {
        setError('Broker name is required');
        return;
      }
      
      if (!API_URL) {
        setError("API URL not configured");
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      const response = await fetch(`${API_URL}/api/brokers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newBroker)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Refresh TPA data
      const tpaResponse = await fetch(`${API_URL}/api/tpa`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!tpaResponse.ok) {
        throw new Error(`API error: ${tpaResponse.status}`);
      }
      
      const tpaData = await tpaResponse.json();
      setTpa(tpaData);
      setNewBroker({ name: '' });
      setBrokerDialogOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding broker:', err);
      setError(err.message || "Failed to add broker");
    }
  };

  // Handle adding a new employer
  const handleAddEmployer = async () => {
    try {
      if (!newEmployer.name.trim()) {
        setError('Employer name is required');
        return;
      }
      
      if (!newEmployer.brokerId) {
        setError('Please select a broker');
        return;
      }
      
      if (!API_URL) {
        setError("API URL not configured");
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      const response = await fetch(`${API_URL}/api/employers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newEmployer)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Refresh TPA data
      const tpaResponse = await fetch(`${API_URL}/api/tpa`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!tpaResponse.ok) {
        throw new Error(`API error: ${tpaResponse.status}`);
      }
      
      const tpaData = await tpaResponse.json();
      setTpa(tpaData);
      setNewEmployer({ name: '', brokerId: '' });
      setEmployerDialogOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Error adding employer:', err);
      setError(err.message || "Failed to add employer");
    }
  };

  // Handle adding a new user
  const handleAddUser = async () => {
    try {
      // Validate form fields
      if (!newUser.username.trim()) {
        setError('Username is required');
        return;
      }
      
      if (!newUser.email.trim()) {
        setError('Email is required');
        return;
      }
      
      if (!newUser.name.trim()) {
        setError('Name is required');
        return;
      }
      
      if (!newUser.tempPassword.trim()) {
        setError('Temporary password is required');
        return;
      }
      
      // Employer users require a broker ID
      if (newUser.role === 'employer' && !newUser.brokerId) {
        setError('Please select a broker for employer users');
        return;
      }
      
      if (!API_URL) {
        setError("API URL not configured");
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      // Create user request
      const userData = {
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tempPassword: newUser.tempPassword
      };
      
      // Add broker ID for employer users
      if (newUser.role === 'employer' && newUser.brokerId) {
        (userData as any).brokerId = newUser.brokerId;
      }
      
      // For admin users, allow specifying a TPA ID
      if (user?.role === 'admin' && newUser.tpaId) {
        (userData as any).tpaId = newUser.tpaId;
      }
      
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('User created:', result);
      
      // Reset form
      setNewUser({
        username: '',
        email: '',
        name: '',
        role: 'broker',
        brokerId: '',
        tempPassword: ''
      });
      
      setUserDialogOpen(false);
      setError(null);

      // Refresh users list
      const usersResponse = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
      
      // Show success message
      alert(`User ${result.user.username} created successfully`);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || "Failed to create user");
    }
  };

  // Handle deleting a broker
  const handleDeleteBroker = async (brokerId: string) => {
    if (!window.confirm("Are you sure you want to delete this broker? This will also delete all associated employers.")) {
      return;
    }
    
    try {
      if (!API_URL) {
        setError("API URL not configured");
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      const response = await fetch(`${API_URL}/api/brokers/${brokerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Refresh TPA data
      const tpaResponse = await fetch(`${API_URL}/api/tpa`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!tpaResponse.ok) {
        throw new Error(`API error: ${tpaResponse.status}`);
      }
      
      const tpaData = await tpaResponse.json();
      setTpa(tpaData);
      setError(null);
    } catch (err: any) {
      console.error('Error deleting broker:', err);
      setError(err.message || "Failed to delete broker");
    }
  };

  // Handle deleting an employer
  const handleDeleteEmployer = async (brokerId: string, employerId: string) => {
    if (!window.confirm("Are you sure you want to delete this employer?")) {
      return;
    }
    
    try {
      if (!API_URL) {
        setError("API URL not configured");
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      const response = await fetch(`${API_URL}/api/brokers/${brokerId}/employers/${employerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Refresh TPA data
      const tpaResponse = await fetch(`${API_URL}/api/tpa`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!tpaResponse.ok) {
        throw new Error(`API error: ${tpaResponse.status}`);
      }
      
      const tpaData = await tpaResponse.json();
      setTpa(tpaData);
      setError(null);
    } catch (err: any) {
      console.error('Error deleting employer:', err);
      setError(err.message || "Failed to delete employer");
    }
  };

  // Render user list for the Users tab
  const renderUsers = () => {
    if (loadingUsers) {
      return (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center p-6">
          <p className="text-gray-500">No users found. Click the button below to add a user.</p>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3">
        {users.map((userItem) => (
          <div 
            key={userItem.username}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div>
              <span className="font-medium">{userItem.name}</span>
              <div className="text-xs">
                <span className="text-gray-500">Email: {userItem.email}</span>
                <span className="text-blue-500 ml-2">
                  Role: {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                </span>
                {userItem.brokerId && tpa?.brokers && (
                  <span className="text-green-500 ml-2">
                    Broker: {tpa.brokers.find(b => b.id === userItem.brokerId)?.name || 'Unknown'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={theme.layout.container}>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={theme.layout.container}>
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <div className="flex">
              <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg></div>
              <div>
                <p className="font-bold">API Connection Error</p>
                <p className="text-sm">{error}</p>
                <div className="mt-3">
                  <p className="text-sm font-medium">Troubleshooting steps:</p>
                  <ul className="list-disc list-inside text-sm mt-1">
                    <li>Check that the backend API is running</li>
                    <li>Verify environment variables are correctly set</li>
                    <li>Current API URL: {API_URL || 'Not configured'}</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tpa) {
    return (
      <div className={theme.layout.container}>
        <div className="max-w-6xl mx-auto p-4">
          <p className={theme.typography.body}>No TPA data found</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`container mx-auto p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
    >
      <h1 className="text-2xl font-bold mb-6">Administration Panel</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {!isAdmin ? (
        <div className="text-center py-8">
          <h3 className="text-xl mb-2">Access Denied</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You do not have administrative permissions to view this page.</p>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <div className="loader"></div>
            </div>
          ) : (
            <div>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  onClick={() => setActiveTab('brokers')}
                  className={`py-2 px-4 ${
                    activeTab === 'brokers'
                      ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    Brokers & Employers
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-4 ${
                    activeTab === 'users'
                      ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    Users
                  </div>
                </button>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'brokers' && (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    {tpa && tpa.brokers && tpa.brokers.map((broker) => (
                      <div key={broker.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                              <BuildingOfficeIcon className="w-5 h-5 text-blue-500 dark:text-blue-300" />
                            </div>
                            <div>
                              <h3 className="font-medium">{broker.name}</h3>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {broker.employers?.length || 0} employers
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <button 
                              onClick={() => {
                                setSelectedBrokerId(broker.id);
                                setEmployerDialogOpen(true);
                                setNewEmployer(prev => ({...prev, brokerId: broker.id}));
                              }}
                              className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 mr-2"
                            >
                              <PlusIcon className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBroker(broker.id)}
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {broker.employers && broker.employers.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-gray-700">
                            {broker.employers.map((employer) => (
                              <div 
                                key={employer.id} 
                                className="p-3 pl-12 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 last:border-b-0"
                              >
                                <div className="flex items-center">
                                  <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                                  <span>{employer.name}</span>
                                </div>
                                <button 
                                  onClick={() => handleDeleteEmployer(broker.id, employer.id)}
                                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setBrokerDialogOpen(true)}
                      className="flex items-center justify-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      <PlusIcon className="w-5 h-5 mr-1" />
                      Add Broker
                    </button>
                  </div>
                </>
              )}
              
              {activeTab === 'users' && (
                <>
                  {renderUsers()}
                  
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setUserDialogOpen(true)}
                      className="flex items-center justify-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                    >
                      <PlusIcon className="w-5 h-5 mr-1" />
                      Add User
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AdminPanel; 