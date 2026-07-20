'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RkaFormModal from '@/components/RkaFormModal';
import CustomDropdown from '@/components/CustomDropdown';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface Rka {
    id: number;
    tahun: number;
    bulan: string;
    branch_name: string;
    kategori: string;
    target_nominal: number;
    created_by: string;
}

const MATA_ANGGARAN_LIST = [
    { id: 'dpk', name: 'Dana Pihak Ketiga', isHeader: true },
    { id: 'dpk_tabungan', name: 'Tabungan', dbName: 'Dana Pihak Ketiga - Tabungan', isChild: true },
    { id: 'dpk_giro', name: 'Giro', dbName: 'Dana Pihak Ketiga - Giro', isChild: true },
    { id: 'dpk_deposito', name: 'Deposito', dbName: 'Dana Pihak Ketiga - Deposito', isChild: true },
    { id: 'dpk_casa', name: 'CASA', isComputed: true, computeFrom: ['Dana Pihak Ketiga - Tabungan', 'Dana Pihak Ketiga - Giro'], isChild: true },
    
    { id: 'dpk_korporasi', name: 'DPK Korporasi', isHeader: true },
    { id: 'korp_giro', name: 'Giro', dbName: 'DPK Korporasi - Giro', isChild: true },
    { id: 'korp_deposito', name: 'Deposito', dbName: 'DPK Korporasi - Deposito', isChild: true },
    
    { id: 'pinjaman', name: 'Pinjaman', isHeader: true },
    { id: 'pinj_mikro', name: 'Mikro', dbName: 'Pinjaman - Mikro', isChild: true },
    { id: 'pinj_small', name: 'Small', dbName: 'Pinjaman - Small', isChild: true },
    { id: 'pinj_kons_kpr', name: 'Konsumer - KPR', dbName: 'Pinjaman - Konsumer KPR', isChild: true, isSubChild: true },
    { id: 'pinj_kons_briguna', name: 'Konsumer - Briguna Ritel', dbName: 'Pinjaman - Konsumer Briguna Ritel', isChild: true, isSubChild: true },
    
    { id: 'sml', name: 'SML', isHeader: true },
    { id: 'sml_mikro', name: 'Mikro', dbName: 'SML - Mikro', isChild: true },
    { id: 'sml_small', name: 'Small', dbName: 'SML - Small', isChild: true },
    { id: 'sml_kons_kpr', name: 'Konsumer - KPR', dbName: 'SML - Konsumer KPR', isChild: true, isSubChild: true },
    { id: 'sml_kons_briguna', name: 'Konsumer - Briguna Ritel', dbName: 'SML - Konsumer Briguna Ritel', isChild: true, isSubChild: true },
    
    { id: 'npl', name: 'NPL', isHeader: true },
    { id: 'npl_mikro', name: 'Mikro', dbName: 'NPL - Mikro', isChild: true },
    { id: 'npl_small', name: 'Small', dbName: 'NPL - Small', isChild: true },
    { id: 'npl_kons_kpr', name: 'Konsumer - KPR', dbName: 'NPL - Konsumer KPR', isChild: true, isSubChild: true },
    { id: 'npl_kons_briguna', name: 'Konsumer - Briguna Ritel', dbName: 'NPL - Konsumer Briguna Ritel', isChild: true, isSubChild: true },
    
    { id: 'recovery_ec', name: 'Recovery EC', isHeader: true },
    { id: 'rec_mikro', name: 'Mikro', dbName: 'Recovery EC - Mikro', isChild: true },
    { id: 'rec_small', name: 'Small', dbName: 'Recovery EC - Small', isChild: true },
    { id: 'rec_konsumer', name: 'Konsumer', dbName: 'Recovery EC - Konsumer', isChild: true },
];

