import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface RkaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const MATA_ANGGARAN_LIST = [
    { id: 'dpk', name: 'Dana Pihak Ketiga', isHeader: true },
    { id: 'dpk_tabungan', name: 'Tabungan', dbName: 'Dana Pihak Ketiga - Tabungan', isChild: true },
    { id: 'dpk_giro', name: 'Giro', dbName: 'Dana Pihak Ketiga - Giro', isChild: true },
    { id: 'dpk_deposito', name: 'Deposito', dbName: 'Dana Pihak Ketiga - Deposito', isChild: true },
    { id: 'dpk_casa', name: 'CASA', isComputed: true, computeFrom: ['dpk_tabungan', 'dpk_giro'], isChild: true },
    
    { id: 'dpk_korporasi', name: 'DPK Korporasi', isHeader: true },
    { id: 'korp_giro', name: 'Giro', dbName: 'DPK Korporasi - Giro', isChild: true },
    { id: 'korp_deposito', name: 'Deposito', dbName: 'DPK Korporasi - Deposito', isChild: true },
    
    { id: 'pinjaman', name: 'Pinjaman', isHeader: true },
    { id: 'pinj_mikro', name: 'Mikro', dbName: 'Pinjaman - Mikro', isChild: true },
    { id: 'pinj_small', name: 'Small', dbName: 'Pinjaman - Small', isChild: true },
    { id: 'pinj_konsumer', name: 'Konsumer', dbName: 'Pinjaman - Konsumer', isChild: true },
    
    { id: 'sml', name: 'SML', isHeader: true },
    { id: 'sml_mikro', name: 'Mikro', dbName: 'SML - Mikro', isChild: true },
    { id: 'sml_small', name: 'Small', dbName: 'SML - Small', isChild: true },
    { id: 'sml_konsumer', name: 'Konsumer', dbName: 'SML - Konsumer', isChild: true },
    
    { id: 'npl', name: 'NPL', isHeader: true },
    { id: 'npl_mikro', name: 'Mikro', dbName: 'NPL - Mikro', isChild: true },
    { id: 'npl_small', name: 'Small', dbName: 'NPL - Small', isChild: true },
    { id: 'npl_konsumer', name: 'Konsumer', dbName: 'NPL - Konsumer', isChild: true },
    
    { id: 'recovery_ec', name: 'Recovery EC', isHeader: true },
    { id: 'rec_mikro', name: 'Mikro', dbName: 'Recovery EC - Mikro', isChild: true },
    { id: 'rec_small', name: 'Small', dbName: 'Recovery EC - Small', isChild: true },
    { id: 'rec_konsumer', name: 'Konsumer', dbName: 'Recovery EC - Konsumer', isChild: true },
];

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function RkaFormModal({ isOpen, onClose, onSuccess }: RkaFormModalProps) {
    const [loading, setLoading] = useState(false);
    
    // Top level form state
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [bulan, setBulan] = useState(MONTHS[new Date().getMonth()]);
    const [tipe, setTipe] = useState('KC');
    const [branchName, setBranchName] = useState('');
    
    // Grid Data state (key is the id of the mata anggaran)
    const [gridData, setGridData] = useState<Record<string, string>>({});
    
    const [errors, setErrors] = useState<any>({});
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

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
        if (tipe === 'KC') return branchesKC;
        if (tipe === 'KCP') return branchesKCP;
        return branchesUnit;
    };

    // Auto-populate data
    useEffect(() => {
        if (!isOpen || !branchName || !tahun || !bulan) {
            setGridData({});
            return;
        }

        const fetchRka = async () => {
            setIsFetching(true);
            try {
                // Fetch for specific year and branch
                const res = await api.get(`/rka?tahun=${tahun}&branch_name=${encodeURIComponent(branchName)}&per_page=all`);
                const existingData = res.data.data || [];
                
                const newGridData: Record<string, string> = {};
                
                // Only populate the data for the currently selected "bulan"
                existingData.forEach((rka: any) => {
                    if (rka.bulan === bulan) {
                        const item = MATA_ANGGARAN_LIST.find(m => (m as any).dbName === rka.kategori);
                        if (item) {
                            const formatted = rka.target_nominal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                            newGridData[item.id] = formatted;
                        }
                    }
                });
                
                setGridData(newGridData);
            } catch (err) {
                console.error('Failed to fetch existing RKA', err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchRka();
    }, [isOpen, branchName, tahun, bulan]);

    if (!isOpen) return null;

    const handleGridChange = (id: string, value: string) => {
        const rawValue = value.replace(/\D/g, '');
        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        
        setGridData(prev => ({
            ...prev,
            [id]: formattedValue
        }));
    };

    const handleClose = () => {
        const hasData = Object.values(gridData).some(val => val !== '');
        if (hasData) {
            setShowConfirmClose(true);
        } else {
            doClose();
        }
    };

    const doClose = () => {
        setGridData({});
        setBranchName('');
        setErrors({});
        setShowConfirmClose(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!branchName) {
            alert('Silakan pilih Unit Kerja terlebih dahulu.');
            return;
        }

        setLoading(true);
        setErrors({});

        // Send all filled/empty values to backend so backend can update or delete
        const fullPayloadData = MATA_ANGGARAN_LIST
            .filter(item => !item.isHeader && !(item as any).isComputed)
            .map(item => {
                const val = gridData[item.id];
                return {
                    kategori: (item as any).dbName || item.name,
                    bulan: bulan, // current selected bulan
                    target_nominal: val ? val.replace(/\./g, '') : ''
                };
            });

        try {
            await api.post('/rka', {
                tahun,
                type: tipe,
                branch_name: branchName,
                data: fullPayloadData
            });
            
            alert('Berhasil menyimpan data RKA secara massal!');
            
            // Reset
            setGridData({});
            setBranchName('');
            onSuccess();
        } catch (error: any) {
            console.error('Failed to save RKA', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Terjadi kesalahan saat menyimpan data.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">Input RKA (Rencana Kerja & Anggaran)</h3>
                    <button 
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-hidden flex flex-col flex-1 space-y-6">
                    
                    {/* Top Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                        {/* Tahun */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tahun</label>
                            <input
                                type="text"
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        {/* Bulan */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bulan</label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                {MONTHS.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipe Cabang */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe Cabang</label>
                            <select
                                value={tipe}
                                onChange={(e) => {
                                    setTipe(e.target.value);
                                    setBranchName(''); // Reset branch on type change
                                }}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="KC">Kantor Cabang (KC)</option>
                                <option value="KCP">Kantor Cabang Pembantu (KCP)</option>
                                <option value="Unit">Unit Kerja</option>
                            </select>
                        </div>

                        {/* Unit Kerja */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit Kerja (Cabang)</label>
                            <select
                                value={branchName}
                                onChange={(e) => {
                                    setBranchName(e.target.value);
                                    if(errors.branch_name) setErrors({...errors, branch_name: null});
                                }}
                                className={`w-full px-4 py-2 bg-slate-50 border ${errors.branch_name ? 'border-red-500' : 'border-slate-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                            >
                                <option value="" disabled>Pilih Unit Kerja</option>
                                {getActiveBranches().map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                            {errors.branch_name && <p className="mt-1 text-xs text-red-500">{errors.branch_name[0]}</p>}
                        </div>
                    </div>

                    {/* Loader overlay for fetching data */}
                    <div className="relative flex-1 min-h-0 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                        {isFetching && (
                            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="ml-3 font-semibold text-slate-700">Memuat data {branchName}...</span>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-auto custom-scrollbar relative">
                            {/* Table Header */}
                            <div className="bg-slate-800 text-white flex min-w-max sticky top-0 z-10">
                                <div className="flex-1 px-4 py-3 text-sm font-bold border-r border-slate-700 sticky left-0 z-20 bg-slate-800">
                                    Mata Anggaran
                                </div>
                                <div className="w-64 px-4 py-3 text-sm font-bold text-center bg-blue-600 sticky right-0 z-20">
                                    Input Data ({bulan}-{tahun.slice(-2)})
                                </div>
                            </div>
                            
                            {/* Table Body */}
                            <div className="divide-y divide-slate-100 bg-white min-w-max">
                                {MATA_ANGGARAN_LIST.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className={`flex items-center hover:bg-slate-50 transition-colors ${item.isHeader ? 'bg-slate-50/50' : ''}`}
                                    >
                                        <div className={`flex-1 px-4 py-2.5 text-sm border-r border-slate-100 sticky left-0 z-10 ${item.isHeader ? 'font-bold text-slate-800 bg-slate-50/50' : 'text-slate-600 pl-8 bg-white'}`}>
                                            {item.name}
                                        </div>
                                        
                                        <div className="w-64 p-1.5 bg-blue-50/10 sticky right-0 z-10">
                                            {!item.isHeader && !(item as any).isComputed && (
                                                <input
                                                    type="text"
                                                    value={gridData[item.id] || ''}
                                                    onChange={(e) => handleGridChange(item.id, e.target.value)}
                                                    disabled={isFetching || !branchName}
                                                    placeholder="0"
                                                    className="w-full px-3 py-1.5 text-right text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white shadow-sm disabled:opacity-50 disabled:bg-slate-50"
                                                />
                                            )}
                                            {(item as any).isComputed && (
                                                <div className="w-full px-3 py-1.5 text-right text-sm font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-md">
                                                    {(() => {
                                                        let sum = 0;
                                                        (item as any).computeFrom.forEach((depId: string) => {
                                                            const val = gridData[depId];
                                                            if (val) sum += parseInt(val.replace(/\./g, ''), 10);
                                                        });
                                                        return sum === 0 ? '0' : sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer / Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleClose}
                        disabled={loading || isFetching}
                        className="rounded-xl"
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={loading || isFetching || !branchName}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Semua Data
                            </>
                        )}
                    </Button>
                </div>

                {/* Custom Confirmation Popup */}
                {showConfirmClose && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm rounded-2xl">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Batalkan Pengisian?</h4>
                            <p className="text-sm text-slate-500 mb-6">
                                Anda memiliki data yang belum disimpan. Apakah Anda yakin ingin membatalkan? Semua perubahan akan hilang.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowConfirmClose(false)}
                                    className="rounded-xl flex-1"
                                >
                                    Kembali
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={doClose}
                                    className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Ya, Batalkan
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
