import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const TopBar = () => (
  <header className="absolute top-0 left-0 right-0 z-10 w-full p-6 flex justify-between items-center">
    {/* GazaPay Logo */}
    <span 
      className="font-bold text-2xl text-white/90" 
      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
    >
      GazaPay
    </span>
    <ShieldCheck 
      className="w-7 h-7 text-white/90" 
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} 
    />
  </header>
);

