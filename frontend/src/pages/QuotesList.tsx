import React from 'react';
import { Link } from 'react-router-dom';

// Mock quotes data
const mockQuotes = [
  { 
    id: 'q1', 
    employer: 'Acme Corporation', 
    employerId: 'emp1',
    name: 'Medical Plan 2023',
    effectiveDate: '2023-01-01', 
    amount: 280500, 
    status: 'Approved' 
  },
  { 
    id: 'q2', 
    employer: 'Globex Inc.', 
    employerId: 'emp2', 
    name: 'Dental Plan 2023',
    effectiveDate: '2023-02-15', 
    amount: 48200, 
    status: 'Pending' 
  },
  { 
    id: 'q3', 
    employer: 'Initech', 
    employerId: 'emp3', 
    name: 'Vision Plan 2023',
    effectiveDate: '2023-03-01', 
    amount: 32100, 
    status: 'Processing' 
  },
  { 
    id: 'q4', 
    employer: 'Stark Industries', 
    employerId: 'emp4', 
    name: 'Comprehensive Plan 2023',
    effectiveDate: '2023-04-01', 
    amount: 520000, 
    status: 'Approved' 
  },
  { 
    id: 'q5', 
    employer: 'Wayne Enterprises', 
    employerId: 'emp5', 
    name: 'Dental Plan 2023',
    effectiveDate: '2023-03-15', 
    amount: 78900, 
    status: 'Pending' 
  }
];

const QuotesList: React.FC = () => {
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
            <label htmlFor="employer" className="block text-sm font-medium text-gray-700">Employer</label>
            <select
              id="employer"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All</option>
              <option value="emp1">Acme Corporation</option>
              <option value="emp2">Globex Inc.</option>
              <option value="emp3">Initech</option>
              <option value="emp4">Stark Industries</option>
              <option value="emp5">Wayne Enterprises</option>
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
                      Quote
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Employer
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
                      Amount
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
                  {mockQuotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/quotes/${quote.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {quote.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/employers/${quote.employerId}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {quote.employer}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quote.effectiveDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${quote.amount.toLocaleString()}
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
                  ))}
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