import React from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  DocumentTextIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  DocumentPlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Mock data for dashboard
const dashboardData = {
  totalEmployers: 27,
  totalQuotes: 158,
  activeQuotes: 42,
  totalDocuments: 87,
  recentUploads: 12,
  recentEmployers: [
    { id: 1, name: 'Acme Co.', employeeCount: 24, status: 'Active' },
    { id: 2, name: 'Globex Corporation', employeeCount: 47, status: 'Active' },
    { id: 3, name: 'Stark Industries', employeeCount: 215, status: 'Inactive' },
  ],
  recentQuotes: [
    { id: 1, name: 'Acme Co. - Gold Plan', employer: 'Acme Co.', status: 'Approved', date: '2023-12-15' },
    { id: 2, name: 'Globex - Family Plan', employer: 'Globex Corporation', status: 'Pending', date: '2023-12-10' },
    { id: 3, name: 'Stark Industries - Premium', employer: 'Stark Industries', status: 'Rejected', date: '2023-12-05' },
  ]
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Active':
    case 'Approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'Pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'Inactive':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      break;
    case 'Rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary-800">Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <Link to="/employers" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-800 truncate">Total Employers</dt>
                  <dd>
                    <div className="text-lg font-semibold text-secondary-900">{dashboardData.totalEmployers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/quotes" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-800 truncate">Total Quotes</dt>
                  <dd>
                    <div className="text-lg font-semibold text-secondary-900">{dashboardData.totalQuotes}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/quotes" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-800 truncate">Active Quotes</dt>
                  <dd>
                    <div className="text-lg font-semibold text-secondary-900">{dashboardData.activeQuotes}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/documents" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <DocumentIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-800 truncate">Total Documents</dt>
                  <dd>
                    <div className="text-lg font-semibold text-secondary-900">{dashboardData.totalDocuments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/documents" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <ArrowUpTrayIcon className="h-6 w-6 text-primary-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-800 truncate">Recent Uploads</dt>
                  <dd>
                    <div className="text-lg font-semibold text-secondary-900">{dashboardData.recentUploads}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Employers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-secondary-800">Recent Employers</h3>
            <Link to="/employers" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {dashboardData.recentEmployers.map((employer) => (
              <li key={employer.id}>
                <Link to={`/employers/${employer.id}`} className="block hover:bg-primary-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-secondary-800 truncate">{employer.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <StatusBadge status={employer.status} />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <UsersIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {employer.employeeCount} Employees
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-secondary-800">Recent Quotes</h3>
            <Link to="/quotes" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {dashboardData.recentQuotes.map((quote) => (
              <li key={quote.id}>
                <Link to={`/quotes/${quote.id}`} className="block hover:bg-primary-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-secondary-800 truncate">{quote.name}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <StatusBadge status={quote.status} />
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <UsersIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          {quote.employer}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>Created on {quote.date}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-secondary-800">Quick Actions</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/employers/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Employer
            </Link>
            <Link to="/quotes/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Create Quote
            </Link>
            <Link to="/documents" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Upload Document
            </Link>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <ChartBarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 