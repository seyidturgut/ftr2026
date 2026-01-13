'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Search,
    Calendar,
    User,
    FileText,
    Globe,
    RefreshCw
} from 'lucide-react';

interface Log {
    id: number;
    downloaded_at: string;
    ip_address: string;
    username: string;
    first_name: string;
    last_name: string;
    content_title: string;
}

interface Stats {
    today: number;
    month: number;
    topContent: { title: string; count: number }[];
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [statsRes, logsRes] = await Promise.all([
                fetch('/api/admin/analytics/stats'),
                fetch(`/api/admin/analytics/logs?search=${searchTerm}`)
            ]);

            const statsData = await statsRes.json();
            const logsData = await logsRes.json();

            if (statsData.success) setStats(statsData);
            if (logsData.success) setLogs(logsData.logs);

        } catch (error) {
            console.error('Analytics Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const exportToCSV = () => {
        if (logs.length === 0) return;

        const headers = ["ID", "Tarih", "Kullanıcı", "İçerik", "IP Adresi"];
        const rows = logs.map(log => [
            log.id,
            new Date(log.downloaded_at).toLocaleString('tr-TR'),
            `${log.first_name} ${log.last_name} (@${log.username})`,
            log.content_title,
            log.ip_address
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8,\uFEFF" +
            [headers, ...rows].map(e => e.join(";")).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `indirme_loglari_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Download size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Bugünkü İndirmeler</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats?.today || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Bu Ayki İndirmeler</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats?.month || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Popüler İçerik</p>
                        <h3 className="text-sm font-bold text-slate-900 truncate max-w-[150px]">
                            {stats?.topContent?.[0]?.title || '-'}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Logs Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="text-slate-400" size={20} />
                        İndirme Kayıtları
                    </h3>

                    <div className="flex items-center gap-3">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Ara (Kullanıcı, İçerik, IP)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                            />
                        </form>
                        <button
                            onClick={fetchData}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Yenile"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            <Download size={16} />
                            Excel/CSV İndir
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
                            <tr>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4">Kullanıcı</th>
                                <th className="px-6 py-4">İçerik</th>
                                <th className="px-6 py-4">IP Adresi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-4 h-12 bg-slate-50/50"></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {new Date(log.downloaded_at).toLocaleString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {log.first_name?.[0] || '?'}{log.last_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{log.first_name || 'İsimsiz'} {log.last_name || 'Kullanıcı'}</div>
                                                    <div className="text-xs text-slate-400">@{log.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            {log.content_title}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            <div className="flex items-center gap-2">
                                                <Globe size={12} />
                                                {log.ip_address}
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
}
