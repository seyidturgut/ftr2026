import React, { useState } from 'react';
import { ChevronLeft, Calculator, AlertCircle, RefreshCw, Activity, Layers, Check } from 'lucide-react';

// Domain definitions with weights and max activity levels
// 0: No activity, 1: Low, 2: Moderate, 3: High (some domains don't have all levels)
const DOMAINS = [
    { id: 'constitutional', name: 'Konstitüsyonel', weight: 3, maxLevel: 2 }, // Ateş, gece terlemesi vb.
    { id: 'lymphadenopathy', name: 'Lenfadenopati', weight: 4, maxLevel: 3 },
    { id: 'glandular', name: 'Glandüler', weight: 2, maxLevel: 2 },
    { id: 'articular', name: 'Artiküler', weight: 2, maxLevel: 3 },
    { id: 'cutaneous', name: 'Kutanöz', weight: 3, maxLevel: 3 },
    { id: 'pulmonary', name: 'Pulmoner', weight: 5, maxLevel: 3 },
    { id: 'renal', name: 'Renal', weight: 5, maxLevel: 3 },
    { id: 'muscular', name: 'Müsküler', weight: 6, maxLevel: 3 },
    { id: 'pns', name: 'PNS (Periferik Sinir)', weight: 5, maxLevel: 3 },
    { id: 'cns', name: 'SNS (Santral Sinir)', weight: 5, maxLevel: 3 },
    { id: 'haematological', name: 'Hematolojik', weight: 2, maxLevel: 3 },
    { id: 'biological', name: 'Biyolojik', weight: 1, maxLevel: 2 },
];

const ACTIVITY_LABELS: Record<number, string> = {
    0: 'Yok (0)',
    1: 'Düşük Aktivite (1)',
    2: 'Orta Aktivite (2)',
    3: 'Yüksek Aktivite (3)'
};

interface CalculationResult {
    score: number;
    activityLevel: string;
    colorClass: string;
}

export default function EssdaiCalculator({ onBack }: { onBack: () => void }) {
    // State to store selected level (0-3) for each domain
    const [selections, setSelections] = useState<Record<string, number>>(
        DOMAINS.reduce((acc, domain) => ({ ...acc, [domain.id]: 0 }), {})
    );

    const [result, setResult] = useState<CalculationResult | null>(null);

    const handleSelectionChange = (domainId: string, level: number) => {
        setSelections(prev => ({
            ...prev,
            [domainId]: level
        }));
    };

    const calculateESSDAI = () => {
        let totalScore = 0;

        DOMAINS.forEach(domain => {
            const level = selections[domain.id] || 0;
            totalScore += level * domain.weight;
        });

        let activityLevel = '';
        let colorClass = '';

        // Classification
        // Low: < 5
        // Moderate: 5 - 13
        // High: ≥ 14
        if (totalScore < 5) {
            activityLevel = 'Düşük Hastalık Aktivitesi';
            colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        } else if (totalScore <= 13) {
            activityLevel = 'Orta Hastalık Aktivitesi';
            colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
            activityLevel = 'Yüksek Hastalık Aktivitesi';
            colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
        }

        setResult({
            score: totalScore,
            activityLevel,
            colorClass
        });
    };

    const handleReset = () => {
        setSelections(DOMAINS.reduce((acc, domain) => ({ ...acc, [domain.id]: 0 }), {}));
        setResult(null);
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Layers className="text-pink-600" size={24} />
                            ESSDAI Hesaplayıcı
                        </h1>
                        <p className="text-sm text-gray-500">EULAR Sjögren's Syndrome Disease Activity Index</p>
                    </div>
                </div>

                {/* Result Mini-Summary if calculated */}
                {result && (
                    <div className={`hidden sm:block px-5 py-2 rounded-full border text-sm font-bold animate-in fade-in ${result.colorClass.replace('bg-', 'bg-opacity-20 ')}`}>
                        Skor: {result.score} — {result.activityLevel}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Inputs: Domains List */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {DOMAINS.map((domain) => (
                            <div key={domain.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="font-bold text-gray-800 flex items-center gap-2">
                                        {domain.name}
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                                            Ağırlık: {domain.weight}
                                        </span>
                                    </label>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${selections[domain.id] > 0
                                            ? 'bg-pink-100 text-pink-700'
                                            : 'bg-gray-50 text-gray-300'
                                        }`}>
                                        {selections[domain.id]}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {/* Level Selection Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {[0, 1, 2, 3].map((level) => {
                                            if (level > domain.maxLevel) return null; // Don't show invalid levels

                                            const isSelected = selections[domain.id] === level;
                                            return (
                                                <button
                                                    key={level}
                                                    onClick={() => handleSelectionChange(domain.id, level)}
                                                    className={`
                                                        px-2 py-1.5 text-xs rounded-lg border transition-all flex items-center justify-center gap-1.5
                                                        ${isSelected
                                                            ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    {isSelected && <Check size={12} />}
                                                    {level === 0 ? 'Yok (0)' :
                                                        level === 1 ? 'Düşük (1)' :
                                                            level === 2 ? 'Orta (2)' : 'Yüksek (3)'}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-end gap-3 sticky bottom-4 z-10 lg:static mt-6">
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw size={18} />
                            Sıfırla
                        </button>
                        <button
                            onClick={calculateESSDAI}
                            className="px-8 py-3 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-w-[160px]"
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
                        <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-xl sticky top-6 ${result.colorClass}`}>
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-2">HESAPLANAN ESSDAI</span>
                            <div className="text-7xl font-black mb-3 tracking-tighter">
                                {result.score}
                            </div>
                            <div className="text-lg font-bold px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm w-full leading-tight">
                                {result.activityLevel}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center text-gray-400 h-64 sticky top-6">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <p className="font-medium text-lg">Sonuç Bekleniyor</p>
                            <p className="text-sm mt-2 max-w-[200px]">Alanları doldurduktan sonra hesapla butonuna basınız.</p>
                        </div>
                    )}

                    <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100 text-sm text-pink-900 leading-relaxed">
                        <h3 className="font-bold flex items-center gap-2 mb-3 text-pink-700">
                            <AlertCircle size={18} />
                            Referans Değerler
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>&lt; 5</span>
                                <span className="font-bold text-emerald-600 text-xs">Düşük Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>5 - 13</span>
                                <span className="font-bold text-orange-600 text-xs">Orta Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>&ge; 14</span>
                                <span className="font-bold text-rose-600 text-xs">Yüksek Aktivite</span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs opacity-70">
                            * Her alanın (domain) kendi ağırlık katsayısı vardır. Skor = Σ(Aktivite Seviyesi x Ağırlık)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
