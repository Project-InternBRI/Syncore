'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, ChevronDown, User, Lock, Eye, EyeOff } from 'lucide-react';

// Explicitly importing images to ensure Next.js bundles them correctly
import bgImage from '../../../public/background_loginpage_syncore.png';
import logoImage from '../../../public/logo_syncore.png';

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
        <div className="flex h-screen w-full bg-white font-sans overflow-hidden">
            
            {/* Left Side - Background Image & Logo (Full Height) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#06163A]">
                <Image 
                    src={bgImage}
                    alt="Background"
                    fill
                    priority
                    className="object-cover object-[15%_center]"
                />
                
                {/* Logo Overlay */}
                <div className="absolute top-12 left-12 z-10">
                    <Image 
                        src={logoImage} 
                        alt="SYNCORE" 
                        width={180}
                        height={60}
                        className="object-contain invert hue-rotate-180 mix-blend-screen opacity-90" 
                        priority
                    />
                </div>
            </div>

            {/* Right Side - Form (Full Height) */}
            <div className="w-full lg:w-1/2 flex flex-col relative h-full bg-white">
                
                {/* Language Selector */}
                <div className="absolute top-8 right-8 flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer hover:text-slate-900 transition-colors">
                    <Globe className="w-4 h-4" />
                    <span>Bahasa Indonesia</span>
                    <ChevronDown className="w-4 h-4" />
                </div>

                <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 max-w-2xl mx-auto w-full">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-[#1a233a] mb-2 tracking-tight">Selamat Datang</h1>
                        <p className="text-slate-500">Silakan masuk untuk melanjutkan</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block text-left">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <input 
                                    type="email" 
                                    placeholder="Masukkan username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 block text-left">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                                />
                                <span className="text-sm font-medium text-slate-600">Ingat saya</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                Lupa password?
                            </a>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full py-6 mt-4 text-base font-semibold bg-gradient-to-r from-[#0052cc] to-[#00b3b3] hover:opacity-90 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all"
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

                        <div className="relative flex items-center justify-center pt-6">
                            <div className="absolute inset-x-0 h-px bg-slate-200"></div>
                            <span className="relative bg-white px-4 text-xs font-medium text-slate-400 tracking-wider">atau</span>
                        </div>
                    </form>
                </div>
                
                {/* Footer Copyright */}
                <div className="absolute bottom-6 w-full text-center">
                    <p className="text-sm font-medium text-slate-400">
                        © 2025 SYNCORE. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
