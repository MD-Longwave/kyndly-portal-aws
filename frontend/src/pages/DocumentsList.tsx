import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Types for document data
interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  quote?: {
    id: string;
    name: string;
  };
  uploadedAt: string;
  uploadedBy: string;
}

// Icon components for document types
const FileIcon = ({ type }: { type: string }) => {
  // Different styles based on document type
  const getIconColor = () => {
    switch (type) {
      case 'PDF':
        return 'text-red-500';
      case 'Excel':
      case 'xlsx':
      case 'xls':
        return 'text-green-500';
      case 'Word':
      case 'docx':
      case 'doc':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <svg className={`mr-3 h-5 w-5 ${getIconColor()}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  );
};

const DocumentsList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by document type
    const matchesType = selectedType === '' || doc.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Upload Document
        </button>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white p-4 shadow sm:rounded-lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by document name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Document Type</label>
            <select
              id="type"
              name="type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="Word">Word</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Document list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <li key={document.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileIcon type={document.type} />
                      <p className="text-sm font-medium text-primary-600 hover:text-primary-900 truncate">
                        {document.name}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Download</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {document.quote && (
                          <Link to={`/quotes/${document.quote.id}`} className="text-primary-600 hover:text-primary-900">
                            {document.quote.name}
                          </Link>
                        )}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>{document.type} • {document.size}</p>
                      <span className="mx-1">•</span>
                      <p>Uploaded {document.uploadedAt}</p>
                      <span className="mx-1">•</span>
                      <p>By {document.uploadedBy}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 sm:px-6 text-center text-gray-500">
              No documents found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DocumentsList;