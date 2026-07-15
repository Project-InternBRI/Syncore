'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/layout/SidebarContext';
import {
    Home,
    LayoutDashboard,
    FileText,
    Target,
    Building2,
    Database,
    UploadCloud,
    Clock,
    FileSpreadsheet,
    MonitorPlay,
    CheckSquare,
    Users,
    ShieldAlert,
    Activity,
    Settings,
    ChevronDown,
    UserCircle2,
    ChevronLeft,
    ChevronRight,
    AlignLeft
} from 'lucide-react';
import logoImage from '../../../public/logo_syncore.png';
import logoSmall from '../../../public/logo_syncore_navbarkecil.png';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const MENU_ITEMS = [
    {
        category: 'BERANDA & PERENCANAAN',
        items: [
            { name: 'Beranda', icon: Home, href: '/' },
            { name: 'RKA', icon: FileText, href: '/rka' },
            { name: 'Pipeline Komitmen', icon: Target, href: '/pipeline' },
        ],
    },
    {
        category: 'GENERATE & DASBOR',
        items: [
            { name: 'Unggah SSA', icon: UploadCloud, href: '/upload-ssa' },
            { name: 'Dasbor', icon: LayoutDashboard, href: '/dashboard' },
            { name: 'Riwayat Generate', icon: Clock, href: '/riwayat-generate' },
        ],
    },
    {
        category: 'PEMANTAUAN',
        items: [
            { name: 'Pemantauan Cabang', icon: MonitorPlay, href: '/monitoring', adminOnly: true },
        ],
    },
    {
        category: 'SISTEM',
        items: [
            { name: 'Permintaan Persetujuan', icon: CheckSquare, href: '/approval', adminOnly: true },
            { name: 'Pengguna', icon: Users, href: '/pengguna', adminOnly: true },
            { name: 'Peran & Izin', icon: ShieldAlert, href: '/role-permission', adminOnly: true },
            { name: 'Catatan Aktivitas', icon: Activity, href: '/activity' },
            { name: 'Pengaturan Sistem', icon: Settings, href: '/pengaturan' },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const { isCollapsed, toggleSidebar } = useSidebar();

    useEffect(() => {
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    return (
        <aside 
            className={cn(
                "bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0 sticky top-0 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 transition-all duration-300 ease-in-out relative", 
                isCollapsed ? "w-[88px]" : "w-[260px]"
            )}
        >
            {/* Super Elegant Floating Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-4 top-9 flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded-full shadow-sm text-slate-400 hover:text-[#1a2f5c] hover:border-slate-300 hover:shadow-md transition-all duration-300 z-50 focus:outline-none ring-[6px] ring-[#F8F9FA]"
                title={isCollapsed ? "Lebarkan Sidebar" : "Kecilkan Sidebar"}
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                ) : (
                    <AlignLeft className="w-4 h-4" />
                )}
            </button>

            {/* Logo Section */}
            <div className={cn("h-24 flex items-center border-b border-slate-100 mb-2 shrink-0 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-6")}>
                <div className="relative flex items-center justify-center w-full h-full">
                    <Image 
                        src={logoImage} 
                        alt="SYNCORE Logo" 
                        height={40} 
                        className={cn(
                            "object-contain w-auto h-10 transition-all duration-300 absolute left-6",
                            isCollapsed ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
                        )} 
                        priority
                        quality={100}
                        unoptimized
                    />
                    <Image
                        src={logoSmall}
                        alt="SYNCORE Logo Small"
                        height={40}
                        className={cn(
                            "object-contain w-auto h-11 transition-all duration-300 absolute",
                            isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                        )}
                        priority
                        quality={100}
                        unoptimized
                    />
                </div>
            </div>

            {/* Navigation Menu - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 scrollbar-none hover:scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {MENU_ITEMS.map((group, idx) => {
                    const visibleItems = group.items.filter(item => {
                        if (item.adminOnly && (!user || user.role !== 'super_admin')) {
                            return false;
                        }
                        return true;
                    });
                    
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={idx} className="mb-2">
                            <div className={cn(
                                "transition-all duration-300 ease-in-out", 
                                isCollapsed ? "h-0 opacity-0 overflow-hidden mt-0" : "h-[24px] opacity-100 mt-5 mb-2"
                            )}>
                                <h3 className="px-7 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    {group.category}
                                </h3>
                            </div>
                            
                            <ul className="space-y-1.5 flex flex-col items-center">
                                {visibleItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.name} className="w-full px-4">
                                            <Link 
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center text-sm font-medium transition-all duration-300 group",
                                                    isCollapsed ? "justify-center w-11 h-11 mx-auto rounded-lg" : "px-3 py-2.5 w-full rounded-lg",
                                                    isActive 
                                                        ? "bg-[#1a2f5c] text-white shadow-md shadow-blue-900/20" 
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-[#1a2f5c]"
                                                )}
                                                title={isCollapsed ? item.name : undefined}
                                            >
                                                <item.icon className={cn(
                                                    "w-[18px] h-[18px] shrink-0 transition-all duration-300", 
                                                    isActive ? "text-white" : "text-slate-400 group-hover:text-[#1a2f5c]"
                                                )} />
                                                
                                                <span 
                                                    className={cn(
                                                        "whitespace-nowrap transition-all duration-300 ease-in-out antialiased",
                                                        isCollapsed ? "opacity-0 max-w-0 ml-0" : "opacity-100 max-w-[180px] ml-3"
                                                    )}
                                                >
                                                    {item.name}
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Profile Section */}
            <div className="p-4 border-t border-slate-100 shrink-0 bg-white z-10">
                <div className={cn(
                    "flex items-center rounded-2xl cursor-pointer transition-all duration-300 border border-transparent hover:bg-slate-50", 
                    isCollapsed ? "p-0 justify-center w-12 h-12 mx-auto hover:bg-transparent" : "p-2.5 justify-between"
                )}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={cn(
                            "rounded-full bg-gradient-to-br from-[#1a2f5c] to-blue-800 text-white flex items-center justify-center flex-shrink-0 font-semibold shadow-inner transition-all duration-300",
                            isCollapsed ? "w-11 h-11 ring-4 ring-slate-50" : "w-10 h-10"
                        )} title={isCollapsed ? user?.name : undefined}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle2 className="w-5 h-5" />}
                        </div>
                        
                        <div className={cn(
                            "transition-all duration-300 ease-in-out antialiased", 
                            isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[140px]"
                        )}>
                            <p className="text-sm font-bold text-slate-800 whitespace-nowrap truncate">{user?.name || 'Memuat...'}</p>
                            <p className="text-xs font-medium text-slate-500 whitespace-nowrap truncate">{user?.email || '...'}</p>
                        </div>
                    </div>
                    
                    <div className={cn(
                        "transition-all duration-300",
                        isCollapsed ? "opacity-0 max-w-0 overflow-hidden" : "opacity-100 max-w-[20px]"
                    )}>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
