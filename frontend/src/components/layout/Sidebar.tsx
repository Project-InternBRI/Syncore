'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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
    UserCircle2
} from 'lucide-react';
import logoImage from '../../../public/logo_syncore.png';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const MENU_ITEMS = [
    {
        category: 'DASHBOARD & PERENCANAAN',
        items: [
            { name: 'Homepage', icon: Home, href: '/' },
            { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
            { name: 'RKA', icon: FileText, href: '/rka' },
            { name: 'Pipeline Komitmen', icon: Target, href: '/pipeline' },
        ],
    },
    {
        category: 'DATA & MASTER',
        items: [
            { name: 'Cabang', icon: Building2, href: '/cabang' },
            { name: 'Master Data', icon: Database, href: '/master-data' },
        ],
    },
    {
        category: 'GENERATE & LAPORAN',
        items: [
            { name: 'Upload SSA', icon: UploadCloud, href: '/upload-ssa' },
            { name: 'Riwayat Generate', icon: Clock, href: '/riwayat-generate' },
            { name: 'Laporan', icon: FileSpreadsheet, href: '/laporan' },
        ],
    },
    {
        category: 'MONITORING',
        items: [
            { name: 'Monitoring Cabang', icon: MonitorPlay, href: '/monitoring' },
        ],
    },
    {
        category: 'SISTEM',
        items: [
            { name: 'Approval Request', icon: CheckSquare, href: '/approval' },
            { name: 'Pengguna', icon: Users, href: '/pengguna' },
            { name: 'Role & Permission', icon: ShieldAlert, href: '/role-permission' },
            { name: 'Activity Log', icon: Activity, href: '/activity' },
            { name: 'Pengaturan Sistem', icon: Settings, href: '/pengaturan' },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

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
        <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0 sticky top-0 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
            {/* Logo Section */}
            <div className="h-24 flex items-center px-6 border-b border-slate-100 mb-4 shrink-0">
                <Image 
                    src={logoImage} 
                    alt="SYNCORE Logo" 
                    height={44} 
                    className="object-contain w-auto h-11" 
                    priority
                />
            </div>

            {/* Navigation Menu - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scrollbar-none hover:scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {MENU_ITEMS.map((group, idx) => (
                    <div key={idx}>
                        <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {group.category}
                        </h3>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link 
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                isActive 
                                                    ? "bg-[#1a2f5c] text-white shadow-md shadow-blue-900/20" 
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-[#1a2f5c]"
                                            )}
                                        >
                                            <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-white" : "text-slate-400 group-hover:text-[#1a2f5c]")} />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Bottom Profile Section */}
            <div className="p-4 border-t border-slate-100 shrink-0">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-[#1a2f5c] text-white flex items-center justify-center flex-shrink-0 font-semibold shadow-inner">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle2 className="w-5 h-5" />}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Loading...'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || '...'}</p>
                        </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
            </div>
        </aside>
    );
}
