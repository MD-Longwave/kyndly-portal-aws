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
  downloadUrl?: string;
  filename?: string;
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
  // Ensure type is a string and has a value before calling toLowerCase
  const fileType = (type || 'unknown').toLowerCase();
  
  // Render different icons based on file type
  if (fileType === 'pdf') {
    return (
      <svg className="mr-3 h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 384 512">
        <path d="M320 464C328.8 464 336 456.8 336 448V416H384V448C384 483.3 355.3 512 320 512H64C28.65 512 0 483.3 0 448V416H48V448C48 456.8 55.16 464 64 464H320zM256 160C238.3 160 224 145.7 224 128V48H64C55.16 48 48 55.16 48 64V192H0V64C0 28.65 28.65 0 64 0H229.5C246.5 0 262.7 6.743 274.7 18.75L365.3 109.3C377.3 121.3 384 137.5 384 154.5V192H336V160H256zM88 224C118.9 224 144 249.1 144 280C144 310.9 118.9 336 88 336H80V368H88C136.6 368 176 328.6 176 280C176 231.4 136.6 192 88 192H56C42.75 192 32 202.8 32 216V408C32 421.3 42.75 432 56 432H88C101.3 432 112 421.3 112 408V392C112 378.7 101.3 368 88 368V336C101.3 336 112 325.3 112 312V296C112 282.7 101.3 272 88 272H80V224H88zM280 224H288C301.3 224 312 213.3 312 200V184C312 170.7 301.3 160 288 160H280C266.7 160 256 170.7 256 184V200C256 213.3 266.7 224 280 224zM352 376C352 362.7 341.3 352 328 352H320C306.7 352 296 362.7 296 376V392C296 405.3 306.7 416 320 416H328C341.3 416 352 405.3 352 392V376zM328 320C354.5 320 376 341.5 376 368V400C376 426.5 354.5 448 328 448H320C293.5 448 272 426.5 272 400V368C272 341.5 293.5 320 320 320H328zM280 256H288C314.5 256 336 277.5 336 304V336C336 362.5 314.5 384 288 384H280C253.5 384 232 362.5 232 336V304C232 277.5 253.5 256 280 256z" />
      </svg>
    );
  } else if (fileType === 'excel' || fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
    return (
      <svg className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 384 512">
        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM155.7 250.2L192 302.1l36.3-51.9c7.6-10.9 22.6-13.5 33.4-5.9s13.5 22.6 5.9 33.4L221.3 344l46.4 66.2c7.6 10.9 5 25.8-5.9 33.4s-25.8 5-33.4-5.9L192 385.8l-36.3 51.9c-7.6 10.9-22.6 13.5-33.4 5.9s-13.5-22.6-5.9-33.4L162.7 344l-46.4-66.2c-7.6-10.9-5-25.8 5.9-33.4s25.8-5 33.4 5.9z"/>
      </svg>
    );
  } else if (fileType === 'word' || fileType === 'docx' || fileType === 'doc') {
    return (
      <svg className="mr-3 h-5 w-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 384 512">
        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM111 257.1l26.8 89.2 31.6-90.3c3.4-9.6 12.5-16.1 22.7-16.1s19.3 6.4 22.7 16.1l31.6 90.3L273 257.1c3.8-12.7 17.2-19.9 29.9-16.1s19.9 17.2 16.1 29.9l-48 160c-3 10-12.1 16.9-22.4 17.1S231.7 442 228.1 432.5L192 338.7l-36.1 93.8c-3.5 9.4-12.6 15.7-22.8 16S117.3 443 114 433L66 271c-3.8-12.7 3.4-26.1 16.1-29.9s26.1 3.4 29.9 16.1z"/>
      </svg>
    );
  } else if (fileType === 'image' || fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif') {
    return (
      <svg className="mr-3 h-5 w-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 512 512">
        <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h336c8.9 0 17.1-4.9 21.5-12.8s3.6-17.4-1.4-24.7l-120.3-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
      </svg>
    );
  } else {
    return (
      <svg className="mr-3 h-5 w-5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 384 512">
        <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128z"/>
      </svg>
    );
  }
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
      
      let quotesArray: any[] = [];
      
      // Handle the response structure correctly
      if (Array.isArray(quotesData)) {
        console.log('Quotes data is an array with length:', quotesData.length);
        quotesArray = quotesData;
      } else if (quotesData.quotes && Array.isArray(quotesData.quotes)) {
        console.log('Found quotes array in response with length:', quotesData.quotes.length);
        quotesArray = quotesData.quotes;
      } else if (typeof quotesData === 'object') {
        console.log('Expected quotes response to be an array, but got:', typeof quotesData);
        // Try to extract quotes array if it's nested in an object
        const possibleArrays = Object.values(quotesData).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          console.log('Found array in quotes response:', possibleArrays[0]);
          quotesArray = possibleArrays[0] as any[];
        } else {
          // If it's a single quote object
          if (quotesData.submissionId) {
            quotesArray = [quotesData];
          } else {
            setError('Failed to parse quotes data.');
          }
        }
      } else {
        setError('Failed to parse quotes data.');
      }
      
      // Process all the quotes
      for (const quote of quotesArray) {
        await fetchDocumentsForQuote(quote, headers, allDocuments);
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
      
      // First try the direct path from the QuoteDetails page
      const quotePath = `${API_URL}/api/quotes/${quote.submissionId}?brokerId=${quote.brokerId || ''}&employerId=${quote.employerId || ''}`;
      console.log(`Trying to load quote data path: ${quotePath}`);
      
      try {
        const quoteResponse = await fetch(quotePath, { headers });
        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          console.log('Found document data in quote:', quoteData);
          
          // Check if documents are directly in the quoteData
          if (quoteData.documents && Array.isArray(quoteData.documents)) {
            console.log(`Found ${quoteData.documents.length} documents in quote data`);
            
            const processedDocs = quoteData.documents.map((doc: any) => {
              // Ensure each document has the submission ID and other required metadata
              return {
                ...doc,
                submissionId: quote.submissionId,
                brokerId: quote.brokerId || doc.brokerId,
                employerId: quote.employerId || doc.employerId,
                companyName: quote.companyName || doc.companyName || ''
              };
            });
            
            allDocuments.push(...processedDocs);
            return; // Early return if documents were found in quote data
          }
        }
      } catch (err) {
        console.warn(`Error fetching quote data for ${quote.submissionId}:`, err);
        // Continue with other methods even if this fails
      }
      
      // Then try regular documents path
      await fetchFromPath(`${API_URL}/api/quotes/${quote.submissionId}/documents`, headers, allDocuments, quote);
      
      // Also try looking for documents in the TPA/Broker/Employer structure
      // Get the broker and employer IDs from the quote if available
      const brokerId = quote.brokerId || '';
      const employerId = quote.employerId || '';
      
      if (brokerId && employerId) {
        const tpaPath = `${API_URL}/api/tpa/brokers/${brokerId}/employers/${employerId}/submissions/${quote.submissionId}/documents`;
        console.log(`Trying TPA path: ${tpaPath}`);
        await fetchFromPath(tpaPath, headers, allDocuments, quote);
      }
      
      console.log("All document fetching attempts completed");
      
    } catch (err) {
      console.warn(`Failed to fetch documents for quote ${quote?.submissionId}:`, err);
      // Continue with other quotes
    }
  };
  
  // Helper function to fetch documents from a specific path
  const fetchFromPath = async (url: string, headers: HeadersInit, allDocuments: Document[], quote: any) => {
    try {
      console.log(`Trying to fetch documents from path: ${url}`);
      const docsResponse = await fetch(url, { headers });
      
      if (docsResponse.status === 404) {
        console.log(`No documents found at ${url}`);
        return; // Silently continue, this is an expected case for paths without documents
      }
      
      if (!docsResponse.ok) {
        console.warn(`Error fetching documents from ${url}: ${docsResponse.status} ${docsResponse.statusText}`);
        return;
      }
      
      const docsData = await docsResponse.json();
      
      console.log(`Documents response from ${url}:`, docsData);
      
      // Handle different response formats
      if (!docsData) {
        console.log('Empty documents response');
        return;
      }
      
      if (Array.isArray(docsData)) {
        console.log('Documents data is an array with length:', docsData.length);
        if (docsData.length > 0) {
          const processedDocs = docsData.map((doc: any) => {
            // Ensure each document has required properties to prevent undefined errors
            return {
              ...doc,
              submissionId: doc.submissionId || quote?.submissionId || '',
              companyName: doc.companyName || quote?.companyName || '',
              documentId: doc.documentId || doc.id || `doc-${Math.random().toString(36).substring(2, 9)}`,
              name: doc.filename || doc.name || 'Unnamed Document',
              filename: doc.filename || doc.name || 'Unnamed Document',
              type: (doc.type || getFileTypeFromName(doc.filename || doc.name || '')).toString(),
              size: doc.size || '0 KB',
              downloadUrl: doc.downloadUrl || doc.url || '',
            };
          });
          allDocuments.push(...processedDocs);
        }
      } else if (docsData.documents && Array.isArray(docsData.documents)) {
        console.log('Documents data has documents array with length:', docsData.documents.length);
        if (docsData.documents.length > 0) {
          const processedDocs = docsData.documents.map((doc: any) => {
            // Ensure each document has required properties to prevent undefined errors
            return {
              ...doc,
              submissionId: doc.submissionId || quote?.submissionId || '',
              companyName: doc.companyName || quote?.companyName || '',
              documentId: doc.documentId || doc.id || `doc-${Math.random().toString(36).substring(2, 9)}`,
              name: doc.filename || doc.name || 'Unnamed Document',
              filename: doc.filename || doc.name || 'Unnamed Document',
              type: (doc.type || getFileTypeFromName(doc.filename || doc.name || '')).toString(),
              size: doc.size || '0 KB',
              downloadUrl: doc.downloadUrl || doc.url || '',
            };
          });
          allDocuments.push(...processedDocs);
        }
      } else if (typeof docsData === 'object') {
        console.log('Documents data is a single object');
        // Try to extract any arrays that might be present
        const possibleArrays = Object.values(docsData).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          console.log('Found array in documents response:', possibleArrays[0]);
          const documentsArray = possibleArrays[0] as any[];
          if (documentsArray.length > 0) {
            const processedDocs = documentsArray.map((doc: any) => {
              // Ensure each document has required properties to prevent undefined errors
              return {
                ...doc,
                submissionId: doc.submissionId || quote?.submissionId || '',
                companyName: doc.companyName || quote?.companyName || '',
                documentId: doc.documentId || doc.id || `doc-${Math.random().toString(36).substring(2, 9)}`,
                name: doc.filename || doc.name || 'Unnamed Document',
                filename: doc.filename || doc.name || 'Unnamed Document',
                type: (doc.type || getFileTypeFromName(doc.filename || doc.name || '')).toString(),
                size: doc.size || '0 KB',
                downloadUrl: doc.downloadUrl || doc.url || '',
              };
            });
            allDocuments.push(...processedDocs);
          }
        } else {
          // Check if it's a valid document object with required fields
          if (docsData.documentId || docsData.id) {
            // Ensure the document has required properties to prevent undefined errors
            const processedDoc = {
              ...docsData,
              submissionId: docsData.submissionId || quote?.submissionId || '',
              companyName: docsData.companyName || quote?.companyName || '',
              documentId: docsData.documentId || docsData.id || `doc-${Math.random().toString(36).substring(2, 9)}`,
              name: docsData.filename || docsData.name || 'Unnamed Document',
              filename: docsData.filename || docsData.name || 'Unnamed Document',
              type: (docsData.type || getFileTypeFromName(docsData.filename || docsData.name || '')).toString(),
              size: docsData.size || '0 KB',
              downloadUrl: docsData.downloadUrl || docsData.url || '',
            };
            allDocuments.push(processedDoc as Document);
          } else {
            console.warn(`Response doesn't contain valid document data:`, docsData);
          }
        }
      } else {
        console.warn(`Unhandled documents response type: ${typeof docsData}`);
      }
    } catch (err) {
      console.warn(`Failed to fetch documents from ${url}:`, err);
    }
  };
  
  // Helper function to determine file type from filename
  const getFileTypeFromName = (filename: string): string => {
    if (!filename) return 'unknown';
    
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word';
      case 'xls':
      case 'xlsx':
      case 'csv':
        return 'Excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      default:
        return extension.toUpperCase() || 'Unknown';
    }
  };
  
  // Group documents by submission
  const groupDocumentsBySubmission = (docs: Document[]): DocumentGroup[] => {
    const groupsMap = new Map<string, DocumentGroup>();
    
    docs.forEach(doc => {
      // Skip documents without required fields
      if (!doc.submissionId) {
        console.warn('Document missing submissionId:', doc);
        return;
      }
      
      const key = doc.submissionId;
      
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          submissionId: doc.submissionId,
          companyName: doc.companyName || 'Unknown Company',
          brokerId: doc.brokerId || '',
          employerId: doc.employerId || '',
          documents: []
        });
      }
      
      groupsMap.get(key)?.documents.push(doc);
    });
    
    // Convert map to array and sort by company name
    return Array.from(groupsMap.values()).sort((a, b) => 
      (a.companyName || '').localeCompare(b.companyName || '')
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
      if (document.downloadUrl) {
        // If we already have a download URL, use it directly
        window.open(document.downloadUrl, '_blank');
        return;
      }
      
      const token = await getIdToken();
      
      const headers: HeadersInit = {
        'x-api-key': API_KEY
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Try downloading using different possible URL patterns
      let response: Response | null = null;
      let downloadUrl = '';
      
      // First try the regular documents path
      downloadUrl = `${API_URL}/api/quotes/${document.submissionId}/documents/download/${document.documentId}`;
      if (document.brokerId && document.employerId) {
        downloadUrl += `?brokerId=${document.brokerId}&employerId=${document.employerId}`;
      }
      
      console.log(`Attempting to download from: ${downloadUrl}`);
      response = await fetch(downloadUrl, { headers });
      
      // If that fails, try the TPA path
      if (!response.ok && document.brokerId && document.employerId) {
        downloadUrl = `${API_URL}/api/tpa/brokers/${document.brokerId}/employers/${document.employerId}/submissions/${document.submissionId}/documents/download/${document.documentId}`;
        console.log(`First attempt failed. Trying TPA path: ${downloadUrl}`);
        response = await fetch(downloadUrl, { headers });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create download link and trigger click
      const blobUrl = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = blobUrl;
      a.download = document.name || document.filename || 'document';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Error downloading document. ' + (err instanceof Error ? err.message : ''));
    }
  };
  
  // Handle document view
  const handleView = (document: Document) => {
    try {
      if (document.downloadUrl) {
        window.open(document.downloadUrl, '_blank');
        return;
      }
      
      // If no direct download URL, use same path as download but open in new tab
      const viewUrl = `${API_URL}/api/quotes/${document.submissionId}/documents/download/${document.documentId}`;
      if (document.brokerId && document.employerId) {
        window.open(`${viewUrl}?brokerId=${document.brokerId}&employerId=${document.employerId}`, '_blank');
      } else {
        window.open(viewUrl, '_blank');
      }
    } catch (err) {
      console.error('Error viewing document:', err);
      alert('Error viewing document. ' + (err instanceof Error ? err.message : ''));
    }
  };
  
  // Load documents on component mount
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Load available document types from documents
  const getAvailableDocumentTypes = (): string[] => {
    const typesSet = new Set<string>();
    
    documentGroups.forEach(group => {
      group.documents.forEach(doc => {
        if (doc.type) {
          typesSet.add(doc.type);
        }
      });
    });
    
    return Array.from(typesSet).sort();
  };
  
  // Filter document groups based on search and filters
  const filteredGroups = documentGroups.filter(group => {
    // If no search term or type filter, include all groups
    if (!searchTerm && !selectedType) return true;
    
    // Check if the group matches the search term
    const matchesSearch = !searchTerm || 
      (group.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.submissionId || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if any document in the group matches the type filter
    const matchesType = !selectedType || 
      group.documents.some(doc => {
        const docType = (doc.type || 'unknown').toString().toLowerCase();
        const filterType = selectedType.toLowerCase();
        return docType === filterType;
      });
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-seafoam border-t-transparent"></div>
      </div>
    );
  }
  
  const availableDocumentTypes = getAvailableDocumentTypes();

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
              {availableDocumentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
                  <li key={document.documentId || `doc-${Math.random()}`} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-night-700 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon type={document.type || 'unknown'} />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {document.name || document.filename || 'Unnamed Document'}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2 mt-1">
                            <span>{document.type || 'Unknown Type'}</span>
                            <span>•</span>
                            <span>{document.size || 'Unknown Size'}</span>
                            <span>•</span>
                            <span>Uploaded {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString() : 'Unknown Date'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleView(document)}
                          className="text-seafoam hover:bg-seafoam/10 p-2 rounded-md transition-colors duration-200 flex items-center"
                          title="View document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-1 text-sm hidden sm:inline">View</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(document)}
                          className="text-seafoam hover:bg-seafoam/10 p-2 rounded-md transition-colors duration-200 flex items-center"
                          title="Download document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-1 text-sm hidden sm:inline">Download</span>
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