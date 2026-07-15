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
    { title: 'Dashboard', desc: 'Lihat ringkasan data dan performa secara keseluruhan.', icon: LayoutDashboard, href: '/dashboard', adminOnly: true },
    { title: 'RKA', desc: 'Kelola Rencana Kerja dan Anggaran perusahaan.', icon: FileText, href: '/rka' },
    { title: 'Pipeline Komitmen', desc: 'Pantau pipeline dan realisasi komitmen setiap cabang.', icon: Target, href: '/pipeline' },
    { title: 'Unggah SSA', desc: 'Upload file SSA Simpanan dan Pinjaman.', icon: UploadCloud, href: '/upload-ssa', adminOnly: true },
    { title: 'Riwayat Generate', desc: 'Lihat riwayat generate dashboard SSA.', icon: Clock, href: '/riwayat-generate', adminOnly: true },
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
            <div className="relative rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm min-h-[200px] md:min-h-[240px] flex items-center"
                 style={{
                     backgroundImage: 'url(/images/background_conthome_cropped.png)',
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat'
                 }}
            >
                {/* Gradient overlay to ensure text is always readable against the background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent md:w-2/3"></div>
                
                <div className="relative z-10 p-8 md:p-12 w-full max-w-2xl space-y-3">
                    <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 tracking-tight">
                        Selamat datang kembali,<br/>
                        <span className="text-[#008f99] font-bold capitalize">{user.role?.replace('_', ' ')}!</span>
                    </h2>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-md">
                        Kelola dan pantau seluruh data SYNCORE melalui sistem terintegrasi dalam satu platform.
                    </p>
                </div>
            </div>

            {/* Quick Stats - Super Admin Only */}
            {user.role === 'super_admin' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
                    {/* Stat 1: Pengguna */}
                    <div className="group relative bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,82,204,0.08)] hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0052cc] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#0052cc] shadow-[0_4px_12px_rgba(0,82,204,0.08)] group-hover:scale-110 group-hover:bg-[#0052cc] group-hover:text-white transition-all duration-500">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#0052cc] text-[9px] font-bold tracking-wider uppercase border border-blue-100/50">
                                <span>TOTAL</span>
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5 group-hover:text-[#0052cc] transition-colors duration-300">8</h4>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pengguna Sistem</p>
                        </div>
                    </div>

                    {/* Stat 2: Cabang */}
                    <div className="group relative bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,143,153,0.08)] hover:border-teal-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#008f99] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all duration-700"></div>
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#008f99] shadow-[0_4px_12px_rgba(0,143,153,0.08)] group-hover:scale-110 group-hover:bg-[#008f99] group-hover:text-white transition-all duration-500">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-[#008f99] text-[9px] font-bold tracking-wider uppercase border border-teal-100/50">
                                <span>TOTAL</span>
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5 group-hover:text-[#008f99] transition-colors duration-300">7</h4>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Kantor Cabang</p>
                        </div>
                    </div>

                    {/* Stat 3: KCP */}
                    <div className="group relative bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.08)] hover:border-indigo-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.08)] group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                <Network className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-bold tracking-wider uppercase border border-indigo-100/50">
                                <span>TOTAL</span>
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5 group-hover:text-indigo-600 transition-colors duration-300">20</h4>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Kantor Cabang Pembantu</p>
                        </div>
                    </div>

                    {/* Stat 4: Unit */}
                    <div className="group relative bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.08)] hover:border-violet-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all duration-700"></div>
                        
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-violet-600 shadow-[0_4px_12px_rgba(124,58,237,0.08)] group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 text-[9px] font-bold tracking-wider uppercase border border-violet-100/50">
                                <span>TOTAL</span>
                            </div>
                        </div>
                        
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight mb-0.5 group-hover:text-violet-600 transition-colors duration-300">16</h4>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Unit Kerja</p>
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
                            className="group relative flex flex-col bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-[#1a2f5c]/20 hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer"
                        >
                            {/* Decorative background circle */}
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-slate-50/50 rounded-full group-hover:scale-150 group-hover:bg-[#1a2f5c]/[0.03] transition-all duration-700 ease-out z-0"></div>
                            
                            <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-[#1a2f5c] mb-3 shadow-sm group-hover:bg-[#1a2f5c] group-hover:text-white group-hover:border-[#1a2f5c] group-hover:scale-110 transition-all duration-500 z-10 relative">
                                <menu.icon className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1 z-10 relative group-hover:text-[#1a2f5c] transition-colors duration-300">{menu.title}</h4>
                            <p className="text-[11px] text-slate-500 leading-relaxed flex-1 z-10 relative">{menu.desc}</p>
                            
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100/80 z-10 relative">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#1a2f5c] transition-colors duration-300">Buka Menu</span>
                                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#1a2f5c] transition-colors duration-300">
                                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
