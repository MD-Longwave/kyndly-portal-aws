import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

// Status Badge Component
const StatusBadge: React.FC<{ status: string; theme: any }> = ({ status, theme }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return theme.badge.success;
      case 'pending':
        return theme.badge.warning;
      case 'inactive':
        return theme.badge.error;
      case 'rejected':
        return theme.badge.error;
      default:
        return theme.badge.info;
    }
  };

  return (
    <span className={`${commonStyles.badge.base} ${getStatusStyles()}`}>
      {status}
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
    recentQuotes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch data from API endpoints
        try {
          const quotesResponse = await fetch('/api/quotes/summary');
          const documentsResponse = await fetch('/api/documents/summary');
          
          if (quotesResponse.ok && documentsResponse.ok) {
            const quotes = await quotesResponse.json();
            const documents = await documentsResponse.json();
            
            setDashboardData({
              totalQuotes: quotes.totalQuotes || 0,
              activeQuotes: quotes.activeQuotes || 0,
              totalDocuments: documents.totalDocuments || 0,
              recentUploads: documents.recentUploads || 0,
              recentQuotes: quotes.recentQuotes || []
            });
            
            setError(null);
            return;
          }
        } catch (apiError) {
          console.log("API endpoints not available yet:", apiError);
          // Continue to fallback
        }
        
        // Fallback for development or when API is not available
        if (isDevelopment) {
          // Simulate a short delay to mimic API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Use empty data but don't show error
          setDashboardData({
            totalQuotes: 0,
            activeQuotes: 0,
            totalDocuments: 0,
            recentUploads: 0,
            recentQuotes: []
          });
          setError(null);
        } else {
          // In production, show a more helpful message
          setError("Data sources are being configured. Check back soon!");
        }
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("We're setting up your dashboard. Please check back soon.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isDevelopment]);

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
    <div className={`min-h-screen ${theme.layout.container}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.layout.section} border-b`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className={theme.typography.h1}>Dashboard</h1>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 ${theme.input} w-64`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className={`p-2 ${theme.button.secondary} rounded-full`}>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                JD
              </div>
              <span className={theme.typography.body}>John Doe</span>
              <ChevronDownIcon className="h-5 w-5 text-slate-400" />
            </div>
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
            className={`${theme.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={theme.typography.caption}>Total Quotes</p>
                <h3 className={`mt-2 ${theme.typography.h2}`}>{dashboardData.totalQuotes}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50`}>
                <DocumentTextIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div
            key="activeQuotes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${theme.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={theme.typography.caption}>Active Quotes</p>
                <h3 className={`mt-2 ${theme.typography.h2}`}>{dashboardData.activeQuotes}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50`}>
                <DocumentTextIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div
            key="totalDocuments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${theme.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={theme.typography.caption}>Total Documents</p>
                <h3 className={`mt-2 ${theme.typography.h2}`}>{dashboardData.totalDocuments}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50`}>
                <DocumentIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>

          <motion.div
            key="recentUploads"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${theme.card} p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={theme.typography.caption}>Recent Uploads</p>
                <h3 className={`mt-2 ${theme.typography.h2}`}>{dashboardData.recentUploads}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-teal-50`}>
                <ArrowUpTrayIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${theme.card} p-6`}
        >
          <h2 className={theme.typography.h2}>Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {dashboardData.recentQuotes && dashboardData.recentQuotes.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {dashboardData.recentQuotes.map((quote: any, index: number) => (
                  <motion.li
                    key={quote.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-2 rounded-lg ${quote.status === 'Active' ? 'bg-teal-50' : quote.status === 'Pending' ? 'bg-amber-50' : quote.status === 'Inactive' ? 'bg-gray-50' : 'bg-red-50'}`}
                    >
                      {quote.name}
                    </motion.div>
                    <motion.div className="flex-1">
                      <p className={theme.typography.body}>{quote.status === 'Active' ? 'Approved' : quote.status === 'Pending' ? 'Pending' : quote.status === 'Inactive' ? 'Inactive' : 'Rejected'}</p>
                      <p className={theme.typography.caption}>{quote.date}</p>
                    </motion.div>
                    <motion.div className="flex-shrink-0 flex">
                      <StatusBadge status={quote.status} theme={theme} />
                    </motion.div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-center text-sm text-slate-500">
                No recent quotes found.
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${theme.card} p-6`}
        >
          <h2 className={theme.typography.h2}>Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.button.primary} p-4 flex flex-col items-center space-y-2`}
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">Create Quote</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.button.primary} p-4 flex flex-col items-center space-y-2`}
            >
              <ArrowUpTrayIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">Upload Document</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.button.primary} p-4 flex flex-col items-center space-y-2`}
            >
              <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm font-medium">Generate Report</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 