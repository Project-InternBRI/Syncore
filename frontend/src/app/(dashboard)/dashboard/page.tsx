'use client';

import { useState, useEffect } from 'react';
import { 
    FileText, Download, Eye, Info, Clock, CheckCircle2, 
    FileSpreadsheet, FileBarChart, PieChart, Activity,
    Building2, Database, X, FileCheck2, Loader2, AlertCircle, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import RiwayatPreviewModal from '@/components/RiwayatPreviewModal';

const dashboards = [
    {
        id: 'kc',
        title: 'KC Dashboard',
        description: 'Menampilkan performa dan pencapaian seluruh Kantor Cabang (KC).',
        totalLabel: 'Total KC',
        totalKey: 'total_kc',
        icon: Building2,
        color: 'blue',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        btnClass: 'bg-[#2563eb] hover:bg-blue-700'
    },
    {
        id: 'kcp',
        title: 'KCP Dashboard',
        description: 'Menampilkan performa dan pencapaian seluruh KCP.',
        totalLabel: 'Total KCP',
        totalKey: 'total_kcp',
        icon: Database,
        color: 'sky',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        btnClass: 'bg-[#0ea5e9] hover:bg-sky-600'
    },
    {
        id: 'unit',
        title: 'Unit Dashboard',
        description: 'Menampilkan performa dan komposisi unit kerja.',
        totalLabel: 'Total Unit',
        totalKey: 'total_unit',
        icon: PieChart,
        color: 'orange',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        btnClass: 'bg-[#f97316] hover:bg-orange-600'
    },
    {
        id: 'produk',
        title: 'Monitoring Produk Dashboard',
        description: 'Menampilkan monitoring kinerja produk simpanan (Tabungan, Giro, dll).',
        totalLabel: 'Produk Simpanan',
        totalKey: 'produk', // Mock static for now
        icon: Activity,
        color: 'slate',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        btnClass: 'bg-[#1e293b] hover:bg-slate-800'
    }
];

export default function DashboardCenterPage() {
    const [selectedDetail, setSelectedDetail] = useState<any>(null);
    const [latestData, setLatestData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewType, setPreviewType] = useState('dashboard_kc');

    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfExportType, setPdfExportType] = useState('kc');
    const [pdfHistoryId, setPdfHistoryId] = useState('');
    const [histories, setHistories] = useState<any[]>([]);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
    const [availableComponents, setAvailableComponents] = useState<string[]>([]);
    const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
    const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
    const [selectedRka, setSelectedRka] = useState<string[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(false);
    
    // Static RKA Months for filter
    const ALL_RKA_MONTHS = [
        { id: '01', label: 'Jan' }, { id: '02', label: 'Feb' }, { id: '03', label: 'Mar' },
        { id: '04', label: 'Apr' }, { id: '05', label: 'Mei' }, { id: '06', label: 'Jun' },
        { id: '07', label: 'Jul' }, { id: '08', label: 'Agu' }, { id: '09', label: 'Sep' },
        { id: '10', label: 'Okt' }, { id: '11', label: 'Nov' }, { id: '12', label: 'Des' }
    ];

    useEffect(() => {
        if (!pdfHistoryId || !pdfModalOpen) return;
        const fetchOptions = async () => {
            setOptionsLoading(true);
            try {
                const response = await api.get(`/riwayat-generate/${pdfHistoryId}/export-options`);
                if (response.data.success) {
                    const periods = response.data.data.periods || [];
                    const components = response.data.data.components || [];
                    setAvailablePeriods(periods);
                    setAvailableComponents(components);
                    setSelectedComponents(components);
                    setSelectedPeriods(periods.slice(-4));
                }
            } catch (e) {
                console.error("Failed to fetch export options", e);
            } finally {
                setOptionsLoading(false);
            }
        };
        fetchOptions();
    }, [pdfHistoryId, pdfModalOpen]);

    const fetchLatestData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/riwayat-generate/latest');
            if (response.data.data) {
                setLatestData(response.data.data);
            } else {
                setLatestData(null);
            }
        } catch (error) {
            console.error('Failed to fetch latest dashboard data:', error);
            setLatestData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestData();
    }, []);

    const handlePreview = (id: string) => {
        if (!latestData) return;
        let type = 'dashboard_kc';
        if (id === 'kcp') type = 'dashboard_kcp';
        else if (id === 'unit') type = 'dashboard_unit';
        else if (id === 'produk') type = 'monitoring_produk';
        
        setPreviewType(type);
        setPreviewModalOpen(true);
    };

    const handleExport = async (id: string) => {
        if (!latestData) return;
        
        try {
            const response = await api.post('/riwayat-generate/export', {
                generate_history_id: latestData.id,
                snapshot_type: id
            }, {
                responseType: 'blob'
            });

            let dateString = latestData.period_name;
            if (!dateString) {
                const monthName = getMonthName(latestData.period_month);
                const year = latestData.period_year;
                const lastDay = new Date(parseInt(year), parseInt(latestData.period_month), 0).getDate();
                dateString = `${lastDay} ${monthName} ${year}`;
            }
            
            let prefix = '';
            if (id === 'kc') prefix = 'Dashboard KC';
            else if (id === 'kcp') prefix = 'Dashboard KCP';
            else if (id === 'unit') prefix = 'Dashboard Unit';
            else if (id === 'produk') prefix = 'Monitoring Produk Dashboard';
            
            const fileName = `${prefix} AH Gunsar ${dateString}.xlsx`;

            const url = URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert('Gagal mengunduh file.');
        }
    };

    const openPdfModal = async () => {
        setPdfModalOpen(true);
        const hid = latestData?.id?.toString() || '';
        setPdfHistoryId(hid);
        setPdfExportType('kc');
        setSelectedRka([]);
        try {
            const response = await api.get('/riwayat-generate?per_page=100');
            if (response.data.data && response.data.data.data) {
                setHistories(response.data.data.data);
            }
        } catch (e) {
            console.error("Failed to load histories", e);
        }
    };

    const handleExportPdfSubmit = async () => {
        if (!pdfHistoryId) {
            alert('Pilih periode terlebih dahulu');
            return;
        }
        setIsExportingPdf(true);
        
        try {
            const response = await api.post('/riwayat-generate/export-pdf', {
                generate_history_id: pdfHistoryId,
                snapshot_type: pdfExportType,
                selected_periods: selectedPeriods,
                selected_components: selectedComponents,
                selected_rka: selectedRka
            }, {
                responseType: 'blob'
            });

            const selectedHist = histories.find(h => h.id.toString() === pdfHistoryId);
            let dateString = selectedHist?.period_name || latestData?.period_name;
            if (!dateString) {
                const m = selectedHist?.period_month || latestData?.period_month;
                const y = selectedHist?.period_year || latestData?.period_year;
                if (m && y) {
                    const monthName = getMonthName(m);
                    const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
                    dateString = `${lastDay} ${monthName} ${y}`;
                } else {
                    dateString = "Periode Berjalan";
                }
            }
            
            let prefix = '';
            if (pdfExportType === 'kc') prefix = 'Dashboard KC';
            else if (pdfExportType === 'kcp') prefix = 'Dashboard KCP';
            else if (pdfExportType === 'unit') prefix = 'Dashboard Unit';
            
            const fileName = `${prefix} Presentasi AH Gunsar ${dateString}.pdf`;

            const url = URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setPdfModalOpen(false);
        } catch (error) {
            console.error('Export PDF failed', error);
            alert('Gagal mengunduh file PDF.');
        } finally {
            setIsExportingPdf(false);
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
        }).format(date) + ' WIB';
    };

    const getMonthName = (monthStr: string) => {
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months[parseInt(monthStr) - 1] || monthStr;
    };

    const hasData = !!latestData;

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 space-y-6 pb-24">
            
            {/* 1. Generate Summary Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className={`p-6 text-white flex items-center justify-between ${hasData ? 'bg-gradient-to-r from-[#1a2f5c] to-[#0052cc]' : 'bg-slate-100 text-slate-800 border-b border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${hasData ? 'bg-white/20 backdrop-blur-sm' : 'bg-white shadow-sm'}`}>
                            {hasData ? (
                                <CheckCircle2 className="w-8 h-8 text-white" />
                            ) : (
                                <FileText className="w-8 h-8 text-slate-400" />
                            )}
                        </div>
                        <div>
                            {hasData ? (
                                <>
                                    <h2 className="text-xl font-bold">Semua data berhasil diproses!</h2>
                                    <p className="text-blue-100 text-sm mt-1">4 dashboard berhasil dibuat dari file SSA yang di-upload.</p>
                                    <p className="text-xs text-blue-200 mt-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Terakhir di-generate: {formatDate(latestData.generated_at)}</p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-slate-800">Menunggu Proses Generate</h2>
                                    <p className="text-slate-500 text-sm mt-1">Silakan upload file SSA dan lakukan generate data.</p>
                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Terakhir di-generate: Belum ada data</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                        {hasData ? (
                            <>
                                <span className="text-3xl font-bold text-white">4</span>
                                <span className="text-blue-100 text-sm font-medium">Dashboard Tersedia</span>
                            </>
                        ) : (
                            <>
                                <span className="text-3xl font-bold text-orange-500">0</span>
                                <span className="text-orange-500 text-sm font-bold">Belum Tersedia</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Generate Summary</h3>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-8 text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            Memuat data...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">Status</p>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    <p className="text-sm font-bold text-slate-800">{hasData ? 'Sukses' : '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">Periode</p>
                                <p className="text-sm font-bold text-slate-800">
                                    {hasData 
                                        ? (latestData.period_name || `${getMonthName(latestData.period_month)} ${latestData.period_year}`) 
                                        : '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">Tanggal Generate</p>
                                <p className="text-sm font-bold text-slate-800">{hasData ? formatDate(latestData.generated_at) : '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">Generate oleh</p>
                                <p className="text-sm font-bold text-slate-800">{hasData ? (latestData.user?.name || 'Super Admin') : '-'}</p>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">Durasi Proses</p>
                                <p className="text-sm font-bold text-slate-800">{hasData ? '1m 24s' : '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">SSA Simpanan</p>
                                <p className={`text-sm font-bold truncate pr-4 ${hasData ? 'text-[#008f99]' : 'text-slate-800'}`}>
                                    {hasData ? latestData.ssa_simpanan_filename : '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">SSA Pinjaman</p>
                                <p className={`text-sm font-bold truncate pr-4 ${hasData ? 'text-[#008f99]' : 'text-slate-800'}`}>
                                    {hasData ? latestData.ssa_pinjaman_filename : '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500">Total Record / Snapshot ID</p>
                                <p className="text-sm font-bold text-slate-800">
                                    {hasData ? (
                                        <>
                                            {latestData.total_records.toLocaleString()} Baris
                                            <span className="text-slate-400 font-normal ml-1">(SNAP-{latestData.id.toString().padStart(3, '0')})</span>
                                        </>
                                    ) : '-'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Pilih Dashboard Cards */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Pilih Dashboard yang Ingin Diekspor</h3>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                            onClick={openPdfModal}
                            disabled={!hasData}
                        >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Export Presentasi (PDF)
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50"
                            onClick={fetchLatestData}
                            disabled={loading}
                        >
                            <Clock className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh Data
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mb-6">Pilih salah satu dashboard di bawah untuk mengekspor hasil analisis dalam format yang tersedia atau melihat preview datanya secara langsung.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboards.map((board) => {
                        const totalValue = hasData 
                            ? (board.totalKey === 'produk' ? '5 Produk' : latestData[board.totalKey]?.toLocaleString())
                            : 'Tidak ada data';
                            
                        return (
                        <div key={board.id} className={`bg-white rounded-2xl border ${hasData ? 'border-slate-200 hover:shadow-md' : 'border-slate-100 opacity-80'} transition-shadow flex flex-col h-full overflow-hidden group`}>
                            
                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${hasData ? board.bg : 'bg-slate-100'} ${hasData ? board.text : 'text-slate-400'} flex items-center justify-center`}>
                                        <board.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className={`font-bold text-sm ${hasData ? board.text : 'text-slate-500'}`}>{board.title}</h4>
                                </div>
                                
                                <p className="text-xs text-slate-500 flex-1 leading-relaxed mb-4">
                                    {board.description}
                                </p>

                                <div className={`px-4 py-3 rounded-xl border ${hasData ? board.border : 'border-slate-100'} ${hasData ? board.bg : 'bg-slate-50'} mb-4`}>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{board.totalLabel}</p>
                                    <p className={`text-2xl font-bold ${hasData ? board.text : 'text-slate-400'}`}>{totalValue}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                                <Button 
                                    className={`w-full shadow-sm font-semibold transition-colors ${hasData ? board.btnClass + ' text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200'}`}
                                    onClick={() => handleExport(board.id)}
                                    disabled={!hasData}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Ekspor Dashboard
                                </Button>
                                
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        className={`flex-1 h-9 text-xs font-semibold bg-white ${hasData ? 'text-slate-600 hover:text-blue-600 border-slate-200' : 'text-slate-300 border-slate-100 cursor-not-allowed hover:text-slate-300 hover:bg-white'}`}
                                        onClick={() => handlePreview(board.id)}
                                        disabled={!hasData}
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                        Preview
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className={`flex-1 h-9 text-xs font-semibold bg-white ${hasData ? 'text-slate-600 hover:text-slate-900 border-slate-200' : 'text-slate-300 border-slate-100 cursor-not-allowed hover:text-slate-300 hover:bg-white'}`}
                                        onClick={() => setSelectedDetail(board)}
                                        disabled={!hasData}
                                    >
                                        <Info className="w-3.5 h-3.5 mr-1.5" />
                                        Detail
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            </div>

            {/* 3. Detail Modal */}
            {selectedDetail && hasData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`p-5 flex items-center justify-between border-b border-slate-100 ${selectedDetail.bg}`}>
                            <div className="flex items-center gap-3">
                                <selectedDetail.icon className={`w-5 h-5 ${selectedDetail.text}`} />
                                <h3 className={`font-bold text-sm ${selectedDetail.text}`}>Detail {selectedDetail.title}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedDetail(null)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                    <span className="text-xs font-medium text-slate-500">Nama File</span>
                                    <span className="text-xs font-bold text-slate-800 break-all pl-4 text-right">
                                        {(() => {
                                            const monthName = getMonthName(latestData.period_month);
                                            const year = latestData.period_year;
                                            const lastDay = new Date(parseInt(year), parseInt(latestData.period_month), 0).getDate();
                                            let prefix = '';
                                            if (selectedDetail.id === 'kc') prefix = 'Dashboard KC';
                                            else if (selectedDetail.id === 'kcp') prefix = 'Dashboard KCP';
                                            else if (selectedDetail.id === 'unit') prefix = 'Dashboard Unit';
                                            else if (selectedDetail.id === 'produk') prefix = 'Monitoring Produk Dashboard';
                                            return `${prefix} AH Gunsar ${lastDay} ${monthName} ${year}.xlsx`;
                                        })()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                    <span className="text-xs font-medium text-slate-500">Ukuran (Estimasi)</span>
                                    <span className="text-xs font-bold text-slate-800">~2.4 MB</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                    <span className="text-xs font-medium text-slate-500">Total Baris</span>
                                    <span className="text-xs font-bold text-slate-800">{selectedDetail.totalKey === 'produk' ? '4,500' : latestData[selectedDetail.totalKey]?.toLocaleString()} Data</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                    <span className="text-xs font-medium text-slate-500">Tanggal Generate</span>
                                    <span className="text-xs font-bold text-slate-800">{formatDate(latestData.generated_at)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-500">Generate oleh</span>
                                    <span className="text-xs font-bold text-[#0052cc] bg-blue-50 px-2 py-0.5 rounded">{latestData.user?.name || 'Super Admin'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <Button 
                                onClick={() => setSelectedDetail(null)}
                                variant="outline"
                                className="flex-1 bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                            >
                                Tutup
                            </Button>
                            <Button 
                                onClick={() => {
                                    handleExport(selectedDetail.id);
                                    setSelectedDetail(null);
                                }}
                                className={`flex-1 text-white shadow-sm ${selectedDetail.btnClass}`}
                            >
                                <Download className="w-4 h-4 mr-1.5" />
                                Ekspor
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export PDF Modal */}
            {pdfModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 flex-shrink-0 flex items-center justify-between border-b border-slate-100 bg-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-slate-800">Export Presentasi (PDF)</h3>
                            </div>
                            <button 
                                onClick={() => setPdfModalOpen(false)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">Periode Data</label>
                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-slate-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {latestData?.period_name || (latestData ? `${getMonthName(latestData.period_month)} ${latestData.period_year}` : 'Memuat...')}
                                            </p>
                                            <p className="text-xs text-slate-500">Periode data aktif pada dashboard</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700">Pilih Bagian yang Diekspor</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-colors ${pdfExportType === 'kc' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                        <input type="radio" name="pdf_type" value="kc" checked={pdfExportType === 'kc'} onChange={() => setPdfExportType('kc')} className="sr-only" />
                                        <Building2 className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Dashboard KC</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-colors ${pdfExportType === 'kcp' ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                        <input type="radio" name="pdf_type" value="kcp" checked={pdfExportType === 'kcp'} onChange={() => setPdfExportType('kcp')} className="sr-only" />
                                        <Database className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Dashboard KCP</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-colors ${pdfExportType === 'unit' ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                                        <input type="radio" name="pdf_type" value="unit" checked={pdfExportType === 'unit'} onChange={() => setPdfExportType('unit')} className="sr-only" />
                                        <PieChart className="w-5 h-5" />
                                        <span className="text-sm font-semibold">Dashboard Unit</span>
                                    </label>
                                </div>
                            </div>

                            {optionsLoading ? (
                                <div className="py-4 flex justify-center items-center text-slate-500">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    <span className="text-sm font-medium">Memuat opsi filter...</span>
                                </div>
                            ) : (
                                <div className="space-y-4 border-t border-slate-100 pt-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-slate-700">Bulan yang Ditampilkan (Kolom)</label>
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">Disarankan 3-5 bulan</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {availablePeriods.map(p => (
                                                <label key={p} className={`cursor-pointer border rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${selectedPeriods.includes(p) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                    <input type="checkbox" className="sr-only" checked={selectedPeriods.includes(p)} onChange={(e) => {
                                                        if (e.target.checked) setSelectedPeriods([...selectedPeriods, p]);
                                                        else setSelectedPeriods(selectedPeriods.filter(x => x !== p));
                                                    }} />
                                                    {p}
                                                </label>
                                            ))}
                                            {availablePeriods.length === 0 && <span className="text-xs text-slate-400">Tidak ada periode tersedia</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-slate-700">RKA (Kolom Tambahan)</label>
                                            <button 
                                                onClick={() => {
                                                    if (selectedRka.length === ALL_RKA_MONTHS.length) setSelectedRka([]);
                                                    else setSelectedRka(ALL_RKA_MONTHS.map(m => m.id));
                                                }}
                                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {selectedRka.length === ALL_RKA_MONTHS.length ? 'Hapus Semua' : 'Pilih Semua'}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_RKA_MONTHS.map(m => (
                                                <label key={m.id} className={`cursor-pointer border rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${selectedRka.includes(m.id) ? 'bg-orange-500 border-orange-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                                    <input type="checkbox" className="sr-only" checked={selectedRka.includes(m.id)} onChange={(e) => {
                                                        if (e.target.checked) setSelectedRka([...selectedRka, m.id]);
                                                        else setSelectedRka(selectedRka.filter(x => x !== m.id));
                                                    }} />
                                                    {m.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-slate-700">Mata Anggaran (Baris)</label>
                                            <button 
                                                onClick={() => {
                                                    if (selectedComponents.length === availableComponents.length) setSelectedComponents([]);
                                                    else setSelectedComponents([...availableComponents]);
                                                }}
                                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {selectedComponents.length === availableComponents.length ? 'Hapus Semua' : 'Pilih Semua'}
                                            </button>
                                        </div>
                                        <div className="max-h-[140px] overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-1.5 custom-scrollbar">
                                            {availableComponents.map(c => (
                                                <label key={c} className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-white rounded-md cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                                                        checked={selectedComponents.includes(c)} 
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedComponents([...selectedComponents, c]);
                                                            else setSelectedComponents(selectedComponents.filter(x => x !== c));
                                                        }} 
                                                    />
                                                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{c}</span>
                                                </label>
                                            ))}
                                            {availableComponents.length === 0 && <span className="text-xs text-slate-400">Tidak ada komponen tersedia</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <p className="text-xs text-slate-500 flex items-start gap-1.5">
                                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                    Data akan digenerate secara otomatis menjadi slide PPTX (16:9) sesuai dengan opsi yang dicentang.
                                </p>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-shrink-0 justify-end gap-3">
                            <Button variant="outline" onClick={() => setPdfModalOpen(false)}>Batal</Button>
                            <Button 
                                onClick={handleExportPdfSubmit}
                                disabled={!pdfHistoryId || isExportingPdf}
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                            >
                                {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render Preview Modal */}
            {latestData && (
                <RiwayatPreviewModal
                    isOpen={previewModalOpen}
                    onClose={() => setPreviewModalOpen(false)}
                    previewType={previewType}
                    historyId={latestData.id}
                />
            )}
        </div>
    );
}
