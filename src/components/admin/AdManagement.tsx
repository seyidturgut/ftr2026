'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Ad } from '../../data/mockAds';
import { useAds } from '@/context/AdContext';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    MousePointer,
    Link as LinkIcon,
    Image as ImageIcon,
    Layout,
    CheckCircle,
    XCircle,
    Upload
} from 'lucide-react';

const AdManagement: React.FC = () => {
    // Context
    const { ads, addAd, updateAd, deleteAd } = useAds();

    // UI State
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const response = await fetch('/api/content/categories?parent_id=null');
                const data = await response.json();
                if (data.success) {
                    setCategories(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCats();
    }, []);

    // Form State
    const [formData, setFormData] = useState<Partial<Ad>>({
        title: '',
        imageUrl: '',
        targetUrl: '',
        position: 'sidebar',
        targetCategoryIds: [],
        status: 'active'
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'ad_image');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, imageUrl: data.data.url }));
            } else {
                alert('Yükleme başarısız: ' + data.message);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Yükleme sırasında bir hata oluştu');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEdit = (ad: Ad) => {
        setFormData({ ...ad, targetCategoryIds: ad.targetCategoryIds || [] });
        setIsEditing(ad.id);
        setShowForm(true);
    };

    const toggleCategory = (catId: number) => {
        const current = formData.targetCategoryIds || [];
        if (current.includes(catId)) {
            setFormData({ ...formData, targetCategoryIds: current.filter(id => id !== catId) });
        } else {
            setFormData({ ...formData, targetCategoryIds: [...current, catId] });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Bu reklamı silmek istediğinize emin misiniz?')) {
            deleteAd(id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            updateAd(isEditing, formData);
        } else {
            const newAd: Ad = {
                id: Math.random().toString(36).substr(2, 9),
                views: 0,
                clicks: 0,
                targetCategoryIds: [],
                ...formData as Omit<Ad, 'id' | 'views' | 'clicks'>
            };
            addAd(newAd);
        }

        // Reset form
        setShowForm(false);
        setIsEditing(null);
        setFormData({
            title: '',
            imageUrl: '',
            targetUrl: '',
            position: 'sidebar',
            targetCategoryIds: [],
            status: 'active'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reklam Yönetimi</h2>
                    <p className="text-gray-500 text-sm mt-1">Banner ve reklam alanlarını buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => {
                        setIsEditing(null);
                        setFormData({
                            title: '',
                            imageUrl: '',
                            targetUrl: '',
                            position: 'sidebar',
                            status: 'active'
                        });
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                    <Plus size={18} />
                    Yeni Reklam Ekle
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-lg animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4">
                        {isEditing ? <Edit2 size={20} className="text-blue-500" /> : <Plus size={20} className="text-blue-500" />}
                        {isEditing ? 'Reklamı Düzenle' : 'Yeni Reklam Oluştur'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reklam Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Örn: X İlacı Lansman"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Görsel</label>

                                {/* Image Preview or Upload Area */}
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ImageIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.imageUrl}
                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="https://... veya dosya yükleyin"
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                        >
                                            {uploading ? (
                                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Upload size={18} />
                                            )}
                                            {uploading ? '...' : 'Yükle'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef URL</label>
                                <div className="relative">
                                    <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="url"
                                        required
                                        value={formData.targetUrl}
                                        onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Kategoriler</label>
                                <div className="border border-gray-200 rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-2 bg-gray-50">
                                    {categories.length > 0 ? categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={(formData.targetCategoryIds || []).includes(cat.id)}
                                                onChange={() => toggleCategory(cat.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{cat.name}</span>
                                        </label>
                                    )) : (
                                        <div className="text-gray-400 text-xs text-center py-2">Kategori yükleniyor...</div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Hiçbir kategori seçilmezse reklam <b>tüm içeriklerde</b> (Genel) görünür.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, position: 'sidebar' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${formData.position === 'sidebar' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                                    >
                                        <Layout size={20} className="rotate-90" />
                                        <div className="text-left">
                                            <div className="font-bold text-xs uppercase">Sidebar</div>
                                            <div className="text-[10px] opacity-70">Sağ Kolon</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, position: 'inline' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${formData.position === 'inline' ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' : 'bg-white border-gray-200 hover:border-purple-200'}`}
                                    >
                                        <Layout size={20} />
                                        <div className="text-left">
                                            <div className="font-bold text-xs uppercase">Inline</div>
                                            <div className="text-[10px] opacity-70">İçerik İçi</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, position: 'header' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${formData.position === 'header' ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500' : 'bg-white border-gray-200 hover:border-orange-200'}`}
                                    >
                                        <Layout size={20} className="rotate-180" />
                                        <div className="text-left">
                                            <div className="font-bold text-xs uppercase">Header</div>
                                            <div className="text-[10px] opacity-70">Üst Alan</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Pasif</option>
                                </select>
                            </div>

                            {formData.imageUrl && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Önizleme</label>
                                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video relative group">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                                >
                                    {isEditing ? 'Değişiklikleri Kaydet' : 'Reklamı Oluştur'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-white group rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                            <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm ${ad.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                                {ad.status === 'active' ? 'Aktif' : 'Pasif'}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center justify-between text-white/90 text-xs font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={14} /> {ad.views.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MousePointer size={14} /> {ad.clicks.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${ad.position === 'sidebar' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                        {ad.position}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 line-clamp-1" title={ad.title}>{ad.title}</h3>
                                <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-500 truncate block hover:text-blue-500 mt-1">
                                    {ad.targetUrl}
                                </a>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(ad)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg text-xs font-bold transition-colors"
                                >
                                    <Edit2 size={16} /> Düzenle
                                </button>
                                <button
                                    onClick={() => handleDelete(ad.id)}
                                    className="flex-none p-2 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default AdManagement;
