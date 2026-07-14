'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { 
    LayoutDashboard, 
    FileText, 
    Target, 
    Building2, 
    MonitorPlay, 
    UploadCloud, 
    Clock, 
    CheckSquare, 
    FileSpreadsheet, 
    Settings,
    ArrowRight,
    Users,
    Network,
    ShieldAlert,
    Activity
} from 'lucide-react';

const MAIN_MENUS = [
    { title: 'Dashboard', desc: 'Lihat ringkasan data dan performa secara keseluruhan.', icon: LayoutDashboard, href: '/dashboard' },
    { title: 'RKA', desc: 'Kelola Rencana Kerja dan Anggaran perusahaan.', icon: FileText, href: '/rka' },
    { title: 'Pipeline Komitmen', desc: 'Pantau pipeline dan realisasi komitmen setiap cabang.', icon: Target, href: '/pipeline' },
    { title: 'Unggah SSA', desc: 'Upload file SSA Simpanan dan Pinjaman.', icon: UploadCloud, href: '/upload-ssa' },
    { title: 'Riwayat Generate', desc: 'Lihat riwayat generate dashboard SSA.', icon: Clock, href: '/riwayat-generate' },
    { title: 'Pemantauan Cabang', desc: 'Pantau kinerja dan pencapaian setiap cabang.', icon: MonitorPlay, href: '/monitoring', adminOnly: true },
    { title: 'Permintaan Persetujuan', desc: 'Kelola dan proses permintaan approval dari pengguna.', icon: CheckSquare, href: '/approval', adminOnly: true },
    { title: 'Pengguna', desc: 'Kelola data pengguna dan akses sistem.', icon: Users, href: '/pengguna', adminOnly: true },
    { title: 'Peran & Izin', desc: 'Atur hak akses dan peran pengguna.', icon: ShieldAlert, href: '/role-permission', adminOnly: true },
    { title: 'Catatan Aktivitas', desc: 'Pantau log aktivitas pengguna dalam sistem.', icon: Activity, href: '/activity' },
    { title: 'Pengaturan Sistem', desc: 'Atur konfigurasi sistem dan preferensi aplikasi.', icon: Settings, href: '/pengaturan' },
];

export default function Homepage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = Cookies.get('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }
        
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, [router]);

    if (!user) return null; // Avoid hydration mismatch or flashing

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8 pb-12">
            {/* Welcome Banner */}
            <div className="relative rounded-[2rem] bg-gradient-to-r from-[#eef8f9] to-[#f4fbfc] overflow-hidden border border-slate-100 shadow-sm">
                <div className="absolute inset-0 opacity-40 mix-blend-multiply" 
                     style={{
                         backgroundImage: 'radial-gradient(circle at 100% 100%, #008f99 0, transparent 40%), radial-gradient(circle at 0 0, #0052cc 0, transparent 40%)'
                     }}
                />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
                    <div className="max-w-xl space-y-4">
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight">
                            Selamat datang kembali,<br/>
                            <span className="text-[#008f99] font-bold capitalize">{user.role?.replace('_', ' ')}!</span>
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            Kelola dan pantau seluruh data SYNCORE melalui sistem terintegrasi dalam satu platform.
                        </p>
                    </div>
                    
                    {/* Abstract Decorative Element replacing the complex image in mockup */}
                    <div className="hidden lg:flex relative w-72 h-48 mr-8">
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-xl transform rotate-3 transition-transform hover:rotate-0 flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-4 w-full p-6">
                                <div className="h-16 bg-blue-100 rounded-lg"></div>
                                <div className="h-16 bg-teal-100 rounded-lg"></div>
                                <div className="h-16 bg-slate-100 rounded-lg col-span-2"></div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center transform -rotate-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#0052cc] to-[#00b3b3] rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats - Super Admin Only */}
            {user.role === 'super_admin' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
                    {/* Stat 1: Pengguna */}
                    <div className="relative group bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-[30px] -mr-8 -mt-8 opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between relative z-10 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052cc] to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-[#0052cc] bg-blue-50 border border-blue-100 px-2 py-1 rounded-full uppercase tracking-wider">Total</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5">8</h4>
                            <p className="text-xs text-slate-500 font-medium">Pengguna Sistem</p>
                        </div>
                    </div>

                    {/* Stat 2: Cabang */}
                    <div className="relative group bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100 rounded-full blur-[30px] -mr-8 -mt-8 opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between relative z-10 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008f99] to-teal-400 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-[#008f99] bg-teal-50 border border-teal-100 px-2 py-1 rounded-full uppercase tracking-wider">Total</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5">7</h4>
                            <p className="text-xs text-slate-500 font-medium">Kantor Cabang</p>
                        </div>
                    </div>

                    {/* Stat 3: KCP */}
                    <div className="relative group bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-[30px] -mr-8 -mt-8 opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between relative z-10 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Network className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full uppercase tracking-wider">Total</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5">20</h4>
                            <p className="text-xs text-slate-500 font-medium">Kantor Cabang Pembantu</p>
                        </div>
                    </div>

                    {/* Stat 4: Unit */}
                    <div className="relative group bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-100 rounded-full blur-[30px] -mr-8 -mt-8 opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
                        <div className="flex items-center justify-between relative z-10 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-400 text-white flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-1 rounded-full uppercase tracking-wider">Total</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5">16</h4>
                            <p className="text-xs text-slate-500 font-medium">Unit Kerja</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Utama Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 pb-2 border-b-2 border-slate-100 inline-block">
                    Menu Utama
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-2">
                    {MAIN_MENUS.filter(menu => {
                        if (menu.adminOnly && user.role !== 'super_admin') return false;
                        return true;
                    }).map((menu, idx) => (
                        <Link 
                            key={idx}
                            href={menu.href}
                            className="group flex flex-col bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1a2f5c] mb-4 group-hover:bg-[#1a2f5c] group-hover:text-white transition-colors">
                                <menu.icon className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">{menu.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed flex-1">{menu.desc}</p>
                            
                            <div className="flex justify-end mt-4">
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#008f99] transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
