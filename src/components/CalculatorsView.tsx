import React, { useState } from 'react';
import { Calculator, ArrowRight, Activity, Percent, Ruler, CheckCircle2, FileBarChart, TestTube2, Thermometer, Gauge, Layers, ListChecks, Lock, Home, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AsdasCrpCalculator from './calculators/AsdasCrpCalculator';
import BasdaiCalculator from './calculators/BasdaiCalculator';
import BasfiCalculator from './calculators/BasfiCalculator';
import CdaiCalculator from './calculators/CdaiCalculator';
import SdaiCalculator from './calculators/SdaiCalculator';
import DapsaCalculator from './calculators/DapsaCalculator';
import Das28Calculator from './calculators/Das28Calculator';
import EssdaiCalculator from './calculators/EssdaiCalculator';
import SledaiCalculator from './calculators/SledaiCalculator';

export default function CalculatorsView({ onBack }: { onBack: () => void }) {
    const { isAuthenticated } = useAuth();
    const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);

    const calculators = [
        {
            id: 'asdas-crp',
            title: 'ASDAS-CRP',
            description: 'Ankylosing Spondylitis Disease Activity Score (CRP tabanlı).',
            icon: Calculator,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'group-hover:border-blue-200'
        },
        {
            id: 'basdai',
            title: 'BASDAI',
            description: 'Bath Ankylosing Spondylitis Disease Activity Index.',
            icon: Activity,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'group-hover:border-rose-200'
        },
        {
            id: 'basfi',
            title: 'BASFI',
            description: 'Bath Ankylosing Spondylitis Functional Index (Fonksiyonel İndeks).',
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'group-hover:border-emerald-200'
        },
        {
            id: 'cdai',
            title: 'CDAI',
            description: 'Clinical Disease Activity Index for Rheumatoid Arthritis.',
            icon: FileBarChart,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'group-hover:border-indigo-200'
        },
        {
            id: 'sdai',
            title: 'SDAI',
            description: 'Simple Disease Activity Index (CRP dahil) for RA.',
            icon: TestTube2,
            color: 'text-violet-600',
            bgColor: 'bg-violet-50',
            borderColor: 'group-hover:border-violet-200'
        },
        {
            id: 'dapsa',
            title: 'DAPSA',
            description: 'Disease Activity in Psoriatic Arthritis (PsA).',
            icon: Thermometer,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
            borderColor: 'group-hover:border-cyan-200'
        },
        {
            id: 'das28',
            title: 'DAS28',
            description: 'Disease Activity Score 28 (ESR ve CRP seçeneği).',
            icon: Gauge,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'group-hover:border-purple-200'
        },
        {
            id: 'essdai',
            title: 'ESSDAI',
            description: "EULAR Sjögren's Syndrome Disease Activity Index.",
            icon: Layers,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'group-hover:border-pink-200'
        },
        {
            id: 'sledai',
            title: 'SLEDAI',
            description: 'Systemic Lupus Erythematosus Disease Activity Index.',
            icon: ListChecks,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'group-hover:border-red-200'
        }
    ];

    if (!isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-slate-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="w-20 h-20 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Hesaplamalar İçin Giriş Yapmalısınız
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 max-w-lg mx-auto mb-8 text-lg">
                        Klinik ölçekleri kullanmak, skorlamak ve sonuçları kaydetmek için lütfen üye girişi yapınız.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 transform hover:-translate-y-1"
                    >
                        Giriş Yap
                        <ArrowRight size={20} />
                    </Link>

                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-20 translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
                </div>

                {/* Blurry Preview of Calculators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 opacity-40 pointer-events-none filter blur-sm">
                    {calculators.slice(0, 3).map((calc) => (
                        <div key={calc.id} className="bg-white p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
                            <div className={`w-12 h-12 ${calc.bgColor} dark:bg-slate-800 ${calc.color} rounded-xl flex items-center justify-center mb-4`}>
                                <calc.icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{calc.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{calc.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <button
                    onClick={() => onBack()}
                    className="hover:text-blue-600 transition-colors"
                >
                    <Home size={12} />
                </button>
                <ChevronRight size={10} className="shrink-0 opacity-30" />
                <button
                    onClick={() => setSelectedCalculator(null)}
                    className={`hover:text-blue-600 transition-colors ${!selectedCalculator ? 'text-blue-600 pointer-events-none' : ''}`}
                >
                    Ölçekler
                </button>
                {selectedCalculator && (
                    <>
                        <ChevronRight size={10} className="shrink-0 opacity-30" />
                        <span className="text-blue-600">
                            {calculators.find(c => c.id === selectedCalculator)?.title}
                        </span>
                    </>
                )}
            </nav>

            {!selectedCalculator ? (
                <>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ölçekler ve Hesaplayıcılar</h1>
                        <p className="text-gray-500 dark:text-slate-400 text-lg">Klinik pratiğinizde kullanabileceğiniz medikal hesaplama araçları.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {calculators.map((calc) => (
                            <button
                                key={calc.id}
                                onClick={() => setSelectedCalculator(calc.id)}
                                className={`group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left relative overflow-hidden`}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${calc.bgColor} dark:bg-slate-800 ${calc.color} shadow-sm group-hover:scale-110 duration-300`}>
                                    <calc.icon size={28} />
                                </div>

                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300">
                                    <ArrowRight className="text-gray-300 group-hover:text-blue-500" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {calc.title}
                                </h3>
                                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                    {calc.description}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    HEMEN HESAPLA <ArrowRight size={12} />
                                </div>

                                {/* Background Decoration */}
                                <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-700 ${calc.bgColor.replace('bg-', 'bg-')}`} />
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {selectedCalculator === 'asdas-crp' && <AsdasCrpCalculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'basdai' && <BasdaiCalculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'basfi' && <BasfiCalculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'cdai' && <CdaiCalculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'sdai' && <SdaiCalculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'dapsa' && <DapsaCalculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'das28' && <Das28Calculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'essdai' && <EssdaiCalculator onBack={() => setSelectedCalculator(null)} />}
                    {selectedCalculator === 'sledai' && <SledaiCalculator onBack={() => setSelectedCalculator(null)} />}
                </div>
            )}

            {/* Empty State / Coming Soon */}
            <div className="mt-12 p-8 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-slate-600 shadow-sm">
                    <Calculator size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-400 dark:text-slate-500 mb-2">Daha Fazlası Yakında...</h3>
                <p className="text-gray-400 dark:text-slate-500 text-sm max-w-md mx-auto">
                    Kütüphanemize düzenli olarak yeni ölçekler ve hesaplayıcılar eklenmektedir. İstediğiniz bir ölçek varsa bizimle iletişime geçebilirsiniz.
                </p>
            </div>
        </div>
    );
}
