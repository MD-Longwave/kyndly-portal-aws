import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  DocumentChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Quotes', path: '/quotes', icon: DocumentChartBarIcon },
  { name: 'Documents', path: '/documents', icon: DocumentTextIcon },
  { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="hidden w-64 flex-shrink-0 bg-primary-800 text-white md:block">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Kyndly ICHRA</h1>
      </div>
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 