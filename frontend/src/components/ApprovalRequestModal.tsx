import React, { useState } from 'react';
import { X, Send, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ApprovalRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ApprovalRequestModal({ isOpen, onClose, onSuccess }: ApprovalRequestModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            toast.error('Harap masukkan alasan permintaan Anda.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/approval-requests', {
                type: 'edit_pipeline',
                reason: reason
            });
            toast.success('Permintaan akses edit berhasil dikirim.');
            setReason('');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to request approval', error);
            toast.error('Gagal mengirim permintaan persetujuan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-[#1a2f5c]">Minta Akses Edit</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col space-y-5 bg-white">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">Pemberitahuan</p>
                            <p className="text-amber-700/90 leading-relaxed">Anda akan meminta akses kepada Super Admin untuk dapat melakukan perubahan pada data Pipeline Komitmen.</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-slate-700">Alasan Permintaan</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a2f5c]/20 focus:border-[#1a2f5c] transition-colors resize-none"
                            placeholder="Contoh: Perlu merevisi data target komitmen bulan depan..."
                            disabled={loading}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1a2f5c] rounded-xl hover:bg-[#122345] transition-colors focus:ring-2 focus:ring-[#1a2f5c]/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mengirim...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Kirim Permintaan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
