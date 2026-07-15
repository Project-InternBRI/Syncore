'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, ChevronDown, User, Lock, Eye, EyeOff, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

import logoImage from '../../../public/logo_syncore.png';
import bgImage from '../../../public/images/background_loginpage.png';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            
            if (response.data.access_token) {
                Cookies.set('auth_token', response.data.access_token, { expires: rememberMe ? 30 : 1 });
                Cookies.set('user_data', JSON.stringify(response.data.user), { expires: rememberMe ? 30 : 1 });
                
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login gagal. Silakan periksa kembali username/email dan password Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full font-sans items-center justify-center relative bg-[#f8fafc] antialiased p-4 md:p-8">
            
            {/* Classic Enterprise Rings Background */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#f4f7f9] via-[#e2eaf4] to-[#d1e0f0]">
                {/* Massive subtle geometric rings */}
                <div className="absolute -top-[30%] -right-[10%] w-[70vw] h-[70vw] rounded-full border-[100px] border-white/40 shadow-xl shadow-blue-900/5 mix-blend-overlay"></div>
                <div className="absolute -bottom-[40%] -left-[10%] w-[60vw] h-[60vw] rounded-full border-[80px] border-white/30 shadow-lg shadow-blue-900/5 mix-blend-overlay"></div>
                
                {/* Additional floating ring for depth */}
                <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full border-[40px] border-white/20 mix-blend-overlay"></div>
            </div>

            {/* Language Selector (Floating) - Light Theme */}
            <div className="absolute top-6 right-6 lg:top-8 lg:right-10 z-30 flex items-center gap-2 text-sm text-slate-600 font-semibold bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full cursor-pointer hover:bg-white hover:text-[#005a9c] transition-all shadow-sm border border-slate-200/50">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Bahasa Indonesia</span>
                <span className="sm:hidden">ID</span>
                <ChevronDown className="w-4 h-4" />
            </div>

            {/* Main Floating Container (Restored Dual-Card Layout) - Light glass */}
            <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[1100px] rounded-[2rem] overflow-hidden shadow-[0_20px_80px_-15px_rgba(0,30,80,0.15)] bg-white/50 backdrop-blur-xl border border-white/80 ring-1 ring-black/[0.03]">
                
                {/* LEFT PANEL - Info Area */}
                <div className="hidden md:flex flex-col justify-center w-1/2 p-12 lg:p-16">
                    <div className="max-w-[480px]">
                        
                        {/* Main Title with Premium Gradient */}
                        <h1 className="text-4xl lg:text-[3.25rem] font-black text-[#0a1b3f] mb-7 leading-[1.1] tracking-tight">
                            Integrated Solutions,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005a9c] via-[#007cc7] to-[#00b3a6] drop-shadow-sm">
                                Stronger Business.
                            </span>
                        </h1>
                        
                        {/* Stylized Description with Left Border */}
                        <div className="pl-6 border-l-[3px] border-[#005a9c]/20">
                            <p className="text-lg lg:text-[1.1rem] text-[#1e345e]/90 leading-relaxed font-medium">
                                Syncore is your integrated business platform to manage, monitor, and grow together in one <span className="font-bold text-[#005a9c]">seamless ecosystem.</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - Login Box */}
                <div className="w-full md:w-1/2 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.03)]">
                    
                    <div className="w-full max-w-[380px] mx-auto">
                        
                        {/* LOGO MOVED HERE: Because this panel is white, the logo's white background is perfectly invisible! */}
                        <div className="flex justify-start mb-10">
                            <Image 
                                src={logoImage} 
                                alt="SYNCORE" 
                                width={240}
                                height={70}
                                className="object-contain" 
                                priority
                            />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-[28px] font-bold text-slate-900 mb-1.5 tracking-tight">Selamat Datang</h2>
                            <p className="text-sm text-slate-500 font-medium">Silakan masuk ke akun Anda untuk melanjutkan.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                    <div className="p-1 bg-red-100 rounded-full shrink-0 mt-0.5">
                                        <ShieldAlert className="w-3 h-3 text-red-600" />
                                    </div>
                                    <p>{error}</p>
                                </div>
                            )}
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block ml-1">Email / Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#005a9c] transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="Masukkan username Anda"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#005a9c]/10 focus:border-[#005a9c] focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 block ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#005a9c] transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#005a9c]/10 focus:border-[#005a9c] focus:bg-white transition-all shadow-sm font-medium tracking-widest"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#005a9c] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-[#005a9c] checked:border-[#005a9c] transition-all cursor-pointer focus:ring-4 focus:ring-[#005a9c]/20 focus:outline-none"
                                        />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Ingat saya</span>
                                </label>
                                <a href="#" className="text-sm font-semibold text-[#005a9c] hover:text-[#003d6b] transition-colors">
                                    Lupa password?
                                </a>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full py-6 mt-4 text-base font-bold bg-[#005a9c] hover:bg-[#003d6b] text-white rounded-xl shadow-lg shadow-[#005a9c]/25 hover:-translate-y-0.5 transition-all duration-300"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Footer Copyright at bottom center */}
            <div className="absolute bottom-6 w-full text-center pointer-events-none z-10">
                <p className="text-sm text-slate-400 font-medium drop-shadow-sm">
                    © 2025 SYNCORE Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
}
