import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Mock data for employers
const mockEmployers = [
  { id: 1, name: 'Acme Corporation', employeeCount: 342, status: 'Active', industry: 'Technology' },
  { id: 2, name: 'Globex Industries', employeeCount: 127, status: 'Active', industry: 'Manufacturing' },
  { id: 3, name: 'Initech', employeeCount: 89, status: 'Inactive', industry: 'Technology' },
  { id: 4, name: 'Massive Dynamic', employeeCount: 256, status: 'Active', industry: 'Research' },
  { id: 5, name: 'Wayne Enterprises', employeeCount: 521, status: 'Active', industry: 'Conglomerate' },
  { id: 6, name: 'Umbrella Corporation', employeeCount: 234, status: 'Inactive', industry: 'Pharmaceuticals' },
  { id: 7, name: 'Stark Industries', employeeCount: 423, status: 'Active', industry: 'Technology' },
  { id: 8, name: 'Cyberdyne Systems', employeeCount: 98, status: 'Active', industry: 'Technology' },
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Active':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'Inactive':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
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

export default function EmployersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  // Extract unique industries for the filter dropdown
  const industries = Array.from(new Set(mockEmployers.map(employer => employer.industry)));

  // Filter employers based on search term and selected industry
  const filteredEmployers = mockEmployers.filter(employer => {
    const matchesSearch = employer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === '' || employer.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-secondary-800">Employers</h1>
        <Link to="/employers/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Employer
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-secondary-800">Filters</h3>
        </div>
        <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-secondary-700">Search Employers</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-secondary-700">Industry</label>
            <select
              id="industry"
              name="industry"
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employers List */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-secondary-800">Employers List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Industry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Employees
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployers.length > 0 ? (
                filteredEmployers.map((employer) => (
                  <tr key={employer.id} className="hover:bg-primary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-800">{employer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employer.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employer.employeeCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={employer.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/employers/${employer.id}`} className="text-primary-600 hover:text-primary-700">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No employers found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 