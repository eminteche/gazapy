'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CornerLeftUp } from 'lucide-react';

interface GlassCardProps {
  statusText: string;
  isRecording: boolean;
  isCancelled: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  statusText, 
  isRecording, 
  isCancelled 
}) => {
  const cardVariants = {
    idle: {
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      scale: 1,
    },
    recording: {
      scale: 1.03,
      boxShadow: '0 0 40px 0 rgba(255, 255, 255, 0.3)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        duration: 1.2,
      },
    },
  };

  const textKey = isCancelled ? 'cancel' : statusText;

  return (
    <motion.div
      className="w-full max-w-md h-40 flex flex-col items-center justify-center rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg p-6"
      variants={cardVariants}
      animate={isRecording && !isCancelled ? 'recording' : 'idle'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={textKey}
          className="flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isCancelled ? (
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <CornerLeftUp className="w-8 h-8 text-white/90 mb-2" />
              <p className="text-xl font-medium text-white/90">Release to cancel</p>
            </motion.div>
          ) : (
            <p className="text-2xl font-medium text-white text-center">
              {statusText}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

