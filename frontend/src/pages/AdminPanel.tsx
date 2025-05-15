import React from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import AdminPanelComponent from '../components/admin/AdminPanel';
import { PageTransition } from '../components/animations';

const AdminPanelPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-brand-gradient dark:bg-dark-gradient rounded-brand p-6 mb-8 text-white shadow-brand dark:shadow-dark">
          <h1 className="text-3xl font-bold mb-2">Administration</h1>
          <p className="text-sky-100">Manage users and access control</p>
          <div className="flex items-center mt-4 text-sm bg-white/10 rounded-lg p-2 w-fit">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            <span>Admin access required</span>
          </div>
        </div>

        {/* Full width container for AdminPanel component */}
        <div className="w-full">
          <AdminPanelComponent />
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminPanelPage; 