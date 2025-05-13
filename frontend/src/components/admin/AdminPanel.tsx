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
    <div className={theme.layout.container}>
      <div className="max-w-6xl mx-auto space-y-8 p-4">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`py-2 px-4 ${activeTab === 'brokers' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('brokers')}
          >
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-5 w-5" />
              <span>Brokers</span>
            </div>
          </button>
          
          <button
            className={`py-2 px-4 ${activeTab === 'employers' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('employers')}
          >
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5" />
              <span>Employers</span>
            </div>
          </button>
          
          <button
            className={`py-2 px-4 ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Users</span>
            </div>
          </button>
        </div>
        
        {/* Main content based on active tab */}
        {activeTab === 'brokers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brokers Section */}
            <div id="brokers" className={theme.card}>
              <div className="flex items-center justify-between mb-6 p-4">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
                  <h2 className={theme.typography.h2}>Brokers</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBrokerDialogOpen(true)}
                  className={`${theme.button.primary} flex items-center space-x-2 px-3 py-1`}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Broker</span>
                </motion.button>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              
              <div className="p-4 space-y-3">
                {tpa.brokers && tpa.brokers.length > 0 ? (
                  tpa.brokers.map((broker) => (
                    <div key={broker.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <span className="font-medium">{broker.name}</span>
                        <span className="text-xs text-gray-500 ml-2">ID: {broker.id}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBroker(broker.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No brokers found</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'employers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Employers Section */}
            <div id="employers" className={theme.card}>
              <div className="flex items-center justify-between mb-6 p-4">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="h-6 w-6 text-blue-500" />
                  <h2 className={theme.typography.h2}>Employers</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEmployerDialogOpen(true)}
                  className={`${theme.button.primary} flex items-center space-x-2 px-3 py-1`}
                  disabled={!tpa.brokers || tpa.brokers.length === 0}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Employer</span>
                </motion.button>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              
              <div className="p-4">
                <div className="mb-4">
                  <label className={`${theme.typography.label} block mb-2`}>Filter by Broker</label>
                  <select
                    value={selectedBrokerId}
                    onChange={(e) => setSelectedBrokerId(e.target.value)}
                    className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  >
                    <option value="">All Brokers</option>
                    {tpa.brokers && tpa.brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>
                        {broker.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-3">
                  {tpa.brokers && tpa.brokers
                    .filter(broker => !selectedBrokerId || broker.id === selectedBrokerId)
                    .flatMap(broker => 
                      (broker.employers || []).map(employer => ({
                        ...employer,
                        brokerName: broker.name,
                        brokerId: broker.id
                      }))
                    )
                    .map((employer) => (
                      <div key={employer.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <span className="font-medium">{employer.name}</span>
                          <div className="text-xs">
                            <span className="text-gray-500">ID: {employer.id}</span>
                            <span className="text-blue-500 ml-2">Broker: {employer.brokerName}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEmployer(employer.brokerId!, employer.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  
                  {(!tpa.brokers || tpa.brokers.length === 0 || 
                     !tpa.brokers.some(broker => broker.employers && broker.employers.length > 0) ||
                     (selectedBrokerId && !tpa.brokers.find(b => b.id === selectedBrokerId)?.employers?.length)) && (
                    <div className="text-gray-500 italic">No employers found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Users Section */}
            <div id="users" className={theme.card}>
              <div className="flex items-center justify-between mb-6 p-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-6 w-6 text-blue-500" />
                  <h2 className={theme.typography.h2}>Users</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserDialogOpen(true)}
                  className={`${theme.button.primary} flex items-center space-x-2 px-3 py-1`}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add User</span>
                </motion.button>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              
              <div className="p-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">User Management</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Create broker and employer users with appropriate access levels. Broker users can manage employer accounts,
                    while employer users can submit quotes and view their specific data.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Click "Add User" to create a new broker or employer user account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Broker Dialog */}
        {brokerDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.card} max-w-md w-full p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={theme.typography.h3}>Add New Broker</h3>
                <button 
                  onClick={() => setBrokerDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>Broker Name</label>
                <input
                  type="text"
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  placeholder="Enter broker name"
                  value={newBroker.name}
                  onChange={(e) => setNewBroker({ ...newBroker, name: e.target.value })}
                />
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBrokerDialogOpen(false)}
                  className={`${theme.button.secondary} flex-1 py-2`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddBroker}
                  className={`${theme.button.primary} flex-1 py-2`}
                >
                  Add
                </motion.button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Employer Dialog */}
        {employerDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.card} max-w-md w-full p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={theme.typography.h3}>Add New Employer</h3>
                <button 
                  onClick={() => setEmployerDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>Employer Name</label>
                <input
                  type="text"
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  placeholder="Enter employer name"
                  value={newEmployer.name}
                  onChange={(e) => setNewEmployer({ ...newEmployer, name: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>Select Broker</label>
                <select
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  value={newEmployer.brokerId}
                  onChange={(e) => setNewEmployer({ ...newEmployer, brokerId: e.target.value })}
                >
                  <option value="">Select a Broker</option>
                  {tpa.brokers && tpa.brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEmployerDialogOpen(false)}
                  className={`${theme.button.secondary} flex-1 py-2`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddEmployer}
                  className={`${theme.button.primary} flex-1 py-2`}
                >
                  Add
                </motion.button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add User Dialog */}
        {userDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.card} max-w-md w-full p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={theme.typography.h3}>Add New User</h3>
                <button 
                  onClick={() => setUserDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>Username</label>
                <input
                  type="text"
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  placeholder="Enter username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>Email</label>
                <input
                  type="email"
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>Name</label>
                <input
                  type="text"
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>User Role</label>
                <select
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="broker">Broker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
              
              {/* Show broker selection only for employer users */}
              {newUser.role === 'employer' && (
                <div className="mb-4">
                  <label className={`${theme.typography.label} block mb-2`}>Select Broker</label>
                  <select
                    className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                    value={newUser.brokerId || ''}
                    onChange={(e) => setNewUser({ ...newUser, brokerId: e.target.value })}
                  >
                    <option value="">Select a Broker</option>
                    {tpa.brokers && tpa.brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>
                        {broker.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className={`${theme.typography.label} block mb-2`}>Temporary Password</label>
                <input
                  type="password"
                  className={`w-full ${theme.input} py-2 px-3 rounded-lg`}
                  placeholder="Temporary password"
                  value={newUser.tempPassword}
                  onChange={(e) => setNewUser({ ...newUser, tempPassword: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserDialogOpen(false)}
                  className={`${theme.button.secondary} flex-1 py-2`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddUser}
                  className={`${theme.button.primary} flex-1 py-2`}
                >
                  Add User
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 