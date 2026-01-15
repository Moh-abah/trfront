

import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '../components/layout/Header/Header';
import { Sidebar } from '../components/layout/Sidebar/Sidebar';
import { Toaster } from '../components/ui/Toast/Toaster';
import RootInitializer from '@/components/RootInitializer';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TECTONIC - Crush the Noise. Seize the Shift',
  description: 'Advanced trading platform with real-time charts, indicators, and backtesting',

};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <RootInitializer />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-0">
              <Header className="flex-shrink-0" />
              <main className="flex-1 overflow-auto min-h-0">
                {children}
              </main>
            </div>
          </div>
          {/* حذف Toaster هنا إذا كنت لا تحتاجه */}
        </Providers>
      </body>
    </html>
  );
}

