'use client';

import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, X, FileCheck2, Loader2, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface DropzoneProps {
    title: string;
    description?: string;
    file: File | null;
    onFileSelect: (file: File | null) => void;
    id: string;
}

const FileDropzone = ({ title, file, onFileSelect, id }: DropzoneProps) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="flex-1">
            <input 
                type="file" 
                id={id} 
                className="hidden" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleChange}
            />
            <label 
                htmlFor={id}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    file 
                        ? 'border-[#008f99] bg-teal-50/50' 
                        : 'border-blue-200 bg-white hover:bg-slate-50'
                }`}
            >
                {file ? (
                    <div className="flex flex-col items-center text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-teal-100 text-[#008f99] flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1 break-all px-4">{file.name}</p>
                        <p className="text-xs text-slate-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                onFileSelect(null);
                            }}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                        >
                            Hapus File
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-[#3b82f6] text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
                            <Upload className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-[#3b82f6] mb-1">
                            Pilih file {title}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                            atau drag & drop file di sini
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">
                            CSV • XLSX • XLS
                        </p>
                    </div>
                )}
            </label>
        </div>
    );
};

export default function UploadSSAPage() {
    // State for files
    const [fileSimpanan, setFileSimpanan] = useState<File | null>(null);
    const [filePinjaman, setFilePinjaman] = useState<File | null>(null);
    const [fileSimpananHist, setFileSimpananHist] = useState<File | null>(null);
    const [filePinjamanHist, setFilePinjamanHist] = useState<File | null>(null);
    const [fileLaba, setFileLaba] = useState<File | null>(null);
    
    // State for checkbox
    const [includeLaba, setIncludeLaba] = useState(false);

    // State for generation modal
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('Sedang menganalisa...');
    const [generateResult, setGenerateResult] = useState<any>(null);

    const getMonthName = (monthStr: string | number) => {
        if (!monthStr) return '';
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return months[parseInt(monthStr.toString()) - 1] || monthStr.toString();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date) + ' WIB';
    };
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    const router = useRouter();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isGenerating) {
            setProgress(0);
            setProgressMessage('Mengunggah file ke server...');
            
            // Simulasi tahapan progress karena kita tidak punya SSE dari backend
            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return prev; // Hold at 95% until real response comes
                    
                    const next = prev + (Math.random() * 5 + 1);
                    if (next > 30 && next < 40) setProgressMessage('Membaca & Memvalidasi data...');
                    if (next > 40 && next < 60) setProgressMessage('Memproses Snapshot & Pivot...');
                    if (next > 60 && next < 80) setProgressMessage('Menghitung Growth & Laba...');
                    if (next > 80) setProgressMessage('Menyimpan hasil akhir...');
                    
                    return next > 95 ? 95 : next;
                });
            }, 800);
        }
        
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isGenerating]);

    // Derived states
    const requiredFilesCount = [fileSimpanan, filePinjaman].filter(Boolean).length;
    const isReadyToGenerate = requiredFilesCount === 2;
    const historyFilesCount = [fileSimpananHist, filePinjamanHist].filter(Boolean).length;

    const handleClearAll = () => {
        setFileSimpanan(null);
        setFilePinjaman(null);
        setFileSimpananHist(null);
        setFilePinjamanHist(null);
        setFileLaba(null);
        setIncludeLaba(false);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const formData = new FormData();
            if (fileSimpanan) formData.append('file_simpanan', fileSimpanan);
            if (filePinjaman) formData.append('file_pinjaman', filePinjaman);
            if (fileSimpananHist) formData.append('file_simpanan_hist', fileSimpananHist);
            if (filePinjamanHist) formData.append('file_pinjaman_hist', filePinjamanHist);
            
            // Hit real backend
            const response = await api.post('/riwayat-generate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data && response.data.data) {
                setGenerateResult(response.data.data);
            }

            setProgress(100);
            setProgressMessage('Selesai!');
            
            setTimeout(() => {
                setIsGenerating(false);
                setShowSuccessModal(true);
            }, 500);
        } catch (error: any) {
            console.error('Failed to generate', error);
            setIsGenerating(false);
            setProgress(0);
            const url = error.config?.url;
            const baseURL = error.config?.baseURL;
            const backendError = error.response?.data?.error || error.response?.data?.message || error.message;
            alert(`Gagal melakukan generate. URL: ${baseURL}${url} | Error: ${backendError}`);
        }
    };

    const handleViewDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 space-y-6 pb-24">
            
            {/* Section 1: File Periode Berjalan (Wajib) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-slate-800">File Periode Berjalan</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600">
                            Wajib
                        </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                        {requiredFilesCount} / 2 file
                    </span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                    Upload SSA Simpanan & SSA Pinjaman untuk periode aktif yang akan diproses.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">SSA Simpanan</label>
                        <FileDropzone 
                            id="simpanan"
                            title="SSA Simpanan" 
                            file={fileSimpanan} 
                            onFileSelect={setFileSimpanan} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">SSA Pinjaman</label>
                        <FileDropzone 
                            id="pinjaman"
                            title="SSA Pinjaman" 
                            file={filePinjaman} 
                            onFileSelect={setFilePinjaman} 
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: File Periode Sebelumnya (Opsional) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-slate-800">File Periode Sebelumnya</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                            Opsional
                        </span>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                        {historyFilesCount} file
                    </span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                    Tambahkan file historis untuk mengisi kolom Posisi dan menghitung Growth (MTD/DTD/YOY/YTD).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">SSA Simpanan — Historis</label>
                        <FileDropzone 
                            id="simpanan-hist"
                            title="Simpanan (Historis)" 
                            file={fileSimpananHist} 
                            onFileSelect={setFileSimpananHist} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">SSA Pinjaman — Historis</label>
                        <FileDropzone 
                            id="pinjaman-hist"
                            title="Pinjaman (Historis)" 
                            file={filePinjamanHist} 
                            onFileSelect={setFilePinjamanHist} 
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Tambahkan Data Laba (Opsional) */}
            <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 ${includeLaba ? 'pb-8' : ''}`}>
                <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                        <input 
                            type="checkbox" 
                            id="include-laba"
                            checked={includeLaba}
                            onChange={(e) => setIncludeLaba(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="include-laba" className="flex items-center gap-3 cursor-pointer select-none">
                            <h2 className="text-base font-bold text-slate-800">Tambahkan Data Laba (Laba, COF, COC)</h2>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                                Opsional
                            </span>
                        </label>
                        <p className="text-xs text-slate-500 mt-1 mb-2">
                            Upload file Data Laba untuk menampilkan chart Laba, COF, dan COC pada halaman Dashboard Visualisasi.
                        </p>
                        
                        {/* Dynamic Dropzone for Laba */}
                        {includeLaba && (
                            <div className="mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">File Laba</label>
                                    <div className="max-w-full">
                                        <FileDropzone 
                                            id="laba"
                                            title="File Laba" 
                                            file={fileLaba} 
                                            onFileSelect={setFileLaba} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 4: Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 mb-4">
                    <span>SSA Simpanan: {fileSimpanan ? <span className="text-[#008f99]">terupload</span> : 'belum diupload'}</span>
                    <span>•</span>
                    <span>SSA Pinjaman: {filePinjaman ? <span className="text-[#008f99]">terupload</span> : 'belum diupload'}</span>
                </div>
                
                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        onClick={handleClearAll}
                        className="flex-1 py-6 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent font-semibold rounded-xl"
                        disabled={isGenerating}
                    >
                        Bersihkan
                    </Button>
                    <Button 
                        disabled={!isReadyToGenerate || isGenerating}
                        onClick={handleGenerate}
                        className={`flex-[3] py-6 font-semibold rounded-xl transition-all ${
                            isReadyToGenerate 
                                ? 'bg-[#0052cc] hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed'
                        }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {Math.round(progress)}% - Memproses Data...
                            </>
                        ) : (
                            'Generate Dashboard'
                        )}
                    </Button>
                </div>
                
                {isGenerating && (
                    <div className="mt-6 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-[#0052cc]">{progressMessage}</span>
                            <span className="text-xs font-bold text-slate-600">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                            <div 
                                className="bg-[#0052cc] h-2 rounded-full transition-all duration-300 ease-out relative overflow-hidden" 
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 mt-2">
                            Harap jangan menutup halaman ini selama proses berjalan.
                        </p>
                    </div>
                )}
                
                {!isReadyToGenerate && !isGenerating && (
                    <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
                        Lengkapi file periode berjalan terlebih dahulu.
                    </p>
                )}
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                                <FileCheck2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Generate Berhasil!</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                File SSA Simpanan dan Pinjaman telah berhasil diproses menjadi 4 buah Dashboard dan disimpan sebagai snapshot.
                            </p>
                            
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Periode</span>
                                    <span className="font-semibold text-slate-700">
                                        {generateResult 
                                            ? (generateResult.period_name || `${getMonthName(generateResult.period_month)} ${generateResult.period_year}`) 
                                            : 'Juli 2026'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Waktu Generate</span>
                                    <span className="font-semibold text-slate-700">
                                        {generateResult ? formatDate(generateResult.generated_at) : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Status</span>
                                    <span className="font-semibold text-green-600">Sukses</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowSuccessModal(false)}
                                    className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                    Tutup
                                </Button>
                                <Button 
                                    onClick={handleViewDashboard}
                                    className="flex-1 rounded-xl bg-[#0052cc] hover:bg-blue-700 text-white shadow-md"
                                >
                                    Lihat Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
