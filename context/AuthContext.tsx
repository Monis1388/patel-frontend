"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    avatar?: string;
    phone?: string;
    savedPrescriptions?: string[];
    specsyAiEnabled?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, redirectPath?: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    sendOTP: (phone: string) => Promise<{ devOtp?: string; message?: string } | undefined>;
    verifyOTP: (phone: string, otp: string, redirectPath?: string) => Promise<void>;
    googleLogin: (tokenId: string) => Promise<void>;
    firebaseLogin: (idToken: string) => Promise<void>;
    updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log('Logging in...');
            const { data } = await api.post('/users/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/');
        } catch (error: any) {
            console.error("Login Check failed", error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const { data } = await api.post('/users/register', { name, email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        router.push('/login');
    };

    const sendOTP = async (phone: string) => {
        try {
            const { data } = await api.post('/users/send-otp', { phone });
            // Return both devOtp and the message (which might contain Twilio errors)
            return { devOtp: data.devOtp, message: data.message };
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const verifyOTP = async (phone: string, otp: string, redirectPath?: string) => {
        try {
            const { data } = await api.post('/users/verify-otp', { phone, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Merge guest cart if exists
            const guestCart = localStorage.getItem('cartItems');
            if (guestCart) {
                try {
                    const parsedCart = JSON.parse(guestCart);
                    if (parsedCart.length > 0) {
                        await api.post('/users/cart/sync', { guestCart: parsedCart });
                        localStorage.removeItem('cartItems');
                    }
                } catch (e) {
                    console.error('Cart sync failed', e);
                }
            }

            if (redirectPath) {
                router.push(redirectPath);
            } else {
                router.push('/');
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'OTP verification failed');
        }
    };

    const googleLogin = async (tokenId: string) => {
        try {
            const { data } = await api.post('/users/google-login', { tokenId });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Google login failed');
        }
    };

    const firebaseLogin = async (idToken: string) => {
        try {
            const { data } = await api.post('/users/firebase-login', { idToken });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            router.push('/');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Firebase login failed');
        }
    };

    const updateUser = (userData: any) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, sendOTP, verifyOTP, googleLogin, firebaseLogin, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
