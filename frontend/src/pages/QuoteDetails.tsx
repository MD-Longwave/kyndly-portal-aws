import React from 'react';
import { Link, useParams } from 'react-router-dom';

// Mock quote data
const mockQuote = {
  id: 'q1',
  name: 'Medical Plan 2023',
  employer: {
    id: 'emp1',
    name: 'Acme Corporation',
    contactPerson: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '(555) 123-4567'
  },
  effectiveDate: '2023-01-01',
  expirationDate: '2023-12-31',
  planDetails: {
    provider: 'Blue Cross Blue Shield',
    planType: 'PPO',
    coverageLevel: 'Comprehensive',
    network: 'Nationwide'
  },
  monthlyCost: {
    totalAmount: 280500,
    perEmployee: 935
  },
  coverageOptions: [
    { type: 'Medical', included: true },
    { type: 'Dental', included: true },
    { type: 'Vision', included: true },
    { type: 'Life Insurance', included: false },
    { type: 'Disability', included: false }
  ],
  notes: 'This plan provides comprehensive coverage for all employees with nationwide access to healthcare providers.',
  status: 'Approved',
  createdAt: '2022-11-15',
  lastUpdated: '2022-12-01',
  documents: [
    { id: 'd1', name: 'Plan Summary.pdf', type: 'PDF', uploadedAt: '2022-11-15' },
    { id: 'd2', name: 'Rate Sheet.xlsx', type: 'Excel', uploadedAt: '2022-11-16' },
    { id: 'd3', name: 'Provider Network.pdf', type: 'PDF', uploadedAt: '2022-11-18' }
  ]
};

const QuoteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch the quote data based on the ID
  // For now, we'll just use our mock data
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{mockQuote.name}</h1>
          <p className="text-sm text-gray-500">
            Quote ID: {mockQuote.id} | Created: {mockQuote.createdAt} | Last Updated: {mockQuote.lastUpdated}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/quotes/${mockQuote.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Edit Quote
          </Link>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Generate Documents
          </button>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="inline-flex px-3 py-1 text-sm font-semibold rounded-full 
        bg-green-100 text-green-800">
        {mockQuote.status}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Quote details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Plan Details</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Provider</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.planDetails.provider}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Plan Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.planDetails.planType}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Coverage Level</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.planDetails.coverageLevel}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Network</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.planDetails.network}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Effective Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.effectiveDate}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Expiration Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.expirationDate}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Coverage Options</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {mockQuote.coverageOptions.map((option, index) => (
                  <li key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <span className={`mr-2 flex-shrink-0 h-5 w-5 rounded-full ${option.included ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <p className="text-sm font-medium text-gray-900">{option.type}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notes</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-900">{mockQuote.notes}</p>
            </div>
          </div>
        </div>
        
        {/* Right column - Employer info, cost, documents */}
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Employer Information</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link to={`/employers/${mockQuote.employer.id}`} className="text-primary-600 hover:text-primary-900">
                      {mockQuote.employer.name}
                    </Link>
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.employer.contactPerson}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.employer.email}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockQuote.employer.phone}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Cost Summary</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Monthly</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                    ${mockQuote.monthlyCost.totalAmount.toLocaleString()}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Per Employee</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${mockQuote.monthlyCost.perEmployee.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Documents</h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Upload
              </button>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {mockQuote.documents.map((doc) => (
                  <li key={doc.id} className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <svg className="mr-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-primary-600 hover:text-primary-900">
                          {doc.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {doc.uploadedAt}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetails; 