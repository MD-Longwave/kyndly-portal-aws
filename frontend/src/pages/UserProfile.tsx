import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { EnvelopeIcon, PhoneIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Check if the app is running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Check if Auth0 credentials are configured
const isAuth0Configured = 
  process.env.REACT_APP_AUTH0_DOMAIN && 
  process.env.REACT_APP_AUTH0_CLIENT_ID;

// Bypass authentication in development if Auth0 is not configured
const bypassAuth = isDevelopment && !isAuth0Configured;

// Define a type for our user data
interface UserData {
  name: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  department: string;
  avatarUrl: string;
  bio: string;
  joinDate: string;
  lastLogin: string;
  picture?: string; // Optional to match Auth0 user type
}

// Mock user data
const mockUserData: UserData = {
  name: 'John Doe',
  email: 'john.doe@kyndly.com',
  phone: '(555) 123-4567',
  title: 'Account Manager',
  company: 'Kyndly Health',
  department: 'Sales',
  avatarUrl: '',
  bio: 'Experienced account manager with 5+ years in the healthcare industry, specializing in ICHRA solutions.',
  joinDate: '2023-06-15',
  lastLogin: '2024-03-20T09:15:00Z',
};

const UserProfile: React.FC = () => {
  const { user, isLoading } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(mockUserData);
  
  // Form state
  const [formData, setFormData] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    title: profileData.title,
    company: profileData.company,
    department: profileData.department,
    bio: profileData.bio,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({ ...profileData, ...formData });
    setIsEditing(false);
    // Here you would also send the updated profile to your backend
  };

  // For development without Auth0
  if (!bypassAuth && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Combine Auth0 user data with our local data if available
  // In development without Auth0, use mock data
  const displayUser = bypassAuth 
    ? profileData 
    : (user ? {
        ...profileData,
        name: user.name || profileData.name,
        email: user.email || profileData.email,
        picture: user.picture
      } : profileData);
  
  const displayName = displayUser.name;
  const displayEmail = displayUser.email;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-semibold text-secondary-800">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and profile settings
        </p>
      </div>

      <div className="p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          {/* Profile Photo and Basic Info */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {displayUser.picture ? (
                  <img
                    src={displayUser.picture}
                    alt={displayName}
                    className="h-32 w-32 rounded-full object-cover border-4 border-mint"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-mint">
                    <UserCircleIcon className="h-24 w-24 text-primary-500" />
                  </div>
                )}
                {!isEditing && (
                  <button
                    className="absolute bottom-0 right-0 rounded-full bg-primary-500 p-2 text-white shadow-md hover:bg-primary-600"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="text-center mt-2">
                <h2 className="text-xl font-semibold text-secondary-800">{displayName}</h2>
                <p className="text-sm text-gray-500">{profileData.title}</p>
                <p className="text-sm text-gray-500">{profileData.company} • {profileData.department}</p>
              </div>
              <div className="w-full mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{displayEmail}</span>
                </div>
                <div className="flex items-center text-sm">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{profileData.phone}</span>
                </div>
              </div>
              {!isEditing && (
                <div className="w-full mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Account Details</h3>
                  <div className="mt-2 text-sm text-gray-500 space-y-1">
                    <p>Member since: {new Date(profileData.joinDate).toLocaleDateString()}</p>
                    <p>Last login: {new Date(profileData.lastLogin).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="mt-6 md:col-span-2 md:mt-0">
            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="space-y-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company
                      </label>
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-primary-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-secondary-800">About</h3>
                  <p className="mt-2 text-sm text-gray-500">{profileData.bio}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center rounded-md bg-primary-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 