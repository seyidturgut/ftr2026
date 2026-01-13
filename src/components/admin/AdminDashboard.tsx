'use client';

import React, { useEffect, useState } from 'react';
import {
    Users,
    FileText,
    FolderTree,
    TrendingUp,
    Clock,
    Eye
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        total_content: 0,
        total_users: 0,
        total_categories: 0,
        total_views: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Stats fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Toplam İçerik', value: stats.total_content, icon: FileText, color: 'bg-blue-500' },
        { label: 'Toplam Kullanıcı', value: stats.total_users, icon: Users, color: 'bg-emerald-500' },
        { label: 'Kategoriler', value: stats.total_categories, icon: FolderTree, color: 'bg-purple-500' },
        { label: 'Toplam Görüntülenme', value: stats.total_views, icon: Eye, color: 'bg-orange-500' },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-xl border border-gray-200"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                                    <Icon size={24} />
                                </div>
                                <TrendingUp size={16} className="text-emerald-500" />
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities Placeholder */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-blue-600" />
                        Son Aktiviteler
                    </h3>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 text-center py-8">Aktivite günlüğü yakında eklenecek.</p>
                    </div>
                </div>

                {/* Popular Content Placeholder */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-600" />
                        Popüler İçerikler
                    </h3>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 text-center py-8">İstatistik verileri işleniyor.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
