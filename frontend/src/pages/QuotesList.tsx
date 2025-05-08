import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { useAuth } from '../contexts/AuthContext';

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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <Link
          to="/quotes/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          New Quote
        </Link>
      </div>

      {/* Filters section */}
      <div className="flex justify-between items-center bg-white p-4 shadow sm:rounded-lg">
        <div className="flex space-x-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
          </div>
          <div>
            <label htmlFor="priorityLevel" className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              id="priorityLevel"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="earliest">Earliest Convenience</option>
            </select>
          </div>
        </div>
        <div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quotes table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Company
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Transperra Rep
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Effective Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      PEPM
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.length > 0 ? (
                    quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/quotes/${quote.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                            {quote.companyName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quote.transperraRep}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quote.ichraEffectiveDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${quote.pepm.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                            quote.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : quote.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/quotes/${quote.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No quotes available yet. Get started by creating a new quote.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotesList; 