import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  DocumentChartBarIcon, 
  Cog6ToothIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { featureAccess } from '../../config/accessConfig';
import { UserRole } from '../../contexts/AuthContext';

const navItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: HomeIcon, 
    roles: featureAccess.dashboard 
  },
  { 
    name: 'Quotes', 
    path: '/quotes', 
    icon: DocumentChartBarIcon, 
    roles: featureAccess.quotes 
  },
  { 
    name: 'Sold Cases', 
    path: '/sold-cases', 
    icon: ClipboardDocumentCheckIcon, 
    roles: featureAccess.soldcases 
  },
  { 
    name: 'Enrollments', 
    path: '/enrollments', 
    icon: UserGroupIcon, 
    roles: featureAccess.enrollments 
  },
  { 
    name: 'Kynd Choice', 
    path: '/kynd-choice', 
    icon: AdjustmentsHorizontalIcon, 
    roles: featureAccess.kyndchoice 
  },
  { 
    name: 'Knowledge Center', 
    path: '/knowledge-center', 
    icon: BookOpenIcon, 
    roles: featureAccess.knowledgecenter 
  },
  { 
    name: 'Documents', 
    path: '/documents', 
    icon: DocumentTextIcon, 
    roles: featureAccess.documents 
  },
];

const userItems = [
  { name: 'Profile', path: '/profile', icon: UserIcon },
];

const adminItems = [
  { 
    name: 'Admin Panel', 
    path: '/admin-panel', 
    icon: Cog6ToothIcon, 
    roles: featureAccess.adminpanel 
  },
];

const Sidebar: React.FC = () => {
  const { hasRole, user } = useAuth();
  
  // Function to check if user has access to a nav item
  const hasAccess = (roles: string[]): boolean => {
    if (!roles || roles.length === 0) return true;
    return roles.some(role => hasRole(role as UserRole));
  };

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => hasAccess(item.roles as string[]));
  const filteredAdminItems = adminItems.filter(item => hasAccess(item.roles as string[]));
  const hasAdminAccess = filteredAdminItems.length > 0;

  return (
    <div className="hidden w-64 flex-shrink-0 bg-primary-800 text-white md:block">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Kyndly ICHRA</h1>
      </div>
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {filteredNavItems.map((item) => (
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
        
        <div className="mt-8 border-t border-primary-700 pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-primary-300">
            User
          </p>
          <div className="mt-2 space-y-1">
            {userItems.map((item) => (
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
        </div>
        
        {hasAdminAccess && (
          <div className="mt-8 border-t border-primary-700 pt-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-primary-300">
              Administration
            </p>
            <div className="mt-2 space-y-1">
              {filteredAdminItems.map((item) => (
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
          </div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar; 