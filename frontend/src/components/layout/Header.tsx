'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Calendar, ChevronDown, UserCircle2, Settings, LogOut } from 'lucide-react';
import NotificationPanel from '@/components/NotificationPanel';

export default function Header({ title = 'Homepage', subtitle = 'Akses cepat ke fitur utama SYNCORE' }: { title?: string, subtitle?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [dateTime, setDateTime] = useState(new Date());

    const routeInfo: Record<string, { title: string, subtitle: string }> = {
        '/': { title: 'Beranda', subtitle: 'Akses cepat ke fitur utama SYNCORE' },
        '/dashboard': { title: 'Dasbor Pusat', subtitle: 'Pusat informasi dasbor hasil generate' },
        '/rka': { title: 'Rencana Kerja & Anggaran', subtitle: 'Kelola Rencana Kerja dan Anggaran perusahaan' },
        '/pipeline': { title: 'Pipeline Komitmen', subtitle: 'Pantau pipeline dan realisasi komitmen setiap cabang' },
        '/upload-ssa': { title: 'Unggah SSA', subtitle: 'Unggah file dan Generate SSA Simpanan, & SSA Pinjaman, Data Laba' },
        '/riwayat-generate': { title: 'Riwayat Generate', subtitle: 'Lihat riwayat generate dasbor SSA' },
        '/laporan': { title: 'Laporan', subtitle: 'Akses berbagai laporan dan ekspor data' },
        '/monitoring': { title: 'Pemantauan Cabang', subtitle: 'Pantau kinerja dan pencapaian setiap cabang' },
        '/approval': { title: 'Permintaan Persetujuan', subtitle: 'Kelola dan proses permintaan persetujuan dari pengguna' },
        '/pengguna': { title: 'Pengguna', subtitle: 'Kelola akun dan akses pengguna sistem' },
        '/role-permission': { title: 'Peran & Izin', subtitle: 'Atur hak akses untuk setiap peran pengguna' },
        '/activity': { title: 'Catatan Aktivitas', subtitle: 'Pantau log aktivitas seluruh pengguna di dalam sistem' },
        '/pengaturan': { title: 'Pengaturan Sistem', subtitle: 'Atur konfigurasi sistem dan preferensi aplikasi' }
    };

    let displayTitle = title;
    let displaySubtitle = subtitle;

    if (routeInfo[pathname]) {
        displayTitle = routeInfo[pathname].title;
        displaySubtitle = routeInfo[pathname].subtitle;
    } else if (pathname !== '/') {
        displayTitle = pathname.replace('/', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        displaySubtitle = '';
    }

    useEffect(() => {
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }

        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(timer);
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

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(dateTime);

    const formattedTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(dateTime) + ' WIB';

    return (
        <header className="relative h-24 bg-[#FAFAFA] flex items-center justify-between px-8 z-40 shadow-sm">
            {/* Page Title & Subtitle */}
            <div>
                <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">{displayTitle}</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">{displaySubtitle}</p>
            </div>

            {/* Right Side Info & Actions */}
            <div className="flex items-center gap-6">
                {/* Date & Time Widget */}
                <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">{formattedDate}</span>
                        <span className="text-[11px] font-medium text-slate-500">{formattedTime}</span>
                    </div>
                </div>

                {/* Notifications */}
                <NotificationPanel />

                {/* User Dropdown */}
                <div className="relative group">
                    <button className="flex items-center gap-2 w-10 h-10 rounded-full bg-[#1a2f5c] text-white justify-center shadow-md shadow-blue-900/20 hover:opacity-90 transition-opacity">
                        {user?.name ? (
                            <span className="font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <UserCircle2 className="w-5 h-5" />
                        )}
                        {/* A tiny chevron overlapping */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-600 shadow-sm">
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50">
                        <div className="p-3 border-b border-slate-100">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-xs font-medium text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="p-1.5 border-b border-slate-100">
                            <button 
                                onClick={() => router.push('/profil')}
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1a2f5c] rounded-lg transition-colors"
                            >
                                <UserCircle2 className="w-4 h-4 text-slate-400" />
                                Lihat Profil
                            </button>
                            <button 
                                onClick={() => router.push('/pengaturan')}
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1a2f5c] rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4 text-slate-400" />
                                Pengaturan
                            </button>
                        </div>
                        <div className="p-1.5">
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4 text-red-500" />
                                Keluar Aplikasi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
