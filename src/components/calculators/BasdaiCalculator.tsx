import React, { useState } from 'react';
import { ChevronLeft, Calculator, AlertCircle, RefreshCw, Activity } from 'lucide-react';

interface BasdaiData {
    fatigue: number; // Q1: Halsizlik/yorgunluk
    neckBackPain: number; // Q2: Boyun, sırt, bel ağrısı
    otherJointPain: number; // Q3: Diğer eklem ağrıları
    tenderness: number; // Q4: Dokunma/basınç ile hassasiyet
    morningStiffnessSeverity: number; // Q5: Sabah tutukluğu şiddeti
    morningStiffnessDuration: number; // Q6: Sabah tutukluğu süresi
}

interface CalculationResult {
    score: number;
    activityLevel: string;
    colorClass: string;
}

export default function BasdaiCalculator({ onBack }: { onBack: () => void }) {
    const [data, setData] = useState<BasdaiData>({
        fatigue: 0,
        neckBackPain: 0,
        otherJointPain: 0,
        tenderness: 0,
        morningStiffnessSeverity: 0,
        morningStiffnessDuration: 0
    });

    const [result, setResult] = useState<CalculationResult | null>(null);

    const calculateBASDAI = () => {
        // Formula: BASDAI = ((Q1 + Q2 + Q3 + Q4) + ((Q5 + Q6) / 2)) / 5
        const {
            fatigue,
            neckBackPain,
            otherJointPain,
            tenderness,
            morningStiffnessSeverity,
            morningStiffnessDuration
        } = data;

        const stiffnessAverage = (morningStiffnessSeverity + morningStiffnessDuration) / 2;
        const sum = fatigue + neckBackPain + otherJointPain + tenderness + stiffnessAverage;
        const score = sum / 5;

        let activityLevel = '';
        let colorClass = '';

        if (score >= 4) {
            activityLevel = 'Yüksek Hastalık Aktivitesi';
            colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
        } else {
            activityLevel = 'Düşük Hastalık Aktivitesi';
            colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        }

        setResult({
            score: parseFloat(score.toFixed(2)),
            activityLevel,
            colorClass
        });
    };

    const handleReset = () => {
        setData({
            fatigue: 0,
            neckBackPain: 0,
            otherJointPain: 0,
            tenderness: 0,
            morningStiffnessSeverity: 0,
            morningStiffnessDuration: 0
        });
        setResult(null);
    };

    const RangeInput = ({
        label,
        value,
        onChange,
        description
    }: {
        label: string,
        value: number,
        onChange: (val: number) => void,
        description?: string
    }) => (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-1 gap-2">
                <div>
                    <label className="text-sm font-bold text-gray-800 leading-tight block">{label}</label>
                    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                </div>
                <div className="w-10 h-8 flex items-center justify-center bg-blue-50 text-blue-700 font-bold rounded-md text-sm shrink-0">
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-1 mt-1">
                <span>0 (Yok)</span>
                <span>5 (Orta)</span>
                <span>10 (Çok Şiddetli)</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-rose-600" size={24} />
                            BASDAI Hesaplayıcı
                        </h1>
                        <p className="text-sm text-gray-500 hidden sm:block">Bath Ankylosing Spondylitis Disease Activity Index</p>
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
                            label="Q1: Halsizlik / Yorgunluk"
                            description="Genel yorgunluk ve halsizlik düzeyiniz?"
                            value={data.fatigue}
                            onChange={(val) => setData({ ...data, fatigue: val })}
                        />

                        <RangeInput
                            label="Q2: Boyun, Sırt veya Kalça Ağrısı"
                            description="Omurga kaynaklı (boyun, sırt, bel) ağrı düzeyiniz?"
                            value={data.neckBackPain}
                            onChange={(val) => setData({ ...data, neckBackPain: val })}
                        />

                        <RangeInput
                            label="Q3: Diğer Eklem Ağrıları"
                            description="Eller, ayaklar, dizler gibi diğer eklemlerdeki ağrı/şişlik?"
                            value={data.otherJointPain}
                            onChange={(val) => setData({ ...data, otherJointPain: val })}
                        />

                        <RangeInput
                            label="Q4: Dokunma ile Hassasiyet"
                            description="Vücudunuzun herhangi bir yerine dokunulduğunda veya bastırıldığında oluşan rahatsızlık?"
                            value={data.tenderness}
                            onChange={(val) => setData({ ...data, tenderness: val })}
                        />

                        <RangeInput
                            label="Q5: Sabah Tutukluğu Şiddeti"
                            description="Sabah uyandığınızda hissettiğiniz tutukluğun şiddeti?"
                            value={data.morningStiffnessSeverity}
                            onChange={(val) => setData({ ...data, morningStiffnessSeverity: val })}
                        />

                        <RangeInput
                            label="Q6: Sabah Tutukluğu Süresi"
                            description="Sabah tutukluğu ne kadar sürüyor?"
                            value={data.morningStiffnessDuration}
                            onChange={(val) => setData({ ...data, morningStiffnessDuration: val })}
                        />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-end gap-3 sticky bottom-4 z-10 lg:static">
                        <button
                            onClick={handleReset}
                            className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw size={18} />
                            Sıfırla
                        </button>
                        <button
                            onClick={calculateBASDAI}
                            className="px-8 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-w-[160px]"
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
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-2">HESAPLANAN BASDAI</span>
                            <div className="text-7xl font-black mb-3 tracking-tighter">
                                {result.score}
                            </div>
                            <div className="text-lg font-bold px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm w-full">
                                {result.activityLevel}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center text-gray-400 h-64 sticky top-4">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <p className="font-medium">Sonuç burada görünecek</p>
                            <p className="text-xs mt-2 max-w-[200px]">Tüm değerleri girdikten sonra hesapla butonuna basınız.</p>
                        </div>
                    )}

                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                        <h3 className="font-bold flex items-center gap-2 mb-2 text-blue-700 text-sm">
                            <AlertCircle size={16} />
                            Referans Değerler
                        </h3>
                        <p className="mb-3 opacity-80">BASDAI (Bath Ankylosing Spondylitis Disease Activity Index), ankilozan spondilitli hastalarda hastalık aktivitesini ölçmek için kullanılan altın standarttır.</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                                <span>&lt; 4</span>
                                <span className="font-bold text-emerald-600">Düşük Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                                <span>&ge; 4</span>
                                <span className="font-bold text-rose-600">Yüksek Aktivite</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
