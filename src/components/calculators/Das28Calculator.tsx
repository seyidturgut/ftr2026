import React, { useState } from 'react';
import { ChevronLeft, Calculator, AlertCircle, RefreshCw, Activity, TestTube, ArrowRightLeft } from 'lucide-react';


interface Das28Data {
    tjc: number; // Tender Joint Count (0-28)
    sjc: number; // Swollen Joint Count (0-28)
    patientGlobal: number; // Patient Global Health (VAS 0-100 mm)
    esr: string; // Erythrocyte Sedimentation Rate (mm/h)
    crp: string; // C-Reactive Protein (mg/L)
}

interface CalculationResult {
    score: number;
    activityLevel: string;
    colorClass: string;
}

type Mode = 'ESR' | 'CRP';

export default function Das28Calculator({ onBack }: { onBack: () => void }) {
    const [mode, setMode] = useState<Mode>('ESR');
    const [data, setData] = useState<Das28Data>({
        tjc: 0,
        sjc: 0,
        patientGlobal: 0,
        esr: '',
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

    const calculateDAS28 = () => {
        const { tjc, sjc, patientGlobal } = data;
        let score = 0;
        const newErrors: { [key: string]: boolean } = {};
        let hasError = false;

        if (mode === 'ESR') {
            const esrValue = parseFloat(data.esr);
            if (isNaN(esrValue) || esrValue < 0) {
                newErrors.lab = true;
                triggerErrorAnimation('lab');
                hasError = true;
            } else {
                // Formula: 0.56 * sqrt(TJC) + 0.28 * sqrt(SJC) + 0.70 * ln(ESR) + 0.014 * GH
                score = (0.56 * Math.sqrt(tjc)) +
                    (0.28 * Math.sqrt(sjc)) +
                    (0.70 * Math.log(esrValue)) +
                    (0.014 * patientGlobal);
            }
        } else {
            const crpValue = parseFloat(data.crp);
            if (isNaN(crpValue) || crpValue < 0) {
                newErrors.lab = true;
                triggerErrorAnimation('lab');
                hasError = true;
            } else {
                // Formula: 0.56 * sqrt(TJC) + 0.28 * sqrt(SJC) + 0.36 * ln(CRP + 1) + 0.014 * GH + 0.96
                score = (0.56 * Math.sqrt(tjc)) +
                    (0.28 * Math.sqrt(sjc)) +
                    (0.36 * Math.log(crpValue + 1)) +
                    (0.014 * patientGlobal) +
                    0.96;
            }
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        let activityLevel = '';
        let colorClass = '';

        // Classification
        // Remission: < 2.6
        // Low: 2.6 - 3.2
        // Moderate: 3.2 - 5.1
        // High: > 5.1
        if (score < 2.6) {
            activityLevel = 'Remisyon';
            colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        } else if (score <= 3.2) {
            activityLevel = 'Düşük Hastalık Aktivitesi';
            colorClass = 'text-blue-600 bg-blue-50 border-blue-200';
        } else if (score <= 5.1) {
            activityLevel = 'Orta Hastalık Aktivitesi';
            colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
            activityLevel = 'Yüksek Hastalık Aktivitesi';
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
            tjc: 0,
            sjc: 0,
            patientGlobal: 0,
            esr: '',
            crp: ''
        });
        setResult(null);
        setErrors({});
    };

    const RangeInput = ({
        label,
        value,
        onChange,
        max = 10,
        description
    }: {
        label: string,
        value: number,
        onChange: (val: number) => void,
        max?: number,
        description?: string
    }) => (
        <div className="space-y-3 bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 gap-2">
                <div>
                    <label className="text-sm font-bold text-gray-800 dark:text-slate-200 leading-tight block">{label}</label>
                    {description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-snug">{description}</p>}
                </div>
                <div className="w-12 h-9 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-lg text-lg shrink-0">
                    {value}
                </div>
            </div>
            <input
                type="range"
                min="0"
                max={max}
                step="1"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 mt-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-slate-500 px-1 mt-1 font-medium">
                <span>0</span>
                <span>{Math.round(max / 2)}</span>
                <span>{max}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b border-gray-200 dark:border-slate-800 pb-5 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="text-indigo-600 dark:text-indigo-400" size={24} />
                            DAS28 Hesaplayıcı
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Disease Activity Score 28</p>
                    </div>
                </div>

                {/* Mode Switcher */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => { setMode('ESR'); setErrors({}); setAnimateError({}); setResult(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'ESR'
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                            : 'text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'}`}
                    >
                        DAS28 - ESR
                    </button>
                    <button
                        onClick={() => { setMode('CRP'); setErrors({}); setAnimateError({}); setResult(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'CRP'
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
                            : 'text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'}`}
                    >
                        DAS28 - CRP
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Inputs */}
                <div className="lg:col-span-2 space-y-6">

                    {/* The original mode toggle was here, now it's in the header */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <RangeInput
                            label="Hassas Eklem Sayısı (TJC)"
                            description="Tender Joint Count (0-28)"
                            value={data.tjc}
                            max={28}
                            onChange={(val) => setData({ ...data, tjc: val })}
                        />

                        <RangeInput
                            label="Şiş Eklem Sayısı (SJC)"
                            description="Swollen Joint Count (0-28)"
                            value={data.sjc}
                            max={28}
                            onChange={(val) => setData({ ...data, sjc: val })}
                        />

                        <RangeInput
                            label="Hasta Global Değerlendirmesi"
                            description="Patient Global Assessment (0-100)"
                            value={data.patientGlobal}
                            max={100}
                            onChange={(val) => setData({ ...data, patientGlobal: val })}
                        />

                        {/* Lab Input Card */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between">
                            <div>
                                <label className={`text-sm font-bold leading-tight block flex items-center gap-2 mb-2 ${errors.lab ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-slate-200'}`}>
                                    <TestTube size={16} className={errors.lab ? 'text-red-600' : 'text-indigo-600 dark:text-indigo-400'} />
                                    {mode === 'ESR' ? 'ESR Değeri (mm/saat)' : 'CRP Değeri (mg/L)'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step={mode === 'ESR' ? '1' : '0.01'}
                                    placeholder={mode === 'ESR' ? "Örn: 25" : "Örn: 5.2"}
                                    value={mode === 'ESR' ? data.esr : data.crp}
                                    onChange={(e) => {
                                        if (mode === 'ESR') setData({ ...data, esr: e.target.value });
                                        else setData({ ...data, crp: e.target.value });
                                        if (errors.lab) setErrors({ ...errors, lab: false });
                                    }}
                                    className={`
                                        w-full px-4 py-3 rounded-lg border outline-none transition-all font-medium text-gray-900 dark:text-white
                                        ${errors.lab
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10 focus:ring-4 focus:ring-red-500/20 focus:border-red-600'
                                            : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400'}
                                        ${animateError.lab ? 'scale-105 shadow-lg shadow-red-200' : ''}
                                    `}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">
                                {mode === 'ESR' ? 'Eritrosit Sedimentasyon Hızı' : 'C-Reaktif Protein (mg/L dikkat ediniz)'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-end gap-3 sticky bottom-4 z-10 lg:static">
                        <button
                            onClick={handleReset}
                            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all flex-1 sm:flex-none"
                        >
                            <RefreshCw size={18} />
                            Sıfırla
                        </button>
                        <button
                            onClick={calculateDAS28}
                            className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex-1 sm:flex-none min-w-[160px]"
                        >
                            <Calculator size={20} />
                            HESAPLA
                        </button>
                    </div>
                </div>

                {/* Right Side: Info & Result */}
                <div className="space-y-6 sticky top-6 h-fit">
                    {/* Sticky Result Card */}
                    {result ? (
                        <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-xl ${result.colorClass}`}>
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-2">HESAPLANAN DAS28</span>
                            <div className="text-7xl font-black mb-3 tracking-tighter">
                                {result.score}
                            </div>
                            <div className="text-lg font-bold px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm w-full leading-tight">
                                {result.activityLevel}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-600 h-64">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <p className="font-medium text-lg">Sonuç Bekleniyor</p>
                            <p className="text-sm mt-2 max-w-[200px]">Değerleri girdikten sonra hesapla butonuna basınız.</p>
                        </div>
                    )}

                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                        <h3 className="font-bold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300">
                            <AlertCircle size={18} />
                            Referans Değerler
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-slate-900/50 rounded-lg">
                                <span>&lt; 2.6</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">Remisyon</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-slate-900/50 rounded-lg">
                                <span>2.6 - 3.2</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">Düşük Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-slate-900/50 rounded-lg">
                                <span>3.2 - 5.1</span>
                                <span className="font-bold text-orange-600 dark:text-orange-400 text-xs">Orta Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 dark:bg-slate-900/50 rounded-lg">
                                <span>&gt; 5.1</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">Yüksek Aktivite</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
