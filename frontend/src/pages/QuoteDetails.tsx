import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DocumentInfo {
  filename: string;
  s3Key: string;
  size: number;
  lastModified: string;
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Quote Details</h1>
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
                          <a
                            href={`https://${S3_BUCKET}.s3.amazonaws.com/${doc.s3Key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-seafoam hover:text-seafoam-600"
                          >
                            View
                          </a>
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