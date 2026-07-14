import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface PipelineFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
    selectedKategori?: string;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const ALL_CATEGORIES = [
    { id: 'Total DPK', name: 'Total DPK' },
    { id: 'Dana Pihak Ketiga - Tabungan', name: 'Total Tabungan' },
    { id: 'Dana Pihak Ketiga - Giro', name: 'Total Giro' },
    { id: 'Dana Pihak Ketiga - Deposito', name: 'Total Deposito' },
    { id: 'Total Loan', name: 'Total Loan' },
    { id: 'SME', name: 'SME' },
    { id: 'CONSUMER', name: 'CONSUMER' },
    { id: 'KPR', name: 'KPR' },
    { id: 'BRIGUNA_RITEL', name: 'BRIGUNA RITEL' },
    { id: 'MIKRO', name: 'MIKRO' },
    { id: 'TOTAL_SML', name: 'TOTAL SML' },
    { id: 'SML_SME', name: 'SML SME' },
    { id: 'SML_CONSUMER', name: 'SML CONSUMER' },
    { id: 'SML_KPR', name: 'SML KPR' },
    { id: 'SML_BRIGUNA_RITEL', name: 'SML BRIGUNA RITEL' },
    { id: 'SML_MIKRO', name: 'SML MIKRO' },
    { id: 'TOTAL_NPL', name: 'TOTAL NPL' },
    { id: 'NPL_SME', name: 'NPL SME' },
    { id: 'NPL_CONSUMER', name: 'NPL CONSUMER' },
    { id: 'NPL_BRIGUNA_RITEL', name: 'NPL BRIGUNA RITEL' },
    { id: 'NPL_KPR', name: 'NPL KPR' },
    { id: 'NPL_MIKRO', name: 'NPL MIKRO' },
    { id: 'TOTAL_EC', name: 'TOTAL EC' },
    { id: 'EC_SME', name: 'EC SME' },
    { id: 'EC_MIKRO', name: 'EC MIKRO' },
    { id: 'EC_CONSUMER', name: 'EC CONSUMER' },
    { id: 'EDC', name: 'EDC' },
    { id: 'QRIS', name: 'QRIS' },
];

