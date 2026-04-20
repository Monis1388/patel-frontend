import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import AuthGuard from '../components/AuthGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ClientPortal from '../components/ClientPortal';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Frame & Sunglasses - Premium Eyewear',
  description: 'Shop the best eyewear online. Premium frames and lenses delivered to your door.',
  icons: {
    icon: '/favicon.ico?v=2',
    apple: '/favicon.ico?v=2',
  },
  verification: {
    google: '6UkivrKfo7wdmi_9RM38sJq4eVC1F6Oznv9mI93zjaA',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Suspense fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="font-black text-xs text-primary italic uppercase tracking-[0.2em] animate-pulse">F&S</p>
                </div>
              </div>
            }>
              <Navbar />
              <main className="flex-grow container mx-auto px-4 pt-8 pb-24 sm:pb-8">
                {children}
              </main>
              <Footer />
              <ClientPortal />
            </Suspense>
          </div>
        </Providers>
      </body>
    </html>
  );
}
