"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface ApprovalRequest {
    id: number;
    user_id: number;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string | null;
    metadata: any;
    created_at: string;
    user?: User;
}

const TABS = [
    { id: 'all', label: 'Semua Permintaan' },
    { id: 'pending', label: 'Menunggu' },
    { id: 'approved', label: 'Disetujui' },
    { id: 'rejected', label: 'Ditolak' }
];

export default function ApprovalPage() {
    const [requests, setRequests] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUserRole(parsed.role);
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
        
        // Initial fetch
        fetchRequests(true);

        // Auto-refresh polling every 5 seconds
        const interval = setInterval(() => {
            fetchRequests(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [statusFilter]);

    const fetchRequests = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const res = await api.get('/approval-requests', {
                params: { status: statusFilter }
            });
            if (res.data?.data) {
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch approval requests', error);
            toast.error('Gagal mengambil data permintaan persetujuan');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            setActionLoading(id);
            await api.post(`/approval-requests/${id}/${action}`);
            toast.success(`Permintaan berhasil di${action === 'approve' ? 'setujui' : 'tolak'}`);
            fetchRequests();
        } catch (error) {
            console.error(`Failed to ${action} request`, error);
            toast.error(`Gagal memproses permintaan`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Menunggu</span>;
            case 'approved':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-600 border border-green-200"><CheckCircle2 className="w-3.5 h-3.5" /> Disetujui</span>;
            case 'rejected':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>;
            default:
                return <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
        }
    };

    const getTypeDisplay = (type: string) => {
        const typeMap: Record<string, string> = {
            'edit_pipeline': 'Akses Edit Pipeline',
            'edit_rka': 'Akses Edit RKA'
        };
        return typeMap[type] || type;
    };

    if (userRole && userRole !== 'super_admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-slate-500">
                <XCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-700">Akses Ditolak</h2>
                <p>Hanya Super Admin yang dapat mengakses halaman ini.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-6 bg-slate-50/50 space-y-4 md:space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a2f5c] tracking-tight">Permintaan Persetujuan</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola dan proses permintaan akses atau persetujuan dari pengguna</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                
                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 border-b border-slate-100 shrink-0 gap-4">
                    <div className="flex space-x-1 p-1 bg-slate-100/80 rounded-xl overflow-x-auto custom-scrollbar w-full sm:w-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={cn(
                                    "px-4 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 whitespace-nowrap",
                                    statusFilter === tab.id
                                        ? "bg-white text-[#1a2f5c] shadow-sm shadow-[#1a2f5c]/5"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Content */}
                <div className="w-full relative overflow-x-auto custom-scrollbar bg-white flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-10 h-10 text-[#1a2f5c] animate-spin" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <CheckCircle2 className="w-16 h-16 text-slate-300 mb-4" />
                            <p className="text-lg font-medium text-slate-600">Tidak ada permintaan</p>
                            <p className="text-sm">Semua permintaan telah diproses atau tidak ada data yang ditemukan.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Tanggal</th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Pemohon (Cabang)</th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Jenis Permintaan</th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Alasan</th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200 text-center">Status</th>
                                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                                            {new Date(req.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-sm font-bold text-[#1a2f5c]">{req.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{req.user?.email}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                                {getTypeDisplay(req.type)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate" title={req.reason || '-'}>
                                            {req.reason || '-'}
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            {req.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(req.id, 'reject')}
                                                        disabled={actionLoading === req.id}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Tolak"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req.id, 'approve')}
                                                        disabled={actionLoading === req.id}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Setujui"
                                                    >
                                                        {actionLoading === req.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Selesai</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
