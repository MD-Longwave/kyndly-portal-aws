import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { useAuth } from '../contexts/AuthContext';
import { Select, Button } from '../components/ui/FormElements';

// Quote type definition based on the actual form fields
interface Quote {
  id: string;
  companyName: string;
  transperraRep: string;
  ichraEffectiveDate: string;
  pepm: number;
  priorityLevel: string;
  status: string;
}

const QuotesList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getIdToken } = useAuth();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from API
        try {
          // Get JWT token
          const token = await getIdToken();
          
          // Create headers with Authorization if token is available
          const headers: HeadersInit = {
            'Content-Type': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Added Authorization header with JWT token to quotes request');
          } else {
            console.warn('No JWT token available for quotes request');
          }
          
          const response = await fetch('/api/quotes', { 
            headers,
            credentials: 'include' // Include cookies and auth tokens
          });
          
          if (response.ok) {
            const data = await response.json();
            setQuotes(data);
            setError(null);
            return;
          }
        } catch (apiError) {
          console.log("API not available yet:", apiError);
          // Continue to fallback - empty data
        }
        
        // Return empty array if API not available
        setQuotes([]);
        setError(null);
      } catch (err) {
        console.error("Error fetching quotes:", err);
        setError("Failed to load quotes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuotes();
  }, [getIdToken]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-seafoam border-t-transparent"></div>
      </div>
    );
  }

  // Status options for filter
  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' }
  ];

  // Priority options for filter
  const priorityOptions = [
    { value: '', label: 'All' },
    { value: 'asap', label: 'ASAP' },
    { value: 'earliest', label: 'Earliest Convenience' }
  ];

  // Handle filter application
  const applyFilters = () => {
    // In a real implementation, this would filter the data or make an API call with filters
    console.log('Applying filters:', { status: statusFilter, priority: priorityFilter });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="bg-brand-gradient rounded-brand p-6 mb-8 text-white shadow-brand">
        <h1 className="text-3xl font-bold mb-2">Quotes</h1>
        <p className="text-sky-100">Manage and track ICHRA quotes</p>
      </div>

      <div className="flex justify-end mb-4">
        <Link to="/quotes/new">
          <Button variant="primary" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>New Quote</span>
          </Button>
        </Link>
      </div>

      {/* Filters section */}
      <div className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark p-6 mb-6">
        <h2 className="text-xl font-semibold text-night dark:text-white mb-4">Filter Quotes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Select 
              label="Status" 
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
          <div>
            <Select 
              label="Priority" 
              name="priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={priorityOptions}
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="primary" 
              type="button" 
              onClick={applyFilters}
              className="bg-seafoam hover:bg-seafoam-600 transition-colors duration-300 font-medium text-white mb-4 px-6"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-brand bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300 mb-6">
          <p className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quotes table */}
      <div className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-night-700">
            <thead className="bg-gray-50 dark:bg-night-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Transperra Rep
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Effective Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  PEPM
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-night-800 divide-y divide-gray-200 dark:divide-night-700">
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-night-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/quotes/${quote.id}`}
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
                      ${quote.pepm.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        quote.status === 'Approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : quote.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/quotes/${quote.id}`}
                      className="text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400"
                    >
                      View
                    </Link>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-2">No quotes available yet</p>
                    <Link
                      to="/quotes/new"
                      className="text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400 font-medium"
                    >
                      Create your first quote
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotesList; 