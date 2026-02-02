import React, { useState } from 'react';
import { ChevronLeft, Calculator, AlertCircle, RefreshCw } from 'lucide-react';


interface AsdasData {
    backPain: number;
    morningStiffness: number;
    patientGlobal: number;
    peripheralPain: number;
    crp: string; // Keep as string for input handling, parse to float for calc
}

interface CalculationResult {
    score: number;
    activityLevel: string;
    colorClass: string;
}

export default function AsdasCrpCalculator({ onBack }: { onBack: () => void }) {
    const [data, setData] = useState<AsdasData>({
        backPain: 0,
        morningStiffness: 0,
        patientGlobal: 0,
        peripheralPain: 0,
        crp: ''
    });

    // Error and Animation States
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
    const [animateError, setAnimateError] = useState<{ [key: string]: boolean }>({});

    const [result, setResult] = useState<CalculationResult | null>(null);

    const triggerErrorAnimation = (field: string) => {
        setAnimateError(prev => ({ ...prev, [field]: true }));
        setTimeout(() => {
            setAnimateError(prev => ({ ...prev, [field]: false }));
        }, 500);
    };

    const calculateASDAS = () => {
        const crpValue = parseFloat(data.crp);
        const newErrors: { [key: string]: boolean } = {};
        let hasError = false;

        if (isNaN(crpValue) || crpValue < 0) {
            newErrors.crp = true;
            triggerErrorAnimation('crp');
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        // Formula: 0.121*Back + 0.058*Stiffness + 0.110*Global + 0.073*Peripheral + 0.579*ln(CRP+1)
        const score = (
            (0.121 * data.backPain) +
            (0.058 * data.morningStiffness) +
            (0.110 * data.patientGlobal) +
            (0.073 * data.peripheralPain) +
            (0.579 * Math.log(crpValue + 1))
        );

        let activityLevel = '';
        let colorClass = '';

        if (score < 1.3) {
            activityLevel = 'İnaktif Hastalık';
            colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        } else if (score < 2.1) {
            activityLevel = 'Düşük Hastalık Aktivitesi';
            colorClass = 'text-blue-600 bg-blue-50 border-blue-200';
        } else if (score < 3.5) {
            activityLevel = 'Yüksek Hastalık Aktivitesi';
            colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
            activityLevel = 'Çok Yüksek Hastalık Aktivitesi';
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
            backPain: 0,
            morningStiffness: 0,
            patientGlobal: 0,
            peripheralPain: 0,
            crp: ''
        });
        setResult(null);
        setErrors({});
    };

    const RangeInput = ({
        label,
        value,
        onChange
    }: {
        label: string,
        value: number,
        onChange: (val: number) => void
    }) => (
        <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-200 leading-tight">{label}</label>
                <div className="w-10 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-md text-sm shrink-0 ml-2">
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
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 px-1 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            <Calculator className="text-blue-600 dark:text-blue-400" size={24} />
                            ASDAS-CRP Hesaplayıcı
                        </h1>
                    </div>
                </div>

                {/* Result Mini-Summary if calculated */}
                {result && (
                    <div className={`px-4 py-2 rounded-full border text-sm font-bold animate-in fade-in ${result.colorClass.replace('bg-', 'bg-opacity-20 ')}`}>
                        Skor: {result.score} — {result.activityLevel}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Side: Inputs (2 Columns) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RangeInput
                            label="Sırt Ağrısı (Back Pain)"
                            value={data.backPain}
                            onChange={(val) => setData({ ...data, backPain: val })}
                        />

                        <RangeInput
                            label="Sabah Tutukluğu (Duration)"
                            value={data.morningStiffness}
                            onChange={(val) => setData({ ...data, morningStiffness: val })}
                        />

                        <RangeInput
                            label="Hasta Global Değerlendirmesi"
                            value={data.patientGlobal}
                            onChange={(val) => setData({ ...data, patientGlobal: val })}
                        />

                        <RangeInput
                            label="Periferik Ağrı / Şişlik"
                            value={data.peripheralPain}
                            onChange={(val) => setData({ ...data, peripheralPain: val })}
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-1/2">
                            <label className={`block text-sm font-medium mb-2 ${errors.crp ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-slate-300'}`}>
                                CRP Değeri (mg/L) {errors.crp && <span className="text-xs text-red-500 ml-1">(Lütfen geçerli değer giriniz)</span>}
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Örn: 5.2"
                                value={data.crp}
                                onChange={(e) => {
                                    setData({ ...data, crp: e.target.value });
                                    if (errors.crp) setErrors({ ...errors, crp: false });
                                }}
                                className={`
                                    w-full px-4 py-3 rounded-lg border outline-none transition-all font-medium text-gray-900 dark:text-white
                                    ${errors.crp
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10 focus:ring-4 focus:ring-red-500/20 focus:border-red-600'
                                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400'}
                                    ${animateError.crp ? 'scale-105 shadow-lg shadow-red-200' : ''}
                                `}
                            />
                        </div>
                        <div className="w-full md:w-1/2 flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                className="px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all flex-1"
                            >
                                <RefreshCw size={18} />
                                Sıfırla
                            </button>
                            <button
                                onClick={calculateASDAS}
                                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex-[2]"
                            >
                                <Calculator size={20} />
                                HESAPLA
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Info & Result */}
                <div className="space-y-6 sticky top-4 h-fit">
                    {/* Sticky Result Card */}
                    {result ? (
                        <div className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-xl ${result.colorClass}`}>
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-2">HESAPLANAN SKOR</span>
                            <div className="text-7xl font-black mb-3 tracking-tighter">
                                {result.score}
                            </div>
                            <div className="text-lg font-bold px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm w-full">
                                {result.activityLevel}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-600 h-64">
                            <Calculator size={48} className="mb-4 opacity-50" />
                            <p className="font-medium">Sonuç burada görünecek</p>
                        </div>
                    )}

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                        <h3 className="font-bold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300 text-sm">
                            <AlertCircle size={16} />
                            Referans Değerler
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                                <span>&lt; 1.3</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">İnaktif</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                                <span>1.3 - 2.1</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">Düşük Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                                <span>2.1 - 3.5</span>
                                <span className="font-bold text-orange-600 dark:text-orange-400">Yüksek Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg">
                                <span>&ge; 3.5</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400">Çok Yüksek</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
