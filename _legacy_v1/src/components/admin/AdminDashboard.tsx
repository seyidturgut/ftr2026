// Simple Admin Dashboard - Will be expanded later
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, FileText, Home } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://www.ftronline.com/wp-content/uploads/100x75.trbg_@2x.png"
                            alt="FTR Online"
                            className="h-10 w-auto"
                        />
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                            Yönetim Paneli
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {user?.title} {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user?.role === 'fulladmin' ? 'Tam Yönetici' : user?.role}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Home size={18} />
                            Ana Sayfa
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <LogOut size={18} />
                            Çıkış
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Hoş Geldiniz, {user?.title} {user?.last_name}!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        FTR Online yönetim paneliniz hazır.
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Users Card - Only for fulladmin */}
                    {user?.role === 'fulladmin' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                        Kullanıcı Yönetimi
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Kullanıcı ekle, düzenle, sil
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Card */}
                    {['fulladmin', 'admin', 'editor'].includes(user?.role || '') && (
                        <div
                            onClick={() => navigate('/admin/content')}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-lg group-hover:bg-sky-200 transition-colors">
                                    <FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                        İçerik Yönetimi
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Yazı, PDF ve Video içeriği ekle
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories Card */}
                    {['fulladmin', 'admin'].includes(user?.role || '') && (
                        <div
                            onClick={() => navigate('/admin/categories')}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                        Kategori Yönetimi
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Bölüm ve içerik kategorileri
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Card */}

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Sistem Durumu</h3>
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-sm opacity-90">
                            Tüm sistemler çalışıyor
                        </p>
                        <p className="text-xs opacity-75 mt-2">
                            Son güncellenme: {new Date().toLocaleDateString('tr-TR')}
                        </p>
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        🚧 Geliştirme Aşamasında
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Kullanıcı ve doküman yönetimi arayüzleri yakında eklenecek.
                        Şu an için backend API'leri tamamen hazır ve kullanılabilir durumda.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
