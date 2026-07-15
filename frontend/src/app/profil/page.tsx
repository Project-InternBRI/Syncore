'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { UserCircle2, Mail, Building2, ShieldAlert, KeyRound, Fingerprint, LogOut, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ProfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            Cookies.remove('auth_token');
            Cookies.remove('user_data');
            router.push('/login');
        }
    };

    if (!isMounted) return null;

    const formatRole = (role: string) => {
        if (!role) return '-';
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            
            {/* Top Navigation Bar for Fullscreen Mode */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 sm:px-12 py-4 flex items-center justify-between shadow-sm">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-[#1a2f5c] transition-colors font-bold text-sm bg-white border border-slate-200 hover:border-[#1a2f5c]/30 hover:bg-blue-50 px-4 py-2 rounded-xl shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-tight text-[#1a2f5c]">SYNCORE</span>
                    <span className="text-sm font-medium text-slate-400">| Pengaturan Profil</span>
                </div>
            </div>

            <div className="w-full max-w-[1200px] mx-auto py-10 px-4 sm:px-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* LEFT SIDEBAR: PROFILE SNAPSHOT */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col items-center p-10 text-center sticky top-28">
                            
                            {/* Soft Glowing Background Top */}
                            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#f4f7fb] to-transparent -z-10"></div>
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -top-12 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            {/* Premium Avatar */}
                            <div className="relative mb-6">
                                {/* Animated Outer Ring */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-300 to-indigo-300 rounded-full scale-[1.15] opacity-50 blur-md animate-pulse"></div>
                                
                                <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#1a2f5c] via-[#244383] to-blue-800 flex items-center justify-center border-[6px] border-white shadow-xl z-10 overflow-hidden">
                                    {user?.name ? (
                                        <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    ) : (
                                        <UserCircle2 className="w-16 h-16 text-white/80" />
                                    )}
                                    
                                    {/* Inner glossy reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2"></div>
                                </div>

                                {/* Active Status Indicator */}
                                <div className="absolute bottom-2 right-3 w-6 h-6 bg-emerald-500 border-[3px] border-white rounded-full z-20 shadow-sm flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            {/* Name & Email */}
                            <h2 className="text-[26px] font-black text-slate-800 tracking-tight leading-tight">{user?.name || 'User Terdaftar'}</h2>
                            <p className="text-[15px] font-medium text-slate-500 mt-1.5">{user?.email || 'email@perusahaan.com'}</p>

                            {/* Badges */}
                            <div className="mt-5 inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                                <ShieldAlert className="w-4 h-4 text-[#1a2f5c]" />
                                <span className="text-xs font-bold text-[#1a2f5c] uppercase tracking-widest">{formatRole(user?.role)}</span>
                            </div>

                            {/* Detailed Stats List */}
                            <div className="mt-10 w-full flex flex-col gap-4">
                                <div className="w-full flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200/50">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-semibold">Unit Kerja</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800">{user?.branch_name || user?.branch || 'Pusat'}</span>
                                </div>

                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 hover:text-red-700 transition-all border border-red-100/50"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar dari Akun
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT MAIN AREA: TABS & FORMS */}
                    <div className="flex-1 flex flex-col gap-8 w-full">
                        
                        {/* Section: Personal Info */}
                        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 relative overflow-hidden group">
                            {/* Subtle background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 translate-x-1/3 -translate-y-1/3"></div>
                            
                            <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Informasi Personal</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">Data identitas utama yang terdaftar pada sistem.</p>
                                </div>
                                <button className="px-5 py-2.5 bg-[#f4f7fb] text-[#1a2f5c] hover:bg-[#1a2f5c] hover:text-white rounded-xl font-bold text-sm transition-all shadow-sm">
                                    Edit Data
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                                    <div className="px-5 py-3.5 bg-[#f8faff] border border-slate-200/80 rounded-xl text-[15px] text-slate-800 font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                        {user?.name || '-'}
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Email</label>
                                    <div className="px-5 py-3.5 bg-[#f8faff] border border-slate-200/80 rounded-xl text-[15px] text-slate-800 font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                        {user?.email || '-'}
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Nomor Telepon</label>
                                    <div className="px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[15px] text-slate-400 font-semibold flex items-center justify-between cursor-not-allowed">
                                        Belum Diatur
                                        <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Opsional</span>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Zona Waktu</label>
                                    <div className="px-5 py-3.5 bg-[#f8faff] border border-slate-200/80 rounded-xl text-[15px] text-slate-800 font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                        (GMT+07:00) Waktu Indonesia Barat
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Security */}
                        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10">
                            <div className="mb-8 pb-5 border-b border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Keamanan & Akses</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Kelola kredensial dan perlindungan ganda pada akun Anda.</p>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                
                                {/* Password Item */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-slate-200/60 rounded-[1.5rem] hover:border-blue-200 hover:bg-[#f8faff] transition-all group cursor-pointer shadow-sm hover:shadow-md">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                                            <KeyRound className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-800">Kata Sandi Akun</p>
                                            <p className="text-sm font-medium text-slate-500 mt-0.5">Disarankan untuk mengganti kata sandi secara berkala.</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white font-bold text-sm rounded-xl transition-all shadow-sm">
                                        Ubah Sandi
                                    </button>
                                </div>

                                {/* 2FA Item */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-slate-200/60 rounded-[1.5rem] hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group cursor-pointer shadow-sm hover:shadow-md">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100">
                                            <Fingerprint className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-base font-bold text-slate-800">Autentikasi Dua Langkah (2FA)</p>
                                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">Aktif</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 mt-0.5">Melindungi akun dengan verifikasi berlapis.</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-700 font-bold text-sm rounded-xl transition-all shadow-sm">
                                        Kelola 2FA
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
