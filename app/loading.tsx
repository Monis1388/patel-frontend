"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md overflow-hidden">


      <div className="relative flex flex-col items-center">
        {/* Professional Spinner */}
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            className="absolute inset-0 border-t-2 border-r-2 border-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 border-b-2 border-l-2 border-primary/20 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black italic tracking-tighter text-primary">F&S</span>
          </div>
        </div>

        <motion.p 
          className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Premium Eyewear
        </motion.p>
      </div>
    </div>
  );
}
