import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BellIcon, 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Check if the app is running in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Settings tabs
const tabs = [
  { name: 'Notifications', icon: BellIcon },
  { name: 'Security', icon: ShieldCheckIcon },
  { name: 'Display', icon: DevicePhoneMobileIcon },
  { name: 'Email', icon: EnvelopeIcon },
];

// Mock notification settings
const initialNotificationSettings = {
  emailNotifications: true,
  pushNotifications: false,
  newEmployer: true,
  quoteUpdates: true,
  documentUploads: true,
  marketingEmails: false,
  weeklyDigest: true,
  systemAlerts: true,
};

// Mock security settings
const initialSecuritySettings = {
  twoFactorAuth: false,
  sessionTimeout: '30',
  rememberDevices: true,
  loginNotifications: true,
};

// Mock display settings
const initialDisplaySettings = {
  theme: 'light',
  dashboardLayout: 'default',
  tableRowsPerPage: '10',
  compactMode: false,
  highContrastMode: false,
};

// Mock email settings
const initialEmailSettings = {
  primaryEmail: 'john.doe@kyndly.com',
  backupEmail: '',
  emailFormat: 'html',
  includeAttachments: true,
  emailSignature: 'John Doe\nAccount Manager\nKyndly Health',
};

const Settings: React.FC = () => {
  const { isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Notifications');
  
  // Settings state
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState(initialSecuritySettings);
  const [displaySettings, setDisplaySettings] = useState(initialDisplaySettings);
  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle toggle changes for notification settings
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  // Handle security setting changes
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Handle display setting changes
  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setDisplaySettings({
      ...displaySettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // Handle email setting changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSaveSettings = () => {
    // Here you would send the updated settings to your backend
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-semibold text-secondary-800">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-64 border-r border-gray-200">
          <div className="py-6 px-4">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.name}>
                  <button
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.name
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon
                      className={`mr-3 h-5 w-5 ${
                        activeTab === tab.name ? 'text-primary-500' : 'text-gray-400'
                      }`}
                      aria-hidden="true"
                    />
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 py-6 px-4 sm:px-6 md:px-8">
          {/* Success message */}
          {saveSuccess && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Settings saved successfully!</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {activeTab === 'Notifications' && (
            <div>
              <h2 className="text-lg font-medium text-secondary-800 mb-4">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={() => handleNotificationToggle('emailNotifications')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                          Enable email notifications
                        </label>
                        <p className="text-gray-500">Receive notifications via email for important updates.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="pushNotifications"
                          name="pushNotifications"
                          type="checkbox"
                          checked={notificationSettings.pushNotifications}
                          onChange={() => handleNotificationToggle('pushNotifications')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="pushNotifications" className="font-medium text-gray-700">
                          Enable browser notifications
                        </label>
                        <p className="text-gray-500">Receive push notifications in your browser when you're online.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="newEmployer"
                          name="newEmployer"
                          type="checkbox"
                          checked={notificationSettings.newEmployer}
                          onChange={() => handleNotificationToggle('newEmployer')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="newEmployer" className="font-medium text-gray-700">
                          New employer notifications
                        </label>
                        <p className="text-gray-500">Receive notifications when a new employer is added.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="quoteUpdates"
                          name="quoteUpdates"
                          type="checkbox"
                          checked={notificationSettings.quoteUpdates}
                          onChange={() => handleNotificationToggle('quoteUpdates')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="quoteUpdates" className="font-medium text-gray-700">
                          Quote updates
                        </label>
                        <p className="text-gray-500">Receive notifications for quote status changes and updates.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="documentUploads"
                          name="documentUploads"
                          type="checkbox"
                          checked={notificationSettings.documentUploads}
                          onChange={() => handleNotificationToggle('documentUploads')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="documentUploads" className="font-medium text-gray-700">
                          Document uploads
                        </label>
                        <p className="text-gray-500">Receive notifications when documents are uploaded.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Other Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="marketingEmails"
                          name="marketingEmails"
                          type="checkbox"
                          checked={notificationSettings.marketingEmails}
                          onChange={() => handleNotificationToggle('marketingEmails')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                          Marketing emails
                        </label>
                        <p className="text-gray-500">Receive marketing and promotional emails from Kyndly.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="weeklyDigest"
                          name="weeklyDigest"
                          type="checkbox"
                          checked={notificationSettings.weeklyDigest}
                          onChange={() => handleNotificationToggle('weeklyDigest')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="weeklyDigest" className="font-medium text-gray-700">
                          Weekly digest
                        </label>
                        <p className="text-gray-500">Receive a weekly summary of all activity in your account.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="systemAlerts"
                          name="systemAlerts"
                          type="checkbox"
                          checked={notificationSettings.systemAlerts}
                          onChange={() => handleNotificationToggle('systemAlerts')}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="systemAlerts" className="font-medium text-gray-700">
                          System alerts
                        </label>
                        <p className="text-gray-500">Receive notifications about system updates and maintenance.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'Security' && (
            <div>
              <h2 className="text-lg font-medium text-secondary-800 mb-4">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="twoFactorAuth"
                          name="twoFactorAuth"
                          type="checkbox"
                          checked={securitySettings.twoFactorAuth}
                          onChange={handleSecurityChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="twoFactorAuth" className="font-medium text-gray-700">
                          Enable two-factor authentication
                        </label>
                        <p className="text-gray-500">Add an extra layer of security to your account.</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                        Session timeout (minutes)
                      </label>
                      <select
                        id="sessionTimeout"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Login Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="rememberDevices"
                          name="rememberDevices"
                          type="checkbox"
                          checked={securitySettings.rememberDevices}
                          onChange={handleSecurityChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="rememberDevices" className="font-medium text-gray-700">
                          Remember devices
                        </label>
                        <p className="text-gray-500">Stay logged in on trusted devices.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="loginNotifications"
                          name="loginNotifications"
                          type="checkbox"
                          checked={securitySettings.loginNotifications}
                          onChange={handleSecurityChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="loginNotifications" className="font-medium text-gray-700">
                          Login notifications
                        </label>
                        <p className="text-gray-500">Receive notifications when your account is accessed from a new device or location.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Password Management</h3>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display tab */}
          {activeTab === 'Display' && (
            <div>
              <h2 className="text-lg font-medium text-secondary-800 mb-4">Display Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Appearance</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                        Theme
                      </label>
                      <select
                        id="theme"
                        name="theme"
                        value={displaySettings.theme}
                        onChange={handleDisplayChange}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dashboardLayout" className="block text-sm font-medium text-gray-700">
                        Dashboard Layout
                      </label>
                      <select
                        id="dashboardLayout"
                        name="dashboardLayout"
                        value={displaySettings.dashboardLayout}
                        onChange={handleDisplayChange}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="default">Default</option>
                        <option value="compact">Compact</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Table Settings</h3>
                  <div>
                    <label htmlFor="tableRowsPerPage" className="block text-sm font-medium text-gray-700">
                      Rows per page
                    </label>
                    <select
                      id="tableRowsPerPage"
                      name="tableRowsPerPage"
                      value={displaySettings.tableRowsPerPage}
                      onChange={handleDisplayChange}
                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Accessibility</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="compactMode"
                          name="compactMode"
                          type="checkbox"
                          checked={displaySettings.compactMode}
                          onChange={handleDisplayChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="compactMode" className="font-medium text-gray-700">
                          Compact mode
                        </label>
                        <p className="text-gray-500">Reduce spacing between elements for a more compact view.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="highContrastMode"
                          name="highContrastMode"
                          type="checkbox"
                          checked={displaySettings.highContrastMode}
                          onChange={handleDisplayChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="highContrastMode" className="font-medium text-gray-700">
                          High contrast mode
                        </label>
                        <p className="text-gray-500">Increase contrast for better visibility.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email tab */}
          {activeTab === 'Email' && (
            <div>
              <h2 className="text-lg font-medium text-secondary-800 mb-4">Email Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Email Addresses</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="primaryEmail" className="block text-sm font-medium text-gray-700">
                        Primary Email
                      </label>
                      <input
                        type="email"
                        name="primaryEmail"
                        id="primaryEmail"
                        value={emailSettings.primaryEmail}
                        onChange={handleEmailChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="backupEmail" className="block text-sm font-medium text-gray-700">
                        Backup Email (optional)
                      </label>
                      <input
                        type="email"
                        name="backupEmail"
                        id="backupEmail"
                        value={emailSettings.backupEmail}
                        onChange={handleEmailChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter a backup email address"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Email Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="emailFormat" className="block text-sm font-medium text-gray-700">
                        Email Format
                      </label>
                      <select
                        id="emailFormat"
                        name="emailFormat"
                        value={emailSettings.emailFormat}
                        onChange={handleEmailChange}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="html">HTML</option>
                        <option value="plaintext">Plain Text</option>
                      </select>
                    </div>

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="includeAttachments"
                          name="includeAttachments"
                          type="checkbox"
                          checked={emailSettings.includeAttachments}
                          onChange={handleEmailChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="includeAttachments" className="font-medium text-gray-700">
                          Include attachments in emails
                        </label>
                        <p className="text-gray-500">Receive document attachments directly in your email.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Email Signature</h3>
                  <div>
                    <label htmlFor="emailSignature" className="block text-sm font-medium text-gray-700">
                      Signature
                    </label>
                    <textarea
                      id="emailSignature"
                      name="emailSignature"
                      rows={4}
                      value={emailSettings.emailSignature}
                      onChange={handleEmailChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Enter your email signature"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 