// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from '@/components/ui/Toast/ToastProvider';
import { ThemeProvider } from 'next-themes';
import React from 'react';


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (


        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
        >

        <QueryClientProvider client={queryClient}>
            <ToastProvider>
            
                    {children}
              
            </ToastProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        </ThemeProvider>
    );
}