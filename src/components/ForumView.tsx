'use client';

import React, { useState, useEffect } from 'react';
import {
    MessageSquare, Users, GraduationCap, FileText,
    ChevronRight, ArrowLeft, Plus, MessageCircle,
    Eye, Clock, Send, Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import TiptapEditor from './admin/TiptapEditor'; // Reusing the editor

type ForumViewMode = 'hub' | 'category' | 'thread';

interface ForumCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    thread_count: number;
    comment_count: number;
}

interface ForumThread {
    id: number;
    title: string;
    content: string;
    first_name: string;
    last_name: string;
    user_title?: string;
    comment_count: number;
    views: number;
    created_at: string;
}

const ForumView: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [view, setView] = useState<ForumViewMode>('hub');
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    // Create Mode States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Comment States
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/forum/categories');
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (err) {
            console.error('Fetch categories error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchThreads = async (catId: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/forum/threads?category_id=${catId}`);
            const data = await res.json();
            if (data.success) setThreads(data.data);
        } catch (err) {
            console.error('Fetch threads error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchThreadDetail = async (threadId: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/forum/threads/${threadId}`);
            const data = await res.json();
            if (data.success) setSelectedThread(data.data);
        } catch (err) {
            console.error('Fetch thread detail error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (cat: ForumCategory) => {
        setSelectedCategory(cat);
        setView('category');
        fetchThreads(cat.id);
    };

    const handleThreadClick = (thread: ForumThread) => {
        setView('thread');
        fetchThreadDetail(thread.id);
    };

    const handleCreateThread = async () => {
        if (!newThreadTitle || !newThreadContent || !selectedCategory) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/forum/threads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category_id: selectedCategory.id,
                    title: newThreadTitle,
                    content: newThreadContent
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateModal(false);
                setNewThreadTitle('');
                setNewThreadContent('');
                fetchThreads(selectedCategory.id);
            }
        } catch (err) {
            console.error('Create thread error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment || !selectedThread) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/forum/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    thread_id: selectedThread.id,
                    content: newComment
                })
            });
            const data = await res.json();
            if (data.success) {
                setNewComment('');
                fetchThreadDetail(selectedThread.id);
            }
        } catch (err) {
            console.error('Add comment error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'FileText': return <FileText size={24} />;
            case 'GraduationCap': return <GraduationCap size={24} />;
            case 'MessageSquare': return <MessageSquare size={24} />;
            case 'Users': return <Users size={24} />;
            default: return <MessageSquare size={24} />;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-gray-100 p-8 md:p-12 text-center animate-in fade-in zoom-in-95 duration-500 mx-4 md:mx-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-50 text-blue-600 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 shadow-xl shadow-blue-500/10">
                    <Lock size={32} className="md:size-[40px]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tight">Topluluk Merkezine Hoş Geldiniz</h2>
                <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto mb-8 md:mb-10 leading-relaxed font-medium">
                    Forum özelliklerini kullanabilmek, tartışmalara katılmak ve paylaşımları görmek için giriş yapmalısınız.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                    >
                        Giriş Yap
                    </button>
                    <button
                        onClick={() => window.location.href = '/register'}
                        className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-blue-100 hover:text-blue-600 transition-all active:scale-95"
                    >
                        Hesap Oluştur
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    {view !== 'hub' && (
                        <button
                            onClick={() => {
                                if (view === 'thread') setView('category');
                                else setView('hub');
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={20} className="md:size-[24px] text-gray-600" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            {view === 'hub' ? 'Forum' : selectedCategory?.name}
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">
                            {view === 'hub' ? 'Topluluk tartışmaları ve vaka paylaşımları' : selectedCategory?.description}
                        </p>
                    </div>
                </div>

                {view === 'category' && isAuthenticated && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 w-full sm:w-auto"
                    >
                        <Plus size={20} />
                        Yeni Konu Aç
                    </button>
                )}
            </div>

            {/* Content Area */}
            {loading && !selectedThread && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                </div>
            )}

            {!loading && view === 'hub' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-left flex items-start gap-4 md:gap-6 group"
                        >
                            <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
                                {getIcon(cat.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2 truncate">{cat.name}</h3>
                                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 line-clamp-2">{cat.description}</p>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider md:tracking-widest">
                                    <span className="flex items-center gap-1"><MessageSquare size={12} className="md:size-3.5" /> {cat.thread_count} Konu</span>
                                    <span className="flex items-center gap-1"><MessageCircle size={12} className="md:size-3.5" /> {cat.comment_count} Yorum</span>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 self-center group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </button>
                    ))}
                </div>
            )}

            {!loading && view === 'category' && (
                <div className="space-y-4">
                    {threads.length === 0 ? (
                        <div className="bg-white p-12 md:p-20 rounded-[2rem] border border-dashed border-gray-200 text-center">
                            <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">Henüz konu açılmamış</h3>
                            <p className="text-gray-500">İlk konuyu siz başlatın!</p>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => handleThreadClick(thread)}
                                className="w-full bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between group gap-4"
                            >
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm md:text-base flex-shrink-0">
                                        {thread.first_name[0]}{thread.last_name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{thread.title}</h4>
                                        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-gray-400 font-medium">
                                            <span className="truncate">{thread.first_name} {thread.last_name}</span>
                                            <span>•</span>
                                            <span className="whitespace-nowrap">{formatDate(thread.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 md:gap-6 text-gray-400 border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <div className="flex-1 sm:flex-none text-center sm:text-left">
                                        <div className="text-base md:text-lg font-bold text-gray-900">{thread.comment_count}</div>
                                        <div className="text-[10px] uppercase tracking-wider font-black">Yorum</div>
                                    </div>
                                    <div className="flex-1 sm:flex-none text-center sm:text-left">
                                        <div className="text-base md:text-lg font-bold text-gray-900">{thread.views}</div>
                                        <div className="text-[10px] uppercase tracking-wider font-black">İzlenme</div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}

            {view === 'thread' && selectedThread && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Main Thread Card */}
                    <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-12 border-b border-gray-50">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl font-black flex-shrink-0">
                                        {selectedThread.first_name[0]}{selectedThread.last_name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-black text-gray-900 truncate">{selectedThread.first_name} {selectedThread.last_name}</div>
                                        <div className="text-[10px] md:text-xs text-blue-600 font-bold uppercase tracking-widest">{selectedThread.user_title || 'Üye'}</div>
                                    </div>
                                </div>
                                <div className="sm:ml-auto text-[10px] md:text-xs font-bold text-gray-400 flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                                    <Clock size={14} /> {formatDate(selectedThread.created_at)}
                                </div>
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-6 tracking-tight leading-tight">{selectedThread.title}</h2>
                            <div
                                className="prose prose-sm md:prose-blue max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: selectedThread.content }}
                            />
                        </div>

                        {/* Stats Bar */}
                        <div className="px-6 md:px-8 py-3 md:py-4 bg-gray-50/50 flex items-center gap-4 md:gap-6 text-xs md:text-sm font-bold text-gray-500">
                            <span className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 md:w-[18px] md:h-[18px]" /> {selectedThread.comments.length} Yorum
                            </span>
                            <span className="flex items-center gap-2">
                                <Eye className="w-4 h-4 md:w-[18px] md:h-[18px]" /> {selectedThread.views} Görüntülenme
                            </span>
                        </div>
                    </div>

                    {/* Comments Area */}
                    <div className="space-y-4 md:space-y-6">
                        <h3 className="text-xl font-black text-gray-900 ml-2">Yorumlar</h3>
                        {selectedThread.comments.map((comment: any) => (
                            <div key={comment.id} className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex gap-4 md:gap-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-gray-400 rounded-xl md:rounded-2xl flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                    {comment.first_name[0]}{comment.last_name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-gray-900 truncate mr-2">{comment.first_name} {comment.last_name}</div>
                                        <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">{formatDate(comment.created_at)}</div>
                                    </div>
                                    <div className="text-gray-600 leading-relaxed text-sm">{comment.content}</div>
                                </div>
                            </div>
                        ))}

                        {/* Reply Section */}
                        {isAuthenticated ? (
                            <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] border-2 border-blue-100 shadow-xl shadow-blue-500/5">
                                <h4 className="font-black text-gray-900 mb-4 text-lg">Cevap Yaz</h4>
                                <textarea
                                    className="w-full p-4 md:p-6 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[120px]"
                                    placeholder="Fikrinizi paylaşın..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleAddComment}
                                        disabled={isSubmitting || !newComment}
                                        className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-200 w-full md:w-auto"
                                    >
                                        <Send size={18} />
                                        Gönder
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 p-8 rounded-3xl text-center border border-dashed border-gray-300">
                                <Lock size={24} className="mx-auto mb-2 text-gray-400" />
                                <p className="text-sm font-bold text-gray-500">Yorum yazmak için giriş yapmalısınız.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Thread Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6 md:p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-full md:max-h-[90vh] rounded-3xl md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-6 md:p-12 overflow-y-auto flex-1">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 md:mb-8 tracking-tight">Yeni Konu Başlat</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Başlık</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 md:px-8 py-4 md:py-5 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-base md:text-lg font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200"
                                        placeholder="Konu başlığını girin..."
                                        value={newThreadTitle}
                                        onChange={(e) => setNewThreadTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">İçerik</label>
                                    <TiptapEditor
                                        content={newThreadContent}
                                        onChange={(html) => setNewThreadContent(html)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4">
                            <button onClick={() => setShowCreateModal(false)} className="w-full md:w-auto px-6 py-3 text-sm font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">İptal</button>
                            <button
                                onClick={handleCreateThread}
                                disabled={isSubmitting || !newThreadTitle || !newThreadContent}
                                className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-xl md:rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
                                Yayınla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumView;
