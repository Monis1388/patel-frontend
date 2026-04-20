"use client";
import React, { useState } from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';
import AIChat from './AIChat';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingAI = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-32 right-6 sm:bottom-6 z-[9999]">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            onClick={() => setIsOpen(true)}
                            className="bg-[#000042] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-black transition-all group relative overflow-hidden active:scale-90"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <MessageCircle className="w-7 h-7 relative z-10 group-hover:hidden" />
                            <Sparkles className="w-7 h-7 relative z-10 hidden group-hover:block transition-all" />

                            {/* Notification Batch */}
                            <span className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-white animate-pulse" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <AIChat
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                initialMessage=""
            />
        </>
    );
};

export default FloatingAI;
