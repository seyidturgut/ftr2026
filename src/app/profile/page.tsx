'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/50">
                                {user.profile_photo ? (
                                    <img
                                        src={`/uploads/${user.profile_photo}`}
                                        alt={user.first_name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {user.title} {user.first_name} {user.last_name}
                                </h1>
                                <p className="text-sky-100 mt-1">@{user.username}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="p-3 bg-sky-100 dark:bg-sky-900 rounded-lg">
                                    <User size={20} className="text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Kullanıcı Adı</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                                </div>
                            </div>

                            {user.email && (
                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                                        <Mail size={20} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">E-posta</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                    <Shield size={20} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Rol</p>
                                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                        {user.role === 'fulladmin' ? 'Tam Yönetici' :
                                            user.role === 'admin' ? 'Yönetici' :
                                                user.role === 'editor' ? 'Editör' : 'Abone'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                    <User size={20} className="text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">#{user.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Coming Soon Note */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-blue-100 dark:border-slate-600">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                🚀 Profil Düzenleme Yakında
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Profil fotoğrafı, şifre değiştirme ve diğer ayarlar yakında eklenecek.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
