import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getThemeStyles } from '../styles/theme';

// API URL - replace with your deployed API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://example.execute-api.us-east-2.amazonaws.com';

const AdminPanel = () => {
  const { user, route } = useAuthenticator((context) => [context.user, context.route]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tpa, setTpa] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [brokerDialogOpen, setBrokerDialogOpen] = useState(false);
  const [employerDialogOpen, setEmployerDialogOpen] = useState(false);
  const [newBroker, setNewBroker] = useState({ name: '' });
  const [newEmployer, setNewEmployer] = useState({ name: '', brokerId: '' });
  const [selectedBrokerId, setSelectedBrokerId] = useState('');

  // Check if user is in admin group
  useEffect(() => {
    const checkUserGroups = async () => {
      try {
        const userInfo = await Auth.currentAuthenticatedUser();
        const groups = userInfo.signInUserSession.accessToken.payload['cognito:groups'] || [];
        setIsAdmin(groups.includes('ADMIN'));
      } catch (err) {
        console.error('Error checking user groups:', err);
      }
    };
    
    if (route === 'authenticated') {
      checkUserGroups();
    }
  }, [route]);

  // Fetch TPA data
  useEffect(() => {
    const fetchTpa = async () => {
      if (route !== 'authenticated') return;
      
      try {
        setLoading(true);
        const token = (await Auth.currentSession()).getIdToken().getJwtToken();
        
        const response = await fetch(`${API_URL}/api/tpa`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setTpa(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching TPA data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTpa();
  }, [route]);

  // Handle adding a new broker
  const handleAddBroker = async () => {
    try {
      if (!newBroker.name.trim()) {
        setError('Broker name is required');
        return;
      }
      
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      
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
    } catch (err) {
      console.error('Error adding broker:', err);
      setError(err.message);
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
      
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      
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
    } catch (err) {
      console.error('Error adding employer:', err);
      setError(err.message);
    }
  };

  // Handle deleting a broker
  const handleDeleteBroker = async (brokerId) => {
    if (!confirm("Are you sure you want to delete this broker? This will also delete all associated employers.")) {
      return;
    }
    
    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      
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
    } catch (err) {
      console.error('Error deleting broker:', err);
      setError(err.message);
    }
  };

  // Handle deleting an employer
  const handleDeleteEmployer = async (brokerId, employerId) => {
    if (!confirm("Are you sure you want to delete this employer?")) {
      return;
    }
    
    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      
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
    } catch (err) {
      console.error('Error deleting employer:', err);
      setError(err.message);
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
            <span className="block sm:inline">Error: {error}</span>
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
        <div className="flex items-center justify-between">
          <h1 className={theme.typography.h1}>Admin Panel - {tpa.name}</h1>
        </div>
        
        {isAdmin && (
          <div className="text-blue-500 font-medium">
            You have admin access
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brokers Section */}
          <div className={theme.card}>
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
          
          {/* Employers Section */}
          <div className={theme.card}>
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
                        onClick={() => handleDeleteEmployer(employer.brokerId, employer.id)}
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
      </div>
    </div>
  );
};

export default AdminPanel; 