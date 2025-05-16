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
// Remove API key constant since it wasn't needed before
// const API_KEY = 'EOpsK0PFHivt1qB5pbGH1GHRPKzFeG27ooU4KX8f';

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
  tpaName?: string;
  brokerId?: string;
  brokerName?: string;
  employerId?: string;
  employerName?: string;
  status?: string;
  enabled?: boolean;
  phoneNumber?: string;
}

interface NewUser {
  username: string;
  email: string;
  name: string;
  role: string;
  brokerId?: string;
  tpaId?: string;
  employerId?: string;
  tempPassword: string;
  phoneNumber?: string;
}

// Add props interface
interface AdminPanelProps {
  // No props needed since we're removing tabs
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const { user, getIdToken } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tpa, setTpa] = useState<TPA | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  
  // New state for user management
  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    email: '',
    name: '',
    role: 'broker',
    brokerId: '',
    tempPassword: '',
    phoneNumber: ''
  });
  
  // Add state for real broker users from Cognito
  const [brokerUsers, setBrokerUsers] = useState<User[]>([]);
  const [loadingBrokers, setLoadingBrokers] = useState(false);
  
  // Add state for editing users
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Add state for the list of users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userCreated, setUserCreated] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Add state for employer users
  const [employerUsers, setEmployerUsers] = useState<User[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  // Extract fetchUsers function to make it available to handleDeleteUser
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
      
      // Debug logging for troubleshooting
      console.log('===== AUTH DEBUGGING =====');
      console.log('Token obtained from getIdToken():');
      console.log('Token length:', token.length);
      console.log('Token first 15 chars:', token.substring(0, 15));
      console.log('Token last 15 chars:', token.substring(token.length - 15));
      console.log('===== END AUTH DEBUGGING =====');
      
      console.log('AdminPanel: Fetching users...');
      
      // Use the endpoint path that Lambda expects
      let endpoint = `${API_URL}/api/users`;
      
      // ALWAYS include tpaId parameter for all users
      const timestamp = new Date().getTime();
      
      // Add timestamp to prevent caching issues
      if (user.tpaId) {
        // Check if the URL already has query parameters
        const separator = endpoint.includes('?') ? '&' : '?';
        endpoint = `${endpoint}${separator}tpaId=${user.tpaId}`;
      }
      
      // Base endpoint before adding timestamp
      console.log('Base endpoint before adding timestamp:', endpoint);
      
      // Check if there are already query parameters
      console.log('Contains ? :', endpoint.includes('?'));
      const separator = endpoint.includes('?') ? '&' : '?';
      
      // Add timestamp to prevent caching
      endpoint = `${endpoint}${separator}_t=${timestamp}`;
      
      console.log(`AdminPanel: Fetching users from ${endpoint}`);
      
      // Make sure there's no extra space in the Authorization header
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      };
      
      console.log('Headers:', headers);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AdminPanel: API error (${response.status}): ${errorText}`);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AdminPanel: Users data received:', data);
      
      // Set users in state
      setUsers(data.users || []);
      
      // Reset error and user created flag
      setError(null);
      setUserCreated(false);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(`Error fetching users: ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch users with TPA-based filtering
  useEffect(() => {
    fetchUsers();
  }, [user, userCreated, getIdToken]);

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
          // For TPA admins, we only want to fetch their specific TPA data
          // For global admins, we fetch all TPA data
          let tpaEndpoint = `${API_URL}/api/tpa`;
          
          // Only append the TPA ID if it exists and we're not an admin
          if (user.role !== 'admin' && user.tpaId) {
            console.log(`AdminPanel: User has tpaId: ${user.tpaId}`);
            // Ensure we're not appending tpa_ prefix if it's already there
            // Use query parameter instead of path parameter
            tpaEndpoint = `${API_URL}/api/tpa?id=${user.tpaId}`;
          }
             
          console.log(`AdminPanel: Fetching TPA data from ${tpaEndpoint}`);
          
          // Make sure there's no extra space in the Authorization header
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.trim()}`
          };
          
          const response = await fetch(tpaEndpoint, {
            method: 'GET',
            headers: headers
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`AdminPanel: API error (${response.status}): ${errorText}`);
            throw new Error(`API error: ${response.status}`);
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

  // New function to fetch real broker users
  const fetchBrokerUsers = async () => {
    if (!user) return;
    
    try {
      setLoadingBrokers(true);
      
      if (!API_URL) {
        console.error("API URL not configured. Please check your environment variables.");
        setLoadingBrokers(false);
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        console.error("Authentication token not available");
        setLoadingBrokers(false);
        return;
      }
      
      // Debug logging
      console.log('AdminPanel: Fetching broker users...');
      
      // Use the endpoint path that Lambda expects with a filter for brokers
      let endpoint = `${API_URL}/api/users?role=broker`;
      
      // Always include tpaId parameter to get brokers from the current TPA
      if (user.tpaId) {
        endpoint = `${endpoint}&tpaId=${user.tpaId}`;
      }
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      endpoint = `${endpoint}&_t=${timestamp}`;
      
      console.log(`AdminPanel: Fetching broker users from ${endpoint}`);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      };
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AdminPanel: API error fetching brokers (${response.status}): ${errorText}`);
        setLoadingBrokers(false);
        return;
      }
      
      const data = await response.json();
      console.log('AdminPanel: Broker users data received:', data);
      
      // Set broker users in state
      if (data.users && Array.isArray(data.users)) {
        // Filter to only include users with broker role
        const brokers = data.users.filter((u: User) => u.role === 'broker');
        console.log(`AdminPanel: Found ${brokers.length} broker users`);
        setBrokerUsers(brokers);
      } else {
        console.warn('AdminPanel: No broker users found or invalid data format');
        setBrokerUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching broker users:', err);
    } finally {
      setLoadingBrokers(false);
    }
  };

  // Fetch broker users when component mounts or user changes
  useEffect(() => {
    fetchBrokerUsers();
  }, [user, getIdToken]);

  // New function to fetch employers for a selected broker
  const fetchEmployersForBroker = async (brokerId: string) => {
    if (!user || !brokerId) return;
    
    try {
      setLoadingEmployers(true);
      
      if (!API_URL) {
        console.error("API URL not configured. Please check your environment variables.");
        setLoadingEmployers(false);
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        console.error("Authentication token not available");
        setLoadingEmployers(false);
        return;
      }
      
      console.log(`AdminPanel: Fetching employers for broker: ${brokerId}`);
      
      // Use the endpoint path that Lambda expects with a filter for employers
      let endpoint = `${API_URL}/api/users?role=employer&brokerId=${encodeURIComponent(brokerId)}`;
      
      // Always include tpaId parameter to get employers from the current TPA
      if (user.tpaId) {
        endpoint = `${endpoint}&tpaId=${user.tpaId}`;
      }
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      endpoint = `${endpoint}&_t=${timestamp}`;
      
      console.log(`AdminPanel: Fetching employer users from ${endpoint}`);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      };
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AdminPanel: API error fetching employers (${response.status}): ${errorText}`);
        setLoadingEmployers(false);
        return;
      }
      
      const data = await response.json();
      console.log('AdminPanel: Employer users data received:', data);
      
      // Set employer users in state
      if (data.users && Array.isArray(data.users)) {
        // Filter to only include users with employer role
        const employers = data.users.filter((u: User) => u.role === 'employer' && u.brokerId === brokerId);
        console.log(`AdminPanel: Found ${employers.length} employer users for broker ${brokerId}`);
        setEmployerUsers(employers);
      } else {
        console.warn('AdminPanel: No employer users found or invalid data format');
        setEmployerUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching employer users:', err);
    } finally {
      setLoadingEmployers(false);
    }
  };

  // Add handler for broker selection change
  const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBrokerId = e.target.value;
    
    // Update the form data
    setNewUser(prev => ({
      ...prev,
      brokerId: selectedBrokerId,
      employerId: '' // Reset employer selection when broker changes
    }));
    
    // Fetch employers for this broker if a broker is selected
    if (selectedBrokerId) {
      fetchEmployersForBroker(selectedBrokerId);
    } else {
      // Clear employers if no broker selected
      setEmployerUsers([]);
    }
  };

  // Handle adding a new user - modified to ensure role-based restrictions
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
      
      // Role-specific validations and RBAC restrictions
      if (user?.role !== 'admin') {
        // TPA admins can only create broker and employer users under their TPA
        if (user?.role === 'tpa_admin') {
          if (!['broker', 'employer'].includes(newUser.role)) {
            setError('TPA admins can only create broker and employer users');
            return;
          }
          
          // Enforce tpaId for users created by TPA admin
          newUser.tpaId = user.tpaId;
        }
        
        // Employer users cannot create users
        if (user?.role === 'employer') {
          setError('Employers do not have permission to create users');
          return;
        }
      }
      
      // Additional role-specific validations
      if (newUser.role === 'broker' && !newUser.tpaId) {
        setError('Please select a TPA for broker users');
        return;
      }
      
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
      
      // Create user request with proper hierarchy
      const userData = {
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tempPassword: newUser.tempPassword,
        phoneNumber: newUser.phoneNumber
      };
      
      // Add organization IDs based on role and permissions
      if (newUser.tpaId) {
        (userData as any).tpaId = newUser.tpaId;
      } else if (user?.tpaId) {
        // Always include TPA ID from current user if available
        (userData as any).tpaId = user.tpaId;
      }
      
      if (newUser.role === 'employer') {
        if (newUser.brokerId) {
          // Using broker username (Cognito user) as the ID now
          (userData as any).brokerId = newUser.brokerId;
          
          // Find the selected broker to get additional details if needed
          const selectedBroker = brokerUsers.find(b => b.username === newUser.brokerId);
          if (selectedBroker) {
            console.log(`Selected broker: ${selectedBroker.name} (${selectedBroker.username})`);
            // Include broker name for reference
            (userData as any).brokerName = selectedBroker.name || selectedBroker.username;
          }
        }
      }
      
      if (newUser.role === 'employer' && newUser.employerId) {
        (userData as any).employerId = newUser.employerId;
      }
      
      console.log('AdminPanel: Creating user with data:', userData);
      
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('AdminPanel: User created successfully:', result);
      
      // Reset form and close dialog
      setNewUser({
        username: '',
        email: '',
        name: '',
        role: 'broker',
        brokerId: '',
        tempPassword: '',
        phoneNumber: ''
      });
      
      setUserDialogOpen(false);
      setUserCreated(true); // Trigger re-fetch of users
      setError(null);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (username: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
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
      
      const response = await fetch(`${API_URL}/api/users/${username}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.trim()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Refresh users data
      await fetchUsers();
      setError(null);
      
      // Show success message
      alert(`User ${username} deleted successfully`);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || "Failed to delete user");
    }
  };

  // Add function to handle sorting
  const handleSort = (field: string) => {
    // If clicking on the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking on a new field, set it as the sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Add function to filter and sort users
  const getFilteredAndSortedUsers = () => {
    // First filter users based on search term
    const filteredUsers = users.filter(user => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.role && user.role.toLowerCase().includes(searchLower)) ||
        (user.tpaName && user.tpaName.toLowerCase().includes(searchLower)) ||
        (user.brokerName && user.brokerName.toLowerCase().includes(searchLower)) ||
        (user.employerName && user.employerName.toLowerCase().includes(searchLower))
      );
    });
    
    // Then sort the filtered users
    return filteredUsers.sort((a, b) => {
      let aValue = a[sortField as keyof User] || '';
      let bValue = b[sortField as keyof User] || '';
      
      // Special case for names, split into first and last
      if (sortField === 'firstName') {
        aValue = a.name ? a.name.split(' ')[0] : '';
        bValue = b.name ? b.name.split(' ')[0] : '';
      } else if (sortField === 'lastName') {
        aValue = a.name ? a.name.split(' ').slice(1).join(' ') : '';
        bValue = b.name ? b.name.split(' ').slice(1).join(' ') : '';
      }
      
      // Convert to strings for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      // Compare based on direction
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Render the users tab with table layout
  const renderUsers = () => {
    const isAdmin = user?.role === 'admin';
    const isTpaAdmin = user?.role === 'tpa_admin';
    
    // Get filtered and sorted users
    const filteredSortedUsers = getFilteredAndSortedUsers();
    
    return (
      <div className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-night dark:text-white">User management</h2>
            
            {/* Only show Add User button for admin and tpa_admin roles */}
            {(isAdmin || isTpaAdmin) && (
              <button
                onClick={() => setUserDialogOpen(true)}
                className="flex items-center text-sm px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                New
              </button>
            )}
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
          ) : (
            <>
              <div className="mb-4 flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search by name, email, role, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full overflow-x-auto">
                <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-night-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-night-700">
                    <tr>
                      <th scope="col" className="w-12 px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
                      <th 
                        scope="col" 
                        className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                        onClick={() => handleSort('username')}
                      >
                        USERNAME
                        {sortField === 'username' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                        onClick={() => handleSort('firstName')}
                      >
                        FIRST
                        {sortField === 'firstName' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                        onClick={() => handleSort('lastName')}
                      >
                        LAST
                        {sortField === 'lastName' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500 hidden sm:table-cell"
                        onClick={() => handleSort('phoneNumber')}
                      >
                        PHONE
                        {sortField === 'phoneNumber' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[15%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                        onClick={() => handleSort('email')}
                      >
                        E-MAIL
                        {sortField === 'email' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[8%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500"
                        onClick={() => handleSort('role')}
                      >
                        ROLE
                        {sortField === 'role' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[8%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500 hidden md:table-cell"
                        onClick={() => handleSort('tpaName')}
                      >
                        TPA
                        {sortField === 'tpaName' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[9%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500 hidden md:table-cell"
                        onClick={() => handleSort('brokerName')}
                      >
                        BROKER
                        {sortField === 'brokerName' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        scope="col" 
                        className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-primary-500 hidden lg:table-cell"
                        onClick={() => handleSort('employerName')}
                      >
                        EMPLOYER
                        {sortField === 'employerName' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th scope="col" className="w-[5%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">DIS</th>
                      <th scope="col" className="w-[15%] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-night-800 divide-y divide-gray-200 dark:divide-night-700">
                    {filteredSortedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? "No users match your search" : "No users found"}
                        </td>
                      </tr>
                    ) : (
                      filteredSortedUsers.map((user) => {
                        // Split name into first and last name if available
                        const nameParts = user.name ? user.name.split(' ') : ['', ''];
                        const firstName = nameParts[0] || '';
                        const lastName = nameParts.slice(1).join(' ') || '';
                        
                        return (
                          <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-night-700">
                            <td className="px-2 py-2 whitespace-nowrap">
                              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                              </div>
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate" title={user.username}>{user.username}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate" title={firstName}>{firstName}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate" title={lastName}>{lastName}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate hidden sm:table-cell" title={user.phoneNumber || '-'}>{user.phoneNumber || '-'}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate" title={user.email}>{user.email}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate" title={user.role}>{user.role}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate hidden md:table-cell" title={user.tpaName || '-'}>{user.tpaName || '-'}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate hidden md:table-cell" title={user.brokerName || '-'}>{user.brokerName || '-'}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate hidden lg:table-cell" title={user.employerName || '-'}>{user.employerName || '-'}</td>
                            <td className="px-2 py-2 whitespace-nowrap text-sm text-night dark:text-white truncate hidden lg:table-cell">
                              {user.enabled === false ? 'Y' : 'N'}
                            </td>
                            <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => handleViewUser(user)}
                                >
                                  View
                                </button>
                                <button 
                                  className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => handleEditUser(user)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteUser(user.username)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <select 
                    className="px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                    defaultValue="10"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  1
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* User Dialog - update the role selection and broker field */}
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
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={newUser.phoneNumber}
                      onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="Phone Number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                    >
                      {/* Only show broker and employer roles */}
                      <option value="broker">Broker</option>
                      <option value="employer">Employer</option>
                    </select>
                  </div>
                  
                  {/* Organization selection based on role */}
                  {/* Only show TPA selection for global admins */}
                  {user?.role === 'admin' && (newUser.role === 'tpa_admin' || newUser.role === 'broker') && (
                    <div>
                      <label className="block text-sm font-medium text-night dark:text-white mb-1">TPA</label>
                      <select
                        value={newUser.tpaId}
                        onChange={(e) => setNewUser({...newUser, tpaId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      >
                        <option value="">Select TPA</option>
                        {tpa && <option value={tpa.id}>{tpa.name || 'Current TPA'}</option>}
                      </select>
                    </div>
                  )}
                  
                  {/* Broker selection for employer users */}
                  {(newUser.role === 'employer') && (
                    <div>
                      <label className="block text-sm font-medium text-night dark:text-white mb-1">Broker</label>
                      <select
                        value={newUser.brokerId}
                        onChange={handleBrokerChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      >
                        <option value="">Select Broker</option>
                        {loadingBrokers ? (
                          <option value="" disabled>Loading brokers...</option>
                        ) : (
                          brokerUsers.map((broker) => (
                            <option key={broker.username} value={broker.username}>
                              {broker.name || broker.username}
                            </option>
                          ))
                        )}
                      </select>
                      {brokerUsers.length === 0 && !loadingBrokers && (
                        <p className="mt-1 text-xs text-red-500">
                          No broker users found. Please create broker users first.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Employer selection - modify to work with broker users */}
                  {newUser.role === 'employer' && newUser.brokerId && (
                    <div>
                      <label className="block text-sm font-medium text-night dark:text-white mb-1">Employer</label>
                      <select
                        value={newUser.employerId}
                        onChange={(e) => setNewUser({...newUser, employerId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      >
                        <option value="">Select Employer</option>
                        {loadingEmployers ? (
                          <option value="" disabled>Loading employers...</option>
                        ) : (
                          employerUsers.map((employer) => (
                            <option key={employer.username} value={employer.username}>
                              {employer.name || employer.username}
                            </option>
                          ))
                        )}
                      </select>
                      {employerUsers.length === 0 && !loadingEmployers && (
                        <p className="mt-1 text-xs text-red-500">
                          No employer users found for this broker. You can create a new employer.
                        </p>
                      )}
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

        {/* Edit User Dialog */}
        {editUserDialogOpen && editingUser && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4 bg-night-900/50">
            <div className="relative bg-white dark:bg-night-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-night-700">
                <h3 className="text-lg font-semibold text-night dark:text-white">Edit User</h3>
                <button 
                  onClick={() => setEditUserDialogOpen(false)}
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
                      value={editingUser.username}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm bg-gray-100 dark:bg-night-600 text-night dark:text-gray-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Username cannot be changed
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Name</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editingUser.phoneNumber || ''}
                      onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      placeholder="Phone Number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                    >
                      {/* Only show broker and employer roles */}
                      <option value="broker">Broker</option>
                      <option value="employer">Employer</option>
                    </select>
                  </div>
                  
                  {/* Organization selection based on role */}
                  {/* Only show TPA selection for global admins */}
                  {user?.role === 'admin' && (editingUser.role === 'tpa_admin' || editingUser.role === 'broker') && (
                    <div>
                      <label className="block text-sm font-medium text-night dark:text-white mb-1">TPA</label>
                      <select
                        value={editingUser.tpaId || ''}
                        onChange={(e) => setEditingUser({...editingUser, tpaId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      >
                        <option value="">Select TPA</option>
                        {tpa && <option value={tpa.id}>{tpa.name || 'Current TPA'}</option>}
                      </select>
                    </div>
                  )}
                  
                  {/* Broker selection for employer users */}
                  {(editingUser?.role === 'employer') && (
                    <div>
                      <label className="block text-sm font-medium text-night dark:text-white mb-1">Broker</label>
                      <select
                        value={editingUser.brokerId || ''}
                        onChange={(e) => {
                          const selectedBrokerId = e.target.value;
                          setEditingUser({
                            ...editingUser,
                            brokerId: selectedBrokerId,
                            employerId: '' // Reset employer when broker changes
                          });
                          
                          // Fetch employers for this broker if a broker is selected
                          if (selectedBrokerId) {
                            fetchEmployersForBroker(selectedBrokerId);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      >
                        <option value="">Select Broker</option>
                        {loadingBrokers ? (
                          <option value="" disabled>Loading brokers...</option>
                        ) : (
                          brokerUsers.map((broker) => (
                            <option key={broker.username} value={broker.username}>
                              {broker.name || broker.username}
                            </option>
                          ))
                        )}
                      </select>
                      {brokerUsers.length === 0 && !loadingBrokers && (
                        <p className="mt-1 text-xs text-red-500">
                          No broker users found. Please create broker users first.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Employer selection for employer users */}
                  {editingUser?.role === 'employer' && editingUser.brokerId && (
                    <div>
                      <label className="block text-sm font-medium text-night dark:text-white mb-1">Employer</label>
                      <select
                        value={editingUser.employerId || ''}
                        onChange={(e) => setEditingUser({...editingUser, employerId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-night-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-night-700 text-night dark:text-white"
                      >
                        <option value="">Select Employer</option>
                        {loadingEmployers ? (
                          <option value="" disabled>Loading employers...</option>
                        ) : (
                          employerUsers.map((employer) => (
                            <option key={employer.username} value={employer.username}>
                              {employer.name || employer.username}
                            </option>
                          ))
                        )}
                      </select>
                      {employerUsers.length === 0 && !loadingEmployers && (
                        <p className="mt-1 text-xs text-red-500">
                          No employer users found for this broker.
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-night dark:text-white mb-1">Password Management</label>
                    <button
                      type="button"
                      onClick={() => {
                        // In a real implementation, this would open a reset password dialog or call an API
                        alert(`Password reset for ${editingUser.username} would be implemented here`);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Reset User Password
                    </button>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      This will send the user a password reset email
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
                    onClick={() => setEditUserDialogOpen(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-night dark:text-white border border-gray-300 dark:border-night-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-night-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Update User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle viewing a user
  const handleViewUser = (user: User) => {
    // For now, just show the user data in an alert
    alert(`User Details:\n\nUsername: ${user.username}\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\nPhone: ${user.phoneNumber || 'Not provided'}\nTPA: ${user.tpaName || 'None'}\nBroker: ${user.brokerName || 'None'}\nEmployer: ${user.employerName || 'None'}`);
  };

  // Handle editing a user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserDialogOpen(true);
    setError(null);
    
    // If this is an employer user and they have a broker ID, 
    // fetch the employers for that broker
    if (user.role === 'employer' && user.brokerId) {
      fetchEmployersForBroker(user.brokerId);
    }
  };

  // Handle updating a user
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      if (!API_URL) {
        setError("API URL not configured");
        return;
      }
      
      const token = await getIdToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      // Create update payload with only fields that have changed
      const updatePayload: Record<string, any> = {
        username: editingUser.username // This is required for identification
      };
      
      // Only include fields that have values
      if (editingUser.email) updatePayload.email = editingUser.email;
      if (editingUser.name) updatePayload.name = editingUser.name;
      if (editingUser.phoneNumber) updatePayload.phoneNumber = editingUser.phoneNumber;
      if (editingUser.role) updatePayload.role = editingUser.role;
      
      // Update organization relationships
      if (editingUser.role === 'broker' || editingUser.role === 'tpa_admin' || editingUser.role === 'tpa_user') {
        if (editingUser.tpaId) updatePayload.tpaId = editingUser.tpaId;
      }
      
      if (editingUser.role === 'employer') {
        if (editingUser.brokerId) {
          updatePayload.brokerId = editingUser.brokerId;
          
          // Find the selected broker to get additional details if needed
          const selectedBroker = brokerUsers.find(b => b.username === editingUser.brokerId);
          if (selectedBroker) {
            console.log(`Selected broker: ${selectedBroker.name} (${selectedBroker.username})`);
            updatePayload.brokerName = selectedBroker.name || selectedBroker.username;
          }
        }
        
        if (editingUser.employerId) updatePayload.employerId = editingUser.employerId;
      }
      
      console.log('AdminPanel: Updating user with data:', updatePayload);
      
      const response = await fetch(`${API_URL}/api/users/${editingUser.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.trim()}`
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('AdminPanel: User updated successfully:', result);
      
      setEditUserDialogOpen(false);
      setUserCreated(true); // Trigger re-fetch of users
      setError(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    }
  };

  // Modify the main render logic to show only the users view
  return (
    <div className="space-y-6 w-full px-4">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage system users and their permissions</p>
      </div>
      
      {/* Display users panel */}
      {renderUsers()}
    </div>
  );
};

export default AdminPanel; 