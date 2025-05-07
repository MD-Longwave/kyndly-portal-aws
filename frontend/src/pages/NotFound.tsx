import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import { getThemeStyles } from '../styles/theme';

const NotFound: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = getThemeStyles(isDarkMode);

  return (
    <div className={theme.layout.container}>
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={theme.card}
        >
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className={theme.typography.h1}>404</h1>
          <p className={theme.typography.body}>Page not found</p>
          <p className="text-slate-500 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${theme.button.primary} mt-6 flex items-center justify-center space-x-2`}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Return Home</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 