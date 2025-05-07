import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { getThemeStyles, commonStyles } from '../styles/theme';

const Enrollments: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data
  const enrollments = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'active',
      date: '2024-03-15',
      plan: 'Premium',
      documents: 3,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'pending',
      date: '2024-03-14',
      plan: 'Basic',
      documents: 1,
    },
    // Add more mock data as needed
  ];

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'pending':
        return <Clock className="text-amber-500" size={20} />;
      case 'inactive':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme.layout.container}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className={theme.typography.h1}>Enrollments</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${theme.button.primary} flex items-center space-x-2`}
          >
            <Plus size={20} />
            <span>New Enrollment</span>
          </motion.button>
        </div>

        {/* Filters and Search */}
        <div className={`${theme.card} p-4 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search enrollments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-full ${theme.input}`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={theme.input}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${theme.button.secondary} flex items-center space-x-2`}
              >
                <Download size={20} />
                <span>Export</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className={`${theme.card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className={theme.layout.section}>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Plan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Documents
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enrollments.map((enrollment) => (
                  <motion.tr
                    key={enrollment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${theme.layout.section} hover:bg-slate-50`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className={theme.typography.body}>{enrollment.name}</div>
                          <div className={theme.typography.caption}>{enrollment.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(enrollment.status)}
                        <span className={theme.typography.body}>
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={theme.typography.body}>{enrollment.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${commonStyles.badge.base} ${theme.badge.info}`}>
                        {enrollment.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={theme.typography.body}>{enrollment.documents}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className={`${theme.button.secondary} text-sm`}>
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enrollments; 