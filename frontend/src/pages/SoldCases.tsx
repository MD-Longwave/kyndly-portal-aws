import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/animations';
import { Auth } from 'aws-amplify';

// Role-based types
type UserRole = 'admin' | 'tpa' | 'broker' | 'employer' | 'guest';

interface UserData {
  id: string;
  username: string;
  role: UserRole;
  tpaId?: string;
  brokerId?: string;
  employerId?: string;
}

// Quote type definition - same as in QuotesList
interface Quote {
  submissionId: string;
  companyName: string;
  transperraRep: string;
  ichraEffectiveDate: string;
  pepm: string;
  status: string;
  brokerName: string;
  employerName: string;
  brokerId: string;
  employerId: string;
  s3Key: string;
}

// Filter option types
interface FilterOption {
  id: string;
  name: string;
}

// API configuration - same as in QuotesList
const API_KEY = '4ws9KDIWIW11u8mNVP0Th2bGN3GhlnnZlquHiv8b';
const API_URL = 'https://m88qalv4u5.execute-api.us-east-2.amazonaws.com/prod';
const API_PATH = '/api/quotes';

// Sorting options
type SortField = 'companyName' | 'transperraRep' | 'ichraEffectiveDate' | 'pepm' | 'brokerName' | 'employerName';
type SortDirection = 'asc' | 'desc';

