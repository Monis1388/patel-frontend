"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip check for login and register pages to avoid infinite loop
        if (pathname === '/login' || pathname === '/register') {
            return;
        }

        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router, pathname]);

    // Show nothing while checking for auth or if not logged in on a protected route
    if (!user && pathname !== '/login' && pathname !== '/register') {
        return null;
    }

    return <>{children}</>;
}
