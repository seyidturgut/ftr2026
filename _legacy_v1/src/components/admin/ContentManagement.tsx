import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api, IMAGE_BASE_URL } from '../../services/api';
import {
    ArrowLeft, Plus, Trash2, Edit, Save, X, Type, Search,
    FileText, Image as ImageIcon, FileUp, CheckCircle, AlertCircle
} from 'lucide-react';
import TiptapEditor from './TiptapEditor';

const ContentManagement: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contents, setContents] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        meta_title: '',
        meta_description: '',
        slug: '',
        category_id: '',
        text_content: '',
        cover_image: '',
        has_download: false,
        pdf_url: '',
        content_type: 'text',
        is_published: true
    });

    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [catRes, contentRes] = await Promise.all([
                api.getContentCategories(),
                api.getContentItems()
            ]);

            if (catRes.success) setCategories(catRes.data);
            if (contentRes.success) setContents(contentRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
            setMessage({ type: 'error', text: 'Veriler yüklenemedi' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'content_cover' | 'pdf') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'content_cover') setUploadingCover(true);
        else setUploadingPdf(true);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('type', type);

            // Use axios directly or add a generic upload method to api.ts
            // For now, let's assume api.ts has it or use axios
            const response = await api.uploadFile(formDataUpload);

            if (response.success) {
                if (type === 'content_cover') {
                    setFormData(prev => ({ ...prev, cover_image: response.data.url }));
                } else {
                    setFormData(prev => ({ ...prev, pdf_url: response.data.url }));
                }
                setMessage({ type: 'success', text: 'Dosya başarıyla yüklendi' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Yükleme başarısız oldu' });
        } finally {
            if (type === 'content_cover') setUploadingCover(false);
            else setUploadingPdf(false);
        }
    };

    const handleEditClick = (item: any) => {
        setEditingId(item.id);
        setFormData({
            title: item.title,
            meta_title: item.meta_title || '',
            meta_description: item.meta_description || '',
            slug: item.slug,
            category_id: item.category_id.toString(),
            text_content: item.text_content || '',
            cover_image: item.cover_image || '',
            has_download: !!item.has_download,
            pdf_url: item.pdf_url || '',
            content_type: item.content_type || 'text',
            is_published: !!item.is_published
        });
        setIsAdding(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!formData.category_id) {
            setMessage({ type: 'error', text: 'Lütfen bir kategori seçin' });
            return;
        }

        try {
            // Derive content_type from selected category
            const selectedCat = categories.find(c => c.id === Number(formData.category_id));
            let finalContentType = 'text';

            if (selectedCat) {
                if (selectedCat.page_type === 'dokuman') finalContentType = 'pdf';
                else if (selectedCat.page_type === 'seminer') finalContentType = 'video';
            }

            const payload = {
                ...formData,
                category_id: Number(formData.category_id),
                content_type: finalContentType,
                has_download: formData.has_download ? 1 : 0
            };

            let response;
            if (editingId) {
                response = await api.updateContent(editingId, payload);
            } else {
                response = await api.createContent(payload);
            }

            if (response.success) {
                setMessage({
                    type: 'success',
                    text: editingId ? 'İçerik başarıyla güncellendi!' : 'İçerik başarıyla oluşturuldu!'
                });
                setIsAdding(false);
                setEditingId(null);
                resetForm();
                loadInitialData();
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'İşlem başarısız' });
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            meta_title: '',
            meta_description: '',
            slug: '',
            category_id: '',
            text_content: '',
            cover_image: '',
            has_download: false,
            pdf_url: '',
            content_type: 'text',
            is_published: true
        });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu içeriği silmek (yayından kaldırmak) istediğinize emin misiniz?')) return;

        try {
            const response = await api.deleteContent(id);
            if (response.success) {
                setMessage({ type: 'success', text: 'İçerik yayından kaldırıldı' });
                loadInitialData();
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Silme işlemi başarısız' });
        }
    };

    const generateSlug = (title: string) => {
        return title.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 py-6 font-primary">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link
                                to="/admin"
                                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mb-2"
                            >
                                <ArrowLeft size={18} />
                                Admin Paneline Dön
                            </Link>
                            <h1 className="text-2xl font-bold text-slate-900">İçerik Yönetimi</h1>
                        </div>
                        <button
                            onClick={() => {
                                setIsAdding(!isAdding);
                                if (!isAdding) {
                                    resetForm();
                                    setEditingId(null);
                                }
                            }}
                            className={`${isAdding ? 'bg-slate-200 text-slate-700' : 'bg-sky-600 text-white'} px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md`}
                        >
                            {isAdding ? <X size={18} /> : <Plus size={18} />}
                            {isAdding ? 'İptal Et' : 'Yeni İçerik Ekle'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70"><X size={18} /></button>
                    </div>
                )}

                {isAdding ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleFormSubmit} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side: Basic Info */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Kategori Seçimi</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50"
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        >
                                            <option value="">Kategori Seçin...</option>
                                            {['akademik', 'dokuman', 'seminer'].map(type => (
                                                <optgroup key={type} label={type === 'akademik' ? 'Akademi' : type === 'dokuman' ? 'Doküman' : 'Seminer'}>
                                                    {categories.filter(c => c.page_type === type).map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">İçerik Başlığı</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Örn: Nörolojik Rehabilitasyonda Güncel Tanı Yöntemleri"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                            value={formData.title}
                                            onChange={(e) => {
                                                const title = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    title,
                                                    slug: generateSlug(title),
                                                    meta_title: title // Default meta title to title
                                                });
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Kapak Görseli</label>
                                        <div className="flex items-center gap-4">
                                            <div
                                                onClick={() => coverInputRef.current?.click()}
                                                className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all text-slate-500"
                                            >
                                                {uploadingCover ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-600 border-t-transparent"></div>
                                                        <span>Yükleniyor...</span>
                                                    </div>
                                                ) : formData.cover_image ? (
                                                    <div className="w-full flex items-center justify-between gap-3 px-2">
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <ImageIcon size={20} className="text-sky-600 shrink-0" />
                                                            <span className="truncate text-xs text-sky-700 font-medium">Görsel Seçildi</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, cover_image: '' }) }}
                                                            className="p-1 hover:bg-red-50 text-red-500 rounded-lg"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <FileUp size={24} />
                                                        <span className="text-xs font-semibold">Görsel Yükle</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    ref={coverInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'content_cover')}
                                                />
                                            </div>
                                            {formData.cover_image && (
                                                <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                                                    <img src={`${IMAGE_BASE_URL}${formData.cover_image}`} alt="Cover" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle size={18} className="text-emerald-600" />
                                            <h3 className="font-bold text-slate-800 text-sm uppercase">Ek Seçenekler</h3>
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                                checked={formData.has_download}
                                                onChange={(e) => setFormData({ ...formData, has_download: e.target.checked })}
                                            />
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">İndirilebilir Dosya (PDF) Var</span>
                                        </label>

                                        {formData.has_download && (
                                            <div className="animate-in slide-in-from-left-2 duration-200">
                                                <button
                                                    type="button"
                                                    onClick={() => pdfInputRef.current?.click()}
                                                    className={`w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-bold text-sm ${formData.pdf_url
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-300 hover:border-sky-500 hover:bg-sky-50 text-slate-600'
                                                        }`}
                                                >
                                                    {uploadingPdf ? 'PDF Yükleniyor...' : formData.pdf_url ? 'PDF Yüklendi ✅' : 'PDF Dosyası Seç (.pdf)'}
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={pdfInputRef}
                                                    className="hidden"
                                                    accept="application/pdf"
                                                    onChange={(e) => handleFileUpload(e, 'pdf')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: SEO & Content */}
                                <div className="space-y-6">
                                    <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Search size={18} className="text-sky-600" />
                                            <h3 className="font-bold text-slate-800 text-sm uppercase">Meta (SEO) Ayarları</h3>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Meta Title</label>
                                            <input
                                                type="text"
                                                placeholder="Arama motorlarında gözükecek başlık"
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-white"
                                                value={formData.meta_title}
                                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tight">Meta Açıklama</label>
                                            <textarea
                                                rows={2}
                                                placeholder="İçeriğin kısa özeti (SEO için)"
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-white resize-none"
                                                value={formData.meta_description}
                                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">İçerik Editörü (Tiptap)</label>
                                            <span className="text-[10px] bg-sky-100 px-2 py-0.5 rounded text-sky-600 font-bold uppercase">Modern Görsel Editör</span>
                                        </div>
                                        <TiptapEditor
                                            content={formData.text_content}
                                            onChange={(html) => setFormData({ ...formData, text_content: html })}
                                            placeholder="İçeriğinizi profesyonelce buraya yazın..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_published ? 'bg-sky-600' : 'bg-slate-300'}`}>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 uppercase">Hemen Yayınla</span>
                                </label>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 flex items-center gap-2"
                                    >
                                        <Save size={20} />
                                        {editingId ? 'İçeriği Güncelle' : 'İçeriği Kaydet'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <FileText className="text-sky-600" size={20} />
                                </div>
                                <h2 className="font-bold text-slate-800 uppercase tracking-tight">Kayıtlı İçerikler ({contents.length})</h2>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="İçerik ara..."
                                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none w-64"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">İçerik</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori / Bölüm</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Durum</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tarih</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400">Yükleniyor...</td></tr>
                                    ) : contents.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400">Henüz içerik bulunmuyor.</td></tr>
                                    ) : (
                                        contents.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        {item.cover_image && (
                                                            <img
                                                                src={`${IMAGE_BASE_URL}${item.cover_image}`}
                                                                className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                                                                alt=""
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">
                                                                {item.title}
                                                                {item.has_download && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">PDF</span>}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-medium">/{item.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-sm font-semibold text-slate-700">{item.category_name}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold">{item.page_type}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {item.is_published ? 'Yayında' : 'Taslak'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-slate-500 font-medium">
                                                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditClick(item)}
                                                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
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
                )}
            </div>
        </div>
    );
};

export default ContentManagement;
