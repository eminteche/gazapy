'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIResponseProps {
  response: string;
}

export const AIResponse: React.FC<AIResponseProps> = ({ response }) => {
  return (
    <div className="w-full max-w-md h-24 flex items-center justify-center mt-4">
      <AnimatePresence>
        {response && (
          <motion.p
            className="text-lg text-white/80 text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {response}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

