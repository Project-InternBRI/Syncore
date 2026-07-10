'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Bell, Calendar, ChevronDown, UserCircle2 } from 'lucide-react';

export default function Header({ title = 'Homepage', subtitle = 'Akses cepat ke fitur utama SYNCORE' }: { title?: string, subtitle?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [dateTime, setDateTime] = useState(new Date());

    const routeInfo: Record<string, { title: string, subtitle: string }> = {
        '/': { title: 'Homepage', subtitle: 'Akses cepat ke fitur utama SYNCORE' },
        '/dashboard': { title: 'Dashboard Center', subtitle: 'Pusat informasi dashboard hasil generate' },
        '/rka': { title: 'Rencana Kerja & Anggaran', subtitle: 'Kelola Rencana Kerja dan Anggaran perusahaan' },
        '/pipeline': { title: 'Pipeline Komitmen', subtitle: 'Pantau pipeline dan realisasi komitmen setiap cabang' },
        '/cabang': { title: 'Data Cabang', subtitle: 'Kelola data cabang, KCP, dan unit kerja' },
        '/master-data': { title: 'Master Data', subtitle: 'Pusat pengelolaan data referensi sistem' },
        '/upload-ssa': { title: 'Upload SSA', subtitle: 'Upload file dan Generate SSA Simpanan, & SSA Pinjaman, Data Laba' },
        '/riwayat-generate': { title: 'Riwayat Generate', subtitle: 'Lihat riwayat generate dashboard SSA' },
        '/laporan': { title: 'Laporan', subtitle: 'Akses berbagai laporan dan export data' },
        '/monitoring': { title: 'Monitoring Cabang', subtitle: 'Pantau kinerja dan pencapaian setiap cabang' },
        '/approval': { title: 'Approval Request', subtitle: 'Kelola dan proses permintaan approval dari pengguna' },
        '/pengguna': { title: 'Pengguna', subtitle: 'Kelola akun dan akses pengguna sistem' },
        '/role-permission': { title: 'Role & Permission', subtitle: 'Atur hak akses untuk setiap peran pengguna' },
        '/activity': { title: 'Activity Log', subtitle: 'Pantau log aktivitas seluruh pengguna di dalam sistem' },
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
        <header className="h-24 bg-[#FAFAFA] flex items-center justify-between px-8 z-20">
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
                <button className="relative w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

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
                        <div className="p-1.5">
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Keluar Aplikasi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
