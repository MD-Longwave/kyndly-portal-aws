import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/ui/FormElements';
import { exportQuoteToCSV, exportQuoteToExcel } from '../utils/exportUtils';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/animations';

// Quote type definition based on the actual form fields
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

// Use exact API key that matches Lambda function
const API_KEY = '4ws9KDIWIW11u8mNVP0Th2bGN3GhlnnZlquHiv8b';
// Update with your new REST API Gateway endpoint
const API_URL = 'https://m88qalv4u5.execute-api.us-east-2.amazonaws.com/prod';
// API path should match what we created in the REST API
const API_PATH = '/api/quotes';

// Sorting options for quotes
type SortField = 'companyName' | 'transperraRep' | 'ichraEffectiveDate' | 'pepm' | 'status' | 'brokerName' | 'employerName';
type SortDirection = 'asc' | 'desc';

const QuotesList: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getIdToken } = useAuth();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{quote: Quote} | null>(null);
  
  // Search and sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('companyName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const fetchQuotes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      console.log('Token available:', !!token);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      };
      
      // Only add Authorization header if the token is valid
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Using API key:', API_KEY);
      console.log('Request headers:', headers);
      console.log('Making request to:', `${API_URL}${API_PATH}`);
      
      const response = await fetch(`${API_URL}${API_PATH}`, { 
        headers,
        // Add mode and credentials for better CORS support
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      // Log headers in a way that's compatible with all TypeScript targets
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);
      
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Error response:', response.status, errorText);
        console.error('Full response:', response);
        setError(`Failed to fetch quotes: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch quotes: ${err instanceof Error ? err.message : 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [getIdToken]);
  
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Handle closing export menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle individual quote export dropdowns
      const exportMenus = document.querySelectorAll('[id^="export-menu-"]');
      exportMenus.forEach(menu => {
        const menuId = menu.id;
        const quoteId = menuId.replace('export-menu-', '');
        const target = event.target as HTMLElement;
        
        if (!target.closest(`#${menuId}`) && !target.closest(`#export-button-${quoteId}`)) {
          menu.classList.add('hidden');
        }
      });
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUploadClick = (quote: Quote) => {
    setUploadTarget({ quote });
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uploadTarget || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingId(uploadTarget.quote.submissionId);
    
    try {
      const token = await getIdToken();
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Fix the URL construction to match QuoteDetails.tsx
      const url = `${API_URL}${API_PATH}/${uploadTarget.quote.submissionId}/documents?brokerId=${uploadTarget.quote.brokerId}&employerId=${uploadTarget.quote.employerId}`;
      console.log('Making upload request to:', url);
      
      // Important: Don't set Content-Type header for multipart/form-data
      // The browser will set it automatically with the correct boundary
      const headers: any = {
        'x-api-key': API_KEY
      };
      
      // Only add Authorization header if the token is valid
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        // Add mode and credentials for better CORS support
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Document uploaded successfully!');
        // Refresh the quotes list to show updated data
        fetchQuotes();
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', response.status, errorText);
        alert(`Failed to upload document: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Error uploading document.');
    } finally {
      setUploadingId(null);
      setUploadTarget(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-seafoam border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 py-8" style={{ minWidth: '1100px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-brand-gradient rounded-brand p-6 mb-8 text-white shadow-brand"
      >
        <h1 className="text-3xl font-bold mb-2">Quotes</h1>
        <p className="text-sky-100">Manage and track ICHRA quotes</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="flex justify-between items-center mb-4"
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
              placeholder="Search quotes by company, broker, rep..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent w-full bg-white dark:bg-night-800 dark:border-night-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Link to="/quotes/new">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-seafoam hover:bg-seafoam-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>New Quote</span>
            </motion.button>
          </Link>
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

      {/* Quotes table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="bg-white dark:bg-night-800 rounded-brand shadow-brand dark:shadow-dark overflow-x-auto" 
        style={{ minWidth: '1050px' }}
      >
        <div className="overflow-x-auto">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
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
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {getSortIcon('status')}
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
                      {quote.pepm}
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
                      
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          id={`export-button-${quote.submissionId}`}
                          onClick={() => {
                            const exportMenu = document.getElementById(`export-menu-${quote.submissionId}`);
                            if (exportMenu) {
                              exportMenu.classList.toggle('hidden');
                            }
                          }}
                          className="bg-seafoam hover:bg-seafoam-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Export
                        </motion.button>
                        
                        <div id={`export-menu-${quote.submissionId}`} className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 hidden">
                          <div className="py-1">
                            <motion.button
                              whileHover={{ backgroundColor: "#f3f4f6" }}
                              onClick={() => exportQuoteToCSV(quote)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              CSV
                            </motion.button>
                            <motion.button
                              whileHover={{ backgroundColor: "#f3f4f6" }}
                              onClick={() => exportQuoteToExcel(quote)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <svg className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              Excel
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`${uploadingId === quote.submissionId 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-seafoam hover:bg-seafoam-700'} 
                          text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center`}
                        onClick={() => handleUploadClick(quote)}
                        disabled={uploadingId === quote.submissionId}
                      >
                        {uploadingId === quote.submissionId ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            Upload
                          </>
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p className="mb-2">
                      {searchTerm ? 'No quotes match your search criteria' : 'No quotes available yet'}
                    </p>
                    {!searchTerm && (
                      <Link
                        to="/quotes/new"
                        className="text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400 font-medium"
                      >
                        Create your first quote
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

export default QuotesList; 