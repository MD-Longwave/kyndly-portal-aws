import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/animations';

// API configuration - same as in other pages
const API_KEY = '4ws9KDIWIW11u8mNVP0Th2bGN3GhlnnZlquHiv8b';
const API_URL = 'https://m88qalv4u5.execute-api.us-east-2.amazonaws.com/prod';

// Types for document data
interface Document {
  documentId: string;
  name: string;
  type: string;
  size: string;
  s3Key: string;
  submissionId: string;
  companyName: string;
  brokerId: string;
  employerId: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Type for document groups (by quote)
interface DocumentGroup {
  submissionId: string;
  companyName: string;
  brokerId: string;
  employerId: string;
  documents: Document[];
}

// Icon components for document types
const FileIcon = ({ type }: { type: string }) => {
  // Different styles based on document type
  const getIconColor = () => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'text-red-500';
      case 'excel':
      case 'xlsx':
      case 'xls':
        return 'text-green-500';
      case 'word':
      case 'docx':
      case 'doc':
        return 'text-blue-500';
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <svg className={`mr-3 h-5 w-5 ${getIconColor()} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  );
};

const DocumentsList: React.FC = () => {
  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<string>('');
  const { getIdToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Fetch documents from the API
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get JWT token
      const token = await getIdToken();
      
      // Create headers with API key and Authorization
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // First fetch quotes, then for each quote fetch documents:
      const quotesResponse = await fetch(`${API_URL}/api/quotes`, { headers });
      
      if (!quotesResponse.ok) {
        if (quotesResponse.status === 404) {
          setError('No quotes found. Please create a quote first before attempting to view documents.');
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to fetch quotes: ${quotesResponse.status} ${quotesResponse.statusText}`);
      }
      
      const quotesData = await quotesResponse.json();
      let allDocuments: Document[] = [];
      
      console.log('Quotes:', quotesData);
      
      if (!quotesData) {
        throw new Error('Empty quotes response');
      }
      
