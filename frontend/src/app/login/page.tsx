'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, ChevronDown, User, Lock, Eye, EyeOff } from 'lucide-react';

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
        <div className="flex h-screen w-full font-sans overflow-hidden items-center relative bg-slate-50 antialiased">
            
            {/* Background Image using static import for guaranteed loading */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src={bgImage}
                    alt="Background Syncore"
                    fill
                    priority
                    quality={100}
                    unoptimized={true}
                    className="object-cover object-center"
                />
            </div>

            {/* Language Selector */}
            <div className="absolute top-8 right-8 z-20 flex items-center gap-2 text-sm text-slate-700 font-medium bg-white px-5 py-2.5 rounded-full cursor-pointer hover:bg-slate-50 transition-colors shadow-sm border border-slate-200">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>Bahasa Indonesia</span>
                <ChevronDown className="w-4 h-4 text-teal-600" />
            </div>

            {/* Login Container (Moved to the Right) */}
            <div className="relative z-10 w-full max-w-[420px] mx-4 md:ml-auto md:mr-[8%] lg:mr-[12%]">
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,143,153,0.2)] border border-slate-100">
                    
                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="bg-white p-2 border border-slate-100 rounded-xl">
                                <Image 
                                    src={logoImage} 
                                    alt="SYNCORE" 
                                    width={160}
                                    height={50}
                                    className="object-contain" 
                                    priority
                                />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Selamat Datang</h1>
                            <p className="text-sm text-slate-500">Silakan masuk ke akun Anda</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center">
                                    {error}
                                </div>
                            )}
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 block ml-1 mb-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type="email" 
                                        placeholder="Masukkan username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 block ml-1 mb-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                                    />
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Ingat saya</span>
                                </label>
                                <a href="#" className="text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors">
                                    Lupa password?
                                </a>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full py-6 mt-2 text-base font-medium bg-gradient-to-r from-[#008f99] to-[#0052cc] hover:from-[#007a82] hover:to-[#0042a3] text-white rounded-xl shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-300"
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

                {/* Footer Copyright */}
                <div className="absolute -bottom-12 w-full text-center">
                    <p className="text-xs font-medium text-slate-500 bg-white py-1.5 px-4 rounded-full inline-block border border-slate-200 shadow-sm">
                        © 2025 SYNCORE. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
