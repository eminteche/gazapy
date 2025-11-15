'use client';

import React from 'react';
import { motion, AnimationControls } from 'framer-motion';
import { Mic } from 'lucide-react';

interface MicButtonProps {
  isRecording: boolean;
  isCancelled: boolean;
  onPressStart: (e: React.MouseEvent | React.TouchEvent) => void;
  rippleControls: AnimationControls;
}

export const MicButton: React.FC<MicButtonProps> = ({ 
  isRecording, 
  isCancelled, 
  onPressStart,
  rippleControls
}) => {
  const idleGlow = {
    scale: [1, 1.15, 1],
    opacity: [0.2, 0.4, 0.2],
  };
  
  const recordingGlow = {
    scale: 1.3,
    opacity: 0.7,
  };
  
  const cancelledGlow = {
    scale: 1.1,
    opacity: 0.3,
  };

  return (
    <motion.div
      className="relative w-24 h-24"
      onMouseDown={onPressStart}
      onTouchStart={onPressStart}
    >
      {/* Ripple Effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-white/70"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={rippleControls}
      />
      
      {/* Breathing/Recording Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/30"
        animate={isCancelled ? cancelledGlow : (isRecording ? recordingGlow : idleGlow)}
        transition={isRecording ? 
          { type: 'spring', stiffness: 400, damping: 30 } : 
          { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      
      {/* Main Mic Button Visual */}
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center cursor-pointer shadow-xl"
        animate={{ scale: isRecording ? 1.06 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      >
        <Mic 
          className="w-9 h-9 text-white" 
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} 
        />
      </motion.div>
    </motion.div>
  );
};

