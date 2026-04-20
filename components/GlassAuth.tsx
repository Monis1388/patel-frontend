"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle2, ArrowRight, Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { auth } from '../utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const GlassAuth = ({ redirectPath = '/' }: { redirectPath?: string }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { sendOTP, verifyOTP } = useAuth();
    const [devOtp, setDevOtp] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    useEffect(() => {
        if (typeof window !== 'undefined' && auth && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: (response: any) => {
                    // reCAPTCHA solved
                }
            });
        }
    }, []);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (phoneNumber.length < 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setIsLoading(true);

        try {
            const result = await sendOTP(phoneNumber);
            if (result) {
                setDevOtp(result.devOtp || '');
                // Show the message if it's an error or a test bypass notice
                if (result.message && (result.message.includes('Error') || result.message.includes('[TEST'))) {
                    setError(result.message);
                }
            }
            setStep('otp');
            setResendTimer(30);
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Pass the current redirect path from props (e.g. 'checkout')
            // If it's just 'checkout', prepend '/' if needed or let router handle it
            const target = redirectPath === 'checkout' ? '/checkout' : redirectPath;
            await verifyOTP(phoneNumber, otp, target);
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonDisabled = step === 'phone' ? phoneNumber.length < 10 : otp.length < 6;

    return (
        <div className="w-full">
            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-[#111111] mb-2">
                        {step === 'phone' ? 'Secure Login' : 'Verify Identity'}
                    </h2>
                    <p className="text-[#1F2937]/60 text-sm font-medium">
                        {step === 'phone' 
                            ? 'Instant access via Mobile OTP' 
                            : `A 6-digit code has been sent to +91 ${phoneNumber}`}
                    </p>
                </div>

                {step === 'otp' && devOtp && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-xl mb-6 text-xs flex items-center justify-between"
                    >
                        <span className="font-bold uppercase tracking-tighter">Debug Code:</span>
                        <span className="text-base font-black tracking-widest">{devOtp}</span>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-xs font-medium"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 'phone' ? (
                            <motion.div
                                key="phone-input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="relative flex items-center group">
                                    <div className="absolute left-4 flex items-center gap-2 border-r border-gray-100 pr-3 pointer-events-none transition-colors group-focus-within:border-blue-200">
                                        <Smartphone className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <span className="text-sm font-bold text-gray-900">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        required
                                        className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-[5.5rem] pr-4 text-gray-900 placeholder-gray-300 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all text-base font-black italic"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp-input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-200 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all text-2xl font-black tracking-[0.6em] text-center italic"
                                    />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <button 
                                        type="button" 
                                        onClick={() => setStep('phone')}
                                        className="text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-[#2563EB] transition-colors"
                                    >
                                        Edit Number
                                    </button>
                                    {resendTimer > 0 ? (
                                        <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">
                                            Resend in {resendTimer}s
                                        </span>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={handleSendOTP}
                                            className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={isLoading || isButtonDisabled}
                            className="w-full bg-[#111111] text-white rounded-xl py-5 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {step === 'phone' ? 'Routing OTP...' : 'Securing Account...'}
                                </span>
                            ) : (
                                <>
                                    {step === 'phone' ? 'Secure Access' : 'Authenticate Bag'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        <div className="flex items-center justify-center gap-2 py-2">
                             <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                             <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">End-to-End Encrypted Session</span>
                        </div>
                    </div>
                </form>
            </div>

            <div id="recaptcha-container"></div>
        </div>
    );
};

export default GlassAuth;
