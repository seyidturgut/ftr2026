'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Moon, Sun, User, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Akademik', href: '/content?type=akademik' },
        { name: 'Doküman', href: '/content?type=dokuman' },
        { name: 'Seminer', href: '/content?type=seminer' },
        { name: 'Hakkımızda', href: '#' },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
            ? 'h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-lg'
            : 'h-20 bg-transparent border-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <img
                        src="https://www.ftronline.com/wp-content/uploads/100x75.trbg_@2x.png"
                        alt="FTR Online"
                        className="h-10 w-auto object-contain"
                    />
                    <span className="font-bold text-xl text-slate-900 dark:text-white">
                        FTR<span className="font-light text-sky-500">Online</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-base font-bold text-slate-900 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    )}

                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden ring-2 ring-transparent hover:ring-sky-200 transition-all">
                                    {user?.profile_photo ? (
                                        <img
                                            src={`/uploads/${user.profile_photo}`}
                                            alt={`${user.first_name} ${user.last_name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user?.first_name?.charAt(0) || 'U'
                                    )}
                                </div>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {user?.title} {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {user?.role === 'fulladmin' ? 'Tam Yönetici' :
                                                user?.role === 'admin' ? 'Yönetici' : 'Abone'}
                                        </p>
                                    </div>

                                    <Link
                                        href="/content?type=akademik"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <FileText size={16} />
                                        İçerikler
                                    </Link>

                                    <Link
                                        href="/profile"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <User size={16} />
                                        Profil
                                    </Link>

                                    <button
                                        onClick={async () => {
                                            setUserMenuOpen(false);
                                            await logout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-2 rounded-full text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-all duration-300"
                        >
                            Portal Giriş
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-4 md:hidden">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 text-slate-900 dark:text-slate-200"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    )}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-slate-900 dark:text-slate-200"
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block py-2 text-slate-900 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 font-semibold"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
