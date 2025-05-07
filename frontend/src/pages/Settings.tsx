import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  SwatchIcon,
  MoonIcon,
  SunIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { getThemeStyles } from '../styles/theme';

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);

  return (
    <div className={theme.layout.container}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className={theme.typography.h1}>Settings</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${theme.button.primary} flex items-center space-x-2`}
          >
            <CheckIcon className="h-5 w-5" />
            <span>Save Changes</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <div className={theme.card}>
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="h-6 w-6 text-blue-500" />
              <h2 className={theme.typography.h2}>Profile Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={theme.typography.label}>Display Name</label>
                <input
                  type="text"
                  className={theme.input}
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label className={theme.typography.label}>Email</label>
                <input
                  type="email"
                  className={theme.input}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className={theme.card}>
            <div className="flex items-center space-x-3 mb-6">
              <BellIcon className="h-6 w-6 text-blue-500" />
              <h2 className={theme.typography.h2}>Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={theme.typography.body}>Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className={theme.typography.body}>Push Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className={theme.card}>
            <div className="flex items-center space-x-3 mb-6">
              <LockClosedIcon className="h-6 w-6 text-blue-500" />
              <h2 className={theme.typography.h2}>Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={theme.typography.label}>Current Password</label>
                <input
                  type="password"
                  className={theme.input}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className={theme.typography.label}>New Password</label>
                <input
                  type="password"
                  className={theme.input}
                  placeholder="Enter new password"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className={theme.card}>
            <div className="flex items-center space-x-3 mb-6">
              <SwatchIcon className="h-6 w-6 text-blue-500" />
              <h2 className={theme.typography.h2}>Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={theme.typography.body}>Dark Mode</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-full ${theme.button.secondary}`}
                >
                  {isDarkMode ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div>
                <label className={theme.typography.label}>Language</label>
                <select className={theme.input}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 