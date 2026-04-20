'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';

const MobileNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: LayoutGrid, label: "Category", href: "/shop" },
        { icon: ShoppingBag, label: "Orders", href: "/orders" },
        { icon: User, label: "Profile", href: "/profile" }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around px-2 z-[999] shadow-[0_-8px_30px_rgb(0,0,0,0.08)] sm:hidden">
            {navItems.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                    <button
                        key={idx}
                        onClick={() => router.push(item.href)}
                        className={`flex flex-col items-center justify-center gap-1 h-full flex-1 transition-all active:scale-90 ${
                            isActive ? 'text-primary' : 'text-gray-400'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default MobileNav;
