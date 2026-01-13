'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    FilePlus, Search, Edit2, Trash2, ExternalLink,
    FileText, Lock, Unlock, X, Save, AlertCircle,
    Image as ImageIcon, Video, FileUp, ListRestart,
    Download, Layout, ChevronRight, RefreshCw
} from 'lucide-react';
import TiptapEditor from './TiptapEditor';
import CoverGenerator from './CoverGenerator';

interface Content {
    id: number;
    title: string;
    slug: string;
    content_type: string;
    category_id: number;
    category_name?: string;
    requires_auth: boolean;
    created_at: string;
    description: string;
    text_content?: string;
    video_url?: string;
    pdf_url?: string;
    pptx_url?: string;
    cover_image?: string;
    reference_pdf_url?: string;
    prepared_by?: string;
    is_published: boolean;
    content_order?: string[];
}

const ContentManagement: React.FC = () => {
    const [contents, setContents] = useState<Content[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage] = useState(20);

    // Edit Modal State
    const [editingItem, setEditingItem] = useState<Content | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // File Upload State
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [showCoverGenerator, setShowCoverGenerator] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter debounce
    const timerRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Debounce search/filter
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            fetchContents();
        }, 500);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [searchTerm, selectedCategoryId, currentPage]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/content/categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Categories fetch error:', error);
        }
    };

    const fetchContents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchTerm,
                category: selectedCategoryId.toString()
            });
            const response = await fetch(`/api/admin/content?${params.toString()}`);
            const data = await response.json();
            if (data.success) {
                setContents(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalItems(data.pagination.total);
                }
            }
        } catch (error) {
            console.error('Content fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        const newItem: Partial<Content> = {
            title: '',
            slug: '',
            content_type: 'text',
            category_id: categories.length > 0 ? categories[0].id : 0,
            requires_auth: true,
            is_published: true,
            description: '',
            text_content: '',
            content_order: ['text', 'pdf', 'video', 'pptx']
        };
        setEditingItem(newItem as Content);
        setMessage(null);
    };

    const handleEdit = (item: Content) => {
        setEditingItem({
            ...item,
            content_order: item.content_order || ['text', 'pdf', 'video', 'pptx']
        });
        setMessage(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`/api/admin/content/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setContents(contents.filter(c => c.id !== id));
            } else {
                alert(data.message || 'Silme işlemi başarısız.');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type === 'cover' ? 'image' : (type === 'reference_pdf' ? 'pdf' : type));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload/content', true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(prev => ({ ...prev, [type]: percent }));
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    setEditingItem(prev => {
                        if (!prev) return null;
                        const updates: any = {};
                        if (type === 'cover') updates.cover_image = data.filename;
                        if (type === 'pdf') updates.pdf_url = data.filename;
                        if (type === 'video') updates.video_url = data.filename;
                        if (type === 'pptx') updates.pptx_url = data.filename;
                        if (type === 'reference_pdf') updates.reference_pdf_url = data.filename;
                        return { ...prev, ...updates };
                    });
                } else {
                    alert(data.message || 'Yükleme başarısız.');
                }
            } else {
                alert('Yükleme sırasında hata oluştu.');
            }
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next[type];
                return next;
            });
        };

        xhr.onerror = () => {
            alert('Ağ hatası oluştu.');
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next[type];
                return next;
            });
        };

        xhr.send(formData);
    };

    const handleFileDelete = async (type: string, filename: string) => {
        if (!confirm('Dosyayı silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/upload/content?filename=${filename}`, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setEditingItem(prev => {
                    if (!prev) return null;
                    const updates: any = {};
                    if (type === 'cover') updates.cover_image = null;
                    if (type === 'pdf') updates.pdf_url = null;
                    if (type === 'video') updates.video_url = null;
                    if (type === 'pptx') updates.pptx_url = null;
                    if (type === 'reference_pdf') updates.reference_pdf_url = null;
                    return { ...prev, ...updates };
                });
            } else {
                alert(data.message || 'Silme işlemi başarısız.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Silme sırasında hata oluştu.');
        }
    };

    const handleCoverGenerated = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        setUploadProgress(prev => ({ ...prev, cover: 0 }));

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload/content', true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(prev => ({ ...prev, cover: percent }));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        setEditingItem(prev => (prev ? { ...prev, cover_image: data.filename } : null));
                        setShowCoverGenerator(false);
                    } else {
                        alert(data.message || 'Yükleme başarısız.');
                    }
                } else {
                    alert('Yükleme sırasında hata oluştu.');
                }
                setUploadProgress(prev => {
                    const next = { ...prev };
                    delete next['cover'];
                    return next;
                });
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Yükleme sırasında hata oluştu.');
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next['cover'];
                return next;
            });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const isNew = !editingItem.id;
            const url = isNew ? '/api/admin/content' : `/api/admin/content/${editingItem.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
            });
            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: isNew ? 'İçerik başarıyla oluşturuldu!' : 'İçerik başarıyla güncellendi!' });
                fetchContents();
                setTimeout(() => setEditingItem(null), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'İşlem başarısız.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Sunucu hatası oluştu.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredContents = contents; // Server handles filtering now

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="İçerik başlığı veya türü ara..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on search
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="flex-1 max-w-[200px]">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => {
                            setSelectedCategoryId(e.target.value === 'all' ? 'all' : parseInt(e.target.value));
                            setCurrentPage(1); // Reset to page 1 on filter
                        }}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                        <option value="all">Tüm Kategoriler</option>
                        {categories.map(cat => {
                            const getPath = (id: number): string => {
                                const c = categories.find(x => x.id === id);
                                if (!c) return '';
                                if (c.parent_id) return getPath(c.parent_id) + ' > ' + c.name;
                                return c.name;
                            };
                            return (
                                <option key={cat.id} value={cat.id}>
                                    {getPath(cat.id)}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                >
                    <FilePlus size={18} />
                    Yeni İçerik Ekle
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-500 uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-8 py-5">İçerik</th>
                                <th className="px-6 py-5">Kategori & Tür</th>
                                <th className="px-6 py-5 text-center">Medya</th>
                                <th className="px-6 py-5">Erişim</th>
                                <th className="px-8 py-5 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                                    <div className="h-3 w-16 bg-gray-50 rounded"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                <div className="h-3 w-20 bg-gray-100 rounded-full"></div>
                                                <div className="h-3 w-12 bg-gray-50 rounded"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center gap-1">
                                                <div className="w-6 h-6 bg-gray-100 rounded"></div>
                                                <div className="w-6 h-6 bg-gray-100 rounded"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="h-8 w-8 bg-gray-100 rounded-xl ml-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : contents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Search size={40} className="mb-2 opacity-20" />
                                            <p className="font-bold">İçerik bulunamadı.</p>
                                            <p className="text-xs">Arama kriterlerinizi değiştirmeyi deneyin.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                contents.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                {item.cover_image ? (
                                                    <img src={`/uploads/${item.cover_image}`} className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center">
                                                        <FileText size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900 line-clamp-1">{item.title}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">#{item.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-600 w-fit">{item.category_name}</span>
                                                <span className="text-gray-500 font-medium capitalize text-xs">{item.content_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {item.pdf_url && <div className="p-1.5 bg-red-50 text-red-500 rounded-lg" title="PDF Mevcut"><FileUp size={14} /></div>}
                                                {item.video_url && <div className="p-1.5 bg-purple-50 text-purple-500 rounded-lg" title="Video Mevcut"><Video size={14} /></div>}
                                                {item.pptx_url && <div className="p-1.5 bg-orange-50 text-orange-500 rounded-lg" title="PPTX Mevcut"><Download size={14} /></div>}
                                                {item.reference_pdf_url && <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg" title="Ref. Makale Mevcut"><FileUp size={14} /></div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {item.requires_auth ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold">
                                                    <Lock size={12} /> Üyelik
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                                                    <Unlock size={12} /> Herkese Açık
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => window.open(`/content/${item.slug}`, '_blank')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><ExternalLink size={16} /></button>
                                                <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-8 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium">
                        Toplam <span className="font-bold text-gray-900">{totalItems}</span> içerikten
                        <span className="font-bold text-gray-900"> {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}</span> arası gösteriliyor
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                        >
                            <ChevronRight size={18} className="rotate-180" />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                // Show first, last, and pages around current
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
                                                ${currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                                                    : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="text-gray-300 px-1">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center justify-between px-10 py-8 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">İçeriği Düzenle</h2>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">ID {editingItem.id}</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium mt-1">Gelişmiş içerik editörü ve medya yönetimi</p>
                            </div>
                            <button onClick={() => setEditingItem(null)} className="p-3 hover:bg-white hover:shadow-xl rounded-2xl transition-all group active:scale-95">
                                <X size={24} className="text-gray-400 group-hover:text-gray-900" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
                            <form onSubmit={handleSave} className="space-y-10">
                                {message && (
                                    <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in zoom-in-95 duration-300 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                            {message.type === 'success' ? <Save size={20} /> : <AlertCircle size={20} />}
                                        </div>
                                        <span className="text-sm font-black">{message.text}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {/* Left: Metadata */}
                                    <div className="lg:col-span-1 space-y-8">
                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kapak Görseli</label>
                                            <div className="group relative aspect-video w-full rounded-[2rem] overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all cursor-pointer">
                                                {editingItem.cover_image ? (
                                                    <>
                                                        <img src={`/uploads/${editingItem.cover_image}`} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="p-4 bg-white/20 backdrop-blur-xl text-white rounded-2xl hover:bg-white/30 transition-all active:scale-90"
                                                            >
                                                                <ImageIcon size={24} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFileDelete('cover', editingItem.cover_image as string)}
                                                                className="p-4 bg-red-500/20 backdrop-blur-xl text-white rounded-2xl hover:bg-red-500/30 transition-all active:scale-90"
                                                            >
                                                                <Trash2 size={24} />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex flex-col items-center justify-center gap-3 h-full text-gray-400"
                                                    >
                                                        {uploadProgress['cover'] !== undefined ? (
                                                            <div className="flex flex-col items-center gap-4 w-full px-12 text-blue-600">
                                                                <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                                                                <div className="text-sm font-black">% {uploadProgress['cover']}</div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="p-5 bg-white rounded-3xl shadow-sm">
                                                                    <ImageIcon size={32} />
                                                                </div>
                                                                <span className="text-xs font-bold">Resim Seçin</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'cover')}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                                                    >
                                                        <FileUp size={14} /> Yükle
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCoverGenerator(true)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95"
                                                    >
                                                        <RefreshCw size={14} /> Sihirbaz
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold text-center">1280x720 (16:9). PNG/JPG/WebP.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Kategori</label>
                                            <select
                                                value={editingItem.category_id}
                                                onChange={(e) => setEditingItem({ ...editingItem, category_id: parseInt(e.target.value) })}
                                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Kategori Seçin</option>
                                                {categories.map(cat => {
                                                    const getPath = (id: number): string => {
                                                        const c = categories.find(x => x.id === id);
                                                        if (!c) return '';
                                                        if (c.parent_id) return getPath(c.parent_id) + ' > ' + c.name;
                                                        return c.name;
                                                    };
                                                    return (
                                                        <option key={cat.id} value={cat.id}>
                                                            [{cat.content_type}] {getPath(cat.id)}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">URL Slug (Otomatik)</label>
                                            <input
                                                type="text"
                                                value={editingItem.slug || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200"
                                                placeholder="icerik-adresi"
                                                required
                                            />
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-3 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                                <input
                                                    type="checkbox"
                                                    id="isPublished"
                                                    checked={editingItem.is_published}
                                                    onChange={(e) => setEditingItem({ ...editingItem, is_published: e.target.checked })}
                                                    className="w-6 h-6 rounded-lg text-emerald-600 focus:ring-emerald-500 border-gray-200 transition-all cursor-pointer"
                                                />
                                                <label htmlFor="isPublished" className="cursor-pointer">
                                                    <div className="text-sm font-black text-gray-900 tracking-tight leading-none">Yayınla</div>
                                                    <div className="text-[10px] text-gray-400 font-bold mt-1">İçerik sitede görünür olacaktır</div>
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-3 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50">
                                                <input
                                                    type="checkbox"
                                                    id="requiresAuth"
                                                    checked={editingItem.requires_auth}
                                                    onChange={(e) => setEditingItem(prev => (prev ? { ...prev, requires_auth: e.target.checked } : null))}
                                                    className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-200 transition-all cursor-pointer"
                                                />
                                                <label htmlFor="requiresAuth" className="cursor-pointer">
                                                    <div className="text-sm font-black text-gray-900 tracking-tight leading-none">Üyelik Gerekli</div>
                                                    <div className="text-[10px] text-gray-400 font-bold mt-1">Detayları sadece üyeler görebilir</div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Hazırlayan / Eğitmen</label>
                                            <input
                                                type="text"
                                                value={editingItem.prepared_by || ''}
                                                onChange={(e) => setEditingItem(prev => (prev ? { ...prev, prepared_by: e.target.value } : null))}
                                                className="w-full px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200"
                                                placeholder="İsim veya Kurum girin..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right: Content & Editor */}
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">İçerik Başlığı</label>
                                            <input
                                                type="text"
                                                value={editingItem.title || ''}
                                                onChange={(e) => {
                                                    const title = e.target.value;
                                                    const trMap: any = {
                                                        'ç': 'c', 'ğ': 'g', 'ş': 's', 'ü': 'u', 'ö': 'o', 'ı': 'i',
                                                        'Ç': 'C', 'Ğ': 'G', 'Ş': 'S', 'Ü': 'U', 'Ö': 'O', 'İ': 'I'
                                                    };
                                                    let slug = title.toLowerCase();
                                                    for (const key in trMap) {
                                                        slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
                                                    }
                                                    slug = slug.replace(/[^\w ]+/g, '').replace(/ +/g, '-');

                                                    setEditingItem(prev => {
                                                        if (!prev) return null;
                                                        return {
                                                            ...prev,
                                                            title,
                                                            slug: prev.id ? prev.slug : slug
                                                        };
                                                    });
                                                }}
                                                className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] text-xl font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200 tracking-tight"
                                                placeholder="İçerik başlığını girin..."
                                                required
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">İçerik Açıklaması</label>
                                            <TiptapEditor
                                                content={editingItem.text_content || ''}
                                                onChange={(html) => setEditingItem(prev => (prev ? { ...prev, text_content: html } : null))}
                                            />
                                        </div>

                                        {/* Media Uploads Section */}
                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Multimedya Dosyaları</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCoverGenerator(true)}
                                                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                                >
                                                    <ImageIcon size={14} /> Kapak Sihirbazı
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                <MediaCard
                                                    title="PDF Belgesi"
                                                    icon={<FileText />}
                                                    value={editingItem.pdf_url}
                                                    color="red"
                                                    progress={uploadProgress['pdf']}
                                                    onDelete={() => handleFileDelete('pdf', editingItem.pdf_url as string)}
                                                    onUpload={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = '.pdf';
                                                        input.onchange = (e) => handleFileUpload(e as any, 'pdf');
                                                        input.click();
                                                    }}
                                                />
                                                <MediaCard
                                                    title="Video Dosyası"
                                                    icon={<Video />}
                                                    value={editingItem.video_url}
                                                    color="purple"
                                                    progress={uploadProgress['video']}
                                                    onDelete={() => handleFileDelete('video', editingItem.video_url as string)}
                                                    onUpload={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = 'video/*';
                                                        input.onchange = (e) => handleFileUpload(e as any, 'video');
                                                        input.click();
                                                    }}
                                                />
                                                <MediaCard
                                                    title="PPTX Sunumu"
                                                    icon={<Layout />}
                                                    value={editingItem.pptx_url}
                                                    color="orange"
                                                    progress={uploadProgress['pptx']}
                                                    onDelete={() => handleFileDelete('pptx', editingItem.pptx_url as string)}
                                                    onUpload={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = '.pptx,.ppt';
                                                        input.onchange = (e) => handleFileUpload(e as any, 'pptx');
                                                        input.click();
                                                    }}
                                                />
                                                <MediaCard
                                                    title="Referans Makale"
                                                    icon={<Download />}
                                                    value={editingItem.reference_pdf_url}
                                                    color="emerald"
                                                    progress={uploadProgress['reference_pdf']}
                                                    onDelete={() => handleFileDelete('reference_pdf', editingItem.reference_pdf_url as string)}
                                                    onUpload={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = '.pdf';
                                                        input.onchange = (e) => handleFileUpload(e as any, 'reference_pdf');
                                                        input.click();
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-10 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-4">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="px-10 py-5 text-sm font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting || Object.keys(uploadProgress).length > 0}
                                className="px-12 py-5 bg-blue-600 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : <Save size={20} />}
                                {Object.keys(uploadProgress).length > 0 ? 'Dosya Yükleniyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCoverGenerator && (
                <CoverGenerator
                    initialTitle={editingItem?.title || ''}
                    onSave={handleCoverGenerated}
                    onClose={() => setShowCoverGenerator(false)}
                />
            )}
        </div>
    );
};

const MediaCard = ({ title, icon, value, color, onUpload, progress, onDelete }: any) => {
    const colorClasses: any = {
        red: "bg-red-50 text-red-500 border-red-100",
        purple: "bg-purple-50 text-purple-500 border-purple-100",
        orange: "bg-orange-50 text-orange-500 border-orange-100",
        emerald: "bg-emerald-50 text-emerald-500 border-emerald-100"
    };

    return (
        <div className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative min-h-[140px] justify-center ${value ? colorClasses[color] : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:border-blue-100 hover:text-blue-500 cursor-pointer'}`} onClick={onUpload}>
            {progress !== undefined ? (
                <div className="flex flex-col items-center gap-2 w-full px-4 text-blue-600">
                    <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-[10px] font-black uppercase tracking-widest">% {progress}</div>
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden mt-1 shadow-inner">
                        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`p-4 rounded-2xl bg-white shadow-sm ${value ? 'text-current shadow-md' : 'text-gray-300'}`}>
                        {icon}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-center">{value ? "Yüklendi" : title}</div>
                    {value && (
                        <>
                            <div className="absolute top-3 right-3 flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all active:scale-95 hover:rotate-90 z-10"
                            >
                                <X size={12} />
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
export default ContentManagement;