const SoldCases: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getIdToken } = useAuth();
  
  // User role related states
  const [userData, setUserData] = useState<UserData | null>(null);
  const [brokerOptions, setBrokerOptions] = useState<FilterOption[]>([]);
  const [employerOptions, setEmployerOptions] = useState<FilterOption[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('');
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('');
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  // Search and sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('companyName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // KPI statistics
  const [stats, setStats] = useState({
    totalSold: 0,
    totalPending: 0,
    conversionRate: 0,
    avgPEPM: 0
  });

  const fetchQuotes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let url = `${API_URL}${API_PATH}`;
      
      // Add role-based query parameters if applicable
      if (userData) {
        const params = new URLSearchParams();
        
        if (userData.role === 'tpa' && userData.tpaId) {
          params.append('tpaId', userData.tpaId);
        }
        
        if (userData.role === 'broker' || (userData.role === 'tpa' && selectedBrokerId)) {
          // Use either the broker's ID or the selected broker ID for TPA users
          const brokerId = userData.role === 'broker' ? userData.brokerId : selectedBrokerId;
          if (brokerId) {
            params.append('brokerId', brokerId);
          }
        }
        
        if (userData.role === 'employer' || selectedEmployerId) {
          // Use either the employer's ID or the selected employer ID
          const employerId = userData.role === 'employer' ? userData.employerId : selectedEmployerId;
          if (employerId) {
            params.append('employerId', employerId);
          }
        }
        
        // Add params to URL if any were set
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      console.log('Fetching quotes with URL:', url);
      
      const response = await fetch(url, { 
        headers,
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const allQuotes = data.quotes || [];
        
        // Filter only sold quotes for display
        const soldQuotes = allQuotes.filter((quote: Quote) => quote.status === 'Sold');
        setQuotes(soldQuotes);
        
        // Calculate KPI statistics
        const totalSold = soldQuotes.length;
        const totalPending = allQuotes.filter((quote: Quote) => quote.status === 'Pending').length;
        const conversionRate = allQuotes.length > 0 
          ? (totalSold / allQuotes.length * 100).toFixed(1) 
          : 0;
          
        // Calculate average PEPM for sold quotes
        const totalPEPM = soldQuotes.reduce((sum: number, quote: Quote) => {
          const pepm = parseFloat(quote.pepm);
          return !isNaN(pepm) ? sum + pepm : sum;
        }, 0);
        const avgPEPM = soldQuotes.length > 0 
          ? (totalPEPM / soldQuotes.length).toFixed(2) 
          : 0;
          
        setStats({
          totalSold,
          totalPending,
          conversionRate: parseFloat(conversionRate as string),
          avgPEPM: parseFloat(avgPEPM as string)
        });
        
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        setError(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch quotes: ${err instanceof Error ? err.message : 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [getIdToken, userData, selectedBrokerId, selectedEmployerId]);
  
  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    // Fetch quotes when user data is loaded or filter selections change
    if (userData) {
      fetchQuotes();
    }
  }, [userData, selectedBrokerId, selectedEmployerId, fetchQuotes]);

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-seafoam" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-seafoam" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  // Filter and sort the quotes
  const filteredAndSortedQuotes = useMemo(() => {
    // First, filter by search term
    const filtered = searchTerm
      ? quotes.filter(quote => 
          quote.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          quote.brokerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.transperraRep?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.employerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.submissionId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : quotes;
    
    // Then, sort the filtered results
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      // Handle numerical sorts (like PEPM)
      if (sortField === 'pepm') {
        const aNum = parseFloat(aValue.toString());
        const bNum = parseFloat(bValue.toString());
        return sortDirection === 'asc' 
          ? aNum - bNum
          : bNum - aNum;
      }
      
      // Handle string comparisons
      return sortDirection === 'asc'
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
  }, [quotes, searchTerm, sortField, sortDirection]);

  // Get current user data and role
  const fetchUserData = async () => {
    setLoadingUserData(true);
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const userGroups = currentUser.signInUserSession.accessToken.payload['cognito:groups'] || [];
      
      let role: UserRole = 'guest';
      let tpaId = '';
      let brokerId = '';
      let employerId = '';
      
      // Determine user role from Cognito groups
      if (userGroups.includes('Admin')) {
        role = 'admin';
      } else if (userGroups.includes('TPA')) {
        role = 'tpa';
        // Extract TPA ID from attributes if available
        tpaId = currentUser.attributes['custom:tpaId'] || '';
      } else if (userGroups.includes('Broker')) {
        role = 'broker';
        // Extract broker ID from attributes if available
        brokerId = currentUser.attributes['custom:brokerId'] || '';
        tpaId = currentUser.attributes['custom:tpaId'] || '';
      } else if (userGroups.includes('Employer')) {
        role = 'employer';
        // Extract employer ID from attributes if available
        employerId = currentUser.attributes['custom:employerId'] || '';
        brokerId = currentUser.attributes['custom:brokerId'] || '';
        tpaId = currentUser.attributes['custom:tpaId'] || '';
      }
      
      setUserData({
        id: currentUser.username,
        username: currentUser.attributes.email,
        role,
        tpaId,
        brokerId,
        employerId
      });
      
      // If TPA, fetch broker options
      if (role === 'tpa' && tpaId) {
        await fetchBrokerOptions(tpaId);
      }
      
      // If broker, fetch employer options
      if (role === 'broker' && brokerId) {
        await fetchEmployerOptions(brokerId);
      }
      
      // Set initial filter selections based on role
      if (role === 'broker' && brokerId) {
        setSelectedBrokerId(brokerId);
      }
      
      if (role === 'employer' && employerId) {
        setSelectedEmployerId(employerId);
      }
      
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoadingUserData(false);
    }
  };
  
  // Fetch broker options for TPA users
  const fetchBrokerOptions = async (tpaId: string) => {
    try {
      // This would be an API call to fetch brokers for the TPA
      // Mock data for now
      setBrokerOptions([
        { id: 'broker-1', name: 'Broker A' },
        { id: 'broker-2', name: 'Broker B' },
      ]);
    } catch (err) {
      console.error('Error fetching broker options:', err);
    }
  };
  
  // Fetch employer options for broker users
  const fetchEmployerOptions = async (brokerId: string) => {
    try {
      // This would be an API call to fetch employers for the broker
      // Mock data for now
      setEmployerOptions([
        { id: 'employer-1', name: 'Employer A' },
        { id: 'employer-2', name: 'Employer B' },
      ]);
    } catch (err) {
      console.error('Error fetching employer options:', err);
    }
  };

  // Handle selected broker change (for TPA users)
  const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brokerId = e.target.value;
    setSelectedBrokerId(brokerId);
    
    // Reset employer selection when broker changes
    setSelectedEmployerId('');
    
    // Fetch employer options for the selected broker
    if (brokerId) {
      fetchEmployerOptions(brokerId);
    } else {
      setEmployerOptions([]);
    }
  };
  
  // Handle selected employer change
  const handleEmployerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployerId(e.target.value);
  };

  if (isLoading || loadingUserData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-seafoam border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 py-8" style={{ minWidth: '1000px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-brand-gradient rounded-brand p-6 mb-8 text-white shadow-brand"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sold Cases</h1>
            {userData && userData.role === 'tpa' && (
              <p className="text-sky-100">Track and manage sold ICHRA quotes across all your brokers and employers</p>
            )}
            {userData && userData.role === 'broker' && (
              <p className="text-sky-100">Track and manage all your sold ICHRA quotes</p>
            )}
            {userData && userData.role === 'employer' && (
              <p className="text-sky-100">View your sold ICHRA quotes</p>
            )}
            {!userData && (
              <p className="text-sky-100">Track and manage all sold ICHRA quotes</p>
            )}
          </div>
          {userData && (
            <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium">
              {userData.role === 'admin' && 'Admin View'}
              {userData.role === 'tpa' && 'TPA View'}
              {userData.role === 'broker' && 'Broker View'}
              {userData.role === 'employer' && 'Employer View'}
            </div>
          )}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        {/* Total Sold KPI */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-night-800 rounded-lg shadow p-4 border-l-4 border-green-500"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sold Cases</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSold}</p>
        </motion.div>

        {/* Total Pending KPI */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-night-800 rounded-lg shadow p-4 border-l-4 border-yellow-500"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Cases</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalPending}</p>
        </motion.div>

        {/* Conversion Rate KPI */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-night-800 rounded-lg shadow p-4 border-l-4 border-blue-500"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.conversionRate}%</p>
        </motion.div>

        {/* Average PEPM KPI */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-night-800 rounded-lg shadow p-4 border-l-4 border-purple-500"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average PEPM</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${stats.avgPEPM}</p>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="flex flex-wrap justify-between items-center mb-4 gap-4"
      >
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search sold cases by company, broker, rep..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent w-full bg-white dark:bg-night-800 dark:border-night-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Role-based filters */}
        {userData && userData.role === 'tpa' && (
          <div className="flex flex-wrap gap-4">
            {/* Broker selector for TPA users */}
            <div className="w-64">
              <label htmlFor="broker-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Broker
              </label>
              <select
                id="broker-filter"
                className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:border-seafoam focus:outline-none focus:ring-seafoam dark:bg-night-800 dark:border-night-700 dark:text-white"
                value={selectedBrokerId}
                onChange={handleBrokerChange}
              >
                <option value="">All Brokers</option>
                {brokerOptions.map(broker => (
                  <option key={broker.id} value={broker.id}>{broker.name}</option>
                ))}
              </select>
            </div>
            
            {/* Employer selector (visible when broker is selected) */}
            {(selectedBrokerId && employerOptions.length > 0) && (
              <div className="w-64">
                <label htmlFor="employer-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Employer
                </label>
                <select
                  id="employer-filter"
                  className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:border-seafoam focus:outline-none focus:ring-seafoam dark:bg-night-800 dark:border-night-700 dark:text-white"
                  value={selectedEmployerId}
                  onChange={handleEmployerChange}
                >
                  <option value="">All Employers</option>
                  {employerOptions.map(employer => (
                    <option key={employer.id} value={employer.id}>{employer.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
        
        {/* Broker users can filter by employer */}
        {userData && userData.role === 'broker' && employerOptions.length > 0 && (
          <div className="w-64">
            <label htmlFor="employer-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Employer
            </label>
            <select
              id="employer-filter"
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:border-seafoam focus:outline-none focus:ring-seafoam dark:bg-night-800 dark:border-night-700 dark:text-white"
              value={selectedEmployerId}
              onChange={handleEmployerChange}
            >
              <option value="">All Employers</option>
              {employerOptions.map(employer => (
                <option key={employer.id} value={employer.id}>{employer.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex space-x-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchQuotes()}
            className="flex items-center space-x-2 bg-seafoam hover:bg-seafoam-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>Refresh</span>
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <FadeIn>
          <div className="rounded-brand bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300 mb-6">
            <p className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
            <button 
              onClick={() => fetchQuotes()}
              className="mt-2 px-3 py-1 text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </FadeIn>
      )}

      {/* Sold Quotes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-x-auto"
        style={{ minWidth: '950px' }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-night-700">
            <thead className="bg-gray-50 dark:bg-night-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('companyName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    {getSortIcon('companyName')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('transperraRep')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Transperra Rep</span>
                    {getSortIcon('transperraRep')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('ichraEffectiveDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Effective Date</span>
                    {getSortIcon('ichraEffectiveDate')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('pepm')}
                >
                  <div className="flex items-center space-x-1">
                    <span>PEPM</span>
                    {getSortIcon('pepm')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('brokerName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Broker</span>
                    {getSortIcon('brokerName')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('employerName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Employer</span>
                    {getSortIcon('employerName')}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-night-800 divide-y divide-gray-200 dark:divide-night-700">
              {filteredAndSortedQuotes.length > 0 ? (
                filteredAndSortedQuotes.map((quote, index) => (
                <motion.tr 
                  key={quote.s3Key} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.3 }}
                  className="hover:bg-gray-50 dark:hover:bg-night-700 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/quotes/${quote.submissionId}?brokerId=${quote.brokerId}&employerId=${quote.employerId}`}
                      className="text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400 font-medium"
                    >
                        {quote.companyName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{quote.transperraRep}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{quote.ichraEffectiveDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${quote.pepm}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{quote.brokerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{quote.employerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to={`/quotes/${quote.submissionId}?brokerId=${quote.brokerId}&employerId=${quote.employerId}`}
                          className="bg-seafoam hover:bg-seafoam-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 inline-block"
                        >
                          View
                        </Link>
                      </motion.div>
                    </div>
                  </td>
                </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-2">
                      {searchTerm ? 'No sold cases match your search criteria' : 'No sold cases available yet'}
                    </p>
                    {!searchTerm && (
                      <Link
                        to="/quotes"
                        className="text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400 font-medium"
                      >
                        Go to Quotes
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default SoldCases; 