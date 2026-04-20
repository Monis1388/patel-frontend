"use client";
import dynamic from 'next/dynamic';
import React from 'react';

import { useAuth } from '../context/AuthContext';

const FloatingAI = dynamic(() => import('./FloatingAI'), { ssr: false });
const MobileNav = dynamic(() => import('./MobileNav'), { ssr: false });

export default function ClientPortal() {
    const { user } = useAuth();
    const isAiEnabled = user?.specsyAiEnabled ?? true;

    return (
        <>
            {isAiEnabled && <FloatingAI />}
            <MobileNav />
        </>
    );
}
