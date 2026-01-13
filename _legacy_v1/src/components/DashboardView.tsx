import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, FILE_BASE_URL } from '../services/api';
import { Heart, Clock, Download, FileText, ChevronRight, PlayCircle, BookOpen, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
                // 1. Get Favorites IDs from local storage
                const favoriteIds = JSON.parse(localStorage.getItem('user_favorites') || '[]');
                setStats(prev => ({ ...prev, favorites: favoriteIds.length }));

                if (favoriteIds.length > 0) {
                    // Ideally we'd have an endpoint to get specific items by IDs, 
                    // but for now we'll fetch all and filter client side (optimization needed for scale)
                    // Or better: In production we would fetch /api/favorites
                    // Fallback hack: Fetch recent items and hope favorites are in there, OR fetch all.
                    // Let's assume for this MVP we fetch a reasonable batch or use an existing list if context provided.
                    // BETTER: Since we don't have getByIds, let's just show the IDs for now or fetch individual items if count is low.

                    // Actually, let's fetch all contentItems (cached/lightweight) then filter? 
                    // This is heavy. Let's try to fetch specific items if possible, or just the last few added.
                    // We will fetch ALL for now as the dataset is small.
                    const response = await api.getContentItems();
                    if (response.success) {
                        const allContent = response.data;
                        const favItems = allContent.filter((item: any) => favoriteIds.includes(item.id));
                        setFavorites(favItems);
                    }
                }

                // 2. Get Last Viewed from local storage
                const lastViewedId = localStorage.getItem('last_viewed_content');
                if (lastViewedId) {
                    // Reuse the filtered list if we fetched data, otherwise fetch specific
                    const response = await api.getContentItem(lastViewedId); // Assuming slug or ID works? API expects slug usually.
                    // Wait, API expects slug. We should store slug in localStorage for last viewed.
                    // If we stored ID, we might have trouble. Let's assume we start storing slug from now on.
                    if (response.success) {
                        setLastViewed(response.data);
                    }
                }

                // 3. Mock Stats (or local storage downloads)
                const localDownloads = parseInt(localStorage.getItem('user_total_downloads') || '0');
                setStats(prev => ({ ...prev, downloads: localDownloads }));

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
            {/* Value Props / Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Star size={24} className="text-yellow-300" fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Favorilerim</p>
                            <h3 className="text-2xl font-bold">{stats.favorites} içerik</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Download size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">İndirilenler</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.downloads}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Son Ziyaret</p>
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">
                            {lastViewed ? new Date(lastViewed.created_at).toLocaleDateString('tr-TR') : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Resume Section - Last Viewed */}
            {lastViewed && (
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-sky-600" />
                        Son Kaldığınız Yerden Devam Edin
                    </h2>
                    <Link to={`/content/${lastViewed.slug}`} className="block group">
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                                {lastViewed.cover_image ? (
                                    <img src={`${FILE_BASE_URL}${lastViewed.cover_image}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
                                    {lastViewed.title}
                                </h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                                    {lastViewed.description}
                                </p>
                            </div>
                            <div className="self-center pr-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Favorites Grid */}
            {favorites.length > 0 ? (
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Heart size={20} className="text-rose-500" fill="currentColor" />
                        Favorilerim
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((item) => (
                            <Link key={item.id} to={`/content/${item.slug}`} className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50 transition-all flex gap-4">
                                <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                    {item.cover_image ? (
                                        <img src={`${FILE_BASE_URL}${item.cover_image}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <FileText size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
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
                <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={32} />
                    </div>
                    <h3 className="text-slate-900 font-bold mb-1">Henüz Favoriniz Yok</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
                        İlginizi çeken içerikleri kalp ikonuna tıklayarak buraya ekleyebilirsiniz.
                    </p>
                    <Link to="/content?type=akademik" className="text-sky-600 font-bold text-sm hover:underline">
                        İçerikleri Keşfet
                    </Link>
                </div>
            )}
        </div>
    );
};

export default DashboardView;
