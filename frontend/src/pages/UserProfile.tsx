import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Shield,
  Key,
  Bell,
  Globe,
  Edit,
  Save,
  X
} from 'lucide-react';
import { getThemeStyles, commonStyles } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import { usePermission } from '../hooks/usePermission';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { hasRole, isKyndlyTeam, isTpaAdmin } = usePermission();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    location: 'San Francisco, CA',
    joinDate: 'January 15, 2024',
    role: 'Administrator',
    notifications: true,
    language: 'English',
    timezone: 'Pacific Time (PT)'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically make an API call to update the user's profile
  };

  // If no user is logged in, show a message
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
                <X size={20} />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit size={20} />
                <span>Edit Profile</span>
              </>
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Overview */}
          <div className={`${theme.card} p-6`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`${theme.layout.section} rounded-full p-3`}>
                <User size={24} className="text-slate-400" />
              </div>
              <div>
                <h2 className={theme.typography.h2}>{formData.firstName} {formData.lastName}</h2>
                <p className={theme.typography.caption}>{formData.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-slate-400" />
                <span className={theme.typography.body}>{formData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-slate-400" />
                <span className={theme.typography.body}>{formData.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Building size={18} className="text-slate-400" />
                <span className={theme.typography.body}>{formData.company}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-slate-400" />
                <span className={theme.typography.body}>{formData.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar size={18} className="text-slate-400" />
                <span className={theme.typography.body}>Joined {formData.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              <div className={`${theme.card} p-6`}>
                <h2 className={`${theme.typography.h2} mb-6`}>Account Settings</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className={theme.typography.label}>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`mt-1 ${theme.input}`}
                    />
                  </div>
                  <div>
                    <label className={theme.typography.label}>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
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
                      disabled={!isEditing}
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

              <div className={`${theme.card} p-6 mt-6`}>
                <h2 className={`${theme.typography.h2} mb-6`}>Preferences</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className={theme.typography.label}>Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`mt-1 ${theme.input}`}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div>
                    <label className={theme.typography.label}>Timezone</label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`mt-1 ${theme.input}`}
                    >
                      <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                      <option value="Mountain Time (MT)">Mountain Time (MT)</option>
                      <option value="Central Time (CT)">Central Time (CT)</option>
                      <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="notifications"
                        checked={formData.notifications}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={theme.input}
                      />
                      <span className={theme.typography.body}>Enable email notifications</span>
                    </label>
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
                    <Save size={20} />
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