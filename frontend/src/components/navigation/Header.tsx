import React from 'react';
import { 
  BellIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-dark-surface border-b border-neutral-200 dark:border-dark-border">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-2xl font-semibold text-primary-800 dark:text-primary-400">
          TPA Dashboard
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-300 dark:hover:bg-dark-bg dark:hover:text-neutral-100"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
          
          <button
            type="button"
            className="relative rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-300 dark:hover:bg-dark-bg dark:hover:text-neutral-100"
          >
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              3
            </span>
            <BellIcon className="h-6 w-6" />
          </button>
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-neutral-500 dark:text-neutral-300" />
                <div className="text-sm">
                  <p className="font-medium text-neutral-700 dark:text-neutral-200">{user?.username || 'User'}</p>
                  <p className="text-neutral-500 dark:text-neutral-400">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-300 dark:hover:bg-dark-bg dark:hover:text-neutral-100"
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