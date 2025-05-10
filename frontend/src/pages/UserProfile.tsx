import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  SwatchIcon,
  MoonIcon,
  SunIcon,
  CheckIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getThemeStyles, commonStyles } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import cognitoService from '../utils/cognitoService';
import { Auth } from 'aws-amplify';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { hasRole, isKyndlyTeam, isTpaAdmin } = usePermission();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    joinDate: '',
    role: '',
    notifications: true,
    language: 'English',
    timezone: 'Pacific Time (PT)'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user attributes from Cognito on mount
  useEffect(() => {
    const fetchUserAttributes = async () => {
      setLoading(true);
      setError(null);
      try {
        const cognitoUser = await cognitoService.getCurrentUser();
        let attributes: Record<string, string> = {};
        if (cognitoUser) {
          const attrsArray = await Auth.userAttributes(cognitoUser);
          attributes = attrsArray.reduce((acc: Record<string, string>, attr: any) => {
            acc[attr.Name] = attr.Value;
            return acc;
          }, {});
        }
        setFormData(prev => ({
          ...prev,
          name: attributes.name || '',
          email: attributes.email || '',
          phone: attributes.phone_number || '',
        }));
      } catch (err: any) {
        setError('Failed to load user info');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAttributes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setLoading(true);
    setError(null);
    try {
      await cognitoService.updateUserAttributes({ name: formData.name });
      // Optionally update other attributes here
      // Refresh user info in context (if available)
      // You may want to call a refreshUser() from useAuth if you add it
    } catch (err: any) {
      setError('Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 rounded-md p-4">
          <p className="text-yellow-800">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.layout.container}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className={theme.typography.h1}>User Profile</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${theme.button.primary} flex items-center space-x-2`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <XMarkIcon className="h-5 w-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <PencilIcon className="h-5 w-5" />
                <span>Edit Profile</span>
              </>
            )}
          </motion.button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className={`${theme.card} p-6`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`${theme.layout.section} rounded-full p-3`}>
                <UserIcon className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h2 className={theme.typography.h2}>{formData.name}</h2>
                <p className={theme.typography.caption}>{formData.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-4 w-4 text-slate-400" />
                <span className={theme.typography.body}>{formData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <LockClosedIcon className="h-4 w-4 text-slate-400" />
                <span className={theme.typography.body}>{formData.phone}</span>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              <div className={`${theme.card} p-6`}>
                <h2 className={`${theme.typography.h2} mb-6`}>Account Settings</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={theme.typography.label}>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`mt-1 ${theme.input}`}
                    />
                  </div>
                  <div>
                    <label className={theme.typography.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className={`mt-1 ${theme.input}`}
                    />
                  </div>
                  <div>
                    <label className={theme.typography.label}>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`mt-1 ${theme.input}`}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`${theme.button.primary} flex items-center space-x-2`}
                  >
                    <CheckIcon className="h-5 w-5" />
                    <span>Save Changes</span>
                  </motion.button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 