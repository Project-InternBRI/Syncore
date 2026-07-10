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
    Network
} from 'lucide-react';

const MAIN_MENUS = [
    { title: 'Dashboard', desc: 'Lihat ringkasan data dan performa secara keseluruhan.', icon: LayoutDashboard, href: '/dashboard' },
    { title: 'RKA', desc: 'Kelola Rencana Kerja dan Anggaran perusahaan.', icon: FileText, href: '/rka' },
    { title: 'Pipeline Komitmen', desc: 'Pantau pipeline dan realisasi komitmen setiap cabang.', icon: Target, href: '/pipeline' },
    { title: 'Cabang', desc: 'Kelola data cabang, KCP, dan unit kerja.', icon: Building2, href: '/cabang' },
    { title: 'Monitoring Cabang', desc: 'Pantau kinerja dan pencapaian setiap cabang.', icon: MonitorPlay, href: '/monitoring' },
    { title: 'Upload SSA', desc: 'Upload file SSA Simpanan dan Pinjaman.', icon: UploadCloud, href: '/upload-ssa' },
    { title: 'Riwayat Generate', desc: 'Lihat riwayat generate dashboard SSA.', icon: Clock, href: '/riwayat-generate' },
    { title: 'Approval Request', desc: 'Kelola dan proses permintaan approval dari pengguna.', icon: CheckSquare, href: '/approval' },
    { title: 'Laporan', desc: 'Akses berbagai laporan dan export data.', icon: FileSpreadsheet, href: '/laporan' },
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

            {/* Menu Utama Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 pb-2 border-b-2 border-slate-100 inline-block">
                    Menu Utama
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-2">
                    {MAIN_MENUS.map((menu, idx) => (
                        <Link key={idx} href={menu.href} className="group flex flex-col bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer">
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

            {/* Bottom Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-[#0052cc] flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#0052cc] uppercase tracking-wider mb-1">Total Pengguna</p>
                        <h4 className="text-2xl font-black text-slate-800 leading-none">8</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Akun aktif sistem</p>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-teal-50 text-[#008f99] flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#008f99] uppercase tracking-wider mb-1">Total Cabang</p>
                        <h4 className="text-2xl font-black text-slate-800 leading-none">7</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Kantor Cabang</p>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-teal-50 text-[#008f99] flex items-center justify-center">
                        <Network className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#008f99] uppercase tracking-wider mb-1">Total KCP</p>
                        <h4 className="text-2xl font-black text-slate-800 leading-none">20</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Kantor Cabang Pembantu</p>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-slate-200/50" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' }}></div>
                        <LayoutDashboard className="w-6 h-6 relative z-10" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Total Unit</p>
                        <h4 className="text-2xl font-black text-slate-800 leading-none">16</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Unit Kerja</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
