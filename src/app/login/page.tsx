'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({ username, password, rememberMe });
            // Redirect handled in login function or here
            // router.push('/content?type=akademik'); // Let AuthContext handle default or specific logic
        } catch (err: any) {
            setError(err.message || 'Giriş başarısız oldu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <img
                            src="https://www.ftronline.com/wp-content/uploads/100x75.trbg_@2x.png"
                            alt="FTR Online"
                            className="h-12 w-auto"
                        />
                        <span className="font-bold text-2xl text-slate-800 dark:text-white">
                            FTR<span className="font-light text-sky-500">Online</span>
                        </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Yönetim Paneline Giriş
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                                <AlertCircle size={20} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                            >
                                Kullanıcı Adı
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                                placeholder="archivist"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                            >
                                Şifre
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-sky-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
                            >
                                Beni Hatırla
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    Giriş Yap
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    FTR Online Yönetim Sistemi © 2026
                </p>
            </div>
        </div>
    );
}
