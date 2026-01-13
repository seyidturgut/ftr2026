import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { ArrowLeft, Plus, Trash2, FolderEdit, Save, X } from 'lucide-react';

const CategoryManagement: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filterType, setFilterType] = useState<string>('all');

    const [formCategory, setFormCategory] = useState({
        name: '',
        slug: '',
        page_type: 'akademik',
        description: '',
        display_order: 0
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await api.getContentCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            setMessage({ type: 'error', text: 'Kategoriler yüklenemedi' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (category: any) => {
        setEditingId(category.id);
        setFormCategory({
            name: category.name,
            slug: category.slug,
            page_type: category.page_type,
            description: category.description || '',
            display_order: category.display_order || 0
        });
        setIsAdding(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            let response;
            if (editingId) {
                response = await api.updateContentCategory(editingId, formCategory);
            } else {
                response = await api.createContentCategory(formCategory);
            }

            if (response.success) {
                setMessage({
                    type: 'success',
                    text: editingId ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!'
                });
                setIsAdding(false);
                setEditingId(null);
                setFormCategory({
                    name: '',
                    slug: '',
                    page_type: 'akademik',
                    description: '',
                    display_order: 0
                });
                loadCategories();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'İşlem başarısız oldu' });
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

        try {
            const response = await api.deleteContentCategory(id);
            if (response.success) {
                setMessage({ type: 'success', text: 'Kategori silindi' });
                loadCategories();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Silme işlemi başarısız' });
        }
    };

    const translatePageType = (type: string) => {
        switch (type) {
            case 'akademik': return 'Akademi';
            case 'dokuman': return 'Doküman';
            case 'seminer': return 'Seminer';
            default: return type;
        }
    };

    const filteredCategories = filterType === 'all'
        ? categories
        : categories.filter(cat => cat.page_type === filterType);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link
                                to="/admin"
                                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mb-2"
                            >
                                <ArrowLeft size={18} />
                                Admin Paneline Dön
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900">Kategori Yönetimi</h1>
                        </div>
                        <button
                            onClick={() => {
                                setIsAdding(true);
                                setEditingId(null);
                                setFormCategory({
                                    name: '',
                                    slug: '',
                                    page_type: 'akademik',
                                    description: '',
                                    display_order: 0
                                });
                            }}
                            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus size={18} />
                            Yeni Kategori Ekle
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })}><X size={18} /></button>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Filtrele:</span>
                    <div className="flex gap-2">
                        {['all', 'akademik', 'dokuman', 'seminer'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterType === type
                                    ? 'bg-sky-600 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {type === 'all' ? 'Tümü' : translatePageType(type)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add/Edit Category Form Modal-like */}
                {isAdding && (
                    <div className="mb-8 bg-white p-6 rounded-xl border border-sky-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                            </h2>
                            <button
                                onClick={() => { setIsAdding(false); setEditingId(null); }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Kategori Adı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={formCategory.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        const slug = name.toLowerCase()
                                            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
                                            .replace(/ /g, '-')
                                            .replace(/[^\w-]+/g, '');
                                        setFormCategory({ ...formCategory, name, slug });
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Slug (URL)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                                    value={formCategory.slug}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Bölüm</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={formCategory.page_type}
                                    onChange={(e) => setFormCategory({ ...formCategory, page_type: e.target.value as any })}
                                >
                                    <option value="akademik">Akademi</option>
                                    <option value="dokuman">Doküman</option>
                                    <option value="seminer">Seminer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sıralama</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={formCategory.display_order}
                                    onChange={(e) => setFormCategory({ ...formCategory, display_order: parseInt(e.target.value || '0') })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                                    rows={2}
                                    value={formCategory.description}
                                    onChange={(e) => setFormCategory({ ...formCategory, description: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsAdding(false); setEditingId(null); }}
                                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {editingId ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Ad / Slug</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Bölüm</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">Sıra</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700">İçerik</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Yükleniyor...</td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Gösterilecek kategori bulunmuyor.</td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{cat.name}</div>
                                            <div className="text-xs text-slate-400">{cat.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.page_type === 'akademik' ? 'bg-purple-50 text-purple-700' :
                                                cat.page_type === 'dokuman' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-amber-50 text-amber-700'
                                                }`}>
                                                {translatePageType(cat.page_type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{cat.display_order}</td>
                                        <td className="px-6 py-4 text-slate-600">{cat.content_count || 0} İçerik</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(cat)}
                                                    className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                                                >
                                                    <FolderEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;
