'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, History, ChevronLeft, ChevronRight, RefreshCw, User, Box, Activity } from 'lucide-react';
import api from '@/lib/api';

export default function ActivityLogPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    // Filter states
    const [moduleFilter, setModuleFilter] = useState('all');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchLogs(currentPage);
        }
    }, [isMounted, currentPage, moduleFilter]);

    const fetchLogs = async (page: number) => {
        setLoading(true);
        try {
            const response = await api.get('/activity-logs', {
                params: {
                    page: page,
                    per_page: 10,
                    module: moduleFilter
                }
            });
            
            if (response.data && response.data.success) {
                setLogs(response.data.data.data);
                setCurrentPage(response.data.data.current_page);
                setTotalPages(response.data.data.last_page);
                setTotalLogs(response.data.data.total);
            }
        } catch (error) {
            console.error('Gagal mengambil data activity log:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    const getActionColor = (action: string) => {
        const a = action.toUpperCase();
        if (a.includes('LOGIN') || a.includes('APPROVE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (a.includes('LOGOUT') || a.includes('REJECT') || a.includes('DELETE')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (a.includes('UPDATE') || a.includes('UPLOAD')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (a.includes('EXPORT')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        return 'bg-blue-50 text-blue-700 border-blue-200';
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6">
            
            {/* Header & Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <History className="w-6 h-6 text-[#1a2f5c]" />
                        Catatan Aktivitas
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Pantau seluruh aktivitas pengguna di dalam sistem untuk keperluan audit.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Module Filter */}
                    <div className="relative w-full sm:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                            value={moduleFilter}
                            onChange={(e) => {
                                setModuleFilter(e.target.value);
                                setCurrentPage(1); // Reset page on filter
                            }}
                            className="block w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a2f5c]/30 focus:border-[#1a2f5c] sm:text-sm appearance-none transition-all cursor-pointer text-slate-700"
                        >
                            <option value="all">Semua Modul</option>
                            <option value="Autentikasi">Autentikasi</option>
                            <option value="Generate & Dasbor">Generate & Dasbor</option>
                            <option value="Perencanaan">Perencanaan</option>
                            <option value="Sistem (Approval)">Sistem (Approval)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <button 
                        onClick={() => fetchLogs(currentPage)}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-medium">Muat Ulang</span>
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">Waktu Kejadian</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modul</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                                            <p className="text-sm">Memuat catatan aktivitas...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-1">
                                                <History className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-base font-medium text-slate-700">Tidak Ada Aktivitas</p>
                                            <p className="text-sm text-slate-500 max-w-sm mx-auto">Belum ada catatan aktivitas yang ditemukan untuk kriteria filter saat ini.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <span>{formatDate(log.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-[#1a2f5c] font-bold text-xs">
                                                    {log.user ? log.user.name.substring(0, 2).toUpperCase() : 'SYS'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-800">{log.user ? log.user.name : 'System'}</span>
                                                    <span className="text-xs text-slate-500">{log.user ? log.user.email : 'system@syncore'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-700 font-medium">{log.module}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-slate-600 leading-snug">
                                                {log.description}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && logs.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-slate-500">
                            Menampilkan <span className="font-medium text-slate-800">{logs.length}</span> dari <span className="font-medium text-slate-800">{totalLogs}</span> aktivitas
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show pages around current page
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === pageNum 
                                                    ? 'bg-[#1a2f5c] text-white' 
                                                    : 'text-slate-600 hover:bg-slate-200/50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
