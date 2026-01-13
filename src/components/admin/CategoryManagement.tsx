'use client';

import React, { useState, useEffect } from 'react';
import {
    FolderPlus,
    Edit2,
    Trash2,
    Tag,
    Hash,
    Layers,
    X,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    content_type: string;
    parent_id?: number | null;
    content_count?: number;
    subcategory_count?: number;
}

const slugify = (text: string) => {
    const trMap: any = {
        'ç': 'c', 'ğ': 'g', 'ş': 's', 'ü': 'u', 'ö': 'o', 'ı': 'i',
        'Ç': 'C', 'Ğ': 'G', 'Ş': 'S', 'Ü': 'U', 'Ö': 'O', 'İ': 'I'
    };
    for (const key in trMap) {
        text = text.replace(new RegExp(key, 'g'), trMap[key]);
    }
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [parentId, setParentId] = useState<number | null>(null);
    const [history, setHistory] = useState<{ id: number | null, name: string }[]>([{ id: null, name: 'Bölümler' }]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [parentId]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const url = parentId
                ? `/api/content/categories?parent_id=${parentId}`
                : '/api/content/categories?parent_id=null';
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Categories fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (id: number | null, name: string) => {
        if (id === parentId) return;
        const index = history.findIndex(h => h.id === id);
        if (index !== -1) {
            setHistory(history.slice(0, index + 1));
        } else {
            setHistory([...history, { id, name }]);
        }
        setParentId(id);
    };

    const handleOpenModal = (cat?: Category) => {
        setError(null);
        if (cat) {
            setEditingCategory({ ...cat });
        } else {
            // New Category - inherit content_type from first item in current list if it exists
            const currentType = categories.length > 0 ? categories[0].content_type : 'akademik';
            setEditingCategory({
                name: '',
                slug: '',
                content_type: currentType,
                parent_id: parentId as any
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const method = editingCategory.id ? 'PUT' : 'POST';
            const url = editingCategory.id ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCategory),
            });
            const data = await response.json();

            if (data.success) {
                setIsModalOpen(false);
                fetchCategories();
            } else {
                setError(data.message || 'İşlem başarısız.');
            }
        } catch (error) {
            console.error('Save error:', error);
            setError('Sunucu hatası oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz? (Not: Dolu veya alt kategorisi olan kategoriler silinemez)')) return;

        try {
            const response = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setCategories(categories.filter(c => c.id !== id));
            } else {
                alert(data.message || 'Silme işlemi başarısız.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Sunucu hatası oluştu.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Kategori Yönetimi</h2>
                    <nav className="flex items-center gap-2 mt-1 text-sm overflow-x-auto pb-1 no-scrollbar">
                        {history.map((h, idx) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <ChevronRight size={14} className="text-gray-400 shrink-0" />}
                                <button
                                    onClick={() => navigateTo(h.id, h.name)}
                                    className={`whitespace-nowrap hover:text-blue-600 transition-colors ${idx === history.length - 1 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}
                                >
                                    {h.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                >
                    <FolderPlus size={18} />
                    {parentId ? 'Alt Kategori Ekle' : 'Bölüm Ekle'}
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-gray-100 rounded-2xl border border-gray-100 animate-pulse"></div>
                    ))
                ) : categories.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <Layers size={48} className="text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-gray-900">Henüz Kategori Bulunamadı</p>
                            <p className="text-sm">Bu seviyede gösterilecek bir içerik kategorisi yok.</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-6 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                        >
                            İlk Kategoriyi Oluşturun
                        </button>
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                            <div className="flex items-start justify-between relative z-10 mb-4">
                                <div
                                    className="flex items-center gap-3 cursor-pointer group/title"
                                    onClick={() => navigateTo(cat.id, cat.name)}
                                >
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover/title:bg-blue-600 group-hover/title:text-white transition-all shadow-sm">
                                        <Tag size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover/title:text-blue-600 transition-colors line-clamp-1">{cat.name}</div>
                                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                            <Layers size={12} className="text-blue-400" /> {cat.content_type}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(cat); }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="bg-gray-50/50 p-2.5 rounded-xl">
                                    <span className="block text-[10px] text-gray-400 uppercase font-black tracking-tighter mb-0.5">İçerikler</span>
                                    <span className="text-lg font-black text-gray-900">{cat.content_count || 0}</span>
                                </div>
                                <div className="bg-blue-50/30 p-2.5 rounded-xl text-right">
                                    <span className="block text-[10px] text-blue-400 uppercase font-black tracking-tighter mb-0.5">Alt Kategoriler</span>
                                    <span className="text-lg font-black text-blue-600">{cat.subcategory_count || 0}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigateTo(cat.id, cat.name)}
                                className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-blue-600 text-gray-600 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                Detayları ve Alt Kategorileri Gör
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="font-black text-gray-900 text-lg">
                                    {editingCategory.id ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                                </h2>
                                <p className="text-xs text-gray-500 font-medium">Bölüm: {history[history.length - 1].name}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-red-100">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span className="text-sm font-bold leading-tight">{error}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Kategori Adı</label>
                                <input
                                    type="text"
                                    value={editingCategory.name || ''}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setEditingCategory({
                                            ...editingCategory,
                                            name,
                                            slug: editingCategory.id ? editingCategory.slug : slugify(name)
                                        });
                                    }}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Örn: Kardiyovasküler Rehabilitasyon"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                                <input
                                    type="text"
                                    value={editingCategory.slug || ''}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="Örn: kardiyovaskuler-rehabilitasyon"
                                    required
                                />
                                <p className="text-[10px] text-gray-400 ml-1">Bu alan benzersiz olmalıdır.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">İçerik Türü</label>
                                <select
                                    value={editingCategory.content_type || 'akademik'}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, content_type: e.target.value })}
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="akademik">Akademik</option>
                                    <option value="dokuman">Doküman</option>
                                    <option value="seminer">Seminer</option>
                                </select>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-3 text-sm font-black text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 py-3 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-50 active:scale-95"
                                >
                                    {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
