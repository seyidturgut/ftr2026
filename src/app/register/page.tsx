'use client';

import React from 'react';
import Link from 'next/link';
import { Construction, ArrowLeft, Heart } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-white p-6 md:p-12">
            <div className="max-w-2xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Visual Header */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full scale-150"></div>
                    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center text-blue-600 mx-auto transform hover:rotate-6 transition-transform cursor-pointer">
                        <Construction size={48} className="md:size-16" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Kayıt Sayfası Yapım Aşamasında</h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-lg mx-auto">
                        Size daha iyi bir deneyim sunabilmek için kayıt sistemimizi güncelliyoruz. Çok yakında buradayız!
                    </p>
                </div>

                {/* Counterpart / CTA */}
                <div className="pt-8">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 group px-10 py-5 bg-gray-900 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Giriş Sayfasına Dön
                    </Link>
                </div>

                {/* Footer Brand */}
                <div className="pt-12 flex items-center justify-center gap-2 text-gray-300 font-black text-xs uppercase tracking-[0.3em]">
                    <span>FTR Online</span>
                    <Heart size={12} className="text-blue-500" />
                    <span>Akademi</span>
                </div>
            </div>
        </div>
    );
}
