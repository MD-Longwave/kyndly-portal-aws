import React from 'react';
import { 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-2xl font-semibold text-primary-800">
          TPA Dashboard
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="relative rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              3
            </span>
            <BellIcon className="h-6 w-6" />
          </button>
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-neutral-500" />
                <div className="text-sm">
                  <p className="font-medium text-neutral-700">{user?.username || 'User'}</p>
                  <p className="text-neutral-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 