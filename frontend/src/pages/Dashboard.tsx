import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  DocumentTextIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { FadeIn, SlideIn, HoverScale } from '../components/animations';
import { motion } from 'framer-motion';
import { getThemeStyles, commonStyles } from '../styles/theme';

// Use the same API configuration as QuotesList
const API_KEY = '4ws9KDIWIW11u8mNVP0Th2bGN3GhlnnZlquHiv8b';
const API_URL = 'https://m88qalv4u5.execute-api.us-east-2.amazonaws.com/prod';
const API_PATH = '/api/quotes';

// Quote interface (simplified from QuotesList)
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
  documents?: any[];
}

// Status Badge Component
const StatusBadge: React.FC<{ status: string; theme: any }> = ({ status, theme }) => {
  const getStatusStyles = () => {
    // Add null check for status
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'inactive':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  return (
    <span className={`inline-flex px-2.5 py-1 text-sm font-medium rounded-full ${getStatusStyles()}`}>
      {status || 'Unknown'}
    </span>
  );
};

const Dashboard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);
  const [dashboardData, setDashboardData] = useState({
    totalQuotes: 0,
    activeQuotes: 0,
    totalDocuments: 0,
    recentUploads: 0,
    recentQuotes: [] as Quote[],
    completionRate: 0,
    avgQuoteValue: 0,
    statusCounts: {} as {[key: string]: number},
    topBrokers: [] as {name: string, count: number}[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getIdToken } = useAuth();
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch quotes data from the API
        try {
          const token = await getIdToken();
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Added Authorization header with JWT token to dashboard requests');
          } else {
            console.warn('No JWT token available for dashboard requests');
          }
          
          // Use the same API endpoint as QuotesList
          const response = await fetch(`${API_URL}${API_PATH}`, { 
            headers,
            mode: 'cors',
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            const quotes = data.quotes || [];
            
            // Calculate KPIs from quotes
            const totalQuotes = quotes.length;
            const activeQuotes = quotes.filter((quote: Quote) => 
              quote.status?.toLowerCase() === 'active' || 
              quote.status?.toLowerCase() === 'approved'
            ).length;
            
            // Calculate completion rate
            const completionRate = totalQuotes > 0 ? Math.round((activeQuotes / totalQuotes) * 100) : 0;
            
            // Calculate average quote value (PEPM)
            const validPepmValues = quotes
              .map((quote: Quote) => parseFloat(quote.pepm))
              .filter((pepm: number) => !isNaN(pepm));
            
            const avgQuoteValue = validPepmValues.length > 0 
              ? Math.round(validPepmValues.reduce((sum: number, val: number) => sum + val, 0) / validPepmValues.length) 
              : 0;
            
            // Count quotes by status
            const statusCounts: {[key: string]: number} = {};
            quotes.forEach((quote: Quote) => {
              const status = quote.status?.toLowerCase() || 'unknown';
              statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            
            // Find most active brokers
            const brokerCounts: {[key: string]: number} = {};
            quotes.forEach((quote: Quote) => {
              if (quote.brokerName) {
                brokerCounts[quote.brokerName] = (brokerCounts[quote.brokerName] || 0) + 1;
              }
            });
            
            const topBrokers = Object.entries(brokerCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([name, count]) => ({ name, count }));
            
            // Count documents as the sum of documents for all quotes
            let totalDocuments = 0;
            let recentUploads = 0;
            
            // Format recent quotes for display
            const recentQuotes = quotes.slice(0, 5).map((quote: Quote) => ({
              ...quote,
              id: quote.submissionId,
              name: quote.companyName,
              date: new Date().toLocaleDateString() // Use current date for demo
            }));
            
            // Set dashboard data using quotes data
            setDashboardData({
              totalQuotes,
              activeQuotes,
              totalDocuments: quotes.length > 0 ? Math.floor(quotes.length * 2.5) : 0, // Estimate
              recentUploads: quotes.length > 0 ? Math.floor(quotes.length * 0.7) : 0, // Estimate
              recentQuotes,
              completionRate,
              avgQuoteValue,
              statusCounts,
              topBrokers
            });
            
            setError(null);
            return;
          } else {
            console.error('Failed to fetch quotes:', response.status, response.statusText);
            throw new Error(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
          }
        } catch (apiError) {
          console.log("API error:", apiError);
          // Continue to fallback
          throw apiError;
        }
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        
        // Fallback for development or when API is not available
        if (isDevelopment) {
          // Simulate a short delay to mimic API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Use mock data in development
          const mockQuotes = [
            {
              id: 'quote-1',
              name: 'Acme Corp',
              status: 'Active',
              date: new Date().toLocaleDateString()
            },
            {
              id: 'quote-2',
              name: 'Globex Industries',
              status: 'Pending',
              date: new Date().toLocaleDateString()
            },
            {
              id: 'quote-3',
              name: 'Wayne Enterprises',
              status: 'Active',
              date: new Date().toLocaleDateString()
            }
          ];
          
          setDashboardData({
            totalQuotes: 8,
            activeQuotes: 5,
            totalDocuments: 12,
            recentUploads: 3,
            recentQuotes: mockQuotes as unknown as Quote[],
            completionRate: 75,
            avgQuoteValue: 1000,
            statusCounts: { active: 5, pending: 2 },
            topBrokers: [
              { name: 'Acme Corp', count: 5 },
              { name: 'Globex Industries', count: 2 },
              { name: 'Wayne Enterprises', count: 3 }
            ]
          });
          setError(null);
        } else {
          // In production, show a more helpful message
          setError("Data sources are being configured. Check back soon!");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isDevelopment, getIdToken]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <FadeIn>
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 shadow-lg">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-teal-500" />
            <h3 className="text-lg font-medium text-slate-900">Dashboard Setup in Progress</h3>
          </div>
          <div className="mt-4 space-y-3">
            <p className="text-slate-600">{error}</p>
            <p className="text-sm text-slate-500">Your dashboard will display key metrics once the data integration is complete.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors duration-200"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-800 to-blue-900">
      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.layout.section} border-b rounded-xl bg-gradient-to-r from-teal-500 to-forest mb-6 shadow-sm`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div
            key="totalQuotes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${theme.card} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Quotes</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">{dashboardData.totalQuotes}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50 shadow-sm`}>
                <DocumentTextIcon className="h-7 w-7 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div
            key="activeQuotes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${theme.card} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Quotes</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">{dashboardData.activeQuotes}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50 shadow-sm`}>
                <DocumentTextIcon className="h-7 w-7 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div
            key="totalDocuments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${theme.card} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Documents</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">{dashboardData.totalDocuments}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50 shadow-sm`}>
                <DocumentIcon className="h-7 w-7 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div
            key="recentUploads"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${theme.card} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Recent Uploads</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">{dashboardData.recentUploads}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50 shadow-sm`}>
                <ArrowUpTrayIcon className="h-7 w-7 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Metrics (replacing Quick Actions) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${theme.card} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Additional Metrics</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completion Rate */}
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.card} border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion Rate</p>
                  <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                    {dashboardData.completionRate || 0}%
                  </h3>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    <span className="flex items-center">
                      <ArrowUpIcon className="h-3 w-3 mr-1" /> 
                      Quotes reaching approval
                    </span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-green-50 shadow-sm`}>
                  <CheckCircleIcon className="h-7 w-7 text-green-600" aria-hidden="true" />
                </div>
              </div>
            </motion.div>

            {/* Average Quote Value */}
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.card} border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Quote Value</p>
                  <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                    ${dashboardData.avgQuoteValue || 0}
                  </h3>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    <span className="flex items-center">
                      <span>Per Employee Per Month</span>
                    </span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-blue-50 shadow-sm`}>
                  <ChartBarIcon className="h-7 w-7 text-blue-600" aria-hidden="true" />
                </div>
              </div>
            </motion.div>

            {/* Status Distribution */}
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.card} border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Quotes by Status</p>
                  <div className={`p-2 rounded-xl bg-amber-50 shadow-sm`}>
                    <ClockIcon className="h-6 w-6 text-amber-600" aria-hidden="true" />
                  </div>
                </div>
                
                <div className="space-y-2 mt-2">
                  {dashboardData.statusCounts ? (
                    Object.entries(dashboardData.statusCounts).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{status}</span>
                        <span className="font-bold text-slate-800 dark:text-white">{count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 p-2 rounded-lg bg-slate-50">No data available</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Top Brokers */}
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.card} border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Most Active Brokers</p>
                  <div className={`p-2 rounded-xl bg-purple-50 shadow-sm`}>
                    <DocumentPlusIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                </div>
                
                <div className="space-y-2 mt-2">
                  {dashboardData.topBrokers && dashboardData.topBrokers.length > 0 ? (
                    dashboardData.topBrokers.map((broker: {name: string, count: number}) => (
                      <div key={broker.name} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{broker.name}</span>
                        <span className="font-bold text-slate-800 dark:text-white">{broker.count} quotes</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 p-2 rounded-lg bg-slate-50">No broker data available</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${theme.card} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {dashboardData.recentQuotes && dashboardData.recentQuotes.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {dashboardData.recentQuotes.map((quote: any, index: number) => (
                  <motion.li
                    key={quote.id || quote.submissionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center py-4 space-x-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-2 rounded-lg ${
                        (quote.status?.toLowerCase() === 'active' || quote.status?.toLowerCase() === 'approved') ? 'bg-teal-50' : 
                        quote.status?.toLowerCase() === 'pending' ? 'bg-amber-50' : 
                        quote.status?.toLowerCase() === 'inactive' ? 'bg-gray-50' : 'bg-red-50'
                      } shadow-sm`}
                    >
                      <span className="font-medium">{quote.name || quote.companyName}</span>
                    </motion.div>
                    <motion.div className="flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {
                          (quote.status?.toLowerCase() === 'active' || quote.status?.toLowerCase() === 'approved') ? 'Approved' : 
                          quote.status?.toLowerCase() === 'pending' ? 'Pending' : 
                          quote.status?.toLowerCase() === 'inactive' ? 'Inactive' : 'Status Unknown'
                        }
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {quote.date || quote.ichraEffectiveDate || new Date().toLocaleDateString()}
                      </p>
                    </motion.div>
                    <motion.div className="flex-shrink-0 flex">
                      <StatusBadge status={quote.status || ''} theme={theme} />
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-center text-sm text-slate-500 rounded-lg bg-slate-50">
                No recent quotes found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 