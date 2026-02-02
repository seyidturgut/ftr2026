'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileText, PlayCircle, BookOpen, Filter, ChevronRight, Search, Lock, Eye,
    Home, Users, Settings, MessageSquare, Menu, X, File, LogOut, User,
    ChevronDown, GraduationCap, FileCode, LayoutDashboard, Heart,
    FolderTree, Layers, Calculator, Stethoscope, Sun, Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import DashboardView from '@/components/DashboardView';
import ProfileView from '@/components/ProfileView';
import AdminView from '@/components/AdminView';
import ContentDetailView from '@/components/ContentDetailView';
import CalculatorsView from '@/components/CalculatorsView';
import PrescriptionGenerator from '@/components/PrescriptionGenerator';
import ForumView from '@/components/ForumView';

type ViewMode = 'content' | 'forum' | 'profile' | 'admin' | 'calculator' | 'rx';

function ContentPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [activeTab, setActiveTab] = useState<string>(searchParams?.get('type') || 'all');
    const [viewMode, setViewMode] = useState<ViewMode>('content');
    const [categories, setCategories] = useState<any[]>([]);
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(searchParams?.get('slug') || null);
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    useEffect(() => {
        const type = searchParams?.get('type');
        const categoryId = searchParams?.get('category_id');

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

        const slug = searchParams?.get('slug');
        setSelectedSlug(slug);
    }, [searchParams, viewMode]);

    // Handle view mode initialization from query parameters
    useEffect(() => {
        const view = searchParams?.get('view') as ViewMode;
        if (view && ['forum', 'profile', 'admin', 'calculator', 'rx'].includes(view)) {
            if (view === 'admin' && user?.role !== 'fulladmin') {
                setViewMode('content');
            } else {
                setViewMode(view);
            }
        } else {
            setViewMode('content');
        }
    }, [searchParams, user]);

    useEffect(() => {
        if (viewMode !== 'content') return;

        const loadData = async () => {
            setLoading(true);
            try {
                const categoryType = activeTab === 'all' ? undefined : activeTab;
                // Use relative path for client-side fetch to ensure build safety
                const catRes = await fetch(`/api/content/categories${categoryType ? `?content_type=${categoryType}` : ''}`);
                const catData = await catRes.json();

                const contentRes = await fetch('/api/content');
                const contentData = await contentRes.json();

                if (catData.success) setCategories(catData.data);

                if (contentData.success) {
                    let filteredContent = contentData.data;

                    if (activeTab !== 'all' && catData.success) {
                        const relevantCategoryIds = catData.data.map((c: any) => c.id);
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
        let matchesCategory = true;
        if (selectedCategory) {
            // Include items from the selected category PLUS its subcategories
            const childCategoryIds = categories
                .filter(c => c.parent_id === selectedCategory)
                .map(c => c.id);
            matchesCategory = item.category_id === selectedCategory || childCategoryIds.includes(item.category_id);
        }

        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleNavClick = (mode: ViewMode, type?: string) => {
        setViewMode(mode);
        setSelectedCategory(null);
        setSearchTerm('');
        setSelectedSlug(null);
        setIsSidebarOpen(false);

        const params = new URLSearchParams();
        if (mode === 'content') {
            if (type && type !== 'all') {
                params.set('type', type);
            }
            if (type === 'all') {
                setActiveTab('all');
            } else if (type) {
                setActiveTab(type);
            }
        } else {
            params.set('view', mode);
        }

        const queryString = params.toString();
        router.push(queryString ? `/content?${queryString}` : '/content');
    };

    const handleToggleFavorite = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            router.push('/login?redirect=/content');
            return;
        }

        try {
            const isFavorite = !!item.is_favorite;
            const method = isFavorite ? 'DELETE' : 'POST';
            const url = isFavorite
                ? `/api/user/favorites?content_id=${item.id}`
                : '/api/user/favorites';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: isFavorite ? undefined : JSON.stringify({ content_id: item.id }),
            });
            const data = await response.json();

            if (data.success) {
                // Update local state
                setContent(prev => prev.map(c =>
                    c.id === item.id ? { ...c, is_favorite: !isFavorite } : c
                ));
            }
        } catch (err) {
            console.error('Favorite toggle error:', err);
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
    const getBreadcrumbs = () => {
        const crumbs: any[] = [];

        // Add active tab as first crumb if not 'all'
        if (activeTab !== 'all') {
            const tabName = activeTab === 'akademik' ? 'Akademik' :
                activeTab === 'dokuman' ? 'Doküman' :
                    activeTab === 'seminer' ? 'Seminer' : activeTab;
            crumbs.push({ id: 'tab-root', name: tabName, isTab: true });
        }

        if (selectedCategory) {
            const path: any[] = [];
            let currentId = selectedCategory;
            while (currentId) {
                const cat = categories.find(c => c.id === currentId);
                if (cat) {
                    path.unshift(cat);
                    currentId = cat.parent_id;
                } else break;
            }
            crumbs.push(...path);
        }

        return crumbs;
    };


    return (
        <div className="fixed inset-0 z-50 flex bg-gray-100 dark:bg-slate-950 font-sans">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 
                transform transition-transform duration-200 ease-in-out h-full flex flex-col justify-between
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                        <Link href="/" className="flex items-center gap-2">
                            {/* Light Mode Logo */}
                            <img
                                src="/ftronline-logo-light.png"
                                alt="FTR Online"
                                className="h-8 w-auto dark:hidden"
                            />
                            {/* Dark Mode Logo */}
                            <img
                                src="/ftronline-logo-dark.png"
                                alt="FTR Online"
                                className="h-8 w-auto hidden dark:block"
                            />
                        </Link>
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-full text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="block md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-1">
                        <button
                            onClick={() => handleNavClick('content', 'all')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'all'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <Home size={20} />
                            Ana Sayfa
                        </button>

                        <button
                            onClick={() => handleNavClick('content', 'akademik')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'akademik'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <GraduationCap size={20} />
                            Akademik
                        </button>

                        <button
                            onClick={() => handleNavClick('content', 'dokuman')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'dokuman'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <FileCode size={20} />
                            Doküman
                        </button>

                        <button
                            onClick={() => handleNavClick('content', 'seminer')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'content' && activeTab === 'seminer'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <PlayCircle size={20} />
                            Seminer
                        </button>

                        <button
                            onClick={() => setViewMode('calculator')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'calculator'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <Calculator size={20} />
                            Ölçekler
                        </button>

                        <button
                            onClick={() => setViewMode('rx')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'rx'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <Stethoscope size={20} />
                            Reçeteci
                        </button>

                        <button
                            onClick={() => handleNavClick('forum')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                ${viewMode === 'forum'
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <MessageSquare size={20} />
                            Forum
                        </button>

                        {isAuthenticated && (
                            <button
                                onClick={() => setViewMode('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                    ${viewMode === 'profile'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <Settings size={20} />
                                Profil Ayarları
                            </button>
                        )}

                        {user?.role === 'fulladmin' && (
                            <button
                                onClick={() => setViewMode('admin')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                                    ${viewMode === 'admin'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                <LayoutDashboard size={20} />
                                <span className="text-left flex-1">Yönetim Paneli</span>
                                <div className="ml-auto w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            </button>
                        )}
                    </nav>

                    <div className="px-6 my-2">
                        <div className="h-px bg-gray-200 dark:bg-slate-800"></div>
                    </div>

                    <div className="p-4 pt-0">
                        {categories.length > 0 && viewMode === 'content' && (
                            <div className="animate-in fade-in duration-300">
                                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                    {activeTab === 'all' ? 'Tüm Kategoriler' :
                                        activeTab === 'akademik' ? 'Akademik Kategoriler' :
                                            activeTab === 'dokuman' ? 'Doküman Kategorileri' :
                                                activeTab === 'seminer' ? 'Seminer Kategorileri' : 'Kategoriler'}
                                </p>
                                <div className="space-y-1">
                                    {categories.filter(c => !c.parent_id).map(category => {
                                        const isSelected = selectedCategory === category.id;
                                        const isParentSelected = !isSelected && categories.some(c => c.parent_id === category.id && (c.id === selectedCategory || expandedCategories.includes(c.id)));
                                        const isOpen = expandedCategories.includes(category.id);
                                        const subCategories = categories.filter(c => c.parent_id === category.id);
                                        const hasSubCategories = subCategories.length > 0;

                                        return (
                                            <div key={category.id} className="space-y-1">
                                                <button
                                                    onClick={() => {
                                                        if (hasSubCategories) {
                                                            if (isOpen) {
                                                                setExpandedCategories(prev => prev.filter(id => id !== category.id));
                                                            } else {
                                                                setExpandedCategories(prev => [...prev, category.id]);
                                                            }
                                                        }
                                                        setSelectedCategory(category.id);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group
                                                    ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' :
                                                            isParentSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' :
                                                                'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'}`}
                                                >
                                                    <span className="font-medium truncate">{category.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            {category.content_count || 0}
                                                        </span>
                                                        {hasSubCategories && (
                                                            <ChevronRight
                                                                size={14}
                                                                className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${isSelected ? 'text-white' : 'text-gray-400'}`}
                                                            />
                                                        )}
                                                    </div>
                                                </button>

                                                {hasSubCategories && isOpen && (
                                                    <div className="pl-4 space-y-1 relative border-l-2 border-slate-100 ml-4 animate-in slide-in-from-left-2 duration-200">
                                                        {subCategories.map(subCategory => {
                                                            const isSubSelected = selectedCategory === subCategory.id;
                                                            return (
                                                                <button
                                                                    key={subCategory.id}
                                                                    onClick={() => setSelectedCategory(subCategory.id)}
                                                                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all
                                                                    ${isSubSelected
                                                                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold shadow-sm ring-1 ring-blue-200 dark:ring-blue-800'
                                                                            : 'text-gray-500 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-300'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {isSubSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                                                                        <span className="truncate">{subCategory.name}</span>
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-400 font-medium">{subCategory.content_count || 0}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Profile Summary at bottom */}
                {isAuthenticated && user && (
                    <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all overflow-hidden">
                                    {user.profile_photo ? (
                                        <img
                                            src={`/uploads/${user.profile_photo}`}
                                            alt={`${user.first_name} ${user.last_name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                        {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate font-medium">
                                        {user.title || 'Kullanıcı'}
                                    </p>
                                </div>
                                <Settings size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                                    <div className="p-1">
                                        <button
                                            onClick={() => setViewMode('profile')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                        >
                                            <User size={16} className="text-gray-400" />
                                            Profilim
                                        </button>
                                        <button
                                            onClick={() => setViewMode('profile')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                        >
                                            <Settings size={16} className="text-gray-400" />
                                            Ayarlar
                                        </button>
                                        {user.role === 'fulladmin' && (
                                            <button
                                                onClick={() => {
                                                    setViewMode('admin');
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                            >
                                                <Settings size={16} className="text-gray-400" />
                                                Yönetim Paneli
                                            </button>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 p-1">
                                        <button
                                            onClick={async () => {
                                                setUserMenuOpen(false);
                                                await logout();
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
                    </div>
                )}

                {/* Guest Logic for Sidebar Bottom */}
                {!isAuthenticated && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                        <Link
                            href="/login"
                            className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <User size={18} />
                            <span className="font-bold text-sm">Giriş Yap</span>
                        </Link>
                    </div>
                )}
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 dark:bg-slate-950 relative">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed top-4 left-4 z-30 block md:hidden p-3 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                    <Menu size={24} className="text-gray-600" />
                </button>

                {/* User Menu - Top Right */}
                {isAuthenticated && user ? (

                    <div className="fixed top-4 right-4 z-30">
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 hover:bg-white/80 rounded-full py-1 pl-1 pr-3 transition-colors bg-white shadow-lg border border-gray-200"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                                    {user.profile_photo ? (
                                        <img
                                            src={`/uploads/${user.profile_photo}`}
                                            alt={user.first_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-bold text-sm">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                                    )}
                                </div>
                                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-gray-500">{user.title || 'Kullanıcı'}</p>
                                    </div>

                                    <div className="p-1">
                                        <button
                                            onClick={() => {
                                                setViewMode('profile');
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                        >
                                            <User size={16} className="text-gray-400" />
                                            Profil Ayarları
                                        </button>

                                        {user.role === 'fulladmin' && (
                                            <button
                                                onClick={() => {
                                                    setViewMode('admin');
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
                                            >
                                                <Settings size={16} className="text-gray-400" />
                                                Yönetim Paneli
                                            </button>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 p-1">
                                        <button
                                            onClick={async () => {
                                                setUserMenuOpen(false);
                                                await logout();
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
                    </div>
                ) : (
                    /* Guest Login Button - Top Right */
                    <div className="fixed top-4 right-4 z-30">
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-bold rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all text-sm md:text-base"
                        >
                            <User size={18} />
                            <span className="hidden md:inline">Giriş Yap</span>
                        </Link>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {viewMode === 'forum' ? (
                        <ForumView />
                    ) : viewMode === 'profile' ? (
                        <ProfileView />
                    ) : viewMode === 'admin' ? (
                        <AdminView />
                    ) : viewMode === 'calculator' ? (
                        <CalculatorsView onBack={() => handleNavClick('content', 'all')} />
                    ) : viewMode === 'rx' ? (
                        <PrescriptionGenerator onBack={() => handleNavClick('content', 'all')} />
                    ) : selectedSlug ? (
                        <ContentDetailView
                            slug={selectedSlug}
                            onBack={() => {
                                const params = new URLSearchParams(window.location.search);
                                params.delete('slug');
                                params.delete('category_id');
                                params.set('type', activeTab || 'all');
                                router.push(`/content?${params.toString()}`);
                            }}
                        />
                    ) : (
                        <>
                            {/* Smart Search Bar */}
                            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                                <div className="relative group max-w-2xl mx-auto md:mx-0">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search size={20} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Konu, başlık veya anahtar kelime ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm text-sm font-medium text-slate-900 dark:text-white"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Breadcrumbs */}
                                {activeTab !== 'all' && (
                                    <nav className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto no-scrollbar pb-2">
                                        <button
                                            onClick={() => {
                                                setSelectedCategory(null);
                                                setSearchTerm('');
                                            }}
                                            className="hover:text-blue-600 transition-colors shrink-0"
                                        >
                                            <Home size={12} />
                                        </button>

                                        <ChevronRight size={10} className="shrink-0 opacity-30" />

                                        {getBreadcrumbs().map((crumb, idx, arr) => (
                                            <React.Fragment key={crumb.id}>
                                                <button
                                                    onClick={() => {
                                                        if (crumb.isTab) {
                                                            setSelectedCategory(null);
                                                        } else {
                                                            setSelectedCategory(crumb.id);
                                                        }
                                                        setSearchTerm('');
                                                    }}
                                                    className={`hover:text-blue-600 transition-colors whitespace-nowrap ${idx === arr.length - 1 ? 'text-blue-600 pointer-events-none' : ''}`}
                                                >
                                                    {crumb.name}
                                                </button>
                                                {idx < arr.length - 1 && (
                                                    <ChevronRight size={10} className="shrink-0 opacity-30" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </nav>
                                )}
                            </div>

                            {isAuthenticated && activeTab === 'all' && !selectedCategory && !searchTerm && (
                                <DashboardView />
                            )}

                            {(activeTab !== 'all' || selectedCategory || searchTerm || !isAuthenticated) && (
                                <>
                                    {/* Recursive Category Grid View */}
                                    {(() => {
                                        // Determine which categories to show (children of selected OR top level if none selected)
                                        if (searchTerm) return null;

                                        let childrenCategories: any[] = [];

                                        if (selectedCategory) {
                                            childrenCategories = categories.filter(c => c.parent_id === selectedCategory);
                                        } else {
                                            // Root level for this tab
                                            const roots = categories.filter(c => !c.parent_id && activeTab !== 'all');

                                            // Auto-drilldown: If specific tab (akademik/dokuman/seminer) has exactly ONE root category,
                                            // we assume that root IS the category for the tab (e.g. "Akademik"), 
                                            // so we skip it and show its children directly.
                                            if (['akademik', 'dokuman', 'seminer'].includes(activeTab) && roots.length === 1) {
                                                childrenCategories = categories.filter(c => c.parent_id === roots[0].id);
                                            } else {
                                                childrenCategories = roots;
                                            }
                                        }

                                        // Only show grid if there are children to show AND we are not in 'all' tab (unless strict requirement)
                                        const shouldShowGrid = childrenCategories.length > 0 && activeTab !== 'all';

                                        if (!shouldShowGrid) return null;

                                        // Get current category name for title
                                        const currentCategory = categories.find(c => c.id === selectedCategory);
                                        const title = currentCategory ? currentCategory.name :
                                            (activeTab === 'akademik' ? 'Akademik Bölümler' :
                                                activeTab === 'dokuman' ? 'Doküman Kategorileri' :
                                                    activeTab === 'seminer' ? 'Seminer Konuları' : 'Kategoriler');

                                        return (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                                                <div className="mb-6">
                                                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                                                        {selectedCategory && (
                                                            <button
                                                                onClick={() => {
                                                                    // Go up one level
                                                                    const current = categories.find(c => c.id === selectedCategory);
                                                                    // If parent is the "skipped root", then going up should effectively go to NULL selection
                                                                    // But if we go to NULL, we show the children of skipped root again. Perfect.
                                                                    setSelectedCategory(current?.parent_id || null);
                                                                }}
                                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-1"
                                                            >
                                                                <ChevronRight className="rotate-180" size={20} />
                                                            </button>
                                                        )}
                                                        {title}
                                                    </h2>
                                                    <p className="text-gray-500 text-sm mt-1 ml-1">
                                                        {selectedCategory ? 'Alt kategorilerden seçim yapınız.' : 'İlgilendiğiniz alanı seçerek içerikleri görüntüleyebilirsiniz.'}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                    {childrenCategories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => {
                                                                setSelectedCategory(cat.id);
                                                                setExpandedCategories(prev => [...new Set([...prev, cat.id])]);
                                                            }}
                                                            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 group transition-all text-left flex flex-col h-40 relative overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                                                <FolderTree size={64} className="text-blue-600" />
                                                            </div>

                                                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                                                <Layers size={24} />
                                                            </div>

                                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg mb-1 truncate w-full">
                                                                {cat.name}
                                                            </h3>
                                                            <div className="mt-auto flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                <span className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                                    <FileText size={12} /> {cat.content_count || 0} İçerik
                                                                </span>
                                                                {categories.some(sub => sub.parent_id === cat.id) && (
                                                                    <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
                                                                        <FolderTree size={12} /> Alt Kategori
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Content List - Only show if searchTerm OR (no subcategories for selected/mix) */}
                                    {(() => {
                                        // Logic: Show content if:
                                        // 1. searchTerm is present
                                        // 2. OR activeTab is 'all'
                                        // 3. OR selectedCategory has NO children (leaf node)
                                        // 4. OR (edge case) we are at top level but there are no categories? (Taken care of by loading/empty state)

                                        const hasChildren = selectedCategory && categories.some(c => c.parent_id === selectedCategory);
                                        const isLeafNode = selectedCategory && !hasChildren;
                                        const isTopLevel = !selectedCategory;
                                        // If top level and not 'all', we showed grid above. So don't show content unless grid is empty?
                                        // But if grid is shown, we often HIDE content to cleaner look.

                                        const shouldShowContent = searchTerm || activeTab === 'all' || isLeafNode;

                                        if (!shouldShowContent) return null;

                                        return (
                                            <>
                                                {loading ? (
                                                    <div className="flex flex-col items-center justify-center py-20">
                                                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                                        <p className="text-gray-500 animate-pulse">Veriler getiriliyor...</p>
                                                    </div>
                                                ) : filteredContent.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                                        {filteredContent.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                onClick={() => {
                                                                    if (!isAuthenticated) {
                                                                        router.push('/login');
                                                                    } else {
                                                                        const params = new URLSearchParams(window.location.search);
                                                                        params.set('slug', item.slug);
                                                                        router.push(`/content?${params.toString()}`);
                                                                    }
                                                                }}
                                                                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-slate-800 flex flex-col h-full transition-all duration-300 group relative overflow-hidden cursor-pointer"
                                                            >
                                                                <div className={`absolute top-0 left-0 w-full h-1 z-20 ${item.content_type === 'pdf' ? 'bg-blue-500' :
                                                                    item.content_type === 'video' ? 'bg-rose-500' : 'bg-emerald-500'
                                                                    }`}></div>

                                                                {item.cover_image && (
                                                                    <div className="w-full h-36 overflow-hidden bg-gray-50 dark:bg-slate-800 flex-shrink-0 relative border-b border-gray-50 dark:border-slate-800">
                                                                        <img
                                                                            src={`/uploads/${item.cover_image}`}
                                                                            alt={item.title}
                                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                            loading="lazy"
                                                                        />
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                    </div>
                                                                )}

                                                                <div className="p-5 flex flex-col flex-1">
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div className="flex flex-wrap gap-1 items-center">
                                                                            <span className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                                {getContentTypeIcon(item.content_type)}
                                                                            </span>
                                                                            {item.pdf_url && (
                                                                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                                                                    PDF
                                                                                </span>
                                                                            )}
                                                                            {item.pptx_url && (
                                                                                <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider border border-orange-100 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                                                                                    PPTX
                                                                                </span>
                                                                            )}
                                                                            {item.video_url && (
                                                                                <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider border border-rose-100 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">
                                                                                    MP4
                                                                                </span>
                                                                            )}
                                                                            {item.reference_pdf_url && (
                                                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                                                                                    REF
                                                                                </span>
                                                                            )}
                                                                            {!item.pdf_url && !item.pptx_url && !item.video_url && !item.reference_pdf_url && (
                                                                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                                                                                    YAZI
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {isAuthenticated && (
                                                                                <button
                                                                                    onClick={(e) => handleToggleFavorite(e, item)}
                                                                                    className={`p-1.5 rounded-lg transition-all ${item.is_favorite ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
                                                                                >
                                                                                    <Heart size={16} fill={item.is_favorite ? "currentColor" : "none"} />
                                                                                </button>
                                                                            )}
                                                                            {item.requires_auth && !isAuthenticated && (
                                                                                <Lock size={16} className="text-amber-500" />
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                        {item.title}
                                                                    </h3>

                                                                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                                                                        {item.description}
                                                                    </p>

                                                                    <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between">
                                                                        <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500 text-xs">
                                                                            <Eye size={14} /> {item.views || 0}
                                                                        </div>

                                                                        {!isAuthenticated ? (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    router.push('/login');
                                                                                }}
                                                                                className="text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                                                            >
                                                                                <Lock size={12} />
                                                                                Giriş Yap
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    const params = new URLSearchParams(window.location.search);
                                                                                    params.set('slug', item.slug);
                                                                                    router.push(`/content?${params.toString()}`);
                                                                                }}
                                                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-full transition-all flex items-center gap-1"
                                                                            >
                                                                                İncele
                                                                                <ChevronRight size={12} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 mx-auto max-w-2xl">
                                                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-slate-500">
                                                            <Search size={32} />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Aradığınız kriterde içerik bulunamadı</h3>
                                                        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Farklı bir kategori seçmeyi deneyin.</p>
                                                        <button
                                                            onClick={() => { setActiveTab('all'); setSelectedCategory(null); setSearchTerm(''); }}
                                                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-sm"
                                                        >
                                                            Tüm İçerikleri Listele
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )
                                    })()}
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function ContentPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Sayfa yükleniyor...</p>
                </div>
            </div>
        }>
            <ContentPageContent />
        </Suspense>
    );
}
