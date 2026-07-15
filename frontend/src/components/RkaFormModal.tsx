import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertTriangle, ChevronDown, Check } from 'lucide-react';
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

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function CustomSelect({ label, value, options, onChange, placeholder, error, disabled = false }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOpt = options.find((o: any) => (o.value || o) === value) || value;
    const displayValue = selectedOpt?.label || selectedOpt;

    return (
        <div className="relative" ref={selectRef}>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">{label}</label>
            <div 
                className={`w-full px-4 py-2.5 bg-slate-50 border ${error ? 'border-red-500 focus:ring-red-500/20' : isOpen ? 'border-[#1a2f5c] ring-2 ring-[#1a2f5c]/20' : 'border-slate-200'} rounded-xl text-sm font-semibold ${value ? 'text-slate-800' : 'text-slate-400'} ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'cursor-pointer hover:border-[#1a2f5c]/50'} flex justify-between items-center transition-all shadow-sm`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className="truncate pr-2">{displayValue || placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && !disabled && (
                <div className="absolute z-[110] w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                        {options.map((opt: any) => {
                            const optValue = opt.value || opt;
                            const optLabel = opt.label || opt;
                            const isSelected = value === optValue;
                            return (
                                <div 
                                    key={optValue}
                                    className={`px-3 py-2 text-[13px] font-semibold rounded-lg cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-[#1a2f5c] text-white shadow-md shadow-[#1a2f5c]/20' : 'text-slate-700 hover:bg-slate-50 hover:text-[#1a2f5c]'}`}
                                    onClick={() => {
                                        onChange(optValue);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="truncate">{optLabel}</span>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

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
    const [popupMessage, setPopupMessage] = useState<{type: 'success'|'error', title: string, message: string} | null>(null);

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
                            const numValue = Math.round(Number(rka.target_nominal));
                            const formatted = numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
            setPopupMessage({
                type: 'error',
                title: 'Validasi Gagal',
                message: 'Silakan pilih Unit Kerja terlebih dahulu sebelum menyimpan data.'
            });
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
            
            setPopupMessage({
                type: 'success',
                title: 'Berhasil Disimpan!',
                message: `Data RKA untuk ${branchName} telah berhasil disimpan ke dalam sistem.`
            });
        } catch (error: any) {
            console.error('Failed to save RKA', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setPopupMessage({
                    type: 'error',
                    title: 'Gagal Menyimpan',
                    message: 'Terjadi kesalahan sistem saat mencoba menyimpan data RKA. Silakan coba lagi.'
                });
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
                <div className="p-6 overflow-hidden flex flex-col flex-1 space-y-6 bg-white">
                    
                    {/* Top Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 shrink-0">
                        <CustomSelect
                            label="Tahun"
                            value={tahun}
                            onChange={(val: string) => setTahun(val)}
                            options={Array.from({ length: 2050 - 2024 + 1 }, (_, i) => (2024 + i).toString())}
                        />

                        <CustomSelect
                            label="Bulan"
                            value={bulan}
                            onChange={(val: string) => setBulan(val)}
                            options={MONTHS}
                        />

                        <CustomSelect
                            label="Tipe Cabang"
                            value={tipe}
                            onChange={(val: string) => {
                                setTipe(val);
                                setBranchName('');
                            }}
                            options={[
                                { label: 'Kantor Cabang (KC)', value: 'KC' },
                                { label: 'Kantor Cabang Pembantu (KCP)', value: 'KCP' },
                                { label: 'Unit Kerja', value: 'Unit' }
                            ]}
                        />

                        <CustomSelect
                            label="Unit Kerja (Cabang)"
                            value={branchName}
                            onChange={(val: string) => {
                                setBranchName(val);
                                if(errors.branch_name) setErrors({...errors, branch_name: null});
                            }}
                            options={getActiveBranches()}
                            placeholder="Pilih Unit Kerja"
                            error={errors.branch_name ? errors.branch_name[0] : null}
                        />
                    </div>

                    {/* Loader overlay for fetching data */}
                    <div className="relative flex-1 min-h-0 border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                        {isFetching && (
                            <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-[#1a2f5c] animate-spin" />
                                <span className="ml-3 font-semibold text-slate-700">Memuat data {branchName}...</span>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-auto custom-scrollbar relative">
                            <table className="min-w-max w-full border-collapse">
                                <thead className="bg-[#f8faff] sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-slate-200">
                                    <tr>
                                        <th scope="col" className="px-5 py-3.5 text-left text-[11.5px] font-bold text-[#1a2f5c] uppercase tracking-widest sticky left-0 z-30 bg-[#f8faff] shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-r border-slate-200">
                                            Mata Anggaran
                                        </th>
                                        <th scope="col" className="w-[180px] px-5 py-3.5 text-right text-[11.5px] font-bold text-[#1a2f5c] uppercase tracking-widest sticky right-0 z-30 bg-[#f8faff] shadow-[-4px_0_12px_rgba(0,0,0,0.03)] border-l border-slate-200">
                                            Input Data ({bulan}-{tahun.slice(-2)})
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {MATA_ANGGARAN_LIST.map((item) => {
                                        const isHeader = item.isHeader;
                                        const isComputed = (item as any).isComputed;
                                        
                                        return (
                                            <tr key={item.id} className={`group transition-colors duration-300 border-b ${isHeader ? 'border-slate-200/80' : 'border-slate-100'}`}>
                                                <td className={`px-5 py-3 whitespace-nowrap sticky left-0 z-10 border-r transition-all duration-300 ${isHeader ? 'bg-[#f4f7fb] shadow-[4px_0_12px_rgba(0,0,0,0.03)] border-slate-200/80 shadow-[inset_3px_0_0_#1a2f5c]' : 'bg-white group-hover:bg-[#f8faff] shadow-[4px_0_12px_rgba(0,0,0,0.02)] border-slate-100 shadow-[inset_3px_0_0_transparent] group-hover:shadow-[inset_3px_0_0_#1a2f5c]'}`}>
                                                    <div className={`flex items-center ${isHeader ? '' : (item as any).isSubChild ? 'pl-12' : 'pl-6'}`}>
                                                        {isComputed && <div className="w-1.5 h-1.5 rounded-full bg-[#1a2f5c] mr-2.5 shadow-[0_0_8px_rgba(26,47,92,0.4)]"></div>}
                                                        {(item as any).isSubChild && <div className="w-1 h-1 rounded-full bg-slate-400 mr-2"></div>}
                                                        <span className={`${isHeader ? 'text-[11px] font-extrabold text-[#1a2f5c] uppercase tracking-wider' : isComputed ? 'text-[12.5px] font-bold text-[#1a2f5c]' : (item as any).isSubChild ? 'text-[12px] font-semibold text-slate-500 group-hover:text-slate-800 transition-colors italic' : 'text-[12.5px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors'}`}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                <td className={`px-4 py-2.5 whitespace-nowrap text-right sticky right-0 z-10 border-l transition-colors duration-300 ${isHeader ? 'bg-[#f4f7fb] shadow-[-4px_0_12px_rgba(0,0,0,0.03)] border-slate-200/80' : 'bg-white group-hover:bg-[#f8faff] shadow-[-4px_0_12px_rgba(0,0,0,0.02)] border-slate-100'}`}>
                                                    {!isHeader && !isComputed && (
                                                        <input
                                                            type="text"
                                                            value={gridData[item.id] || ''}
                                                            onChange={(e) => handleGridChange(item.id, e.target.value)}
                                                            disabled={isFetching || !branchName}
                                                            placeholder="0"
                                                            className="w-full max-w-[150px] ml-auto block px-3 py-1.5 text-right text-[13px] font-bold text-[#1a2f5c] bg-[#f8faff] border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] hover:bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] disabled:opacity-50 disabled:bg-slate-50 transition-all placeholder:font-medium placeholder:text-[#1a2f5c]/30"
                                                        />
                                                    )}
                                                    {isComputed && (
                                                        <div className="w-full max-w-[150px] ml-auto px-3 py-1.5 text-right text-[13px] font-bold text-[#1a2f5c] bg-[#f8faff] border border-slate-200/80 rounded-lg">
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
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
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
                        className="bg-[#1a2f5c] hover:bg-[#111f3d] text-white rounded-xl shadow-[0_4px_12px_rgba(26,47,92,0.2)] hover:shadow-[0_6px_16px_rgba(26,47,92,0.3)] transition-all px-6"
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

                {/* Universal Custom Alert/Success Popup */}
                {popupMessage && (
                    <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm rounded-2xl">
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner ${popupMessage.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${popupMessage.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    {popupMessage.type === 'success' ? (
                                        <Check className="w-8 h-8 text-emerald-600" />
                                    ) : (
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    )}
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 mb-2">{popupMessage.title}</h4>
                            <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">
                                {popupMessage.message}
                            </p>
                            {popupMessage.type === 'success' ? (
                                <div className="flex gap-3 mt-4">
                                    <Button 
                                        variant="outline"
                                        onClick={() => {
                                            setPopupMessage(null);
                                            setGridData({});
                                            setBranchName('');
                                            onSuccess(); // This closes the modal from parent
                                        }}
                                        className="w-full rounded-xl font-bold py-6 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        Tutup
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            setPopupMessage(null); // Just close popup, keep modal open
                                        }}
                                        className="w-full rounded-xl font-bold py-6 bg-[#1a2f5c] hover:bg-[#111f3d] text-white shadow-[0_4px_12px_rgba(26,47,92,0.2)] hover:shadow-[0_6px_16px_rgba(26,47,92,0.3)] transition-all"
                                    >
                                        Lanjut Input
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    onClick={() => setPopupMessage(null)}
                                    className="w-full rounded-xl font-bold py-6 transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm mt-4"
                                >
                                    Kembali
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
