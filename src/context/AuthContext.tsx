'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/verify');
            const data = await res.json();
            if (data.success && data.data.user) {
                setUser(data.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (loginData: any) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });
        const data = await res.json();
        if (data.success) {
            setUser(data.data.user);
            const isAdmin = data.data.user.role === 'fulladmin' || data.data.user.role === 'admin';
            router.push(isAdmin ? '/content?view=admin' : '/content');
        } else {
            throw new Error(data.message);
        }
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        router.push('/login');
    };

    // Protected route check
    useEffect(() => {
        if (!loading) {
            const publicPaths = ['/login', '/', '/content'];
            const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
            if (!user && !isPublicPath) {
                router.push('/login');
            } else if (user && pathname === '/login') {
                const isAdmin = user.role === 'fulladmin' || user.role === 'admin';
                router.push(isAdmin ? '/content?view=admin' : '/content');
            }
        }
    }, [user, loading, pathname, router]);

    const isAdmin = user?.role === 'fulladmin' || user?.role === 'admin';
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
