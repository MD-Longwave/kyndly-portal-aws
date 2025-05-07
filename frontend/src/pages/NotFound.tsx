import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getThemeStyles } from '../styles/theme';

const NotFound: React.FC = () => {
  const [isDarkMode] = React.useState(false);
  const theme = getThemeStyles(isDarkMode);

  return (
    <div className={`min-h-screen ${theme.layout.container} flex items-center justify-center`}>
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${theme.card} p-8 text-center`}
        >
          <div className="flex justify-center mb-6">
            <div className={`${theme.layout.section} rounded-full p-4`}>
              <AlertTriangle size={48} className="text-amber-500" />
            </div>
          </div>
          
          <h1 className={`${theme.typography.h1} mb-4`}>404 - Page Not Found</h1>
          <p className={`${theme.typography.body} mb-8`}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${theme.button.primary} flex items-center justify-center space-x-2 w-full`}
            >
              <Home size={20} />
              <span>Return to Home</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 