import React from 'react';
import { Link, useParams } from 'react-router-dom';

// Mock employer data
const mockEmployer = {
  id: 'emp1',
  name: 'Acme Corporation',
  contactPerson: 'John Doe',
  email: 'john.doe@acme.com',
  phone: '(555) 123-4567',
  address: '123 Main St, Suite 100, San Francisco, CA 94105',
  employeeCount: 120,
  status: 'Active',
  industry: 'Technology',
  quotes: [
    { id: 'q1', name: 'Medical Plan 2023', amount: 280500, status: 'Approved' },
    { id: 'q2', name: 'Dental Plan 2023', amount: 48200, status: 'Pending' }
  ],
  documents: [
    { id: 'd1', title: 'Employer Application', type: 'Application Form', date: '2023-01-15' },
    { id: 'd2', title: 'Company Profile', type: 'Supporting Document', date: '2023-01-16' }
  ]
};

const EmployerDetails: React.FC = () => {
  const { employerId } = useParams<{ employerId: string }>();
  
  // In a real app, we would fetch employer details based on the ID
  // For now, we'll just use the mock data
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{mockEmployer.name}</h1>
        <div className="flex space-x-3">
          <Link
            to={`/quotes/new?employer=${employerId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            New Quote
          </Link>
          <Link
            to="/employers"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Employer details card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Employer Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Details and contact information.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockEmployer.id}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Contact person</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockEmployer.contactPerson}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockEmployer.email}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockEmployer.phone}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockEmployer.address}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Employee count</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockEmployer.employeeCount}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Industry</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mockEmployer.industry}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    mockEmployer.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {mockEmployer.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Quotes section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quotes</h3>
          <Link
            to={`/quotes/new?employer=${employerId}`}
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            New Quote
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {mockEmployer.quotes.map((quote) => (
              <li key={quote.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/quotes/${quote.id}`}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      {quote.name}
                    </Link>
                    <p className="text-sm text-gray-500">${quote.amount.toLocaleString()}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      quote.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {quote.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Documents section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Documents</h3>
          <button
            type="button"
            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Upload
          </button>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {mockEmployer.documents.map((doc) => (
              <li key={doc.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/documents/${doc.id}`}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      {doc.title}
                    </Link>
                    <p className="text-sm text-gray-500">{doc.type} • {doc.date}</p>
                  </div>
                  <button
                    type="button"
                    className="px-2 py-1 text-sm text-primary-600 hover:text-primary-900"
                  >
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployerDetails; 