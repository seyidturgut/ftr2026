import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, IMAGE_BASE_URL, DOC_BASE_URL } from '../services/api';
import {
    Clock, Eye, Download, FileText,
    Share2, Calendar, User, ChevronRight, Heart,
    CheckCircle, Home
} from 'lucide-react';
import PDFViewer from './PDFViewer';

const ContentDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const response = await api.getContentItem(slug);
                if (response.success) {
                    setContent(response.data);

                    // Save to local storage for "Last Viewed"
                    localStorage.setItem('last_viewed_content', slug);

                    // Check local storage for favorites
                    const favorites = JSON.parse(localStorage.getItem('user_favorites') || '[]');
                    if (favorites.includes(response.data.id)) {
                        setIsFavorite(true);
                    }
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

    const handleToggleFavorite = () => {
        if (!content) return;

        const favorites = JSON.parse(localStorage.getItem('user_favorites') || '[]');
        let newFavorites;
        let isFav;

        if (favorites.includes(content.id)) {
            newFavorites = favorites.filter((id: number) => id !== content.id);
            isFav = false;
            setNotification({ type: 'success', message: 'Favorilerden çıkarıldı' });
        } else {
            newFavorites = [...favorites, content.id];
            isFav = true;
            setNotification({ type: 'success', message: 'Favorilere eklendi' });
        }

        localStorage.setItem('user_favorites', JSON.stringify(newFavorites));
        setIsFavorite(isFav);

        // Auto hide notification
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDownload = () => {
        if (content?.pdf_url) {
            const link = document.createElement('a');
            // Use IMAGE_BASE_URL for direct download to ensure it works even if proxy fails
            link.href = `${IMAGE_BASE_URL}${content.pdf_url}`;
            link.download = `${content.slug}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">İçerik yükleniyor...</p>
                </div>
            </div>
        );
    }
    // ... (skipping unchanged parts for brevity if possible, but safer to replace block)
    // I will target specific lines since the file is large.

    // 1. Download Link Logic (lines 76-85)
    // 2. PDF Viewer Prop (line 209)
    // 3. Cover Image (line 222)

    // Let's do it in separate replace calls or one big multi-replace if supported (it is).
    // But multi-replace tool is safer.


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">İçerik yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <FileText size={32} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Eyvah! Bir Sorun Var</h1>
                <p className="text-slate-600 mb-6 max-w-md text-sm">{error || 'İstediğiniz içeriğe şu an ulaşılamıyor.'}</p>
                <Link
                    to="/content"
                    className="px-6 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 text-sm"
                >
                    Listeye Dön
                </Link>
            </div>
        );
    }

    const typeName = content.page_type === 'akademik' ? 'Akademik' :
        content.page_type === 'dokuman' ? 'Doküman' : 'Seminer';

    return (
        <div className="font-sans pb-20 fade-in animate-in">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-24 right-6 z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                    <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {notification.type === 'success' ? <CheckCircle size={18} /> : <FileText size={18} />}
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">{notification.message}</p>
                </div>
            )}

            {/* Breadcrumbs Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm px-4 md:px-8">
                <div className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap no-scrollbar">
                        <Link to="/content" className="flex items-center gap-1 hover:text-sky-600 transition-colors">
                            <Home size={18} />
                        </Link>
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        <Link to={`/content?type=${content.page_type}`} className="hover:text-sky-600 transition-colors font-medium">
                            {typeName}
                        </Link>
                        {content.category_name && (
                            <>
                                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                                <Link
                                    to={`/content?type=${content.page_type}&category_id=${content.category_id}`}
                                    className="font-medium text-slate-700 hover:text-sky-600 transition-colors"
                                >
                                    {content.category_name}
                                </Link>
                            </>
                        )}
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        <span className="font-bold text-sky-600 truncate max-w-[200px]">{content.title}</span>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-100 ml-4">
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-2 rounded-full transition-all ${isFavorite ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' : 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                            title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                        >
                            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                        </button>

                        {content.pdf_url && (
                            <button
                                onClick={handleDownload}
                                className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                            >
                                <Download size={16} />
                                İndir
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 py-8">
                {/* Title & Metadata */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-4">{content.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                        {content.author_title && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                                <User size={14} className="text-sky-500" />
                                <span className="font-semibold text-slate-700">{content.author_title} {content.first_name} {content.last_name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(content.created_at).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye size={14} />
                            {content.views} Görüntülenme
                        </div>
                    </div>
                </div>

                {/* PDF Viewer Section */}
                {content.pdf_url ? (
                    <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-t-xl flex justify-between items-center text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-gray-50 to-white">
                            <span>Belge Önizleme</span>
                            <span className='bg-sky-100 text-sky-700 px-2 py-0.5 rounded'>PDF</span>
                        </div>
                        <PDFViewer
                            fileUrl={`${DOC_BASE_URL}${content.pdf_url}`}
                            onDownload={handleDownload}
                        />
                    </div>
                ) : content.content_type === 'pdf' && !content.pdf_url ? (
                    <div className="mb-10 p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-center">
                        <p className="font-bold">PDF dosyası bulunamadı.</p>
                        <p className="text-sm">İçerik PDF olarak işaretlenmiş ancak dosya yüklenmemiş veya URL hatalı.</p>
                    </div>
                ) : content.cover_image && (
                    /* Default Cover Image if not PDF */
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                        <img
                            src={`${IMAGE_BASE_URL}${content.cover_image}`}
                            alt={content.title}
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>
                )}

                {/* Text Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-sky-600 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold mb-4 text-slate-900 border-b border-slate-100 pb-2">İçerik Detayı</h3>
                            <div dangerouslySetInnerHTML={{ __html: content.text_content || content.description }} />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        {/* Info Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-sky-500 rounded-full"></div>
                                Hakkında
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                {content.meta_description || content.description?.substring(0, 150) + '...'}
                            </p>

                            <div className="space-y-3">
                                <button onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: content.title,
                                            url: window.location.href,
                                        });
                                    }
                                }} className="w-full py-2.5 bg-slate-50 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                    <Share2 size={16} />
                                    Paylaş
                                </button>
                            </div>
                        </div>

                        {/* Tags (Placeholder) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                                Etiketler
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {['FTR', 'Rehabilitasyon', 'Güncel', 'Tedavi'].map(tag => (
                                    <span key={tag} className="text-xs font-semibold px-3 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100 hover:border-sky-200 hover:text-sky-600 transition-colors cursor-default">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentDetail;
