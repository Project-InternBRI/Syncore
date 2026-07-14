"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Building2, Plus } from 'lucide-react';
import Cookies from 'js-cookie';
import PipelineFormModal from '@/components/PipelineFormModal';
import ActionPlanFormModal from '@/components/ActionPlanFormModal';
import ApprovalRequestModal from '@/components/ApprovalRequestModal';
import CustomDropdown from '@/components/CustomDropdown';
import api from '@/lib/api';
import { Key } from 'lucide-react';

interface Pipeline {
    id: number;
    tahun: string;
    bulan: string;
    type: string;
    branch_name: string;
    kategori: string;
    w1: string;
    w2: string;
    w3: string;
    w4: string;
    gap_harian: string;
}

interface Rka {
    id: number;
    tahun: number;
    bulan: string;
    type: string;
    branch_name: string;
    kategori: string;
    target_nominal: number;
}

interface ActionPlan {
    id: number;
    tahun: string;
    bulan: string;
    branch_name: string;
    kategori: string;
    nasabah: string;
    nominal: string;
    tanggal: string;
    week: string;
}

const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const KATEGORI_LIST = [
    { key: 'Dana Pihak Ketiga - Tabungan', label: 'DPK Tabungan' },
    { key: 'Dana Pihak Ketiga - Giro', label: 'DPK Giro' },
    { key: 'Dana Pihak Ketiga - Deposito', label: 'DPK Deposito' },
    { key: 'DPK Korporasi - Giro', label: 'Korp Giro' },
    { key: 'DPK Korporasi - Deposito', label: 'Korp Deposito' },
    { key: 'Pinjaman - Mikro', label: 'Pinjaman Mikro' },
    { key: 'Pinjaman - Small', label: 'Pinjaman Small' },
    { key: 'Pinjaman - Konsumer', label: 'Pinjaman Konsumer' },
    { key: 'SML - Mikro', label: 'SML Mikro' },
    { key: 'SML - Small', label: 'SML Small' },
    { key: 'SML - Konsumer', label: 'SML Konsumer' },
    { key: 'NPL - Mikro', label: 'NPL Mikro' },
    { key: 'NPL - Small', label: 'NPL Small' },
    { key: 'NPL - Konsumer', label: 'NPL Konsumer' },
];

const branchesKC = [
    'KC Jakarta Tanah Abang', 'KC Jakarta Krekot', 'KC Jakarta Veteran', 'KC JAKARTA ROXI', 'KC Jakarta Gunung Sahari', 'KC Jakarta Mangga Dua', 'KC Kemayoran'
];
const branchesKCP = [
    'KCP Sudirman', 'KCP Thamrin'
];
const branchesUnit = [
    'Unit Pasar Senen', 'Unit Blok M'
];

const CATEGORY_TABS = [
    { id: 'Total DPK', label: 'Total DPK' },
    { id: 'Dana Pihak Ketiga - Tabungan', label: 'Total Tabungan' },
    { id: 'Dana Pihak Ketiga - Giro', label: 'Total Giro' },
    { id: 'Dana Pihak Ketiga - Deposito', label: 'Total Deposito' },
    { id: 'Total Loan', label: 'Total Loan' },
    { id: 'SME', label: 'SME' },
    { id: 'CONSUMER', label: 'CONSUMER' },
    { id: 'KPR', label: 'KPR' },
    { id: 'BRIGUNA_RITEL', label: 'BRIGUNA RITEL' },
    { id: 'MIKRO', label: 'MIKRO' },
    { id: 'TOTAL_SML', label: 'TOTAL SML' },
    { id: 'SML_SME', label: 'SML SME' },
    { id: 'SML_CONSUMER', label: 'SML CONSUMER' },
    { id: 'SML_KPR', label: 'SML KPR' },
    { id: 'SML_BRIGUNA_RITEL', label: 'SML BRIGUNA RITEL' },
    { id: 'SML_MIKRO', label: 'SML MIKRO' },
    { id: 'TOTAL_NPL', label: 'TOTAL NPL' },
    { id: 'NPL_SME', label: 'NPL SME' },
    { id: 'NPL_CONSUMER', label: 'NPL CONSUMER' },
    { id: 'NPL_BRIGUNA_RITEL', label: 'NPL BRIGUNA RITEL' },
    { id: 'NPL_KPR', label: 'NPL KPR' },
    { id: 'NPL_MIKRO', label: 'NPL MIKRO' },
    { id: 'TOTAL_EC', label: 'TOTAL EC' },
    { id: 'EC_SME', label: 'EC SME' },
    { id: 'EC_MIKRO', label: 'EC MIKRO' },
    { id: 'EC_CONSUMER', label: 'EC CONSUMER' },
    { id: 'EDC', label: 'EDC' },
    { id: 'QRIS', label: 'QRIS' },
];

