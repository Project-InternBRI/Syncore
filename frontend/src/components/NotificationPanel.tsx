'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash2, Loader2, Info, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    action_url: string | null;
    is_read: boolean;
    created_at: string;
}

export default function NotificationPanel() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const lastNotifIdRef = useRef<number | null>(null);

    // Polling logic for both unread count and toasts
    useEffect(() => {
        let isFetching = false; // guard to prevent concurrent requests
        const fetchUpdates = async () => {
            if (isFetching) return; // skip if previous request still in-flight
            isFetching = true;
            try {
                // Fetch latest notifications to check for new ones
                const res = await api.get('/notifications?per_page=5');
                if (res.data?.success) {
                    const latestNotifs = res.data.data.data;
                    
                    // Update unread count manually based on current state or an endpoint
                    const unreadRes = await api.get('/notifications/unread-count');
                    if (unreadRes.data?.success) {
                        setUnreadCount(unreadRes.data.data.count);
                    }

                    if (latestNotifs.length > 0) {
                        const topNotif = latestNotifs[0];
                        
                        // If we have a new notification that we haven't seen before during this session
                        if (lastNotifIdRef.current !== null && topNotif.id > lastNotifIdRef.current) {
                            // Check for any new high priority notifications
                            const newHighPriority = latestNotifs.filter((n: Notification) => 
                                n.id > lastNotifIdRef.current! && n.priority === 'high' && !n.is_read
                            );

                            newHighPriority.forEach((notif: Notification) => {
                                toast.custom((t) => (
                                    <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out slide-out-to-top-2'} max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                                        <div className="flex-1 w-0 p-4">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 pt-0.5">
                                                    <AlertTriangle className="h-10 w-10 text-red-500 bg-red-50 p-2 rounded-full" />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{notif.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex border-l border-gray-200">
                                            <button
                                                onClick={() => {
                                                    toast.dismiss(t.id);
                                                    if (notif.action_url) {
                                                        router.push(notif.action_url);
                                                        setIsOpen(false);
                                                    }
                                                }}
                                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                                            >
                                                Lihat
                                            </button>
                                        </div>
                                    </div>
                                ), { duration: 5000 });
                            });
                        }
                        
                        // Update ref to latest id
                        lastNotifIdRef.current = topNotif.id;
                    }
                }
            } catch (error) {
                // Silently ignore network errors during heavy operations (e.g. generate)
            } finally {
                isFetching = false;
            }
        };

        fetchUpdates();
        const interval = setInterval(fetchUpdates, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [router]);


    // Fetch notifications when panel opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/notifications?per_page=20');
            if (res.data?.success) {
                setNotifications(res.data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: number, actionUrl: string | null) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            
            if (actionUrl) {
                setIsOpen(false);
                router.push(actionUrl);
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
        
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
    };

    const getIcon = (type: string, priority: string) => {
        if (priority === 'high') return <AlertTriangle className="w-5 h-5 text-red-500" />;
        if (type.includes('success')) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        if (type.includes('failed') || type.includes('reject')) return <XCircle className="w-5 h-5 text-red-500" />;
        if (type.includes('expir')) return <Clock className="w-5 h-5 text-amber-500" />;
        return <Info className="w-5 h-5 text-blue-500" />;
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
                    isOpen 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden origin-top-right">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#f8faff]">
                        <h3 className="font-bold text-slate-800">Notifikasi</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {/* Content List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                <p className="text-sm text-slate-500 font-medium">Memuat notifikasi...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Bell className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-600 font-bold mb-1">Belum ada notifikasi</p>
                                <p className="text-sm text-slate-400 font-medium">Anda akan menerima notifikasi di sini saat ada aktivitas baru.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map(notif => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => markAsRead(notif.id, notif.action_url)}
                                        className={`flex gap-3 p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                                            notif.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
                                        }`}
                                    >
                                        <div className="shrink-0 mt-0.5">
                                            {getIcon(notif.type, notif.priority)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-bold truncate pr-2 ${
                                                    notif.priority === 'high' && !notif.is_read ? 'text-red-700' : 'text-slate-800'
                                                }`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <span className="shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5"></span>
                                                )}
                                            </div>
                                            <p className={`text-xs mb-2 line-clamp-2 ${notif.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                                                {notif.message}
                                            </p>
                                            <span className="text-[11px] font-semibold text-slate-400">
                                                {formatTimeAgo(notif.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
