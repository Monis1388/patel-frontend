"use client";
import nextDynamic from 'next/dynamic';
import React from 'react';

// This is a Client Component wrapper that can safely use ssr: false
const HomeContent = nextDynamic(() => import('./HomeContent'), { 
    ssr: false,
    loading: () => (
        <div className="flex flex-col gap-8 pb-32 bg-[#FBFBFB] animate-pulse p-4 min-h-screen">
            <div className="h-[240px] md:h-[400px] bg-gray-200 rounded-3xl w-full" />
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-2xl" />)}
                </div>
            </div>
        </div>
    )
});

export default function ClientWrapper() {
    return <HomeContent />;
}