      if (Array.isArray(quotesData)) {
        console.log('Quotes data is an array with length:', quotesData.length);
        for (const quote of quotesData) {
          await fetchDocumentsForQuote(quote, headers, allDocuments);
        }
      } else if (typeof quotesData === 'object') {
        console.error('Expected quotes response to be an array, but got:', typeof quotesData);
        // Try to extract quotes array if it's nested in an object
        const possibleArrays = Object.values(quotesData).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          console.log('Found array in quotes response:', possibleArrays[0]);
          const quotesArray = possibleArrays[0] as any[];
          for (const quote of quotesArray) {
            await fetchDocumentsForQuote(quote, headers, allDocuments);
          }
        } else {
          // If it's a single quote object
          if (quotesData.submissionId) {
            await fetchDocumentsForQuote(quotesData, headers, allDocuments);
          } else {
            setError('Failed to parse quotes data.');
          }
        }
      } else {
        setError('Failed to parse quotes data.');
      }
      
      // Group documents by submission ID
      const groups = groupDocumentsBySubmission(allDocuments);
      setDocumentGroups(groups);
      
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(`Failed to load documents: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to fetch documents for a single quote
  const fetchDocumentsForQuote = async (quote: any, headers: HeadersInit, allDocuments: Document[]) => {
    try {
      if (!quote || !quote.submissionId) {
        console.warn('Invalid quote object:', quote);
        return;
      }
      
      console.log(`Fetching documents for quote ${quote.submissionId}`);
      const docsResponse = await fetch(`${API_URL}/api/quotes/${quote.submissionId}/documents`, { headers });
      
      if (docsResponse.status === 404) {
        console.log(`No documents found for quote ${quote.submissionId}`);
        return; // Silently continue, this is an expected case for quotes without documents
      }
      
      if (!docsResponse.ok) {
        console.warn(`Error fetching documents for quote ${quote.submissionId}: ${docsResponse.status} ${docsResponse.statusText}`);
        return;
      }
      
      const docsData = await docsResponse.json();
      
      console.log(`Documents response for ${quote.submissionId}:`, docsData);
      
      // Handle different response formats
      if (!docsData) {
        console.log('Empty documents response');
        return;
      }
      
      if (Array.isArray(docsData)) {
        console.log('Documents data is an array with length:', docsData.length);
        if (docsData.length > 0) {
          allDocuments.push(...docsData);
        }
      } else if (docsData.documents && Array.isArray(docsData.documents)) {
        console.log('Documents data has documents array with length:', docsData.documents.length);
        if (docsData.documents.length > 0) {
          allDocuments.push(...docsData.documents);
        }
      } else if (typeof docsData === 'object') {
        console.log('Documents data is a single object');
        // Try to extract any arrays that might be present
        const possibleArrays = Object.values(docsData).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          console.log('Found array in documents response:', possibleArrays[0]);
          const documentsArray = possibleArrays[0] as Document[];
          if (documentsArray.length > 0) {
            allDocuments.push(...documentsArray);
          }
        } else {
          // Check if it's a valid document object with required fields
          if (docsData.documentId) {
            // If no arrays found, treat as a single document
            allDocuments.push(docsData as Document);
          } else {
            console.warn(`Response doesn't contain valid document data:`, docsData);
          }
        }
      } else {
        console.warn(`Unhandled documents response type: ${typeof docsData}`);
      }
    } catch (err) {
      console.warn(`Failed to fetch documents for quote ${quote?.submissionId}:`, err);
      // Continue with other quotes
    }
  };
  
  // Group documents by submission
  const groupDocumentsBySubmission = (docs: Document[]): DocumentGroup[] => {
    const groupsMap = new Map<string, DocumentGroup>();
    
    docs.forEach(doc => {
      const key = doc.submissionId;
      
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          submissionId: doc.submissionId,
          companyName: doc.companyName,
          brokerId: doc.brokerId,
          employerId: doc.employerId,
          documents: []
        });
      }
      
      groupsMap.get(key)?.documents.push(doc);
    });
    
    // Convert map to array and sort by company name
    return Array.from(groupsMap.values()).sort((a, b) => 
      a.companyName.localeCompare(b.companyName)
    );
  };
  
  // Handle document upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!selectedSubmission) {
      alert('Please select a quote to upload this document to.');
      return;
    }
    
    const file = e.target.files[0];
    setUploadLoading(true);
    
    try {
      const token = await getIdToken();
      
      // Find the selected submission details
      const selectedGroup = documentGroups.find(group => group.submissionId === selectedSubmission);
      if (!selectedGroup) {
        throw new Error('Selected quote not found');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Create the URL with the right parameters
      const url = `${API_URL}/api/quotes/${selectedSubmission}/documents?brokerId=${selectedGroup.brokerId}&employerId=${selectedGroup.employerId}`;
      
      // Important: Don't set Content-Type header for multipart/form-data
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
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Document uploaded successfully!');
        // Refresh the documents list
        fetchDocuments();
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', response.status, errorText);
        alert(`Failed to upload document: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Error uploading document.');
    } finally {
      setUploadLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle document download
  const handleDownload = async (document: Document) => {
    try {
      const token = await getIdToken();
      
      const headers: HeadersInit = {
        'x-api-key': API_KEY
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Construct URL with the document's S3 key and submission info
      const url = `${API_URL}/api/quotes/${document.submissionId}/documents/download/${document.documentId}?brokerId=${document.brokerId}&employerId=${document.employerId}`;
      
      const response = await fetch(url, {
        headers,
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create download link and trigger click
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Error downloading document.');
    }
  };
  
  // Load documents on component mount
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Filter document groups based on search and filters
  const filteredGroups = documentGroups.filter(group => {
    // If no search term or type filter, include all groups
    if (!searchTerm && !selectedType) return true;
    
    // Check if the group matches the search term
    const matchesSearch = !searchTerm || 
      group.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.submissionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if any document in the group matches the type filter
    const matchesType = !selectedType || 
      group.documents.some(doc => doc.type.toLowerCase() === selectedType.toLowerCase());
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-seafoam border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-brand-gradient rounded-brand p-6 mb-8 text-white shadow-brand"
      >
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-sky-100">Manage and access documents for your ICHRA quotes</p>
      </motion.div>
      
      {/* Search and filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="bg-white dark:bg-night-800 p-4 shadow rounded-brand mb-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent w-full bg-white dark:bg-night-800 dark:border-night-700 dark:text-white"
                placeholder="Search by company name or submission ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
            <select
              id="type"
              name="type"
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent bg-white dark:bg-night-800 dark:border-night-700 dark:text-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="Word">Word</option>
              <option value="Image">Image</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* Upload controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="bg-white dark:bg-night-800 p-4 shadow rounded-brand mb-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-full md:w-auto flex-grow max-w-xs">
            <label htmlFor="submission-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Document to Quote
            </label>
            <select
              id="submission-select"
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-seafoam focus:border-transparent bg-white dark:bg-night-800 dark:border-night-700 dark:text-white"
              value={selectedSubmission}
              onChange={(e) => setSelectedSubmission(e.target.value)}
            >
              <option value="">Select a Quote</option>
              {documentGroups.map(group => (
                <option key={group.submissionId} value={group.submissionId}>
                  {group.companyName} ({group.submissionId})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUploadClick}
              disabled={uploadLoading || !selectedSubmission}
              className={`flex items-center space-x-2 ${
                uploadLoading || !selectedSubmission
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-seafoam hover:bg-seafoam-600'
              } text-white px-4 py-2 rounded-md transition-colors duration-200`}
            >
              {uploadLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Upload Document</span>
                </>
              )}
            </motion.button>
          </div>
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
              onClick={() => fetchDocuments()}
              className="mt-2 px-3 py-1 text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </FadeIn>
      )}
      
      {/* Document groups */}
      {filteredGroups.length > 0 ? (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <motion.div
              key={group.submissionId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              className="bg-white dark:bg-night-800 shadow rounded-brand overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-night-700 bg-gray-50 dark:bg-night-700">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <Link 
                      to={`/quotes/${group.submissionId}?brokerId=${group.brokerId}&employerId=${group.employerId}`}
                      className="text-lg font-medium text-seafoam hover:text-seafoam-600 dark:text-sky dark:hover:text-sky-400"
                    >
                      {group.companyName}
                    </Link>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Submission ID: {group.submissionId}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                      {group.documents.length} document{group.documents.length !== 1 ? 's' : ''}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedSubmission(group.submissionId);
                        handleUploadClick();
                      }}
                      className="text-seafoam hover:bg-seafoam/10 p-2 rounded-full transition-colors duration-200"
                      title="Upload document to this quote"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <ul className="divide-y divide-gray-200 dark:divide-night-700">
                {group.documents.map((document) => (
                  <li key={document.documentId} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-night-700 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon type={document.type} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {document.name}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2 mt-1">
                            <span>{document.type}</span>
                            <span>•</span>
                            <span>{document.size}</span>
                            <span>•</span>
                            <span>Uploaded {new Date(document.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(document)}
                          className="text-seafoam hover:bg-seafoam/10 p-2 rounded-full transition-colors duration-200"
                          title="Download document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-night-800 shadow rounded-brand p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {searchTerm || selectedType ? 'No documents match your search' : error ? 'Error loading documents' : 'No documents found'}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || selectedType 
              ? 'Try adjusting your search criteria or clear filters to see all documents.'
              : error
              ? error
              : 'Documents may not be available for your quotes yet. Upload your first document by selecting a quote and clicking the upload button.'}
          </p>
          {(searchTerm || selectedType) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-seafoam hover:bg-seafoam-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seafoam-500"
            >
              Clear Filters
            </button>
          )}
          {error && (
            <button
              onClick={() => fetchDocuments()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-seafoam hover:bg-seafoam-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seafoam-500"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsList; 