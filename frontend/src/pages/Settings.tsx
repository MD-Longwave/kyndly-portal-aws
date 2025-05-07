import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Bell,
  Lock,
  Globe,
  Palette,
  Moon,
  Sun,
  Save
} from 'lucide-react';
import { getThemeStyles, commonStyles } from '../styles/theme';

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: <User size={20} />,
      iconBg: 'bg-blue-50 text-blue-600',
      content: (
        <div className="space-y-4">
          <div>
            <label className={theme.typography.caption}>Display Name</label>
            <input
              type="text"
              className={`mt-1 block w-full ${theme.input}`}
              placeholder="Enter your display name"
            />
          </div>
          <div>
            <label className={theme.typography.caption}>Email</label>
            <input
              type="email"
              className={`mt-1 block w-full ${theme.input}`}
              placeholder="Enter your email"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Notifications',
      icon: <Bell size={20} />,
      iconBg: 'bg-purple-50 text-purple-600',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={theme.typography.h3}>Email Notifications</h3>
              <p className={theme.typography.caption}>Receive email updates about your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={theme.typography.h3}>Push Notifications</h3>
              <p className={theme.typography.caption}>Receive push notifications in your browser</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      ),
    },
    {
      title: 'Security',
      icon: <Lock size={20} />,
      iconBg: 'bg-red-50 text-red-600',
      content: (
        <div className="space-y-4">
          <div>
            <label className={theme.typography.caption}>Current Password</label>
            <input
              type="password"
              className={`mt-1 block w-full ${theme.input}`}
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className={theme.typography.caption}>New Password</label>
            <input
              type="password"
              className={`mt-1 block w-full ${theme.input}`}
              placeholder="Enter your new password"
            />
          </div>
          <div>
            <label className={theme.typography.caption}>Confirm New Password</label>
            <input
              type="password"
              className={`mt-1 block w-full ${theme.input}`}
              placeholder="Confirm your new password"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Appearance',
      icon: <Palette size={20} />,
      iconBg: 'bg-amber-50 text-amber-600',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={theme.typography.h3}>Dark Mode</h3>
              <p className={theme.typography.caption}>Switch between light and dark themes</p>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${theme.button.secondary}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div>
            <label className={theme.typography.caption}>Font Size</label>
            <select className={`mt-1 block w-full ${theme.input}`}>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`min-h-screen ${theme.layout.container}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className={theme.typography.h1}>Settings</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${theme.button.primary} flex items-center space-x-2`}
          >
            <Save size={20} />
            <span>Save Changes</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {settingsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${theme.card} p-6`}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-3 rounded-xl ${section.iconBg}`}>
                  {section.icon}
                </div>
                <h2 className={theme.typography.h2}>{section.title}</h2>
              </div>
              {section.content}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings; 