'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';

const ProfileView: React.FC = () => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        title: '',
        email: '',
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                title: user.title || '',
                email: user.email || '',
                old_password: '',
                new_password: '',
                confirm_password: '',
            });
            setProfilePhoto(user.profile_photo || '');
        }
    }, [user]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload/profile', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setProfilePhoto(data.filename);
                setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Upload başarısız!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Sunucu hatası!' });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (formData.new_password && formData.new_password !== formData.confirm_password) {
                setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' });
                setLoading(false);
                return;
            }

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
                setFormData(prev => ({
                    ...prev,
                    old_password: '',
                    new_password: '',
                    confirm_password: '',
                }));
            } else {
                setMessage({ type: 'error', text: data.message || 'Bir hata oluştu!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Sunucu hatası!' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Compact Header */}
                <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-4 py-6">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50">
                                {profilePhoto ? (
                                    <img
                                        src={`/uploads/${profilePhoto}`}
                                        alt={user?.first_name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                {uploadingPhoto ? (
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Camera size={14} className="text-gray-700" />
                                )}
                            </button>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Profil Ayarları</h1>
                            <p className="text-blue-100 text-sm">@{user?.username}</p>
                        </div>
                    </div>
                </div>

                {/* Compact Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Kişisel Bilgiler */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <User size={16} className="text-blue-600" />
                            Kişisel Bilgiler
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ad</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Soyad</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ünvan</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Örn: Dr., Prof., Uzm."
                                />
                            </div>
                        </div>
                    </div>

                    {/* İletişim */}
                    <div className="border-t border-gray-200 pt-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Mail size={16} className="text-blue-600" />
                            İletişim
                        </h2>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">E-posta</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Şifre */}
                    <div className="border-t border-gray-200 pt-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Lock size={16} className="text-blue-600" />
                            Şifre Değiştir
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={formData.old_password}
                                        onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                        placeholder="Şifre değiştirmek için gerekli"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={formData.new_password}
                                            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                            placeholder="En az 6 karakter"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        value={formData.confirm_password}
                                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Tekrar girin"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kaydet */}
                    <div className="border-t border-gray-200 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Değişiklikleri Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileView;
