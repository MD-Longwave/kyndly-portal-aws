import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { FadeIn, SlideIn, HoverScale } from '../components/animations';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Active':
    case 'Approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'Pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'Inactive':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    case 'Rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <FadeIn>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-blue-700">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-medium text-blue-800">Dashboard Setup in Progress</h3>
          </div>
          <div className="mt-4 space-y-3">
            <p>{error}</p>
            <p className="text-sm">Your dashboard will display key metrics once the data integration is complete.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-secondary-800">Dashboard</h1>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SlideIn direction="up" delay={0.1}>
          <HoverScale>
            <Link to="/quotes" className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <DocumentTextIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-800 truncate">Total Quotes</dt>
                      <dd>
                        <div className="text-lg font-semibold text-secondary-900">{dashboardData.totalQuotes}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          </HoverScale>
        </SlideIn>

        <SlideIn direction="up" delay={0.2}>
          <HoverScale>
            <Link to="/quotes" className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <DocumentTextIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-800 truncate">Active Quotes</dt>
                      <dd>
                        <div className="text-lg font-semibold text-secondary-900">{dashboardData.activeQuotes}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          </HoverScale>
        </SlideIn>

        <SlideIn direction="up" delay={0.3}>
          <HoverScale>
            <Link to="/documents" className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <DocumentIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-800 truncate">Total Documents</dt>
                      <dd>
                        <div className="text-lg font-semibold text-secondary-900">{dashboardData.totalDocuments}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          </HoverScale>
        </SlideIn>

        <SlideIn direction="up" delay={0.4}>
          <HoverScale>
            <Link to="/documents" className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <ArrowUpTrayIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-800 truncate">Recent Uploads</dt>
                      <dd>
                        <div className="text-lg font-semibold text-secondary-900">{dashboardData.recentUploads}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          </HoverScale>
        </SlideIn>
      </div>

      <SlideIn direction="up" delay={0.5}>
        <div className="grid grid-cols-1 gap-5">
          {/* Recent Quotes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-secondary-800">Recent Quotes</h3>
              <Link to="/quotes" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            
            {dashboardData.recentQuotes && dashboardData.recentQuotes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
                {dashboardData.recentQuotes.map((quote: any, index: number) => (
                <FadeIn key={quote.id} delay={0.1 * index}>
                  <li>
                    <HoverScale scale={1.01}>
                      <Link to={`/quotes/${quote.id}`} className="block">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-secondary-800 truncate">{quote.name}</p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <StatusBadge status={quote.status} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </HoverScale>
                  </li>
                </FadeIn>
                ))}
            </ul>
            ) : (
            <div className="px-4 py-5 text-center text-sm text-secondary-500">
              No recent quotes found.
            </div>
            )}
          </div>
        </div>
      </SlideIn>

      {/* Quick Actions */}
      <SlideIn direction="up" delay={0.6}>
        <div>
          <h3 className="text-lg font-medium text-secondary-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HoverScale>
              <Link
                to="/quotes/new"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create Quote
              </Link>
            </HoverScale>
            
            <HoverScale>
              <Link
                to="/documents?action=upload"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Upload Document
              </Link>
            </HoverScale>
            
            <HoverScale>
              <Link
                to="/reports"
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ChartBarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Generate Report
              </Link>
            </HoverScale>
          </div>
        </div>
      </SlideIn>
    </div>
  );
} 