'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock, Eye, Download, FileText,
    Share2, Calendar, User, ChevronLeft, Heart,
    CheckCircle, Home, ChevronRight, Play, X
} from 'lucide-react';
import AdBanner from './AdBanner';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });
const PPTXViewer = dynamic(() => import('@/components/PPTXViewer'), { ssr: false });
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ContentDetailViewProps {
    slug: string;
    onBack: () => void;
}

export default function ContentDetailView({ slug, onBack }: ContentDetailViewProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState<'pdf' | 'video' | 'pptx' | 'reference' | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const response = await fetch(`/api/content/${slug}`);
                const data = await response.json();

                if (data.success) {
                    setContent(data.data);
                    setIsFavorite(!!data.data.is_favorite);

                    // Set default tab
                    if (data.data.pdf_url) setActiveTab('pdf');
                    else if (data.data.video_url) setActiveTab('video');
                    else if (data.data.pptx_url) setActiveTab('pptx');
                    else if (data.data.reference_pdf_url) setActiveTab('reference');
                } else {
                    setError('İçerik bulunamadı.');
                }
            } catch (err) {
                console.error('Failed to fetch content:', err);
                setError('İçerik yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleToggleFavorite = async () => {
        if (!content) return;

        try {
            const method = isFavorite ? 'DELETE' : 'POST';
            const url = isFavorite
                ? `/api/user/favorites?content_id=${content.id}`
                : '/api/user/favorites';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: isFavorite ? undefined : JSON.stringify({ content_id: content.id }),
            });
            const data = await response.json();

            if (data.success) {
                setIsFavorite(!isFavorite);
                setNotification({
                    type: 'success',
                    message: isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi'
                });
            }
        } catch (err) {
            console.error('Favorite toggle error:', err);
            setNotification({ type: 'error', message: 'İşlem başarısız' });
        }

        setTimeout(() => setNotification(null), 3000);
    };

    const handleDownload = async (type: 'standard' | 'reference' = 'standard') => {
        if (!isAuthenticated) {
            setNotification({ type: 'error', message: 'İndirme yapabilmek için giriş yapmalısınız.' });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        const fileUrl = type === 'reference' ? content.reference_pdf_url : content.pdf_url;
        if (fileUrl) {
            try {
                // 1. Check Limits
                const checkResponse = await fetch('/api/download/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content_id: content.id })
                });

                const checkData = await checkResponse.json();

                if (!checkData.success) {
                    setNotification({ type: 'error', message: checkData.message });
                    setTimeout(() => setNotification(null), 4000);
                    return;
                }

                // 2. Record Download (Optimistic UI Update + Legacy Counter)
                await fetch(`/api/content/${content.id}/download`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type })
                });

                // Update local state
                setContent((prev: any) => ({
                    ...prev,
                    [type === 'reference' ? 'reference_downloads' : 'downloads']: (prev[type === 'reference' ? 'reference_downloads' : 'downloads'] || 0) + 1
                }));

                // 3. Trigger Download
                const link = document.createElement('a');
                link.href = `/uploads/${fileUrl}`;
                link.download = `${type === 'reference' ? 'referans-' : ''}${content.slug}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } catch (err) {
                console.error('Download process failed:', err);
                setNotification({ type: 'error', message: 'İşlem sırasında bir hata oluştu.' });
                setTimeout(() => setNotification(null), 3000);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 animate-pulse font-medium">İçerik yükleniyor...</p>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <FileText size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Eyvah! Bir Sorun Var</h2>
                <p className="text-gray-500 mb-6 max-w-md">{error || 'İçeriğe ulaşılamadı.'}</p>
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    Geri Dön
                </button>
            </div>
        );
    }

    const typeName = content.page_type === 'akademik' ? 'Akademik' :
        content.page_type === 'dokuman' ? 'Doküman' : 'Seminer';

    // Extract all category IDs (current + parents) for ad targeting
    const categoryIds = content ? [
        content.category_id,
        ...(content.breadcrumbs?.map((b: any) => b.id) || [])
    ].filter(Boolean) : [];

    return (
        <div className="animate-in fade-in duration-500">
            {notification && (
                <div className="fixed top-24 right-6 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                    <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {notification.type === 'success' ? <CheckCircle size={18} /> : <FileText size={18} />}
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{notification.message}</p>
                </div>
            )}

            <div className="mb-6">
                {/* Compact Top Bar: Back + Breadcrumbs */}
                <div className="flex items-center gap-3 mb-4 overflow-x-auto no-scrollbar">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-all rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 active:scale-95"
                    >
                        <ChevronLeft size={16} />
                        <span className="text-xs">Geri</span>
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0 mx-1"></div>

                    <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                        <span onClick={onBack} className="hover:text-blue-600 cursor-pointer transition-colors">
                            <Home size={12} />
                        </span>
                        <ChevronRight size={10} className="shrink-0 opacity-30" />
                        {content.breadcrumbs?.map((bc: any) => (
                            <React.Fragment key={bc.id}>
                                <span
                                    onClick={() => router.push(`/content?category_id=${bc.id}`)}
                                    className="hover:text-blue-600 cursor-pointer transition-colors"
                                >
                                    {bc.name}
                                </span>
                                <ChevronRight size={10} className="shrink-0 opacity-30" />
                            </React.Fragment>
                        ))}
                    </nav>
                </div>

                {/* Compact Main Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/50 dark:border-slate-800/50 shadow-xl shadow-blue-500/5 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">

                        {/* Initial Left Side: Title + Meta (Badges Removed) */}
                        <div className="flex-1 md:flex-none md:w-1/3 min-w-0 space-y-3">

                            {/* Title */}
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                                {content.title}
                            </h1>

                            {/* Dense Metadata Row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-slate-400">
                                {content.prepared_by && (
                                    <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                                        <User size={12} />
                                        <span>Hazırlayan: {content.prepared_by}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    <span>{new Date(content.created_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Eye size={12} />
                                    <span>{content.views}</span>
                                </div>
                                {content.pdf_url && (
                                    <div className="flex items-center gap-1.5 text-blue-600">
                                        <Download size={12} />
                                        <span>{content.downloads} İndirme</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions Row - Moved here to separate from Ad */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={handleToggleFavorite}
                                    className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all shadow-sm border ${isFavorite
                                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900 text-rose-500 dark:text-rose-400'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                                        }`}
                                    title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                >
                                    <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                                </button>

                                {content.pdf_url && (
                                    <button
                                        onClick={() => handleDownload('standard')}
                                        className="h-9 px-4 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Download size={14} />
                                        <span>İndir</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Header Ad Banner (Right Side) */}
                        <div className="hidden md:block flex-1 pl-8">
                            <AdBanner position="header" className="h-full w-full" categoryIds={categoryIds} />
                        </div>

                    </div>
                </div>

                {/* Compact Tabs - Integrated into bottom of card */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {content.pdf_url && (
                        <button
                            onClick={() => setActiveTab('pdf')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeTab === 'pdf'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <FileText size={14} />
                            Döküman
                        </button>
                    )}
                    {content.video_url && (
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeTab === 'video'
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 ring-1 ring-purple-200 dark:ring-purple-800'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Play size={14} />
                            Video
                        </button>
                    )}
                    {content.pptx_url && (
                        <button
                            onClick={() => setActiveTab('pptx')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeTab === 'pptx'
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <FileText size={14} />
                            Sunum
                        </button>
                    )}
                    {content.reference_pdf_url && (
                        <button
                            onClick={() => setActiveTab('reference')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeTab === 'reference'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <CheckCircle size={14} />
                            Kaynak
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-8">
                {/* Dynamic Media Viewer Container */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    {activeTab === 'pdf' && content.pdf_url && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-slate-900/5 border-x border-t border-slate-200 text-slate-500 px-6 py-3 rounded-t-3xl flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                    Döküman Önizleme
                                </div>
                                <span className='bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-black'>PDF</span>
                            </div>
                            <div className="rounded-b-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                                <PDFViewer
                                    fileUrl={`/uploads/${content.pdf_url}`}
                                    onDownload={() => handleDownload('standard')}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'video' && content.video_url && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-slate-900/5 border-x border-t border-slate-200 text-slate-500 px-6 py-3 rounded-t-3xl flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    Video İçerik
                                </div>
                                <span className='bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-black'>MP4</span>
                            </div>
                            <div className="aspect-video bg-black rounded-b-3xl overflow-hidden shadow-xl ring-1 ring-slate-200">
                                <video
                                    src={`/uploads/${content.video_url}`}
                                    controls
                                    className="w-full h-full"
                                    poster={content.cover_image ? `/uploads/${content.cover_image}` : undefined}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'pptx' && content.pptx_url && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-slate-900/5 border-x border-t border-slate-200 text-slate-500 px-6 py-3 rounded-t-3xl flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    Sunum Dosyası
                                </div>
                                <span className='bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-black'>PPTX</span>
                            </div>
                            <div className="rounded-b-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                                <PPTXViewer
                                    fileUrl={`/uploads/${content.pptx_url}`}
                                    onDownload={() => handleDownload('standard')}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'reference' && content.reference_pdf_url && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-emerald-900 text-white px-6 py-3 rounded-t-3xl flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Referans Makale
                                </div>
                                <button
                                    onClick={() => handleDownload('reference')}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
                                >
                                    <Download size={12} /> İndir
                                </button>
                            </div>
                            <div className="rounded-b-3xl overflow-hidden border border-emerald-200 shadow-xl bg-white">
                                <PDFViewer
                                    fileUrl={`/uploads/${content.reference_pdf_url}`}
                                    onDownload={() => handleDownload('reference')}
                                />
                            </div>
                        </div>
                    )}

                    {!activeTab && content.cover_image && (
                        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-800">
                            <img
                                src={`/uploads/${content.cover_image}`}
                                alt={content.title}
                                className="w-full h-auto object-cover max-h-72"
                            />
                        </div>
                    )}
                </div>

                {/* Content Detail Text Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <AdBanner position="inline" className="mb-8" categoryIds={categoryIds} />
                        <div className="bg-white dark:bg-slate-900 px-2 py-6 md:px-4 md:py-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl prose prose-slate dark:prose-invert prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-2xl prose-strong:text-slate-900 dark:prose-strong:text-white">
                            <h3 className="text-xl font-black mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                İçerik Açıklaması
                            </h3>
                            <div dangerouslySetInnerHTML={{ __html: content.text_content || content.description }} />
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-6">
                            <AdBanner position="sidebar" categoryIds={categoryIds} />

                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl relative group overflow-hidden">
                                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-slate-900">
                                    <CheckCircle size={100} />
                                </div>
                                <h4 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                    Tags
                                </h4>
                                <div className="flex flex-wrap gap-2 relative z-10">
                                    {['FTR', 'Rehabilitasyon', 'Akademik'].map(tag => (
                                        <span key={tag} className="text-[9px] font-black px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-default border border-slate-100 dark:border-slate-700 shadow-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );
}
