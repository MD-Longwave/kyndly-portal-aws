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
  status?: string;
  enabled?: boolean;
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

// Add props interface
interface AdminPanelProps {
  initialActiveTab?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialActiveTab = 'brokers' }) => {
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
  const [activeTab, setActiveTab] = useState(initialActiveTab);
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
  const [userCreated, setUserCreated] = useState(false);

  // Add these new state variables after the existing useState declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrokerId, setFilterBrokerId] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Add effect to update activeTab when initialActiveTab changes
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

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
        
        console.log(`AdminPanel: Connecting to API: ${API_URL}`);
        
        try {
          console.log(`AdminPanel: Fetching TPA data from ${API_URL}/api/tpa`);
          const response = await fetch(`${API_URL}/api/tpa`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log("AdminPanel: TPA data received:", data);
          
          // Debug log to check brokers
          if (data && data.brokers) {
            console.log(`AdminPanel: Found ${data.brokers.length} brokers in TPA data`);
            data.brokers.forEach((broker: any, index: number) => {
              console.log(`AdminPanel: Broker ${index + 1}:`, broker);
              if (broker.employers) {
                console.log(`AdminPanel: Broker ${index + 1} has ${broker.employers.length} employers`);
              } else {
                console.log(`AdminPanel: Broker ${index + 1} has no employers`);
              }
            });
          } else {
            console.warn("AdminPanel: No brokers found in TPA data:", data);
          }
          
          setTpa(data);
          setError(null);
        } catch (fetchError: any) {
          if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('Network request failed')) {
            console.error('AdminPanel: API connection error:', fetchError);
            setError(`Could not connect to API at ${API_URL}. The API might not be running or might be deployed to a different endpoint.`);
          } else {
            console.error('AdminPanel: API error:', fetchError);
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
        
        console.log('AdminPanel: Fetching users...');
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
        console.log(`AdminPanel: Fetched ${data.users?.length || 0} users`);
        setUsers(data.users || []);
        setError(null);

        // Reset the userCreated flag
        if (userCreated) {
          setUserCreated(false);
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [user, getIdToken, userCreated]); // Add userCreated as a dependency

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
      
      console.log('AdminPanel: Creating new broker with name:', newBroker.name);
      
      // Add loading state
      setError('Creating broker...');
      
      const response = await fetch(`${API_URL}/api/brokers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newBroker)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('AdminPanel: Broker created successfully:', result);
      
      // Send welcome email
      try {
        const emailResponse = await fetch(`${API_URL}/api/email/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientType: 'broker',
            name: newBroker.name,
            recipientId: result.brokerId,
            email: result.email || '' // If email is available
          })
        });
        
        if (emailResponse.ok) {
          console.log('AdminPanel: Welcome email sent to new broker');
        } else {
          console.warn('AdminPanel: Failed to send welcome email to broker');
        }
      } catch (emailError) {
        console.error('AdminPanel: Error sending welcome email:', emailError);
      }
      
      // Refresh TPA data with cache-busting query parameter
      const timestamp = new Date().getTime();
      const tpaResponse = await fetch(`${API_URL}/api/tpa?_t=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!tpaResponse.ok) {
        throw new Error(`API error: ${tpaResponse.status}`);
      }
      
      const tpaData = await tpaResponse.json();
      console.log('AdminPanel: Updated TPA data after broker creation:', tpaData);
      
      // Verify that the new broker exists in the updated data
      const brokerExists = tpaData?.brokers?.some((b: Broker) => b.id === result.brokerId);
      if (!brokerExists) {
        console.warn('AdminPanel: Newly created broker not found in TPA data, might be a caching issue');
      }
      
      setTpa(tpaData);
      setNewBroker({ name: '' });
      setBrokerDialogOpen(false);
      setError(null);
      
      // Show success message
      alert(`Broker "${newBroker.name}" created successfully!`);
      
    } catch (err: any) {
      console.error('AdminPanel: Error adding broker:', err);
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
      
      console.log('AdminPanel: Creating new employer with name:', newEmployer.name);
      
      // Add loading state
      setError('Creating employer...');
      
      const response = await fetch(`${API_URL}/api/employers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newEmployer)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('AdminPanel: Employer created successfully:', result);
      
      // Send welcome email to employer
      try {
        // Find broker name for the email
        let brokerName = '';
        if (tpa && tpa.brokers) {
          const broker = tpa.brokers.find(b => b.id === newEmployer.brokerId);
          if (broker) brokerName = broker.name;
        }
        
        const emailResponse = await fetch(`${API_URL}/api/email/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientType: 'employer',
            name: newEmployer.name,
            recipientId: result.employerId,
            brokerName: brokerName,
            brokerId: newEmployer.brokerId,
            email: result.email || '' // If email is available
          })
        });
        
        if (emailResponse.ok) {
          console.log('AdminPanel: Welcome email sent to new employer');
        } else {
          console.warn('AdminPanel: Failed to send welcome email to employer');
        }
      } catch (emailError) {
        console.error('AdminPanel: Error sending welcome email:', emailError);
      }
      
      // Refresh TPA data with cache-busting query parameter
      const timestamp = new Date().getTime();
      const tpaResponse = await fetch(`${API_URL}/api/tpa?_t=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!tpaResponse.ok) {
        throw new Error(`API error: ${tpaResponse.status}`);
      }
      
      const tpaData = await tpaResponse.json();
      console.log('AdminPanel: Updated TPA data after employer creation:', tpaData);
      
      // Verify employer was added
      const employerAdded = tpaData?.brokers?.some((b: Broker) => 
        b.id === newEmployer.brokerId && 
        b.employers?.some((e: Employer) => e.id === result.employerId)
      );
      
      if (!employerAdded) {
        console.warn('AdminPanel: Newly created employer not found in TPA data, might be a caching issue');
      }
      
      setTpa(tpaData);
      setNewEmployer({ name: '', brokerId: '' });
      setEmployerDialogOpen(false);
      setError(null);
      
      // Show success message
      alert(`Employer "${newEmployer.name}" created successfully!`);
      
    } catch (err: any) {
      console.error('AdminPanel: Error adding employer:', err);
      setError(err.message || "Failed to add employer");
    }
  };

  // Handle adding a new user - modified to ensure refresh on creation
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
      
      console.log('AdminPanel: Creating user with data:', userData);
      
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

      // Set flag to trigger users refresh and immediately fetch users
      setUserCreated(true);
      
      // Show success message
      alert(`User ${result.user.username} created successfully`);
      
      // Immediately fetch users to update the list
      try {
        setLoadingUsers(true);
        const usersResponse = await fetch(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (usersResponse.ok) {
          const data = await usersResponse.json();
          setUsers(data.users || []);
        }
      } catch (fetchError) {
        console.error('Error refreshing users after creation:', fetchError);
      } finally {
        setLoadingUsers(false);
      }
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

  // Add this new function before the renderBrokers function
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Create filtered and sorted data
  const getFilteredBrokers = () => {
    if (!tpa || !tpa.brokers) return [];
    
    let filtered = [...tpa.brokers];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(broker => 
        broker.name.toLowerCase().includes(term) || 
        broker.id.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareA, compareB;
      
      // Determine values to compare based on sort field
      if (sortField === 'name') {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else if (sortField === 'id') {
        compareA = a.id.toLowerCase();
        compareB = b.id.toLowerCase();
      } else if (sortField === 'employers') {
        compareA = (a.employers || []).length;
        compareB = (b.employers || []).length;
      } else {
        // Default to name
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      }
      
      // Determine sort order
      if (typeof compareA === 'string' && typeof compareB === 'string') {
        const result = compareA.localeCompare(compareB);
        return sortDirection === 'asc' ? result : -result;
      } else {
        // For numeric comparisons
        const result = Number(compareA) - Number(compareB);
        return sortDirection === 'asc' ? result : -result;
      }
    });
    
    return filtered;
  };
  
  const getFilteredEmployers = () => {
    if (!tpa || !tpa.brokers) return [];
    
    // Collect all employers from all brokers
    let allEmployers = tpa.brokers.flatMap(broker => 
      (broker.employers || []).map(employer => ({
        ...employer,
        brokerName: broker.name,
        brokerId: broker.id
      }))
    );
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allEmployers = allEmployers.filter(employer => 
        employer.name.toLowerCase().includes(term) || 
        employer.id.toLowerCase().includes(term) ||
        employer.brokerName.toLowerCase().includes(term)
      );
    }
    
    // Apply broker filter
    if (filterBrokerId) {
      allEmployers = allEmployers.filter(employer => 
        employer.brokerId === filterBrokerId
      );
    }
    
    // Apply sorting
    allEmployers.sort((a, b) => {
      let compareA, compareB;
      
      // Determine values to compare based on sort field
      if (sortField === 'name') {
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      } else if (sortField === 'id') {
        compareA = a.id.toLowerCase();
        compareB = b.id.toLowerCase();
      } else if (sortField === 'broker') {
        compareA = a.brokerName.toLowerCase();
        compareB = b.brokerName.toLowerCase();
      } else {
        // Default to name
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
      }
      
      // Determine sort order
      const result = compareA.localeCompare(compareB);
      return sortDirection === 'asc' ? result : -result;
    });
    
    return allEmployers;
  };

  // Render the brokers tab with table layout
  const renderBrokers = () => {
    const filteredBrokers = getFilteredBrokers();
    const filteredEmployers = getFilteredEmployers();
    
    return (
      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-grow">
                <label htmlFor="search" className="block text-sm font-medium text-night dark:text-white mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                />
              </div>
              
              {/* Broker filter dropdown (for employers table) */}
              <div className="w-full md:w-1/3">
                <label htmlFor="brokerFilter" className="block text-sm font-medium text-night dark:text-white mb-1">
                  Filter by Broker
                </label>
                <select
                  id="brokerFilter"
                  value={filterBrokerId}
                  onChange={(e) => setFilterBrokerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                >
                  <option value="">All Brokers</option>
                  {tpa && tpa.brokers && tpa.brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>{broker.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Reset filters button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBrokerId('');
                    setSortField('name');
                    setSortDirection('asc');
                  }}
                  className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/30"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Brokers Section */}
        <div className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-night dark:text-white">Brokers</h2>
              <button
                onClick={() => setBrokerDialogOpen(true)}
                className="flex items-center text-sm px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Broker
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
                <span className="ml-3 text-night dark:text-white">Loading brokers...</span>
              </div>
            ) : error ? (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
                <p>{error}</p>
              </div>
            ) : !filteredBrokers.length ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {tpa && tpa.brokers && tpa.brokers.length > 0 ? (
                  <p>No brokers match your search criteria.</p>
                ) : (
                  <>
                    <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No brokers found. Create your first broker by clicking the Add Broker button.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-night-700">
                  <thead className="bg-gray-50 dark:bg-night-700">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortField === 'name' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('employers')}
                      >
                        <div className="flex items-center">
                          Employers
                          {sortField === 'employers' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-night-800 divide-y divide-gray-200 dark:divide-night-700">
                    {filteredBrokers.map((broker) => (
                      <tr key={broker.id} className="hover:bg-gray-50 dark:hover:bg-night-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <BuildingOfficeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-night dark:text-white">{broker.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {broker.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-night dark:text-white">
                          {broker.employers && broker.employers.length > 0 ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              {broker.employers.length} employers
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">No employers</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedBrokerId(broker.id);
                              setNewEmployer({ name: '', brokerId: broker.id });
                              setEmployerDialogOpen(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                          >
                            Add Employer
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteBroker(broker.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Employers Section */}
        {tpa && tpa.brokers && tpa.brokers.some(broker => broker.employers && broker.employers.length > 0) && (
          <div className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-night dark:text-white mb-6">Employers</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-night-700">
                  <thead className="bg-gray-50 dark:bg-night-700">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortField === 'name' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('broker')}
                      >
                        <div className="flex items-center">
                          Broker
                          {sortField === 'broker' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-night-800 divide-y divide-gray-200 dark:divide-night-700">
                    {filteredEmployers.map((employer) => (
                      <tr key={employer.id} className="hover:bg-gray-50 dark:hover:bg-night-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <UserGroupIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-night dark:text-white">{employer.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {employer.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-night dark:text-white">
                          {employer.brokerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteEmployer(employer.brokerId, employer.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Broker Dialog */}
        {brokerDialogOpen && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4 bg-night-900/50">
            <div className="relative bg-white dark:bg-night-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-night-700">
                <h3 className="text-lg font-semibold text-night dark:text-white">Add New Broker</h3>
                <button 
                  onClick={() => setBrokerDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Broker Name</label>
                    <input
                      type="text"
                      value={newBroker.name}
                      onChange={(e) => setNewBroker({...newBroker, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="Enter broker name"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setBrokerDialogOpen(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-night dark:text-white border border-gray-300 dark:border-night-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-night-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBroker}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create Broker
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Employer Dialog */}
        {employerDialogOpen && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4 bg-night-900/50">
            <div className="relative bg-white dark:bg-night-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-night-700">
                <h3 className="text-lg font-semibold text-night dark:text-white">Add New Employer</h3>
                <button 
                  onClick={() => setEmployerDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Employer Name</label>
                    <input
                      type="text"
                      value={newEmployer.name}
                      onChange={(e) => setNewEmployer({...newEmployer, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="Enter employer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Broker</label>
                    <select
                      value={newEmployer.brokerId}
                      onChange={(e) => setNewEmployer({...newEmployer, brokerId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                    >
                      <option value="">Select Broker</option>
                      {tpa && tpa.brokers && tpa.brokers.map((broker) => (
                        <option key={broker.id} value={broker.id}>{broker.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setEmployerDialogOpen(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-night dark:text-white border border-gray-300 dark:border-night-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-night-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEmployer}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create Employer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the users tab with table layout
  const renderUsers = () => {
    return (
      <div className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-night dark:text-white">Users</h2>
            <button
              onClick={() => setUserDialogOpen(true)}
              className="flex items-center text-sm px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add User
            </button>
          </div>
          
          {loadingUsers ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
              <span className="ml-3 text-night dark:text-white">Loading users...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No users found. Create your first user by clicking the Add User button.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-night-700">
                <thead className="bg-gray-50 dark:bg-night-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Broker</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-night-800 divide-y divide-gray-200 dark:divide-night-700">
                  {users.map((user) => {
                    // Find broker name if brokerId exists
                    let brokerName = "";
                    if (user.brokerId && tpa && tpa.brokers) {
                      const broker = tpa.brokers.find(b => b.id === user.brokerId);
                      if (broker) brokerName = broker.name;
                    }
                    
                    return (
                      <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-night-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-night dark:text-white">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-night dark:text-white">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-night dark:text-white">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 
                              user.role === 'broker' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                              user.role === 'employer' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-night dark:text-white">{brokerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {user.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => {
                              // Delete user functionality (to be implemented)
                              alert('Delete user functionality not yet implemented');
                            }}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* User Dialog */}
        {userDialogOpen && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4 bg-night-900/50">
            <div className="relative bg-white dark:bg-night-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-night-700">
                <h3 className="text-lg font-semibold text-night dark:text-white">Add New User</h3>
                <button 
                  onClick={() => setUserDialogOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Username</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                    >
                      <option value="broker">Broker</option>
                      <option value="employer">Employer</option>
                    </select>
                  </div>
                  
                  {newUser.role === 'employer' && (
                    <div>
                      <label className="block text-sm font-medium text-night dark:text-white mb-1">Broker</label>
                      <select
                        value={newUser.brokerId}
                        onChange={(e) => setNewUser({...newUser, brokerId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      >
                        <option value="">Select Broker</option>
                        {tpa && tpa.brokers && tpa.brokers.map((broker) => (
                          <option key={broker.id} value={broker.id}>{broker.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Temporary Password</label>
                    <input
                      type="password"
                      value={newUser.tempPassword}
                      onChange={(e) => setNewUser({...newUser, tempPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="Temporary Password"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      User will be required to change password on first login.
                    </p>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
                    <p>{error}</p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setUserDialogOpen(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-night dark:text-white border border-gray-300 dark:border-night-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-night-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Modify the main render logic for the tabs
  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-night-700">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('brokers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'brokers'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-night-600'
            }`}
          >
            Brokers & Employers
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-night-600'
            }`}
          >
            Users
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'brokers' && renderBrokers()}
      
      {activeTab === 'users' && renderUsers()}
    </div>
  );
};

export default AdminPanel; 