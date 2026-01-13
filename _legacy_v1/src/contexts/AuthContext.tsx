// Authentication Context - Manages auth state globally

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string, rememberMe?: boolean) => Promise<any>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        // Check both localStorage and sessionStorage
        let savedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        let savedUser = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');

        if (!savedToken || !savedUser) {
            setIsLoading(false);
            return;
        }

        try {
            // Fetch fresh user data from API
            const response = await api.getProfile();
            if (response.success && response.data) {
                const freshUser = response.data;
                setUser(freshUser);
                setToken(savedToken);

                // Update storage with fresh data
                const isRememberMe = localStorage.getItem('remember_me') === 'true';
                const storage = isRememberMe ? localStorage : sessionStorage;
                storage.setItem('user_data', JSON.stringify(freshUser));
            } else {
                throw new Error('Verification failed');
            }
        } catch (error) {
            console.error('Auth refresh failed:', error);
            // On error, we can still use the saved user as fallback if we want,
            // or force logout if token is expired. Let's force logout for security.
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string, rememberMe: boolean = false) => {
        try {
            const response = await api.login(username, password);
            if (response.success && response.data) {
                setToken(response.data.token);
                setUser(response.data.user);

                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('auth_token', response.data.token);
                storage.setItem('user_data', JSON.stringify(response.data.user));
                storage.setItem('remember_me', rememberMe.toString());

                // Clear the other storage to avoid conflicts
                const otherStorage = rememberMe ? sessionStorage : localStorage;
                otherStorage.removeItem('auth_token');
                otherStorage.removeItem('user_data');
                otherStorage.removeItem('remember_me');

                return response.data; // Return for redirect logic
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('remember_me');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_data');
            sessionStorage.removeItem('remember_me');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user && !!token,
                login,
                logout,
                checkAuth,
            }}
        >
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
