import React, { useState } from 'react';
import { ChevronLeft, Calculator, AlertCircle, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';

interface BasfiData {
    q1: number; // Çorap giymek
    q2: number; // Kalemi yerden almak
    q3: number; // Yüksek raf
    q4: number; // Koltuğa kalkmak
    q5: number; // Yerden kalkmak
    q6: number; // 10 dk ayakta durmak
    q7: number; // Merdiven çıkmak
    q8: number; // Omuzların üzerinden bakmak
    q9: number; // Fiziksel aktiviteler
    q10: number; // Tüm günü tamamlama
}

interface CalculationResult {
    score: number;
    activityLevel: string;
    colorClass: string;
}

export default function BasfiCalculator({ onBack }: { onBack: () => void }) {
    // Initial state with all 10 questions set to 0
    const [data, setData] = useState<BasfiData>({
        q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
        q6: 0, q7: 0, q8: 0, q9: 0, q10: 0
    });

    const [result, setResult] = useState<CalculationResult | null>(null);

    const calculateBASFI = () => {
        // Formula: Sum of all 10 items divided by 10
        const values = Object.values(data);
        const sum = values.reduce((acc, curr) => acc + curr, 0);
        const score = sum / 10;

        let activityLevel = '';
        let colorClass = '';

        // Interpretation logic for BASFI
        if (score < 4) {
            activityLevel = 'Düşük Fonksiyonel Kısıtlılık';
            colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        } else if (score < 7) {
            activityLevel = 'Orta Düzey Fonksiyonel Kısıtlılık';
            colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
            activityLevel = 'Yüksek Fonksiyonel Kısıtlılık';
            colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
        }

        setResult({
            score: parseFloat(score.toFixed(2)),
            activityLevel,
            colorClass
        });
    };

    const handleReset = () => {
        setData({
            q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
            q6: 0, q7: 0, q8: 0, q9: 0, q10: 0
        });
        setResult(null);
    };

    const RangeInput = ({
        label,
        value,
        onChange,
        index
    }: {
        label: string,
        value: number,
        onChange: (val: number) => void,
        index: number
    }) => (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-xs font-bold rounded-full">
                        {index}
                    </span>
                    <label className="text-sm font-medium text-gray-800 dark:text-slate-200 leading-tight block pt-0.5">{label}</label>
                </div>
                <div className="w-10 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-md text-sm shrink-0">
                    {value}
                </div>
            </div>
            <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 mt-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 px-1 mt-1">
                <span>Kolay</span>
                <span>Zor</span>
                <span>İmkansız</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-600 dark:text-emerald-500" size={24} />
                            BASFI Hesaplayıcı
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 hidden sm:block">Bath Ankylosing Spondylitis Functional Index</p>
                    </div>
                </div>

                {/* Result Mini-Summary if calculated */}
                {result && (
                    <div className={`hidden sm:block px-6 py-2 rounded-full border text-sm font-bold animate-in fade-in ${result.colorClass.replace('bg-', 'bg-opacity-20 ')}`}>
                        Skor: {result.score} — {result.activityLevel}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Inputs: 10 Questions (3 columns on large screens) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <RangeInput
                            index={1}
                            label="Destek almadan veya yardımcı cihaz kullanmadan çoraplarınızı giymek?"
                            value={data.q1}
                            onChange={(val) => setData({ ...data, q1: val })}
                        />
                        <RangeInput
                            index={2}
                            label="Belinizi bükerek yerden kalemi almak?"
                            value={data.q2}
                            onChange={(val) => setData({ ...data, q2: val })}
                        />
                        <RangeInput
                            index={3}
                            label="Destek almadan yüksek bir rafa uzanmak?"
                            value={data.q3}
                            onChange={(val) => setData({ ...data, q3: val })}
                        />
                        <RangeInput
                            index={4}
                            label="Destek almadan (kolları kullanmadan) sandalyeden kalkmak?"
                            value={data.q4}
                            onChange={(val) => setData({ ...data, q4: val })}
                        />
                        <RangeInput
                            index={5}
                            label="Sırtüstü yatarken yerden ayağa kalkmak?"
                            value={data.q5}
                            onChange={(val) => setData({ ...data, q5: val })}
                        />
                        <RangeInput
                            index={6}
                            label="Desteksiz 10 dakika ayakta durmak?"
                            value={data.q6}
                            onChange={(val) => setData({ ...data, q6: val })}
                        />
                        <RangeInput
                            index={7}
                            label="Tutunmadan veya destek almadan merdiven çıkmak?"
                            value={data.q7}
                            onChange={(val) => setData({ ...data, q7: val })}
                        />
                        <RangeInput
                            index={8}
                            label="Vücudunuzu döndürmeden omzunuzun üzerinden arkaya bakmak?"
                            value={data.q8}
                            onChange={(val) => setData({ ...data, q8: val })}
                        />
                        <RangeInput
                            index={9}
                            label="Fiziksel güç gerektiren aktiviteleri yapmak (örn: fizyoterapi egzersizleri, bahçe işleri)?"
                            value={data.q9}
                            onChange={(val) => setData({ ...data, q9: val })}
                        />
                        <RangeInput
                            index={10}
                            label="Evde veya işte tüm gün boyunca aktif kalmak?"
                            value={data.q10}
                            onChange={(val) => setData({ ...data, q10: val })}
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-end gap-3 sticky bottom-4 z-10 lg:static">
                        <button
                            onClick={handleReset}
                            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw size={18} />
                            Sıfırla
                        </button>
                        <button
                            onClick={calculateBASFI}
                            className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-w-[160px]"
                        >
                            <Calculator size={20} />
                            HESAPLA
                        </button>
                    </div>
                </div>

                {/* Right Side: Info & Result */}
                <div className="space-y-6">
                    {/* Sticky Result Card */}
                    {result ? (
                        <div className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-xl sticky top-4 ${result.colorClass}`}>
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-2">HESAPLANAN BASFI</span>
                            <div className="text-7xl font-black mb-3 tracking-tighter">
                                {result.score}
                            </div>
                            <div className="text-lg font-bold px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm w-full leading-tight">
                                {result.activityLevel}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-600 h-64 sticky top-4">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <p className="font-medium">Sonuç burada görünecek</p>
                            <p className="text-xs mt-2 max-w-[200px]">10 soruyu yanıtladıktan sonra hesapla butonuna basınız.</p>
                        </div>
                    )}

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                        <h3 className="font-bold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300 text-sm">
                            <AlertCircle size={16} />
                            BASFI Hakkında
                        </h3>
                        <p className="mb-3 opacity-80">BASFI (Bath Ankylosing Spondylitis Functional Index), hastaların günlük aktivitelerini ne kadar zorlukla yapabildiklerini ölçer.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