export default function PipelinePage() {
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isActionPlanModalOpen, setIsActionPlanModalOpen] = useState(false);
    const [selectedActionPlan, setSelectedActionPlan] = useState<any>(null);
    const [hasEditAccess, setHasEditAccess] = useState(false);
    
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedKategori, setSelectedKategori] = useState(CATEGORY_TABS[0].id);
    const [searchQuery, setSearchQuery] = useState('');
    
    // For Action Plan Section
    const [actionPlanMonth, setActionPlanMonth] = useState(MONTHS_FULL[new Date().getMonth()]);
    
    // Data States
    const [pipelineData, setPipelineData] = useState<Record<string, Record<string, Pipeline>>>({});
    const [rkaData, setRkaData] = useState<Record<string, Record<string, number>>>({});
    const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        
        // Initial fetch
        fetchAllData(true);
        checkEditAccess();

        // Polling every 5 seconds for real-time updates
        const interval = setInterval(() => {
            fetchAllData(false);
            checkEditAccess();
        }, 5000);

        return () => clearInterval(interval);
    }, [isMounted, selectedYear, selectedKategori]);

    const checkEditAccess = async () => {
        try {
            const res = await api.get('/approval-requests/check-access', {
                params: { type: 'edit_pipeline' }
            });
            setHasEditAccess(res.data?.has_access || false);
        } catch (error) {
            console.error('Failed to check access', error);
        }
    };

    const fetchAllData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            
            const [pipeRes, rkaRes, actionRes] = await Promise.all([
                api.get('/pipeline', { params: { tahun: selectedYear, type: 'KC', kategori: selectedKategori, per_page: 'all' } }),
                api.get('/rka', { params: { tahun: selectedYear, type: 'KC', per_page: 'all' } }),
                api.get('/pipeline/action-plans', { params: { tahun: selectedYear, kategori: selectedKategori } })
            ]);
            
            const newPipeData: Record<string, Record<string, Pipeline>> = {};
            if (pipeRes.data?.data) {
                pipeRes.data.data.forEach((p: Pipeline) => {
                    if (!newPipeData[p.branch_name]) newPipeData[p.branch_name] = {};
                    newPipeData[p.branch_name][p.bulan] = p;
                });
            }
            
            const newRkaData: Record<string, Record<string, number>> = {};
            if (rkaRes.data?.data) {
                rkaRes.data.data.forEach((r: Rka) => {
                    if (r.kategori !== selectedKategori) return;
                    if (!newRkaData[r.branch_name]) newRkaData[r.branch_name] = {};
                    newRkaData[r.branch_name][r.bulan] = r.target_nominal;
                });
            }

            setPipelineData(newPipeData);
            setRkaData(newRkaData);
            
            if (actionRes.data?.data) {
                setActionPlans(actionRes.data.data);
            } else {
                setActionPlans([]);
            }
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    const formatCurrency = (value: string | number | undefined) => {
        if (value === undefined || value === null) return '-';
        return parseFloat(value.toString()).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const formatPercent = (val: number) => {
        return val.toFixed(2) + '%';
    };

    const getActiveBranches = () => {
        return branchesKC.filter(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    const branches = getActiveBranches();

    // Group action plans for the selected month by branch
    const filteredActionPlans = actionPlans.filter(p => p.bulan === actionPlanMonth);
    const actionPlansByBranch: Record<string, ActionPlan[]> = {};
    let maxRows = 0;
    
    branches.forEach(branch => {
        const branchPlans = filteredActionPlans.filter(p => p.branch_name === branch);
        actionPlansByBranch[branch] = branchPlans;
        if (branchPlans.length > maxRows) maxRows = branchPlans.length;
    });

    const displayRows = Math.max(maxRows, 1);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-6 bg-slate-50/50 space-y-4 md:space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a2f5c] tracking-tight">Monitoring Pipeline Komitmen</h1>
                    <p className="text-sm text-slate-500 mt-1">Supervisi pencapaian target dan strategi harian cabang (Januari - Desember)</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <CustomDropdown 
                        value={selectedYear}
                        onChange={(val) => setSelectedYear(val)}
                        options={Array.from({ length: 2050 - 2024 + 1 }, (_, i) => (2024 + i).toString())}
                        className="w-32"
                    />

                    {(() => {
                        const superAdminCategories = ['TOTAL_EC', 'EC_SME', 'EC_MIKRO', 'EC_CONSUMER', 'EDC', 'QRIS'];
                        const isSuperAdminCategory = superAdminCategories.includes(selectedKategori);

                        if (user?.role === 'super_admin') {
                            if (isSuperAdminCategory) {
                                return (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2f5c] text-white rounded-xl text-sm font-semibold hover:bg-[#122345] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Input Pipeline</span>
                                    </button>
                                );
                            }
                            return null;
                        } else {
                            if (!isSuperAdminCategory) {
                                if (hasEditAccess) {
                                    return (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2f5c] text-white rounded-xl text-sm font-semibold hover:bg-[#122345] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Input Pipeline</span>
                                        </button>
                                    );
                                } else {
                                    return (
                                        <button
                                            onClick={() => setIsApprovalModalOpen(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                        >
                                            <Key className="w-4 h-4" />
                                            <span>Minta Akses Edit</span>
                                        </button>
                                    );
                                }
                            }
                            return null;
                        }
                    })()}
                </div>
            </div>

            <div className="flex flex-col space-y-6">
                {/* Main Table Area */}
                <div className="flex flex-col bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden shrink-0">
                    
                    {/* Tabs & Search */}
                    <div className="flex flex-col sm:flex-row justify-between items-center px-2 pt-2 border-b border-slate-100 shrink-0 overflow-x-auto">
                        <div className="flex space-x-1 whitespace-nowrap min-w-max">
                            {CATEGORY_TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedKategori(tab.id)}
                                    className={`px-5 py-3.5 text-[13px] font-bold transition-colors border-b-2 relative ${
                                        selectedKategori === tab.id 
                                            ? 'border-[#1a2f5c] text-[#1a2f5c]' 
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-3 relative flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <div className="relative w-full sm:w-56">
                                <div className="absolute inset-y-0 left-3 pl-2 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari Cabang..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Spreadsheet Grid */}
                    <div className="w-full relative overflow-x-auto custom-scrollbar bg-slate-50/30 transform-gpu">
                        {loading ? (
                            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <Loader2 className="w-10 h-10 text-[#1a2f5c] animate-spin mb-4" />
                                <p className="text-slate-600 font-semibold animate-pulse">Menyiapkan data spreadsheet...</p>
                            </div>
                        ) : branches.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <Building2 className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Tidak Ada Data</h3>
                                <p className="text-slate-500">Cabang tidak ditemukan.</p>
                            </div>
                        ) : (
                            <table className="min-w-max w-full border-collapse">
                                <thead className="sticky top-0 z-40 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                                    <tr>
                                        <th rowSpan={2} className="px-5 py-3 text-left text-[12px] font-extrabold text-[#1a2f5c] uppercase tracking-wider bg-[#f8faff] border-r border-b border-slate-200 sticky left-0 z-50 w-[250px]">
                                            BRANCH OFFICE
                                        </th>
                                        {MONTHS_FULL.map((m, idx) => (
                                            <th key={m} colSpan={6} className={`px-2 py-2 text-center text-[12px] font-bold text-white uppercase tracking-wider border-r border-slate-300 ${idx % 2 === 0 ? 'bg-[#1a2f5c]' : 'bg-[#1e3c78]'}`}>
                                                KOMITMEN {m.toUpperCase()}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {MONTHS_FULL.map((m, idx) => (
                                            <React.Fragment key={m + '_cols'}>
                                                <th className="px-3 py-2 text-center text-[11px] font-bold text-slate-700 bg-slate-100 border-r border-b border-slate-200">
                                                    Pencapaian Thd RKA %
                                                </th>
                                                <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-700 bg-slate-50 border-r border-b border-slate-200">W1</th>
                                                <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-700 bg-slate-50 border-r border-b border-slate-200">W2</th>
                                                <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-700 bg-slate-50 border-r border-b border-slate-200">W3</th>
                                                <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-700 bg-slate-50 border-r border-b border-slate-200">W4</th>
                                                <th className="px-3 py-2 text-right text-[11px] font-bold text-[#1a2f5c] bg-[#eef2f9] border-r border-b border-slate-300 shadow-[inset_1px_0_0_rgba(0,0,0,0.02)]">Gap Harian</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {branches.map((branch, index) => (
                                        <tr 
                                            key={branch} 
                                            className={`group transition-colors duration-200 hover:bg-[#f8faff] border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                                        >
                                            <td className="px-5 py-2.5 whitespace-nowrap sticky left-0 z-30 bg-inherit border-r border-slate-200 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
                                                <span className="text-[13px] font-bold text-slate-700 group-hover:text-[#1a2f5c] truncate pr-2">{branch}</span>
                                            </td>
                                            {MONTHS_FULL.map(m => {
                                                const pipe = pipelineData[branch]?.[m];
                                                const rkaNominal = rkaData[branch]?.[m] || 0;
                                                
                                                let w1 = 0, w2 = 0, w3 = 0, w4 = 0, gap = 0;
                                                if (pipe) {
                                                    w1 = parseFloat(pipe.w1);
                                                    w2 = parseFloat(pipe.w2);
                                                    w3 = parseFloat(pipe.w3);
                                                    w4 = parseFloat(pipe.w4);
                                                    gap = parseFloat(pipe.gap_harian);
                                                }
                                                
                                                const totalPipe = w1 + w2 + w3 + w4;
                                                let pct = 0;
                                                if (rkaNominal > 0) {
                                                    pct = (totalPipe / rkaNominal) * 100;
                                                }

                                                return (
                                                    <React.Fragment key={branch + m}>
                                                        <td className={`px-3 py-2 text-center text-[12px] font-bold border-r border-slate-200 ${pct >= 100 ? 'text-green-600 bg-green-50/30' : pct > 0 ? 'text-amber-600 bg-amber-50/30' : 'text-slate-400'}`}>
                                                            {pct > 0 ? formatPercent(pct) : '-'}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-[12px] font-medium text-slate-700 border-r border-slate-100">{formatCurrency(w1)}</td>
                                                        <td className="px-3 py-2 text-right text-[12px] font-medium text-slate-700 border-r border-slate-100">{formatCurrency(w2)}</td>
                                                        <td className="px-3 py-2 text-right text-[12px] font-medium text-slate-700 border-r border-slate-100">{formatCurrency(w3)}</td>
                                                        <td className="px-3 py-2 text-right text-[12px] font-medium text-slate-700 border-r border-slate-100">{formatCurrency(w4)}</td>
                                                        <td className={`px-3 py-2 text-right text-[12px] font-bold border-r border-slate-300 bg-[#f8faff]/50 ${gap < 0 ? 'text-red-600' : gap > 0 ? 'text-[#1a2f5c]' : 'text-slate-400'}`}>
                                                            {gap !== 0 ? formatCurrency(gap) : '-'}
                                                        </td>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Action Plan Table (Details) */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col shrink-0 overflow-visible">
                    <div className="bg-[#1a2f5c] rounded-t-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20">
                        <div>
                            <h3 className="text-white font-bold text-base tracking-wide uppercase">Tabel Strategi Dana (Nasabah)</h3>
                            <p className="text-blue-200 text-xs mt-1">Perbandingan action plan seluruh cabang untuk mengatasi gap pencapaian - {CATEGORY_TABS.find(k => k.id === selectedKategori)?.label}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-blue-200 text-xs font-semibold">Pilih Bulan:</span>
                            <CustomDropdown 
                                value={actionPlanMonth}
                                onChange={(val) => setActionPlanMonth(val)}
                                options={MONTHS_FULL}
                                className="w-40 border-0"
                            />
                            {user?.role !== 'super_admin' && (
                                <button
                                    onClick={() => setIsActionPlanModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Input Strategi</span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="w-full relative overflow-x-auto custom-scrollbar bg-slate-50/50 p-4 transform-gpu">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-10 h-10 text-[#1a2f5c] animate-spin" />
                            </div>
                        ) : branches.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 font-medium">Tidak ada cabang untuk ditampilkan.</p>
                            </div>
                        ) : (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm inline-block min-w-full">
                                <table className="min-w-max border-collapse">
                                    <thead className="bg-slate-50">
                                        {/* Branch Headers */}
                                        <tr>
                                            {branches.map(branch => (
                                                <th key={branch} colSpan={4} className="px-4 py-3 text-center text-xs font-extrabold text-[#1a2f5c] uppercase tracking-widest border-r border-b border-slate-200 bg-[#f8faff]">
                                                    {branch}
                                                </th>
                                            ))}
                                        </tr>
                                        {/* Column Headers per branch */}
                                        <tr>
                                            {branches.map(branch => (
                                                <React.Fragment key={branch + '_sub'}>
                                                    <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-600 border-r border-b border-slate-200 bg-slate-100/50 w-[150px]">Nasabah</th>
                                                    <th className="px-3 py-2.5 text-right text-[11px] font-bold text-slate-600 border-r border-b border-slate-200 bg-slate-100/50 w-[120px]">Nominal</th>
                                                    <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-600 border-r border-b border-slate-200 bg-slate-100/50 w-[100px]">Tanggal</th>
                                                    <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-600 border-r border-b border-slate-200 bg-slate-100/50 w-[100px]">Week</th>
                                                </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {Array.from({ length: displayRows }).map((_, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                                                {branches.map(branch => {
                                                    const plan = actionPlansByBranch[branch]?.[rowIndex];
                                                    if (!plan) {
                                                        // Empty cell placeholders
                                                        return (
                                                            <React.Fragment key={branch + rowIndex}>
                                                                <td className="px-3 py-2 border-r border-slate-100 bg-slate-50/20"></td>
                                                                <td className="px-3 py-2 border-r border-slate-100 bg-slate-50/20"></td>
                                                                <td className="px-3 py-2 border-r border-slate-100 bg-slate-50/20"></td>
                                                                <td className="px-3 py-2 border-r border-slate-100 bg-slate-50/20"></td>
                                                            </React.Fragment>
                                                        );
                                                    }
                                                    return (
                                                        <React.Fragment key={branch + rowIndex}>
                                                            <td className="px-3 py-2 text-[12px] font-bold text-slate-700 border-r border-slate-100 truncate">{plan.nasabah}</td>
                                                            <td className="px-3 py-2 text-[12px] text-right font-semibold text-[#1a2f5c] border-r border-slate-100">{formatCurrency(plan.nominal)}</td>
                                                            <td className="px-3 py-2 text-[12px] text-center text-slate-500 border-r border-slate-100">{plan.tanggal || '-'}</td>
                                                            <td className="px-3 py-2 text-center border-r border-slate-100">
                                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-bold">{plan.week || '-'}</span>
                                                            </td>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <PipelineFormModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedActionPlan(null);
                }}
                onSuccess={() => {
                    fetchAllData(false);
                    checkEditAccess();
                }}
                initialData={selectedActionPlan}
                selectedKategori={selectedKategori}
            />

            <ApprovalRequestModal 
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                onSuccess={() => {
                    setIsApprovalModalOpen(false);
                    checkEditAccess();
                }}
            />
            
            <ActionPlanFormModal
                isOpen={isActionPlanModalOpen}
                onClose={() => setIsActionPlanModalOpen(false)}
                onSuccess={() => fetchAllData(false)}
                selectedKategori={selectedKategori}
            />
        </div>
    );
}
