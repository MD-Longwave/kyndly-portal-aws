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

const API_KEY = process.env.REACT_APP_API_KEY || '';

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
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
        if (API_KEY) headers['x-api-key'] = API_KEY;
        const url = `/quotes/${id}?brokerId=${brokerId}&employerId=${employerId}`;
        const response = await fetch(url, { headers });
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
          setError(null);
        } else {
          setError('Failed to fetch quote details');
        }
      } catch (err) {
        setError('Failed to fetch quote details');
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
      const url = `/quotes/${quote.submissionId}/documents?brokerId=${quote.brokerId}&employerId=${quote.employerId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {})
        } as any,
        body: formData,
      });
      if (response.ok) {
        alert('Document uploaded successfully!');
        // Refresh quote details to show new document
        window.location.reload();
      } else {
        alert('Failed to upload document.');
      }
    } catch (err) {
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
        <div className="bg-white rounded-brand shadow-brand overflow-hidden p-6">
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Company:</strong> {quote.companyName}</div>
              <div><strong>Transperra Rep:</strong> {quote.transperraRep}</div>
              <div><strong>Effective Date:</strong> {quote.ichraEffectiveDate}</div>
              <div><strong>PEPM:</strong> {quote.pepm}</div>
              <div><strong>Status:</strong> {quote.status}</div>
              <div><strong>Broker:</strong> {quote.brokerName}</div>
              <div><strong>Employer:</strong> {quote.employerName}</div>
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Documents</h2>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="text-green-600 hover:underline mb-2"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
            <ul className="list-disc pl-6">
              {quote.documents && quote.documents.length > 0 ? (
                quote.documents.map((doc) => (
                  <li key={doc.s3Key}>
                    <a
                      href={`https://${S3_BUCKET}.s3.amazonaws.com/${doc.s3Key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.filename}
                    </a>
                    <span className="ml-2 text-gray-500 text-xs">
                      ({(doc.size / 1024).toFixed(1)} KB, {new Date(doc.lastModified).toLocaleString()})
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No documents uploaded yet.</li>
              )}
            </ul>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">All Quote Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(quote, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const S3_BUCKET = 'kyndly-ichra-documents';

export default QuoteDetails; 