const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function RkaPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'KC' | 'KCP' | 'Unit'>('KC');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [groupedData, setGroupedData] = useState<Record<string, Record<string, Record<string, number>>>>({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<string>('KC Jakarta Tanah Abang');
    const [user, setUser] = useState<any>(null);

    const branchesKC = [
        'KC Jakarta Tanah Abang', 'KC Krekot', 'KC Jakarta Veteran', 
        'KC Roxi', 'KC Jakarta Gunung Sahari', 'KC Jakarta Mangga Dua', 'KC Jakarta Kemayoran'
    ];
    
    const branchesKCP = [
        'KCP Senen Jaya', 'KCP Abdul Muis', 'KCP RSPAD', 'KCP Depkeu', 
        'KCP PASAR TANAH ABANG', 'KCP PERTAMINA', 'KCP LEMHANAS', 'KCP TOMANG', 
        'KCP PANGERAN JAYAKARTA', 'KCP KARANGANYAR', 'KCP THAMRIN CITY', 
        'KCP BENDUNGAN HILIR', 'KCP HARCO MANGGA DUA', 'KCP GAJAH MADA', 
        'KCP KEBON KACANG', 'KCP KEMENTRIAN BUMN', 'KCP TASPEN', 'KCP PASAR BARU', 
        'KCP PASAR PAGI MANGGA DUA', 'KCP BLOK B PUSAT GROSI TN ABANG'
    ];

    const branchesUnit = [
        'UNIT GARUDA JAKARTA', 'UNIT SUMUR BATU JAKARTA', 'UNIT HAJI UNG', 
        'UNIT PANGERAN JAYAKARTA', 'UNIT SAWAH BESAR', 'UNIT KARANG ANYAR JAKARTA', 
        'UNIT KS TUBUN', 'UNIT SERDANG JAKARTA', 'UNIT BENDUNGAN HILIR', 
        'UNIT KEBON KACANG', 'UNIT SENEN', 'UNIT PETOJO', 'UNIT JEMBATAN LIMA', 
        'UNIT HASYIM ASHARI', 'UNIT PETAMBURAN'
    ];

    const getActiveBranches = () => {
        if (activeTab === 'KC') return branchesKC;
        if (activeTab === 'KCP') return branchesKCP;
        return branchesUnit;
    };

    useEffect(() => {
        setIsMounted(true);
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchRkas();
            const interval = setInterval(() => {
                fetchRkas(true);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isMounted, activeTab, selectedYear]);

    const fetchRkas = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const params = {
                per_page: 'all',
                type: activeTab,
                tahun: selectedYear
            };
            const response = await api.get('/rka', { params });
            if (response.data && response.data.data) {
                const rawData: Rka[] = response.data.data;
                
                const newGrouped: Record<string, Record<string, Record<string, number>>> = {};
                
                // Pre-populate with all active branches so they show up as 0 even if no data
                getActiveBranches().forEach(branch => {
                    const branchYear = `${branch} (${selectedYear})`;
                    newGrouped[branchYear] = {};
                });
                
                rawData.forEach(rka => {
                    // Only group if it matches the selected year (just in case)
                    if (rka.tahun.toString() !== selectedYear) return;
                    
                    const branchYear = `${rka.branch_name} (${rka.tahun})`;
                    if (!newGrouped[branchYear]) newGrouped[branchYear] = {};
                    if (!newGrouped[branchYear][rka.kategori]) newGrouped[branchYear][rka.kategori] = {};
                    
                    newGrouped[branchYear][rka.kategori][rka.bulan] = rka.target_nominal;
                });

                setGroupedData(newGrouped);
            }
        } catch (error) {
            console.error('Error fetching RKA data', error);
            if (!isSilent) setGroupedData({});
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const formatNumber = (num: any) => {
        if (num === null || num === undefined || num === '') return '0';
        const numStr = String(num);
        const parts = numStr.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.length > 1 ? parts.join('.') : parts[0];
    };

    const getMonthValue = (branchYear: string, item: any, itemIndex: number, monthFull: string) => {
        if (item.isHeader) {
            let sum = 0;
            for (let i = itemIndex + 1; i < MATA_ANGGARAN_LIST.length; i++) {
                if (MATA_ANGGARAN_LIST[i].isHeader) break;
                if ((MATA_ANGGARAN_LIST[i] as any).isComputed) continue; // Skip computed in header sum
                
                const childDbName = (MATA_ANGGARAN_LIST[i] as any).dbName || MATA_ANGGARAN_LIST[i].name;
                const val = groupedData[branchYear]?.[childDbName]?.[monthFull];
                sum += val ? Number(val) : 0;
            }
            return sum;
        } else if (item.isComputed) {
            let sum = 0;
            item.computeFrom.forEach((dbName: string) => {
                const val = groupedData[branchYear]?.[dbName]?.[monthFull];
                sum += val ? Number(val) : 0;
            });
            return sum;
        } else {
            const dbName = item.dbName || item.name;
            const val = groupedData[branchYear]?.[dbName]?.[monthFull];
            return val !== undefined && val !== null ? val : 0;
        }
    };

    const getRowTotal = (branchYear: string, item: any, itemIndex: number) => {
        let total = 0;
        MONTHS_FULL.forEach(m => {
            total += Number(getMonthValue(branchYear, item, itemIndex, m));
        });
        return total;
    };

    const handleTabChange = (tab: 'KC' | 'KCP' | 'Unit') => {
        setActiveTab(tab);
        if (tab === 'KC') setSelectedBranch(branchesKC[0]);
        if (tab === 'KCP') setSelectedBranch(branchesKCP[0]);
        if (tab === 'Unit') setSelectedBranch(branchesUnit[0]);
    };

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Segmented Control for Main Tabs */}
                    <div className="flex p-1 bg-slate-100/80 border border-slate-200/60 rounded-xl">
                        {['KC', 'KCP', 'Unit'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab as any)}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                    activeTab === tab
                                        ? 'bg-[#1a2f5c] text-white shadow-sm ring-1 ring-[#1a2f5c]/20'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                            >
                                {tab === 'KC' ? 'Kantor Cabang' : tab === 'KCP' ? 'Cabang Pembantu' : 'Unit Kerja'}
                            </button>
                        ))}
                    </div>

                    <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari RKA..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a2f5c]/50 focus:border-[#1a2f5c] sm:text-sm transition-colors"
                        />
                    </div>
                </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 mr-2">
                            <CustomDropdown
                                value={selectedYear}
                                onChange={(val) => setSelectedYear(val)}
                                options={Array.from({ length: 2050 - 2024 + 1 }, (_, i) => (2024 + i).toString())}
                            />
                        </div>
                        {user?.role === 'super_admin' && (
                            <Button 
                                onClick={() => setModalOpen(true)}
                                className="w-full sm:w-auto flex items-center gap-2 bg-[#1a2f5c] hover:bg-[#111f3d] text-white shadow-sm rounded-xl px-5"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="font-medium">Tambah / Edit RKA</span>
                            </Button>
                        )}
                    </div>
                </div>

            {/* Main Content Container (Dashboard Workspace Layout) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[675px]">
                
                {/* Sidebar Navigation (Sub Tabs) */}
                <div className="w-[280px] bg-slate-50/50 border-r border-slate-200 shrink-0 flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-200 bg-white/50">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Daftar {activeTab === 'KC' ? 'Kantor Cabang' : activeTab === 'KCP' ? 'Cabang Pembantu' : 'Unit Kerja'}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                        {getActiveBranches().map((branch) => (
                            <button
                                key={branch}
                                onClick={() => setSelectedBranch(branch)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 flex items-center justify-between group ${
                                    selectedBranch === branch
                                        ? 'bg-[#1a2f5c] text-white shadow-md shadow-[#1a2f5c]/20'
                                        : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-200/60'
                                }`}
                            >
                                <span className="truncate pr-2">{branch}</span>
                                {selectedBranch === branch && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm text-slate-500">Memuat data...</p>
                        </div>
                    ) : Object.keys(groupedData).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-base font-semibold text-slate-800 mb-1">Belum ada data RKA untuk {activeTab}</p>
                            <p className="text-sm text-slate-500">Silakan klik tombol "Tambah / Edit RKA" untuk memasukkan data baru.</p>
                        </div>
                    ) : (
                        <table className="min-w-max w-full border-collapse">
                            <thead className="bg-[#f8faff] sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="px-5 py-3.5 text-left text-[11.5px] font-bold text-[#1a2f5c] uppercase tracking-widest sticky left-0 z-40 bg-[#f8faff] shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r border-slate-200 w-[220px]">
                                        Mata Anggaran
                                    </th>
                                    {MONTHS_SHORT.map((m) => (
                                        <th key={m} scope="col" className="px-3 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100 min-w-[85px]">
                                            {m}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-5 py-3.5 text-right text-[11.5px] font-bold text-[#1a2f5c] uppercase tracking-widest sticky right-0 z-40 bg-[#f8faff] shadow-[-4px_0_12px_rgba(0,0,0,0.03)] border-l border-slate-200 min-w-[120px]">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {(() => {
                                    const branchYear = `${selectedBranch} (${selectedYear})`;
                                    return (
                                        <React.Fragment key={branchYear}>
                                        {/* Group Header */}
                                        <tr className="bg-white">
                                            <td 
                                                colSpan={14} 
                                                className="p-0 border-b border-slate-200"
                                            >
                                                <div className="px-5 py-4 sticky left-0 w-max flex items-center gap-3 z-20 bg-white">
                                                    <div className="w-1.5 h-5 bg-[#1a2f5c] rounded-full"></div>
                                                    <span className="text-[14px] font-bold text-slate-800">{branchYear}</span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Rows per item */}
                                        {MATA_ANGGARAN_LIST.map((item, itemIndex) => {
                                            const isHeader = item.isHeader;
                                            const isComputed = (item as any).isComputed;
                                            
                                            return (
                                                <tr key={`${branchYear}-${item.id}`} className={`group transition-colors border-b ${isHeader ? 'bg-slate-50 border-slate-200/60' : 'bg-white hover:bg-[#f4f7fb] border-slate-100'}`}>
                                                    <td className={`px-5 py-2.5 whitespace-nowrap sticky left-0 z-10 border-r ${isHeader ? 'bg-slate-50 shadow-[4px_0_12px_rgba(0,0,0,0.02)] border-slate-200/60' : 'bg-white group-hover:bg-[#f4f7fb] shadow-[4px_0_12px_rgba(0,0,0,0.02)] border-slate-200/60'}`}>
                                                        <div className={`flex items-center ${isHeader ? '' : 'pl-5'}`}>
                                                            {isComputed && <div className="w-1.5 h-1.5 rounded-full bg-[#1a2f5c] mr-2"></div>}
                                                            <span className={`text-[11.5px] ${isHeader ? 'font-bold text-slate-800' : isComputed ? 'font-semibold text-[#1a2f5c]' : 'font-medium text-slate-600'}`}>
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    
                                                    {MONTHS_FULL.map((m, mIndex) => {
                                                        const val = getMonthValue(branchYear, item, itemIndex, m);
                                                        return (
                                                            <td key={mIndex} className="px-3 py-2.5 whitespace-nowrap text-right border-r border-slate-100">
                                                                <span className={`text-[11.5px] ${val > 0 ? (isHeader ? 'font-bold text-slate-800' : isComputed ? 'font-semibold text-[#1a2f5c]' : 'font-semibold text-slate-700') : 'text-slate-300 font-medium'}`}>
                                                                    {val === 0 && !isHeader ? '0' : formatNumber(val)}
                                                                </span>
                                                            </td>
                                                        );
                                                    })}
                                                    
                                                    <td className={`px-5 py-2.5 whitespace-nowrap text-right sticky right-0 z-10 border-l ${isHeader ? 'bg-slate-50 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] border-slate-200/60' : 'bg-white group-hover:bg-[#f4f7fb] shadow-[-4px_0_12px_rgba(0,0,0,0.02)] border-slate-200/60'}`}>
                                                        <span className={`text-[11.5px] font-bold ${isHeader ? 'text-slate-800' : 'text-emerald-600'}`}>
                                                            {formatNumber(getRowTotal(branchYear, item, itemIndex))}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                    );
                                })()}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            <RkaFormModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                onSuccess={() => {
                    setModalOpen(false);
                    fetchRkas();
                }}
            />
        </div>
    );
}
