import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface RiwayatPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    historyId: number;
    previewType: string;
}

export default function RiwayatPreviewModal({ isOpen, onClose, historyId, previewType }: RiwayatPreviewModalProps) {
    const [loadingTabs, setLoadingTabs] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    
    const [tabs, setTabs] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<string>('');
    const [data, setData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch Tabs when modal opens or previewType changes
    useEffect(() => {
        if (!isOpen || !historyId || !previewType) return;

        const fetchTabs = async () => {
            setLoadingTabs(true);
            setError(null);
            try {
                const response = await api.get(`/riwayat-generate/${historyId}/preview-tabs/${previewType}`);
                if (response.data.success) {
                    const fetchedTabs = response.data.tabs || [];
                    setTabs(fetchedTabs);
                    if (fetchedTabs.length > 0) {
                        setActiveTab(fetchedTabs[0]);
                    } else {
                        setActiveTab('');
                        setData([]);
                    }
                } else {
                    setError('Gagal mengambil daftar entitas.');
                }
            } catch (err: any) {
                setError(err.message || 'Terjadi kesalahan saat mengambil daftar.');
            } finally {
                setLoadingTabs(false);
            }
        };

        fetchTabs();
    }, [isOpen, historyId, previewType]);

    // Fetch Data when activeTab changes
    useEffect(() => {
        if (!isOpen || !historyId || !previewType || !activeTab) return;

        const fetchData = async () => {
            setLoadingData(true);
            setError(null);
            try {
                const response = await api.get(`/riwayat-generate/${historyId}/preview-data/${previewType}?name=${encodeURIComponent(activeTab)}`);
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    setError('Gagal mengambil data preview.');
                }
            } catch (err: any) {
                setError(err.message || 'Terjadi kesalahan saat mengambil data.');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [isOpen, historyId, previewType, activeTab]);

    const formatCurrency = (val: number | null | undefined) => {
        if (val === null || val === undefined) return '-';
        return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val);
    };

    const getTitle = () => {
        switch (previewType) {
            case 'dashboard_kc': return 'Preview Dashboard KC';
            case 'dashboard_kcp': return 'Preview Dashboard KCP';
            case 'dashboard_unit': return 'Preview Dashboard Unit';
            case 'monitoring_produk': return 'Preview Monitoring Produk';
            default: return 'Preview Data';
        }
    };

    // Extract unique date keys from all rows to form columns
    const dateColumns = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        const keysSet = new Set<string>();
        data.forEach(row => {
            if (row.values && typeof row.values === 'object') {
                Object.keys(row.values).forEach(k => keysSet.add(k));
            }
        });
        
        const parseIndonesianDate = (dateStr: string) => {
            const months: Record<string, number> = {
                'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mei': 4, 'jun': 5,
                'jul': 6, 'agu': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11
            };
            
            const lowerStr = dateStr.toLowerCase().trim();
            
            // Format: "22 Jun-2026" or "22 Jun 2026"
            const fullMatch = lowerStr.match(/^(\d+)\s+([a-z]+)[-\s](\d{4})$/);
            if (fullMatch) {
                const day = parseInt(fullMatch[1]);
                const m = fullMatch[2].substring(0, 3);
                const month = months[m] !== undefined ? months[m] : 0;
                const year = parseInt(fullMatch[3]);
                return new Date(year, month, day).getTime();
            }
            
            // Format: "Jan-25" or "Jan 25"
            const myMatch = lowerStr.match(/^([a-z]+)[-\s](\d{2,4})$/);
            if (myMatch) {
                const m = myMatch[1].substring(0, 3);
                const month = months[m] !== undefined ? months[m] : 0;
                let year = parseInt(myMatch[2]);
                if (year < 100) year += 2000;
                return new Date(year, month, 1).getTime();
            }
            
            return 0; // Fallback
        };

        const sortedKeys = Array.from(keysSet).sort((a, b) => {
            return parseIndonesianDate(a) - parseIndonesianDate(b);
        });
        
        return sortedKeys;
    }, [data]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Menampilkan seluruh susunan tanggal dan data layaknya file Excel.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                {!loadingTabs && tabs.length > 0 && (
                    <div className="flex px-4 border-b border-slate-100 bg-slate-50/80 overflow-x-auto shrink-0">
                        <div className="flex min-w-max">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-3 text-[13px] font-semibold transition-colors border-b-2 whitespace-nowrap ${
                                        activeTab === tab 
                                        ? 'border-[#0052cc] text-[#0052cc] bg-white' 
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-auto bg-slate-50/50 p-4">
                    {loadingTabs || loadingData ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#0052cc]" />
                            <p className="text-sm font-medium">Memuat data preview...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-500 text-sm font-medium bg-red-50 rounded-xl border border-red-100">
                            {error}
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium bg-white rounded-xl border border-slate-200">
                            Tidak ada data untuk ditampilkan pada kategori ini.
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                            <div className="overflow-x-auto overflow-y-auto max-h-full custom-scrollbar">
                                <table className="min-w-max w-full text-[13px] text-left border-collapse">
                                    <thead className="text-[11px] text-slate-600 bg-slate-50 uppercase font-bold sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-4 py-3 border-b border-r border-slate-200 bg-slate-50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                {previewType === 'monitoring_produk' ? 'Branch Office' : 'Mata Anggaran'}
                                            </th>
                                            {dateColumns.map(date => (
                                                <th key={date} className="px-4 py-3 border-b border-r border-slate-200 text-right whitespace-nowrap">{date}</th>
                                            ))}
                                            <th className="px-4 py-3 border-b border-r border-slate-200 text-right whitespace-nowrap bg-blue-50/50">RKA</th>
                                            <th className="px-4 py-3 border-b border-r border-slate-200 text-right whitespace-nowrap bg-blue-50/50">Pencapaian RKA</th>
                                            <th className="px-4 py-3 border-b border-r border-slate-200 text-right whitespace-nowrap bg-orange-50/50">MTD Growth</th>
                                            <th className="px-4 py-3 border-b border-r border-slate-200 text-right whitespace-nowrap bg-orange-50/50">YTD Growth</th>
                                            <th className="px-4 py-3 border-b border-slate-200 text-right whitespace-nowrap bg-orange-50/50">
                                                {previewType === 'monitoring_produk' ? 'DTD Growth' : 'YoY Growth'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap border-r border-slate-100 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                                                    {row.label || '-'}
                                                </td>
                                                {dateColumns.map(date => (
                                                    <td key={date} className="px-4 py-2.5 text-right font-medium text-slate-600 border-r border-slate-100 whitespace-nowrap">
                                                        {row.values && row.values[date] !== undefined ? formatCurrency(row.values[date]) : '-'}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-2.5 text-right font-medium text-slate-600 border-r border-slate-100 whitespace-nowrap bg-blue-50/10">
                                                    {row.rka ? formatCurrency(row.rka) : '-'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-medium text-slate-600 border-r border-slate-100 whitespace-nowrap bg-blue-50/10">
                                                    {row.pencapaian_rka ? `${(row.pencapaian_rka * 100).toFixed(2)}%` : '-'}
                                                </td>
                                                <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap border-r border-slate-100 bg-orange-50/10 ${row.mtd < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(row.mtd)}
                                                </td>
                                                <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap border-r border-slate-100 bg-orange-50/10 ${row.ytd < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(row.ytd)}
                                                </td>
                                                <td className={`px-4 py-2.5 text-right font-medium whitespace-nowrap bg-orange-50/10 ${(previewType === 'monitoring_produk' ? row.dtd : row.yoy) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(previewType === 'monitoring_produk' ? row.dtd : row.yoy)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Custom scrollbar styles */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; 
                }
            `}} />
        </div>
    );
}
