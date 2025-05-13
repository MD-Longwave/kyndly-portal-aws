import React from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import AdminPanelComponent from '../../../app/components/AdminPanel';
import { PageTransition } from '../components/animations';

const AdminPanelPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-brand-gradient dark:bg-dark-gradient rounded-brand p-6 mb-8 text-white shadow-brand dark:shadow-dark">
          <h1 className="text-3xl font-bold mb-2">Administration</h1>
          <p className="text-sky-100">Manage brokers, employers and access control</p>
          <div className="flex items-center mt-4 text-sm bg-white/10 rounded-lg p-2 w-fit">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            <span>Admin access required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-3 bg-white dark:bg-night-800 shadow-brand dark:shadow-dark rounded-brand overflow-hidden">
            <div className="bg-gradient-to-r from-moss to-night px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-white">Access Management</h3>
              <p className="mt-1 text-sm text-sky-100">System components</p>
            </div>
            
            <div className="p-4">
              <nav className="space-y-1">
                <a href="#brokers" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-night dark:text-white bg-gray-100 dark:bg-night-700">
                  <BuildingOfficeIcon className="mr-3 h-5 w-5 text-blue-500" />
                  Brokers
                </a>
                <a href="#employers" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-night dark:text-white hover:bg-gray-100 dark:hover:bg-night-700">
                  <UserGroupIcon className="mr-3 h-5 w-5 text-blue-500" />
                  Employers
                </a>
              </nav>
            </div>
          </div>

          <div className="xl:col-span-9">
            <AdminPanelComponent />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminPanelPage; 