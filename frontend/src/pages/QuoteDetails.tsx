import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { exportQuoteToCSV, exportQuoteToExcel } from '../utils/exportUtils';

interface DocumentInfo {
  filename: string;
  s3Key: string;
  size: number;
  lastModified: string;
  downloadUrl: string;
  isPdf?: boolean;
}

interface QuoteDetailsData {
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
  [key: string]: any;
  documents?: DocumentInfo[];
}

const API_KEY = '4ws9KDIWIW11u8mNVP0Th2bGN3GhlnnZlquHiv8b';
// Update with your new REST API Gateway endpoint
const API_URL = 'https://m88qalv4u5.execute-api.us-east-2.amazonaws.com/prod';
// API path prefix should match what we created in the REST API
const API_PATH_PREFIX = '/api/quotes';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const query = useQuery();
  const brokerId = query.get('brokerId') || '';
  const employerId = query.get('employerId') || '';
  const { getIdToken } = useAuth();
  const [quote, setQuote] = useState<QuoteDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setIsLoading(true);
        const token = await getIdToken();
        
        // Don't trim the token - this might be causing the format issue
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        };
        
        // Only add Authorization header if the token is valid
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('Token length:', token.length);
          console.log('Token first 15 chars:', token.substring(0, 15) + '...');
        }
        
        console.log('Making request to:', `${API_URL}${API_PATH_PREFIX}/${id}?brokerId=${brokerId}&employerId=${employerId}`);
        
        const response = await fetch(`${API_URL}${API_PATH_PREFIX}/${id}?brokerId=${brokerId}&employerId=${employerId}`, { 
          headers,
          // Add mode and credentials for better CORS support
          mode: 'cors',
          credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        
        // Log headers for debugging
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        console.log('Response headers:', responseHeaders);
        
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
          setError(null);
        } else {
          const errorText = await response.text();
          console.error('Error response:', response.status, errorText);
          setError(`Failed to fetch quote details: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to fetch quote details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchQuote();
  }, [id, brokerId, employerId, getIdToken]);

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!quote || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const token = await getIdToken();
      
      const formData = new FormData();
      formData.append('file', file);
      const url = `${API_URL}${API_PATH_PREFIX}/${quote.submissionId}/documents?brokerId=${quote.brokerId}&employerId=${quote.employerId}`;
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
      
      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        alert('Document uploaded successfully!');
        // Refresh quote details to show new document
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', response.status, errorText);
        alert(`Failed to upload document: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading document.');
    } finally {
      setUploading(false);
    }
  };

  // Function to handle exporting the quote to CSV
  const handleExportToCsv = () => {
    if (quote) {
      exportQuoteToCSV(quote);
      setShowExportMenu(false);
    }
  };

  // Function to handle exporting the quote to Excel
  const handleExportToExcel = () => {
    if (quote) {
      exportQuoteToExcel(quote);
      setShowExportMenu(false);
    }
  };

  // Close the export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('#export-menu') && !target.closest('#export-button')) {
          setShowExportMenu(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <div className="bg-brand-gradient rounded-brand p-6 mb-8 text-white shadow-brand">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quote Details</h1>
            <p className="text-sky-100">View and manage quote information</p>
          </div>
          {quote && (
            <div className="relative">
              <button 
                id="export-button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="bg-white hover:bg-gray-100 text-seafoam font-medium px-4 py-2 rounded-md text-sm transition-colors duration-200 flex items-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export Quote
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showExportMenu && (
                <div 
                  id="export-menu"
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                >
                  <div className="py-1">
                    <button
                      onClick={handleExportToCsv}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Export as CSV
                    </button>
                    <button
                      onClick={handleExportToExcel}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Export as Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-seafoam border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">{error}</div>
      ) : quote ? (
        <div className="space-y-6">
          {/* Basic Quote Info Card */}
          <div className="bg-white rounded-brand shadow-brand overflow-hidden p-6">
            <h2 className="text-xl font-semibold mb-4 text-seafoam">Quote Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p className="text-lg font-medium">{quote.companyName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ICHRA Effective Date</h3>
                  <p className="text-lg">{quote.ichraEffectiveDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">PEPM</h3>
                  <p className="text-lg">${quote.pepm}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Funding Strategy</h3>
                  <p className="text-lg">{quote.currentFundingStrategy || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Transperra Rep</h3>
                  <p className="text-lg">{quote.transperraRep}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p>
                    <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                      quote.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : quote.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {quote.status || 'New'}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission ID</h3>
                  <p className="text-xs font-mono bg-gray-100 py-1 px-2 rounded inline-block">{quote.submissionId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                  <p className="text-lg">{new Date(quote.submissionDate || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan & Company Details */}
          <div className="bg-white rounded-brand shadow-brand overflow-hidden p-6">
            <h2 className="text-xl font-semibold mb-4 text-seafoam">Plan Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Target Deductible</h3>
                  <p className="text-lg">{quote.targetDeductible ? `$${quote.targetDeductible}` : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Target HSA</h3>
                  <p className="text-lg">{quote.targetHSA || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Is GLI</h3>
                  <p className="text-lg">{quote.isGLI ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority Level</h3>
                  <p className="text-lg capitalize">{quote.priorityLevel || 'Standard'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Type</h3>
                  <p className="text-lg">{quote.contactType || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
                  <p className="text-lg italic">{quote.additionalNotes || 'No additional notes'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Broker & Employer Info */}
          <div className="bg-white rounded-brand shadow-brand overflow-hidden p-6">
            <h2 className="text-xl font-semibold mb-4 text-seafoam">Broker & Employer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Broker Name</h3>
                  <p className="text-lg">{quote.brokerName || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Broker Email</h3>
                  <p className="text-lg">
                    {quote.brokerEmail ? (
                      <a href={`mailto:${quote.brokerEmail}`} className="text-seafoam hover:underline">
                        {quote.brokerEmail}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Broker ID</h3>
                  <p className="text-sm font-mono bg-gray-100 py-1 px-2 rounded inline-block">{quote.brokerId}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employer Name</h3>
                  <p className="text-lg">{quote.employerName || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employer ID</h3>
                  <p className="text-sm font-mono bg-gray-100 py-1 px-2 rounded inline-block">{quote.employerId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">TPA ID</h3>
                  <p className="text-sm font-mono bg-gray-100 py-1 px-2 rounded inline-block">{quote.tpaId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-brand shadow-brand overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-seafoam">Documents</h2>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-300 flex items-center gap-2"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
            
            {quote.documents && quote.documents.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quote.documents.map((doc) => (
                      <tr key={doc.s3Key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.filename}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(doc.size / 1024).toFixed(1)} KB</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.lastModified).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <a
                              href={doc.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-seafoam hover:bg-seafoam-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              View
                            </a>
                            <a
                              href={doc.downloadUrl}
                              download
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                              onClick={(e) => {
                                // Force download by recreating the link and clicking it programmatically
                                e.preventDefault();
                                const a = document.createElement('a');
                                a.href = doc.downloadUrl;
                                a.download = doc.filename || 'document';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Download
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No documents uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">Click the upload button to add a document</p>
              </div>
            )}
          </div>

          {/* Developer Section with JSON data - can be toggled or removed */}
          <div className="bg-white rounded-brand shadow-brand overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-seafoam">Developer Data</h2>
              <button 
                onClick={() => document.getElementById('jsonData')?.classList.toggle('hidden')}
                className="text-sm text-gray-500 hover:text-seafoam"
              >
                Toggle JSON View
              </button>
            </div>
            <div id="jsonData" className="hidden">
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                {JSON.stringify(quote, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const S3_BUCKET = 'kyndly-ichra-documents';

export default QuoteDetails; 