const SUPER_ADMIN_CATEGORIES = ['TOTAL_EC', 'EC_SME', 'EC_MIKRO', 'EC_CONSUMER', 'EDC', 'QRIS'];

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
    const displayLabel = selectedOpt?.label || selectedOpt?.name || selectedOpt || placeholder;

    return (
        <div className="flex flex-col gap-1.5" ref={selectRef}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <div 
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 bg-white border ${error ? 'border-red-300' : 'border-slate-200'} rounded-xl text-[13px] font-semibold text-slate-700 cursor-pointer hover:border-[#1a2f5c] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                >
                    <span className={!value ? 'text-slate-400 font-medium' : ''}>{displayLabel}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar py-1">
                        {options.map((opt: any, idx: number) => {
                            const optValue = opt.value || opt.id || opt;
                            const optLabel = opt.label || opt.name || opt;
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => {
                                        onChange(optValue);
                                        setIsOpen(false);
                                    }}
                                    className={`px-3 py-2 text-[13px] font-semibold cursor-pointer transition-colors ${value === optValue ? 'bg-[#1a2f5c]/5 text-[#1a2f5c]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    {optLabel}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {error && <span className="text-[11px] font-medium text-red-500">{error}</span>}
        </div>
    );
}

export default function PipelineFormModal({ isOpen, onClose, onSuccess, initialData, selectedKategori }: PipelineFormModalProps) {
    const [loading, setLoading] = useState(false);
    
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [bulan, setBulan] = useState(MONTHS[new Date().getMonth()]);
    const [tipe, setTipe] = useState('KC');
    const [branchName, setBranchName] = useState('');
    const [kategori, setKategori] = useState(selectedKategori || ALL_CATEGORIES[0].id);
    
    const [w1, setW1] = useState('');
    const [w2, setW2] = useState('');
    const [w3, setW3] = useState('');
    const [w4, setW4] = useState('');
    const [gapHarian, setGapHarian] = useState('');
    
    const [errors, setErrors] = useState<any>({});
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUser(parsed);
                if (parsed.role !== 'super_admin' && parsed.branch_name) {
                    setBranchName(parsed.branch_name);
                    // Determine tipe
                    if (parsed.branch_name.includes('KC ')) setTipe('KC');
                    else if (parsed.branch_name.includes('KCP ')) setTipe('KCP');
                    else setTipe('Unit');
                }
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    const branchesKC = [
        'KC Jakarta Tanah Abang', 'KC Jakarta Krekot', 'KC Jakarta Veteran', 
        'KC JAKARTA ROXI', 'KC Jakarta Gunung Sahari', 'KC Jakarta Mangga Dua', 'KC Kemayoran'
    ];
    
    const branchesKCP = [
        'KCP Sudirman', 'KCP Thamrin'
    ];

    const branchesUnit = [
        'Unit Pasar Senen', 'Unit Blok M'
    ];

    const getActiveBranches = () => {
        if (tipe === 'KC') return branchesKC;
        if (tipe === 'KCP') return branchesKCP;
        return branchesUnit;
    };

    const getAvailableCategories = () => {
        if (!user) return ALL_CATEGORIES;
        if (user.role === 'super_admin') {
            return ALL_CATEGORIES.filter(c => SUPER_ADMIN_CATEGORIES.includes(c.id));
        } else {
            return ALL_CATEGORIES.filter(c => !SUPER_ADMIN_CATEGORIES.includes(c.id));
        }
    };

    // Initialize category when modal opens
    useEffect(() => {
        if (isOpen && selectedKategori) {
            setKategori(selectedKategori);
        }
    }, [isOpen, selectedKategori]);

    // Auto-populate data
    useEffect(() => {
        if (!isOpen || !branchName || !tahun || !bulan || !kategori) {
            setW1(''); setW2(''); setW3(''); setW4(''); setGapHarian('');
            return;
        }

        const fetchPipeline = async () => {
            setIsFetching(true);
            try {
                const res = await api.get(`/pipeline?tahun=${tahun}&branch_name=${encodeURIComponent(branchName)}&kategori=${encodeURIComponent(kategori)}&per_page=all`);
                const existingData = res.data.data || [];
                
                const pipeline = existingData.find((p: any) => p.bulan === bulan);
                
                if (pipeline) {
                    const format = (val: any) => val ? parseFloat(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '';
                    setW1(format(pipeline.w1));
                    setW2(format(pipeline.w2));
                    setW3(format(pipeline.w3));
                    setW4(format(pipeline.w4));
                    setGapHarian(format(pipeline.gap_harian));
                } else {
                    setW1(''); setW2(''); setW3(''); setW4(''); setGapHarian('');
                }
            } catch (err) {
                console.error('Failed to fetch existing Pipeline', err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchPipeline();
    }, [isOpen, branchName, tahun, bulan, kategori]);

    if (!isOpen) return null;

    const handleNumberChange = (setter: any, value: string) => {
        const rawValue = value.replace(/\D/g, '');
        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setter(formattedValue);
    };

    const handleClose = () => {
        if (w1 || w2 || w3 || w4 || gapHarian) {
            setShowConfirmClose(true);
        } else {
            doClose();
        }
    };

    const doClose = () => {
        setBranchName('');
        setW1(''); setW2(''); setW3(''); setW4(''); setGapHarian('');
        setErrors({});
        setShowConfirmClose(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!branchName) {
            setErrors({ branch_name: ['Silakan pilih Unit Kerja terlebih dahulu.'] });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.post('/pipeline', {
                tahun,
                bulan,
                type: tipe,
                branch_name: branchName,
                kategori,
                w1: w1 ? w1.replace(/\./g, '') : null,
                w2: w2 ? w2.replace(/\./g, '') : null,
                w3: w3 ? w3.replace(/\./g, '') : null,
                w4: w4 ? w4.replace(/\./g, '') : null,
                gap_harian: gapHarian ? gapHarian.replace(/\./g, '') : null
            });
            
            doClose();
            onSuccess();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-full overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-[#1a2f5c] tracking-tight">Input Pipeline Komitmen</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Isi target mingguan dan gap harian cabang</p>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <CustomSelect
                            label="Tahun"
                            value={tahun}
                            onChange={setTahun}
                            options={Array.from({ length: 2050 - 2024 + 1 }, (_, i) => (2024 + i).toString())}
                        />
                        <CustomSelect
                            label="Bulan"
                            value={bulan}
                            onChange={setBulan}
                            options={MONTHS}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                            disabled={isFetching || (user && user.role !== 'super_admin')}
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
                            disabled={isFetching || (user && user.role !== 'super_admin')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CustomSelect 
                            label="Kategori"
                            value={kategori}
                            onChange={(val: string) => {
                                setKategori(val);
                                if (errors.kategori) setErrors({...errors, kategori: null});
                            }}
                            options={getAvailableCategories()}
                            placeholder="Pilih Kategori"
                            error={errors.kategori ? errors.kategori[0] : null}
                            disabled={isFetching}
                        />
                    </div>


                    <div className="bg-[#f8faff] border border-slate-200 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-[#1a2f5c] uppercase tracking-wider">Target Mingguan</h3>
                            {isFetching && <Loader2 className="w-4 h-4 text-[#1a2f5c] animate-spin" />}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Week 1 (W1)</label>
                                <input
                                    type="text"
                                    value={w1}
                                    onChange={(e) => handleNumberChange(setW1, e.target.value)}
                                    placeholder="0"
                                    disabled={isFetching}
                                    className="w-full px-3 py-2.5 text-right text-[13px] font-bold text-[#1a2f5c] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] shadow-sm disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Week 2 (W2)</label>
                                <input
                                    type="text"
                                    value={w2}
                                    onChange={(e) => handleNumberChange(setW2, e.target.value)}
                                    placeholder="0"
                                    disabled={isFetching}
                                    className="w-full px-3 py-2.5 text-right text-[13px] font-bold text-[#1a2f5c] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] shadow-sm disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Week 3 (W3)</label>
                                <input
                                    type="text"
                                    value={w3}
                                    onChange={(e) => handleNumberChange(setW3, e.target.value)}
                                    placeholder="0"
                                    disabled={isFetching}
                                    className="w-full px-3 py-2.5 text-right text-[13px] font-bold text-[#1a2f5c] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] shadow-sm disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Week 4 (W4)</label>
                                <input
                                    type="text"
                                    value={w4}
                                    onChange={(e) => handleNumberChange(setW4, e.target.value)}
                                    placeholder="0"
                                    disabled={isFetching}
                                    className="w-full px-3 py-2.5 text-right text-[13px] font-bold text-[#1a2f5c] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] shadow-sm disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 mt-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gap Harian</label>
                                <input
                                    type="text"
                                    value={gapHarian}
                                    onChange={(e) => handleNumberChange(setGapHarian, e.target.value)}
                                    placeholder="0"
                                    disabled={isFetching}
                                    className="w-full px-3 py-2.5 text-right text-[13px] font-bold text-[#1a2f5c] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] shadow-sm disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleClose}
                        disabled={loading || isFetching}
                        className="rounded-xl font-semibold"
                    >
                        Batal
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={loading || isFetching || !branchName}
                        className="bg-[#1a2f5c] hover:bg-[#111f3d] text-white rounded-xl shadow-[0_4px_12px_rgba(26,47,92,0.2)] hover:shadow-[0_6px_16px_rgba(26,47,92,0.3)] transition-all px-6 font-semibold"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Simpan Komitmen
                    </Button>
                </div>

                {/* Confirm Close */}
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
                                <Button variant="outline" onClick={() => setShowConfirmClose(false)} className="rounded-xl flex-1 font-semibold">Kembali</Button>
                                <Button variant="destructive" onClick={doClose} className="rounded-xl flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold">Ya, Batalkan</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
