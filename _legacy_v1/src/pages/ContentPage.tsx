import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, IMAGE_BASE_URL, DOC_BASE_URL } from '../services/api';
import {
    ArrowLeft, Clock, Eye, Download, FileText,
    Share2, Calendar, User, ChevronRight, Heart,
    CheckCircle, Home
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import { useAuth } from '../contexts/AuthContext';

const ContentPage: React.FC = () => {
    // ... (rest of component logic remains same until return)
    // I will replace only the changed parts separately to avoid huge replacements if possible, but imports are at top.
    // Screw it, I'll do multiple targeted replaces.
    // This tool call is just for Imports.
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

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
            // Use IMAGE_BASE_URL for robust download
            link.href = `${IMAGE_BASE_URL}${content.pdf_url}`;
            link.download = `${content.slug}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    // ...

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">İçerik yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <FileText size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Eyvah! Bir Sorun Var</h1>
                <p className="text-slate-600 mb-8 max-w-md">{error || 'İstediğiniz içeriğe şu an ulaşılamıyor.'}</p>
                <Link
                    to="/"
                    className="px-8 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200"
                >
                    Ana Sayfaya Dön
                </Link>
            </div>
        );
    }

    const typeName = content.page_type === 'akademik' ? 'Akademik' :
        content.page_type === 'dokuman' ? 'Doküman' : 'Seminer';

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
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
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap no-scrollbar">
                        <Link to="/" className="flex items-center gap-1 hover:text-sky-600 transition-colors">
                            <Home size={16} />
                            <span className="font-medium hidden sm:inline">Ana Sayfa</span>
                        </Link>
                        <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                        <Link to={`/content?type=${content.page_type}`} className="hover:text-sky-600 transition-colors font-medium">
                            {typeName}
                        </Link>
                        {content.category_name && (
                            <>
                                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                                <span className="font-medium text-slate-700">{content.category_name}</span>
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

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Title & Metadata */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">{content.title}</h1>
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
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-t-xl flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                            <span>Belge Önizleme</span>
                            <span>PDF</span>
                        </div>
                        <PDFViewer
                            fileUrl={`${DOC_BASE_URL}${content.pdf_url}`}
                            onDownload={handleDownload}
                        />
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
            </main>
        </div>
    );
};

export default ContentPage;
