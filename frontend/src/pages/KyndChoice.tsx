import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { getThemeStyles } from '../styles/theme';

const KyndChoice: React.FC = () => {
  const [isDarkMode] = React.useState(false);
  const theme = getThemeStyles(isDarkMode);

  return (
    <div className={`min-h-screen ${theme.layout.container}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${theme.card} p-8 text-center`}
        >
          <div className="flex justify-center mb-6">
            <div className={`${theme.layout.section} rounded-full p-4`}>
              <SparklesIcon className="text-amber-500" width={48} height={48} />
            </div>
          </div>

          <h1 className={`${theme.typography.h1} mb-4`}>Coming Soon</h1>
          <p className={`${theme.typography.body} mb-8 max-w-2xl mx-auto`}>
            We're working on something exciting! KyndChoice will help you make informed decisions about your benefits with personalized recommendations and expert guidance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className={`${theme.card} p-6`}>
              <h3 className={`${theme.typography.h3} mb-3`}>Personalized Recommendations</h3>
              <p className={theme.typography.body}>
                Get tailored benefit suggestions based on your unique needs and preferences.
              </p>
            </div>
            <div className={`${theme.card} p-6`}>
              <h3 className={`${theme.typography.h3} mb-3`}>Expert Guidance</h3>
              <p className={theme.typography.body}>
                Access professional advice to help you make the best choices for your situation.
              </p>
            </div>
            <div className={`${theme.card} p-6`}>
              <h3 className={`${theme.typography.h3} mb-3`}>Easy Comparison</h3>
              <p className={theme.typography.body}>
                Compare different benefit options side by side to make informed decisions.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${theme.button.primary} flex items-center justify-center space-x-2 mx-auto`}
          >
            <span>Get Notified When Available</span>
            <ArrowRightIcon className="text-white" width={20} height={20} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default KyndChoice; 