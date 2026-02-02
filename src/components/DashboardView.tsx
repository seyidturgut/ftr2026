'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Download, FileText, ChevronRight, PlayCircle, BookOpen, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DashboardView: React.FC = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [lastViewed, setLastViewed] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ downloads: 0, favorites: 0 });

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch favorites from API
                const favRes = await fetch('/api/user/favorites');
                const favData = await favRes.json();

                if (favData.success) {
                    setFavorites(favData.data);
                    setStats(prev => ({ ...prev, favorites: favData.data.length }));
                }

                // Get total downloads from a real metric if available, otherwise fallback
                const contentRes = await fetch('/api/content');
                const contentData = await contentRes.json();
                if (contentData.success) {
                    const totalDownloads = contentData.data.reduce((acc: number, item: any) => acc + (item.downloads || 0), 0);
                    setStats(prev => ({ ...prev, downloads: totalDownloads }));
                }

                const lastViewedSlug = localStorage.getItem('last_viewed_content');
                if (lastViewedSlug) {
                    const response = await fetch(`/api/content/${lastViewedSlug}`);
                    const data = await response.json();
                    if (data.success) {
                        setLastViewed(data.data);
                    }
                }
            } catch (err) {
                console.error("Dashboard data load failed", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'akademik': return <BookOpen size={16} className="text-indigo-500" />;
            case 'dokuman': return <FileText size={16} className="text-orange-500" />;
            case 'seminer': return <PlayCircle size={16} className="text-rose-500" />;
            case 'video': return <PlayCircle size={16} className="text-rose-500" />;
            case 'pdf': return <FileText size={16} className="text-orange-500" />;
            default: return <FileText size={16} className="text-slate-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-900/50 dark:to-blue-900/50 dark:bg-slate-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none dark:border dark:border-indigo-500/30">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 dark:bg-indigo-500/20 rounded-xl backdrop-blur-sm">
                            <Star size={24} className="text-yellow-300" fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-blue-100 dark:text-indigo-200 text-sm font-medium">Favorilerim</p>
                            <h3 className="text-2xl font-bold text-white">{stats.favorites} içerik</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Download size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">İndirilenler</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.downloads}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Son Ziyaret</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {user?.last_login ? new Date(user.last_login).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {lastViewed && (
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-sky-600" />
                        Son Kaldığınız Yerden Devam Edin
                    </h2>
                    <Link href={`/content/${lastViewed.slug}`} className="block group">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                {lastViewed.cover_image ? (
                                    <img src={`/uploads/${lastViewed.cover_image}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <FileText size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-2 uppercase tracking-wide">
                                    {getTypeIcon(lastViewed.page_type)}
                                    {lastViewed.page_type === 'dokuman' ? 'Doküman' : lastViewed.page_type === 'seminer' ? 'Seminer' : 'Makale'}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {lastViewed.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                                    {lastViewed.description}
                                </p>
                            </div>
                            <div className="self-center pr-2 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {favorites.length > 0 ? (
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Heart size={20} className="text-rose-500" fill="currentColor" />
                        Favorilerim
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((item) => (
                            <Link key={item.id} href={`/content/${item.slug}`} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-rose-200 dark:hover:border-rose-900 hover:shadow-lg hover:shadow-rose-50 dark:hover:shadow-none transition-all flex gap-4">
                                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    {item.cover_image ? (
                                        <img src={`/uploads/${item.cover_image}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <FileText size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        {getTypeIcon(item.page_type)}
                                        <span className="capitalize">{item.page_type}</span>
                                        <span>•</span>
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={32} />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-bold mb-1">Henüz Favoriniz Yok</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mb-4">
                        İlginizi çeken içerikleri kalp ikonuna tıklayarak buraya ekleyebilirsiniz.
                    </p>
                    <Link href="/content?type=akademik" className="text-sky-600 dark:text-sky-400 font-bold text-sm hover:underline">
                        İçerikleri Keşfet
                    </Link>
                </div>
            )}
        </div>
    );
};

export default DashboardView;
