'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AdProvider } from '@/context/AdContext';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="ftr-theme"
        >
            <AuthProvider>
                <AdProvider>
                    {children}
                </AdProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
