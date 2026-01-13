import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useParams } from 'react-router-dom';
import { api, FILE_BASE_URL } from '../services/api';
import {
    FileText, PlayCircle, Download, BookOpen,
    Filter, ChevronRight, Search, Lock, Eye,
    Home, Users, Settings, MessageSquare, Menu, X,
    File, LogOut, User, Bell, ChevronDown, GraduationCap, FileCode
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ContentDetail from '../components/ContentDetail';
import DashboardView from '../components/DashboardView';

type ViewMode = 'content' | 'forum' | 'users';

const ContentListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { slug } = useParams<{ slug?: string }>();
    const { isAuthenticated, user, logout } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState<string>(searchParams.get('type') || 'all');
    const [viewMode, setViewMode] = useState<ViewMode>('content');
    const [categories, setCategories] = useState<any[]>([]);
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Sync state with URL params
    useEffect(() => {
        const type = searchParams.get('type');
        const categoryId = searchParams.get('category_id');

        if (type && ['akademik', 'dokuman', 'seminer'].includes(type) && viewMode === 'content') {
            setActiveTab(type);
        } else if (!type && viewMode === 'content') {
            setActiveTab('all');
        }

        if (categoryId) {
            setSelectedCategory(parseInt(categoryId));
        } else {
            setSelectedCategory(null);
        }
    }, [searchParams, viewMode]);

    // Load data
    useEffect(() => {
        if (viewMode !== 'content') return;

        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch categories based on active tab
                const categoryPromise = activeTab === 'all'
                    ? api.getContentCategories()
                    : api.getContentCategories(activeTab as any);

                // Fetch content
                const [catRes, contentRes] = await Promise.all([
                    categoryPromise,
                    api.getContentItems() // We filter content client-side for smoother UX, or can filter API side
                ]);

                if (catRes.success) setCategories(catRes.data);

                if (contentRes.success) {
                    let filteredContent = contentRes.data;

                    // Client-side filtering by type if needed (API returns all usually)
                    if (activeTab !== 'all') {
                        // Find category IDs belonging to this type to filter content
                        // OR if API supports type filtering on content items directly:
                        // For now we trust the client side association via categories or check content_type

                        // Map page type to content type
                        let contentTypeMap: Record<string, string> = {
                            'akademik': 'text', // Assuming simple mapping for now, or match via category logic
                            'dokuman': 'pdf',
                            'seminer': 'video'
                        };

                        // Better: Filter by the categories returned for this type
                        const relevantCategoryIds = catRes.data.map((c: any) => c.id);
                        filteredContent = filteredContent.filter((item: any) =>
                            relevantCategoryIds.includes(item.category_id)
                        );
                    }
                    setContent(filteredContent);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab, viewMode]);

    const filteredContent = content.filter(item => {
        const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleNavClick = (mode: ViewMode, type?: string) => {
        setViewMode(mode);
        setSelectedCategory(null);
        setSearchTerm('');
        setIsSidebarOpen(false); // Close sidebar on mobile on selection

        if (mode === 'content') {
            if (type === 'all') {
                navigate('/content');
                setActiveTab('all');
            } else if (type) {
                navigate(`/content?type=${type}`);
                setActiveTab(type);
            }
        } else if (mode === 'forum') {
            navigate('/content?app_mode=forum'); // Use a param or specific route if forum requires it, or just use state if it's purely client side. But since we want to clear slug:
            // Actually, "Forum" logic below relies on viewMode. 
            // If I am on /content/X, and I set viewMode='forum', I'm still on /content/X, so slug exists, so detail renders.
            // So for ALL nav clicks, I must navigate to /content (base).
            navigate('/content');
        } else {
            navigate('/content');
        }
    };

    const getContentTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText size={16} className="text-blue-600" />;
            case 'video': return <PlayCircle size={16} className="text-rose-600" />;
            case 'text': return <BookOpen size={16} className="text-emerald-600" />;
            default: return <File size={16} className="text-gray-600" />;
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'pdf': return 'PDF';
            case 'video': return 'VIDEO';
            case 'text': return 'YAZI';
            default: return 'DOSYA';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex bg-gray-100 font-sans">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
                transform transition-transform duration-200 ease-in-out h-full flex flex-col justify-between
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex-1 overflow-y-auto">
                    {/* Logo Area */}
                    <div className="flex items-center h-16 px-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">FTR</span>
                            </div>
                            <span className="text-lg font-semibold text-gray-800">FTR Online</span>
                        </Link>
                    </div>

                    {/* Main Navigation Menu */}
                    <nav className="p-4 space-y-1">
                        <button
                            onClick={() => handleNavClick('content', 'all')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'all'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Home size={20} />
                            Ana Sayfa
                        </button>

                        <button
                            onClick={() => handleNavClick('content', 'akademik')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'akademik'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <GraduationCap size={20} />
                            Akademi
                        </button>

                        <button
                            onClick={() => handleNavClick('content', 'dokuman')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'dokuman'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <FileCode size={20} />
                            Doküman
                        </button>

                        <button
                            onClick={() => handleNavClick('content', 'seminer')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'seminer'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <PlayCircle size={20} />
                            Seminer
                        </button>

                        <button
                            onClick={() => handleNavClick('forum')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'forum'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <MessageSquare size={20} />
                            Forum
                        </button>
                    </nav>

                    <div className="px-6 my-2">
                        <div className="h-px bg-gray-200"></div>
                    </div>

                    {/* Secondary Navigation - Categories (Dynamic) */}
                    <div className="p-4 pt-0">
                        {categories.length > 0 && viewMode === 'content' && (
                            <div className="animate-in fade-in duration-300">
                                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    {activeTab === 'all' ? 'Tüm Kategoriler' :
                                        activeTab === 'akademik' ? 'Akademik Kategoriler' :
                                            activeTab === 'dokuman' ? 'Doküman Kategorileri' : 'Seminer Kategorileri'}
                                </p>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm mb-1
                                            ${selectedCategory === cat.id
                                                ? 'bg-gray-100 text-gray-900 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <span className="truncate">{cat.name}</span>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 border border-gray-200">
                                            {cat.content_count || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {categories.length === 0 && viewMode === 'content' && !loading && (
                            <p className="px-4 text-xs text-gray-400 italic">Bu alanda gösterilecek kategori bulunamadı.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Footer - User */}
                <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm text-white">
                                {user.profile_photo ? (
                                    <img
                                        src={`${FILE_BASE_URL}${user.profile_photo}`}
                                        alt={user.first_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="font-bold text-sm">{user.first_name?.[0]}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.title || 'Kullanıcı'}</p>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors justify-center border border-blue-200 border-dashed">
                            <LogOut size={16} /> Giriş Yap
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 relative">

                {/* Header */}
                <header className="flex items-center justify-between bg-white h-16 px-6 border-b border-gray-200 shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="block md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Menu size={24} className="text-gray-600" />
                        </button>
                        <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                            {viewMode === 'forum' ? 'Forum' :
                                activeTab === 'all' ? 'Tüm İçerikler' :
                                    activeTab === 'akademik' ? 'Akademik Kütüphane' :
                                        activeTab === 'dokuman' ? 'Doküman Arşivi' : 'Eğitim & Seminerler'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-4">
                        {/* Search */}
                        {viewMode === 'content' && (
                            <div className="hidden sm:flex items-center gap-2 bg-gray-100/80 rounded-lg px-4 py-2 border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
                                <Search size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="İçeriklerde ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-gray-700 w-32 lg:w-48 placeholder-gray-400"
                                />
                            </div>
                        )}

                        {/* Profile Dropdown */}
                        {isAuthenticated && user && (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 hover:bg-gray-50 rounded-full py-1 pl-1 pr-3 transition-colors border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white bg-blue-100 text-blue-600">
                                        {user.profile_photo ? (
                                            <img
                                                src={`${FILE_BASE_URL}${user.profile_photo}`}
                                                alt={user.first_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="font-bold text-xs">{user.first_name?.[0]}</span>
                                        )}
                                    </div>
                                    <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                            <p className="text-sm font-semibold text-gray-900">Hesabım</p>
                                        </div>

                                        <div className="p-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <User size={16} className="text-gray-400" />
                                                Profil Ayarları
                                            </Link>

                                            {user.role === 'fulladmin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                                >
                                                    <Settings size={16} className="text-gray-400" />
                                                    Yönetim Paneli
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-100 p-1">
                                            <button
                                                onClick={async () => {
                                                    setUserMenuOpen(false);
                                                    await logout();
                                                    navigate('/');
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content Body */}
                <main className={`flex-1 overflow-y-auto ${slug ? '' : 'p-4 md:p-8'}`}>
                    {slug ? (
                        <ContentDetail />
                    ) : viewMode === 'forum' ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-lg mx-auto">
                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <MessageSquare size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Forum Çok Yakında!</h2>
                            <p className="text-gray-500 mb-8">
                                FTR uzmanlarının bilgi paylaşımında bulunabileceği, vaka tartışabileceği forum alanımız hazırlanmaktadır. Yakında hizmetinizde olacak.
                            </p>
                            <button
                                onClick={() => handleNavClick('content', 'all')}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                            >
                                İçeriklere Dön
                            </button>
                        </div>
                    ) : isAuthenticated && activeTab === 'all' && !selectedCategory && !searchTerm && viewMode === 'content' ? (
                        <div className="p-4 md:p-8">
                            <DashboardView />
                        </div>
                    ) : (
                        <>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-500 animate-pulse">Veriler getiriliyor...</p>
                                </div>
                            ) : filteredContent.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {filteredContent.map((item) => (
                                        <div key={item.id} className="bg-white rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.1)] border border-gray-100 p-5 flex flex-col h-full transition-all duration-300 group relative overflow-hidden">
                                            {/* Top Decoration */}
                                            <div className={`absolute top-0 left-0 w-full h-1 ${item.content_type === 'pdf' ? 'bg-blue-500' :
                                                item.content_type === 'video' ? 'bg-rose-500' : 'bg-emerald-500'
                                                }`}></div>

                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`p-2 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors`}>
                                                        {getContentTypeIcon(item.content_type)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-100 px-1.5 py-0.5 rounded">
                                                        {getTypeBadgeColor(item.content_type)}
                                                    </span>
                                                </div>
                                                {item.requires_auth && !isAuthenticated && (
                                                    <Lock size={16} className="text-amber-500" />
                                                )}
                                            </div>

                                            <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>

                                            <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                                                {item.description}
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-gray-400 text-xs">
                                                    <Eye size={14} /> {item.views || 0}
                                                </div>

                                                {item.requires_auth && !isAuthenticated ? (
                                                    <button
                                                        onClick={() => navigate('/login')}
                                                        className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                                    >
                                                        <Lock size={12} />
                                                        Giriş Yap
                                                    </button>
                                                ) : (
                                                    <Link
                                                        to={`/content/${item.slug}`}
                                                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                                                    >
                                                        İncele
                                                        <ChevronRight size={12} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 mx-auto max-w-2xl">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Search size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">Aradığınız kriterde içerik bulunamadı</h3>
                                    <p className="text-gray-500 text-sm mb-6">Farklı bir kategori seçmeyi veya arama terimini değiştirmeyi deneyin.</p>
                                    <button
                                        onClick={() => { setActiveTab('all'); setSelectedCategory(null); setSearchTerm(''); }}
                                        className="text-blue-600 font-bold hover:underline text-sm"
                                    >
                                        Tüm İçerikleri Listele
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ContentListPage;
