import { motion } from 'framer-motion';
import React from 'react';

interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.02, // Very subtle scale by default
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ 
        duration: 0.2,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default HoverScale; 