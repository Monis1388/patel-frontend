"use client";
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import GlassAuth from '../../components/GlassAuth';
import { useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const [loginMethod, setLoginMethod] = useState<'mobile' | 'admin'>('mobile');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, googleLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8F8F8]">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px]"
            >
                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12">
                    
                    {/* Method Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-2xl mb-10">
                        <button
                            onClick={() => { setLoginMethod('mobile'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${loginMethod === 'mobile' ? 'bg-white text-[#111111] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Phone className="w-3.5 h-3.5" /> OTP Login
                        </button>
                        <button
                            onClick={() => { setLoginMethod('admin'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${loginMethod === 'admin' ? 'bg-white text-[#111111] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Lock className="w-3.5 h-3.5" /> Admin Only
                        </button>
                    </div>

                    {error && loginMethod === 'admin' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl mb-8 text-xs font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    {redirect === 'checkout' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex items-center gap-3"
                        >
                            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                            <p className="text-blue-700 text-xs font-bold uppercase tracking-tight">Please login to continue your order</p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {loginMethod === 'mobile' ? (
                            <motion.div
                                key="mobile-auth"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                            >
                                <GlassAuth redirectPath={redirect || '/'} />
                                
                                <div className="mt-8">
                                    <div className="relative flex items-center gap-4 mb-8">
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Social Auth</span>
                                        <div className="flex-1 h-[1px] bg-gray-100"></div>
                                    </div>
                                    
                                    <div className="flex justify-center">
                                        <GoogleLogin
                                            onSuccess={credentialResponse => {
                                                if (credentialResponse.credential) {
                                                    googleLogin(credentialResponse.credential);
                                                }
                                            }}
                                            onError={() => {
                                                console.error('Google Login Failed');
                                            }}
                                            theme="outline"
                                            shape="pill"
                                            text="continue_with"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="standard-form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-[#111111] mb-2">Admin Dashboard</h2>
                                    <p className="text-[#1F2937]/60 text-sm">Enter your credentials to access the console</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2563EB] transition-colors" />
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium"
                                            placeholder="Admin Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2563EB] transition-colors" />
                                        <input
                                            type="password"
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 transition-all outline-none text-sm font-medium"
                                            placeholder="Secret Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 bg-[#111111] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Verify Admin
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmail('admin@example.com');
                                            setPassword('password123');
                                        }}
                                        className="w-full py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#111111] transition-colors"
                                    >
                                        Demo Credentials
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                </div>
            </motion.div>
        </div>
    );
}
