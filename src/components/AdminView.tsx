'use client';

import React, { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    Users,
    FolderTree,
    ChevronRight,
    Search,
    Plus,
    Filter,
    Megaphone
} from 'lucide-react';
import AdminDashboard from './admin/AdminDashboard';
import ContentManagement from './admin/ContentManagement';
import UserManagement from './admin/UserManagement';
import CategoryManagement from './admin/CategoryManagement';
import AdManagement from './admin/AdManagement';
import AnalyticsDashboard from './admin/AnalyticsDashboard';

type AdminTab = 'dashboard' | 'content' | 'users' | 'categories' | 'ads' | 'analytics';

const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'content', label: 'İçerik Yönetimi', icon: FileText },
        { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
        { id: 'categories', label: 'Kategoriler', icon: FolderTree },
        { id: 'ads', label: 'Reklam Yönetimi', icon: Megaphone },
        { id: 'analytics', label: 'İndirme Analizleri', icon: LayoutDashboard },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Admin Header & Local Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as AdminTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Admin Content */}
            <div className="transition-all duration-300">
                {activeTab === 'dashboard' && <AdminDashboard />}
                {activeTab === 'content' && <ContentManagement />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'categories' && <CategoryManagement />}
                {activeTab === 'ads' && <AdManagement />}
                {activeTab === 'analytics' && <AnalyticsDashboard />}
            </div>
        </div>
    );
};

export default AdminView;
