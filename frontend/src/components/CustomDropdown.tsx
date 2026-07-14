'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: string[] | number[];
    className?: string;
    icon?: React.ReactNode;
}

export default function CustomDropdown({ 
    value, 
    onChange, 
    options,
    className,
    icon
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn("flex items-center justify-between w-full min-w-[120px] px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-slate-50 shadow-sm", className)}
            >
                <div className="flex items-center gap-2">
                    {icon || <CalendarDays className="w-4 h-4 text-slate-400" />}
                    <span>{value}</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg shadow-blue-900/5 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => {
                                onChange(opt.toString());
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full text-left px-3 py-2.5 text-sm font-medium transition-colors hover:bg-blue-50",
                                value === opt.toString() 
                                    ? "bg-blue-50/50 text-blue-700 font-bold" 
                                    : "text-slate-600"
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
