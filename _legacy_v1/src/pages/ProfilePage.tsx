// Profile Edit Page - User can update photo, name, email, password
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api, IMAGE_BASE_URL } from '../services/api';
import { ArrowLeft, Camera, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: user?.title || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Sadece resim dosyaları yükleyebilirsiniz' });
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Dosya boyutu en fazla 2MB olabilir' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.uploadFile(file, 'profile');

            if (response.success && response.data) {
                setProfilePhoto(response.data.url);
                setMessage({ type: 'success', text: 'Profil fotoğrafı yüklendi' });
                await checkAuth(); // Refresh user data
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Yükleme başarısız oldu' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validate passwords
        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
            return;
        }

        setLoading(true);

        try {
            const updateData: any = {
                title: formData.title,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email
            };

            // Only include password if changing
            if (formData.new_password) {
                updateData.current_password = formData.current_password;
                updateData.new_password = formData.new_password;
            }

            const response = await api.updateUser(user!.id, updateData);

            if (response.success) {
                setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
                await checkAuth(); // Refresh user data

                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Güncelleme başarısız oldu' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Load fresh profile data from API on mount
    React.useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.getProfile();
                if (response.success && response.data) {
                    const userData = response.data;
                    setFormData({
                        title: userData.title || '',
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                        email: userData.email || '',
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                    });
                    setProfilePhoto(userData.profile_photo || '');
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            }
        };
        loadProfile();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <Link
                        to="/content?type=akademik"
                        className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium mb-4"
                    >
                        <ArrowLeft size={20} />
                        Geri Dön
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Profil Ayarları</h1>
                    <p className="text-slate-600 mt-2">Kişisel bilgilerinizi ve şifrenizi güncelleyin</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit}>
                        {/* Profile Photo Section */}
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Profil Fotoğrafı</h2>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    {profilePhoto ? (
                                        <img
                                            src={`${IMAGE_BASE_URL}${profilePhoto}`}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                                            {user?.first_name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <label
                                        htmlFor="photo-upload"
                                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <Camera size={16} className="text-slate-600" />
                                    </label>
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 mb-2">
                                        JPG, GIF veya PNG. Maksimum 2MB.
                                    </p>
                                    {uploading && (
                                        <p className="text-sm text-sky-600">Yükleniyor...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Kişisel Bilgiler</h2>

                            {message.text && (
                                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Ünvan
                                    </label>
                                    <select
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Prof. Dr.">Prof. Dr.</option>
                                        <option value="Doç. Dr.">Doç. Dr.</option>
                                        <option value="Uzm. Dr.">Uzm. Dr.</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Ad
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Soyad
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        E-posta
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Change */}
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Şifre Değiştir</h2>
                            <p className="text-sm text-slate-600 mb-4">
                                Şifrenizi değiştirmek istemiyorsanız bu alanları boş bırakın.
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Mevcut Şifre
                                    </label>
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Yeni Şifre
                                    </label>
                                    <input
                                        type="password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Yeni Şifre (Tekrar)
                                    </label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 flex items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/content?type=akademik')}
                                className="px-6 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
