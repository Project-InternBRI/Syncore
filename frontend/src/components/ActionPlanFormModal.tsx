import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Cookies from 'js-cookie';

interface ActionPlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedKategori?: string;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const WEEKS = [
    { id: 'W1', name: 'Week 1 (W1)' },
    { id: 'W2', name: 'Week 2 (W2)' },
    { id: 'W3', name: 'Week 3 (W3)' },
    { id: 'W4', name: 'Week 4 (W4)' },
];

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

    const selectedOpt = options.find((o: any) => (o.value || o) === value || (o.id || o) === value) || value;
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

export default function ActionPlanFormModal({ isOpen, onClose, onSuccess, selectedKategori }: ActionPlanFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [bulan, setBulan] = useState(MONTHS[new Date().getMonth()]);
    const [tipe, setTipe] = useState('KC');
    const [branchName, setBranchName] = useState('');
    const [kategori, setKategori] = useState(ALL_CATEGORIES[0].id);
    
    const [nasabah, setNasabah] = useState('');
    const [nominal, setNominal] = useState('');
    const [tanggal, setTanggal] = useState('');
    const [week, setWeek] = useState('W1');

    useEffect(() => {
        const userData = Cookies.get('user_data');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUser(parsed);
                if (parsed.role !== 'super_admin' && parsed.branch_name) {
                    setBranchName(parsed.branch_name);
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

    // Initialize form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (selectedKategori) {
                setKategori(selectedKategori);
            }
            if (user && user.role !== 'super_admin' && user.branch_name) {
                setBranchName(user.branch_name);
                if (user.branch_name.includes('KC ')) setTipe('KC');
                else if (user.branch_name.includes('KCP ')) setTipe('KCP');
                else setTipe('Unit');
            }
            // Reset form fields
            setNasabah('');
            setNominal('');
            setTanggal('');
            setWeek('W1');
            setErrors({});
        }
    }, [isOpen, selectedKategori, user]);

    if (!isOpen) return null;

    const handleNumberChange = (value: string) => {
        const rawValue = value.replace(/\D/g, '');
        const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setNominal(formattedValue);
    };

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setErrors({});
            
            const payload = {
                tahun,
                bulan,
                branch_name: branchName,
                kategori,
                nasabah,
                nominal: nominal ? parseInt(nominal.replace(/\./g, '')) : 0,
                tanggal,
                week
            };

            await api.post('/pipeline/action-plans', payload);
            
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Failed to save Action Plan', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
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
                        <h2 className="text-xl font-bold text-[#1a2f5c] tracking-tight">Input Strategi Dana (Nasabah)</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Tambahkan action plan untuk pencapaian gap</p>
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
                            disabled={user && user.role !== 'super_admin'}
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
                            disabled={user && user.role !== 'super_admin'}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kategori</label>
                            <div className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-500 cursor-not-allowed">
                                {ALL_CATEGORIES.find(c => c.id === kategori)?.name || kategori}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#f8faff] border border-slate-200 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-[#1a2f5c] uppercase tracking-wider">Detail Strategi</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Nasabah</label>
                                <input
                                    type="text"
                                    value={nasabah}
                                    onChange={(e) => {
                                        setNasabah(e.target.value);
                                        if (errors.nasabah) setErrors({...errors, nasabah: null});
                                    }}
                                    className={`w-full px-3 py-2.5 bg-white border ${errors.nasabah ? 'border-red-300' : 'border-slate-200'} rounded-xl text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[#1a2f5c] focus:ring-1 focus:ring-[#1a2f5c] transition-all placeholder:text-slate-400 placeholder:font-medium`}
                                    placeholder="Masukkan nama nasabah..."
                                />
                                {errors.nasabah && <span className="text-[11px] font-medium text-red-500">{errors.nasabah[0]}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nominal Target</label>
                                <input
                                    type="text"
                                    value={nominal}
                                    onChange={(e) => {
                                        handleNumberChange(e.target.value);
                                        if (errors.nominal) setErrors({...errors, nominal: null});
                                    }}
                                    className={`w-full px-3 py-2.5 bg-white border ${errors.nominal ? 'border-red-300' : 'border-slate-200'} rounded-xl text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[#1a2f5c] focus:ring-1 focus:ring-[#1a2f5c] transition-all text-right`}
                                    placeholder="0"
                                />
                                {errors.nominal && <span className="text-[11px] font-medium text-red-500">{errors.nominal[0]}</span>}
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tanggal</label>
                                <input
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => {
                                        setTanggal(e.target.value);
                                        if (errors.tanggal) setErrors({...errors, tanggal: null});
                                    }}
                                    className={`w-full px-3 py-2.5 bg-white border ${errors.tanggal ? 'border-red-300' : 'border-slate-200'} rounded-xl text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[#1a2f5c] focus:ring-1 focus:ring-[#1a2f5c] transition-all`}
                                />
                                {errors.tanggal && <span className="text-[11px] font-medium text-red-500">{errors.tanggal[0]}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <CustomSelect 
                                label="Target Minggu (Week)"
                                value={week}
                                onChange={(val: string) => {
                                    setWeek(val);
                                    if (errors.week) setErrors({...errors, week: null});
                                }}
                                options={WEEKS}
                                placeholder="Pilih Minggu"
                                error={errors.week ? errors.week[0] : null}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-xl text-[13px] font-bold h-10 px-5 border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl text-[13px] font-bold h-10 px-6 bg-[#1a2f5c] hover:bg-[#122345] text-white shadow-sm flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Simpan Strategi
                    </Button>
                </div>
            </div>
        </div>
    );
}
