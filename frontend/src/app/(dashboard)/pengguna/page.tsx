'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, UserCircle2, Mail, Building2, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';



export default function PenggunaPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua');

    useEffect(() => {
        setIsMounted(true);
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Mengambil data pengguna asli dari API
            const response = await api.get('/pengguna');
            if (response.data && response.data.data) {
                setUsers(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Gagal mengambil data pengguna asli:', error);
            setUsers([]); // Jangan gunakan mock data, biarkan kosong jika API gagal
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesRole = true;
        if (roleFilter !== 'Semua') {
            const roleStr = user.role.replace('_', ' ').toLowerCase();
            matchesRole = roleStr === roleFilter.toLowerCase();
        }

        return matchesSearch && matchesRole;
    });

    const formatRole = (role: string) => {
        if (!role) return '-';
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getRoleColor = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes('admin')) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (r.includes('pimpinan')) return 'bg-blue-50 text-blue-700 border-blue-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-6">
            
            {/* Header & Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                {/* Decorative background flare */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Daftar Pengguna Sistem</h2>
                    <p className="text-sm text-slate-500 mt-1">Pantau dan kelola seluruh akun yang terdaftar dalam platform SYNCORE.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a2f5c]/30 focus:border-[#1a2f5c] sm:text-sm transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="relative w-full sm:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="block w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a2f5c]/30 focus:border-[#1a2f5c] sm:text-sm transition-all appearance-none cursor-pointer"
                        >
                            <option value="Semua">Semua Peran</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Pimpinan Cabang">Pimpinan Cabang</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-[#1a2f5c] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-medium text-slate-500">Memuat data pengguna...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-base font-bold text-slate-800 mb-1">Pengguna Tidak Ditemukan</p>
                            <p className="text-sm text-slate-500">Tidak ada pengguna yang cocok dengan filter atau pencarian Anda.</p>
                        </div>
                    ) : (
                        <table className="min-w-full border-collapse text-left text-sm">
                            <thead className="bg-[#f8faff] sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-bold text-[#1a2f5c] uppercase tracking-wider text-xs border-b border-slate-200">
                                        Profil Pengguna
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold text-[#1a2f5c] uppercase tracking-wider text-xs border-b border-slate-200">
                                        Peran Sistem
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold text-[#1a2f5c] uppercase tracking-wider text-xs border-b border-slate-200">
                                        Unit Kerja (Cabang)
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold text-[#1a2f5c] uppercase tracking-wider text-xs border-b border-slate-200 text-center">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-blue-50/40 transition-colors duration-200 group">
                                        
                                        {/* Profil Pengguna */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a2f5c] to-blue-800 text-white flex items-center justify-center font-bold shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 group-hover:text-[#1a2f5c] transition-colors">{user.name}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                                                        <Mail className="w-3 h-3" />
                                                        <span className="text-[12px] font-medium">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Peran Sistem */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${getRoleColor(user.role)}`}>
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                {formatRole(user.role)}
                                            </div>
                                        </td>

                                        {/* Unit Kerja */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                {user.branch || '-'}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {user.status === 'aktif' ? (
                                                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-xs font-bold">Aktif</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60 shadow-sm">
                                                    <XCircle className="w-4 h-4" />
                                                    <span className="text-xs font-bold">Nonaktif</span>
                                                </div>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Table Footer / Pagination Space */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                    <span className="text-sm font-medium text-slate-500">
                        Menampilkan <strong className="text-slate-700">{filteredUsers.length}</strong> pengguna
                    </span>
                </div>
            </div>
        </div>
    );
}
