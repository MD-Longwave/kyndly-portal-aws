import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  LockClosedIcon,
  CheckIcon,
  PencilIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';
import cognitoService from '../utils/cognitoService';
import { Auth } from 'aws-amplify';
import { FormSection, Input, Button } from '../components/ui/FormElements';

const UserProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { hasRole, isKyndlyTeam, isTpaAdmin } = usePermission();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    joinDate: '',
    role: '',
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
          role: attributes['custom:role'] || 'User',
          company: attributes['custom:company'] || '',
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setLoading(true);
    setError(null);
    try {
      await cognitoService.updateUserAttributes({ 
        name: formData.name,
        phone_number: formData.phone
      });
      if (refreshUser) await refreshUser(); // Refresh user info in context
    } catch (err: any) {
      setError('Failed to update profile information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="h-12 w-24 bg-gray-200 dark:bg-night-800 rounded mb-4"></div>
          <div className="h-64 w-full max-w-3xl bg-gray-100 dark:bg-night-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-brand border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-800 dark:text-yellow-200">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-brand-gradient dark:bg-dark-gradient rounded-brand p-6 mb-8 text-white shadow-brand dark:shadow-dark">
        <h1 className="text-3xl font-bold mb-2">User Profile</h1>
        <p className="text-sky-100">Manage your account information</p>
      </div>

      {/* Edit/Cancel and Save Changes buttons at the top right */}
      <div className="flex items-center justify-end mb-4 space-x-2">
        {isEditing ? (
          <>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-brand font-medium border-0 bg-seafoam hover:bg-seafoam-600 text-white"
              onClick={handleSubmit}
              type="button"
            >
              <CheckIcon className="h-5 w-5 mr-1" />
              Save Changes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-brand font-medium bg-white border border-gray-300 text-night hover:bg-gray-50 dark:bg-night-700 dark:border-night-600 dark:text-white dark:hover:bg-night-600"
              onClick={() => setIsEditing(false)}
              type="button"
            >
              <XMarkIcon className="h-5 w-5 mr-1" />
              Cancel
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-brand font-medium bg-night hover:bg-night-700 text-white dark:bg-seafoam dark:hover:bg-seafoam-600"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            <PencilIcon className="h-5 w-5 mr-1" />
            Edit Profile
          </motion.button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6 rounded-r-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="bg-white dark:bg-night-800 shadow-brand dark:shadow-dark rounded-brand overflow-hidden">
          <div className="bg-gradient-to-r from-moss to-night px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-white">Profile Information</h3>
            <p className="mt-1 text-sm text-sky-100">Personal details and account information</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-14 w-14 rounded-full bg-seafoam/20 flex items-center justify-center text-seafoam">
                <UserIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-night dark:text-white">{formData.name || 'User'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{formData.role || 'User'}</p>
              </div>
            </div>
            
            <div className="space-y-4 text-night dark:text-white">
              <div className="flex items-center space-x-3 border-b border-gray-200 dark:border-night-700 pb-3">
                <EnvelopeIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <span className="text-sm">{formData.email}</span>
              </div>
              <div className="flex items-center space-x-3 border-b border-gray-200 dark:border-night-700 pb-3">
                <PhoneIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <span className="text-sm">{formData.phone || 'Not provided'}</span>
              </div>
              {formData.company && (
                <div className="flex items-center space-x-3 border-b border-gray-200 dark:border-night-700 pb-3">
                  <UserIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm">{formData.company}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="lg:col-span-2">
          <FormSection 
            title="Account Settings" 
            description="Update your profile information"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    icon={<UserIcon className="h-5 w-5" />}
                  />
                </div>
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                  />
                </div>
                <div>
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    icon={<PhoneIcon className="h-5 w-5" />}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </FormSection>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 