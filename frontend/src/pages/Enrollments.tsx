import React, { useState } from 'react';
import { getThemeStyles } from '../styles/theme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Enrollments: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);

  return (
    <div className={`min-h-screen w-full ${theme.layout.container} flex flex-col`}>
      {/* Header with theme toggle */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className={theme.typography.h1}>Enrollments</h1>
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className={`p-2 rounded-full ${theme.button.secondary}`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </header>
      {/* Iframe embed */}
      <div className="flex-1 flex items-center justify-center">
        <iframe
          src="https://your-embed-url.com"
          title="Enrollments Dashboard"
          className="w-full h-full border-0 rounded-xl shadow-lg"
          style={{ minHeight: '80vh' }}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default Enrollments; 