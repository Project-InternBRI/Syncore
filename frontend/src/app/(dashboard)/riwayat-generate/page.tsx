'use client';

import { useState, useEffect } from 'react';
import { Eye, Download, FileText, ChevronDown, Calendar, Search, Trash2, MoreVertical, X, Settings, ChevronRight, Filter, Check } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import RiwayatPreviewModal from '@/components/RiwayatPreviewModal';

const CustomSelect = ({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: {label: string, value: string}[], placeholder: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Auto-close when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.custom-select-container')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative custom-select-container">
            <button 
                onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                className="w-full flex items-center justify-between py-2 px-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white transition-colors"
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-[60] top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1 custom-scrollbar">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                        >
                            <span className={`truncate ${value === opt.value ? 'text-blue-600 font-semibold' : 'text-slate-600 font-medium'}`}>
                                {opt.label}
                            </span>
                            {value === opt.value && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function RiwayatGeneratePage() {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [filterType, setFilterType] = useState<'date' | 'period'>('period');

    // Filter Menu State
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [tempStatus, setTempStatus] = useState('all');
    const [tempMonth, setTempMonth] = useState('all');
    const [tempYear, setTempYear] = useState('all');
    const [tempFilterType, setTempFilterType] = useState<'date' | 'period'>('period');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: 9,
        last_page: 1,
        from: 0,
        to: 0
    });

    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewHistoryId, setPreviewHistoryId] = useState<number>(0);
    const [previewType, setPreviewType] = useState<string>('');

    // Action Menu State
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

    // Modal States
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [historyToDelete, setHistoryToDelete] = useState<number | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [historyToDetail, setHistoryToDetail] = useState<any>(null);
    
    // Bulk Delete State
    const [bulkDeleteMenuOpen, setBulkDeleteMenuOpen] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
    const [bulkDeleteRange, setBulkDeleteRange] = useState<string>('all');

    // Close action menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Ignore detached elements to prevent premature closing of parent popups
            if (!document.contains(target)) return;
            
            if (!target.closest('.action-menu-container')) {
                setActiveMenuId(null);
            }
            if (!target.closest('.bulk-delete-container')) {
                setBulkDeleteMenuOpen(false);
            }
            if (!target.closest('.filter-menu-container')) {
                setFilterMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    
    // In a real implementation, we would use SWR or React Query, but this matches the current stack
    useEffect(() => {
        fetchHistories();
    }, [statusFilter, monthFilter, yearFilter, filterType, currentPage]);

    const fetchHistories = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            if (monthFilter !== 'all') {
                params.month = monthFilter;
            }
            if (yearFilter !== 'all') {
                params.year = yearFilter;
            }
            params.filter_type = filterType;
            params.page = currentPage;
            params.per_page = 9;
            
            const response = await api.get('/riwayat-generate', { params });
            if (response.data && response.data.data) {
                const responseData = response.data.data;
                setHistories(responseData.data || []);
                setPagination({
                    total: responseData.total || 0,
                    per_page: responseData.per_page || 9,
                    last_page: responseData.last_page || 1,
                    from: responseData.from || 0,
                    to: responseData.to || 0
                });
            } else {
                setHistories([]);
                setPagination({ total: 0, per_page: 9, last_page: 1, from: 0, to: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch histories', error);
            setHistories([]);
            setPagination({ total: 0, per_page: 9, last_page: 1, from: 0, to: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (id: number, type: string) => {
        // Mock export action
        alert(`Requesting export for History ID: ${id}, Type: ${type}`);
    };

    const handlePreview = (id: number, type: string) => {
        setPreviewHistoryId(id);
        setPreviewType(type);
        setPreviewModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!historyToDelete) return;
        
        try {
            await api.delete(`/riwayat-generate/${historyToDelete}`);
            fetchHistories(); // Refresh the list
            setDeleteModalOpen(false);
            setHistoryToDelete(null);
        } catch (error) {
            console.error('Failed to delete history', error);
            alert('Gagal menghapus riwayat. Silakan coba lagi.');
        }
    };

    const handleBulkDeleteSelect = (range: string) => {
        setBulkDeleteRange(range);
        setBulkDeleteMenuOpen(false);
        setBulkDeleteConfirmOpen(true);
    };

    const confirmBulkDelete = async () => {
        try {
            await api.delete(`/riwayat-generate/bulk?range=${bulkDeleteRange}`);
            fetchHistories(); // Refresh the list
            setBulkDeleteConfirmOpen(false);
        } catch (error) {
            console.error('Failed to bulk delete histories', error);
            alert('Gagal menghapus riwayat. Silakan coba lagi.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Sukses</span>;
            case 'failed':
                return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700">Gagal</span>;
            case 'processing':
                return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">Diproses</span>;
            default:
                return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getMonthName = (monthStr: string) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return months[parseInt(monthStr) - 1] || monthStr;
    };

    const applyFilters = () => {
        setStatusFilter(tempStatus);
        setMonthFilter(tempMonth);
        setYearFilter(tempYear);
        setFilterType(tempFilterType);
        setCurrentPage(1); // Reset to first page
        
        setFilterMenuOpen(false);
    };

    const clearFilters = () => {
        setTempStatus('all');
        setTempMonth('all');
        setTempYear('all');
        setTempFilterType('period');
        setStatusFilter('all');
        setMonthFilter('all');
        setYearFilter('all');
        setFilterType('period');
        setCurrentPage(1); // Reset to first page
        setFilterMenuOpen(false);
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto space-y-4">
            
            {/* Filter & Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari periode atau user..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        />
                    </div>
                    
                    {/* Filter Popover Button */}
                    <div className="relative filter-menu-container w-full sm:w-auto">
                        <Button 
                            variant="outline"
                            onClick={() => {
                                setTempStatus(statusFilter);
                                setTempMonth(monthFilter);
                                setTempYear(yearFilter);
                                setTempFilterType(filterType);
                                setFilterMenuOpen(!filterMenuOpen);
                            }}
                            className={`w-full sm:w-auto flex items-center gap-2 border-blue-200 focus:ring-blue-500 ${
                                (statusFilter !== 'all' || monthFilter !== 'all' || yearFilter !== 'all') 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : 'text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            <Filter className="w-4 h-4" /> Filter
                            {(statusFilter !== 'all' || monthFilter !== 'all' || yearFilter !== 'all') && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </Button>
                        
                        {filterMenuOpen && (
                            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-20 origin-top-right space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipe Pencarian Waktu</label>
                                    <CustomSelect 
                                        value={tempFilterType}
                                        onChange={(v) => setTempFilterType(v as 'date' | 'period')}
                                        placeholder="Pilih Tipe Filter"
                                        options={[
                                            { label: "Periode Data", value: "period" },
                                            { label: "Tanggal Generate", value: "date" },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        {tempFilterType === 'date' ? 'Bulan Generate' : 'Periode Bulan'}
                                    </label>
                                    <CustomSelect 
                                        value={tempMonth}
                                        onChange={setTempMonth}
                                        placeholder="Semua Bulan"
                                        options={[
                                            { label: "Semua Bulan", value: "all" },
                                            { label: "Januari", value: "01" },
                                            { label: "Februari", value: "02" },
                                            { label: "Maret", value: "03" },
                                            { label: "April", value: "04" },
                                            { label: "Mei", value: "05" },
                                            { label: "Juni", value: "06" },
                                            { label: "Juli", value: "07" },
                                            { label: "Agustus", value: "08" },
                                            { label: "September", value: "09" },
                                            { label: "Oktober", value: "10" },
                                            { label: "November", value: "11" },
                                            { label: "Desember", value: "12" },
                                        ]}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        {tempFilterType === 'date' ? 'Tahun Generate' : 'Periode Tahun'}
                                    </label>
                                    <CustomSelect 
                                        value={tempYear}
                                        onChange={setTempYear}
                                        placeholder="Semua Tahun"
                                        options={[
                                            { label: "Semua Tahun", value: "all" },
                                            { label: "2024", value: "2024" },
                                            { label: "2025", value: "2025" },
                                            { label: "2026", value: "2026" },
                                            { label: "2027", value: "2027" },
                                        ]}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                                    <CustomSelect 
                                        value={tempStatus}
                                        onChange={setTempStatus}
                                        placeholder="Semua Status"
                                        options={[
                                            { label: "Semua Status", value: "all" },
                                            { label: "Sukses", value: "success" },
                                            { label: "Gagal", value: "failed" },
                                            { label: "Diproses", value: "processing" },
                                        ]}
                                    />
                                </div>
                                
                                <div className="pt-3 flex gap-2 border-t border-slate-100">
                                    {(statusFilter !== 'all' || monthFilter !== 'all' || yearFilter !== 'all') ? (
                                        <Button onClick={clearFilters} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                                            Bersihkan
                                        </Button>
                                    ) : (
                                        <Button onClick={() => setFilterMenuOpen(false)} variant="outline" className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-700">
                                            Batalkan
                                        </Button>
                                    )}
                                    <Button onClick={applyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                        Terapkan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Bulk Delete Dropdown */}
                <div className="relative bulk-delete-container w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        onClick={() => setBulkDeleteMenuOpen(!bulkDeleteMenuOpen)}
                        className="w-full sm:w-auto flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 focus:ring-slate-500"
                    >
                        <Settings className="w-4 h-4" /> Kelola Riwayat
                    </Button>
                    
                    {bulkDeleteMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 origin-top-right">
                            {/* Nested Menu Item: Hapus Data */}
                            <div className="relative group/delete">
                                <button 
                                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Trash2 className="w-4 h-4" />
                                        <span>Hapus Data</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-red-400" />
                                </button>
                                
                                {/* Sub-menu on Hover */}
                                <div className="absolute right-full top-0 w-56 pr-1 opacity-0 invisible group-hover/delete:opacity-100 group-hover/delete:visible transition-all duration-200 z-30">
                                    <div className="bg-white rounded-xl shadow-lg border border-slate-100 py-1">
                                        <button 
                                            onClick={() => handleBulkDeleteSelect('all')}
                                            className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            Hapus Semua Riwayat
                                        </button>
                                        <div className="my-1 border-t border-slate-100"></div>
                                        <button 
                                            onClick={() => handleBulkDeleteSelect('7')}
                                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Hapus Riwayat 7 Hari Terakhir
                                        </button>
                                        <button 
                                            onClick={() => handleBulkDeleteSelect('30')}
                                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Hapus Riwayat 30 Hari Terakhir
                                        </button>
                                        <button 
                                            onClick={() => handleBulkDeleteSelect('90')}
                                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Hapus Riwayat 90 Hari Terakhir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-hidden h-[625px]">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Generate</th>
                                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Periode Data</th>
                                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Digenerate Oleh</th>
                                <th scope="col" className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cakupan Data</th>
                                <th scope="col" className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                                            Memuat riwayat generate...
                                        </div>
                                    </td>
                                </tr>
                            ) : histories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        Belum ada riwayat generate SSA.
                                    </td>
                                </tr>
                            ) : (
                                histories.map((history: any) => (
                                    <tr key={history.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">{formatDate(history.generated_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                {history.period_name || `${getMonthName(history.period_month)} ${history.period_year}`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-700">{history.user?.name || 'Unknown User'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center gap-2 text-xs font-medium text-slate-500">
                                                <span title="Kantor Cabang" className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{history.total_kc} KC</span>
                                                <span title="Kantor Cabang Pembantu" className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{history.total_kcp} KCP</span>
                                                <span title="Unit Kerja" className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{history.total_unit} Unit</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getStatusBadge(history.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="relative group">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        disabled={history.status !== 'success'}
                                                        className="h-8 bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                        Preview
                                                        <ChevronDown className="w-3 h-3 ml-1" />
                                                    </Button>
                                                    
                                                    {/* Dropdown for Preview Options */}
                                                    {history.status === 'success' && (
                                                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-10">
                                                            <div className="p-1.5">
                                                                <button onClick={() => handlePreview(history.id, 'dashboard_kc')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg">
                                                                    Dashboard KC
                                                                </button>
                                                                <button onClick={() => handlePreview(history.id, 'dashboard_kcp')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg">
                                                                    Dashboard KCP
                                                                </button>
                                                                <button onClick={() => handlePreview(history.id, 'dashboard_unit')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg">
                                                                    Dashboard Unit
                                                                </button>
                                                                <button onClick={() => handlePreview(history.id, 'monitoring_produk')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg">
                                                                    Monitoring Produk
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="relative group">
                                                    <Button 
                                                        size="sm"
                                                        disabled={history.status !== 'success'}
                                                        className="h-8 bg-[#1a2f5c] hover:bg-blue-800 text-white shadow-sm"
                                                    >
                                                        <Download className="w-4 h-4 mr-1.5" />
                                                        Export Ulang
                                                        <ChevronDown className="w-3 h-3 ml-1" />
                                                    </Button>
                                                    
                                                    {/* Dropdown for Export Options */}
                                                    {history.status === 'success' && (
                                                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-10">
                                                            <div className="p-1.5">
                                                                <button onClick={() => handleExport(history.id, 'all')} className="flex items-center w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg">
                                                                    <FileText className="w-3.5 h-3.5 mr-2 text-slate-400" /> Export Semua Dashboard
                                                                </button>
                                                                <div className="my-1 border-t border-slate-100"></div>
                                                                <button onClick={() => handleExport(history.id, 'dashboard_kc')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0052cc] rounded-lg">
                                                                    Dashboard KC
                                                                </button>
                                                                <button onClick={() => handleExport(history.id, 'dashboard_kcp')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0052cc] rounded-lg">
                                                                    Dashboard KCP
                                                                </button>
                                                                <button onClick={() => handleExport(history.id, 'dashboard_unit')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0052cc] rounded-lg">
                                                                    Dashboard Unit
                                                                </button>
                                                                <button onClick={() => handleExport(history.id, 'monitoring_produk')} className="flex items-center w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0052cc] rounded-lg">
                                                                    Monitoring Produk
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* More Options Menu */}
                                                <div className="relative ml-1 action-menu-container">
                                                    <Button 
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setActiveMenuId(activeMenuId === history.id ? null : history.id)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    {/* Dropdown for More Options */}
                                                    <div className={`absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 transition-all duration-200 origin-top-right z-10 ${activeMenuId === history.id ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                                        <div className="p-1.5">
                                                            <button 
                                                                onClick={() => {
                                                                    setActiveMenuId(null);
                                                                    setHistoryToDetail(history);
                                                                    setDetailModalOpen(true);
                                                                }} 
                                                                className="flex items-center w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                                                            >
                                                                <FileText className="w-3.5 h-3.5 mr-2" /> Detail Riwayat
                                                            </button>
                                                            <div className="my-1 border-t border-slate-100"></div>
                                                            <button 
                                                                onClick={() => {
                                                                    setActiveMenuId(null);
                                                                    setHistoryToDelete(history.id);
                                                                    setDeleteModalOpen(true);
                                                                }} 
                                                                className="flex items-center w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Hapus Riwayat
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {!loading && histories.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
                        <span className="text-xs font-medium text-slate-500">
                            Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} riwayat
                        </span>
                        
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 transition-colors"
                            >
                                Sebelumnya
                            </button>
                            
                            <div className="flex items-center">
                                {(() => {
                                    let pages = [];
                                    if (pagination.last_page <= 5) {
                                        for (let i = 1; i <= pagination.last_page; i++) pages.push(i);
                                    } else {
                                        if (currentPage <= 3) {
                                            pages = [1, 2, 3, 4, 5];
                                        } else if (currentPage >= pagination.last_page - 2) {
                                            for (let i = pagination.last_page - 4; i <= pagination.last_page; i++) pages.push(i);
                                        } else {
                                            for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
                                        }
                                    }
                                    return pages.map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-xs font-semibold mx-0.5 transition-colors ${
                                                currentPage === page 
                                                    ? 'bg-blue-600 text-white shadow-sm' 
                                                    : 'text-slate-600 hover:bg-slate-200 bg-transparent'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ));
                                })()}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                                disabled={currentPage === pagination.last_page || pagination.last_page === 0}
                                className="px-3 py-1.5 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 transition-colors"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Preview Modal */}
            <RiwayatPreviewModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                historyId={previewHistoryId}
                previewType={previewType}
            />

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Hapus Riwayat?</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Apakah Anda yakin ingin menghapus riwayat ini secara permanen? Data dashboard yang terkait dengan riwayat ini juga akan ikut terhapus dan tidak dapat dikembalikan.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Batal</Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Hapus Permanen</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {bulkDeleteConfirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Konfirmasi Hapus</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            {bulkDeleteRange === 'all' && "Apakah Anda yakin ingin menghapus SEMUA riwayat secara permanen? Data yang dihapus tidak dapat dikembalikan."}
                            {bulkDeleteRange === '7' && "Apakah Anda yakin ingin menghapus riwayat yang digenerate dalam 7 hari terakhir?"}
                            {bulkDeleteRange === '30' && "Apakah Anda yakin ingin menghapus riwayat yang digenerate dalam 30 hari terakhir?"}
                            {bulkDeleteRange === '90' && "Apakah Anda yakin ingin menghapus riwayat yang digenerate dalam 90 hari terakhir?"}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setBulkDeleteConfirmOpen(false)}>Batal</Button>
                            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmBulkDelete}>Ya, Hapus Data</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModalOpen && historyToDetail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Detail Riwayat Generate
                            </h3>
                            <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">Status</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${historyToDetail.status === 'success' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                        <p className="text-sm font-bold text-slate-800">{historyToDetail.status === 'success' ? 'Sukses' : historyToDetail.status}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">Periode</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {historyToDetail.period_name || `${getMonthName(historyToDetail.period_month)} ${historyToDetail.period_year}`}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">Tanggal Generate</p>
                                    <p className="text-sm font-bold text-slate-800">{formatDate(historyToDetail.generated_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">Generate oleh</p>
                                    <p className="text-sm font-bold text-slate-800">{historyToDetail.user?.name || 'Unknown'}</p>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500">Durasi Proses</p>
                                    <p className="text-sm font-bold text-slate-800">1m 24s</p>
                                </div>
                                
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs font-medium text-slate-500">SSA Simpanan</p>
                                    <p className="text-sm font-bold text-slate-800 truncate" title={historyToDetail.ssa_simpanan_filename}>
                                        {historyToDetail.ssa_simpanan_filename || '-'}
                                    </p>
                                </div>
                                
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs font-medium text-slate-500">SSA Pinjaman</p>
                                    <p className="text-sm font-bold text-slate-800 truncate" title={historyToDetail.ssa_pinjaman_filename || '-'}>
                                        {historyToDetail.ssa_pinjaman_filename || '-'}
                                    </p>
                                </div>
                                
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs font-medium text-slate-500">SSA Simpanan Historis</p>
                                    <p className="text-sm font-bold text-slate-800 truncate" title={historyToDetail.ssa_simpanan_hist_filename || '-'}>
                                        {historyToDetail.ssa_simpanan_hist_filename || '-'}
                                    </p>
                                </div>
                                
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs font-medium text-slate-500">SSA Pinjaman Historis</p>
                                    <p className="text-sm font-bold text-slate-800 truncate" title={historyToDetail.ssa_pinjaman_hist_filename || '-'}>
                                        {historyToDetail.ssa_pinjaman_hist_filename || '-'}
                                    </p>
                                </div>
                                
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs font-medium text-slate-500">File Laba</p>
                                    <p className="text-sm font-bold text-slate-800 truncate" title={historyToDetail.file_laba_filename || '-'}>
                                        {historyToDetail.file_laba_filename || '-'}
                                    </p>
                                </div>
                                
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs font-medium text-slate-500">Total Record / Snapshot ID</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {Number(historyToDetail.total_records || 0).toLocaleString()} Baris (SNAP-{(historyToDetail.id || 0).toString().padStart(3, '0')})
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <Button onClick={() => setDetailModalOpen(false)}>Tutup</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
