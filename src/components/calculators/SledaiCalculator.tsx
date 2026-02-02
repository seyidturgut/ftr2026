import React, { useState } from 'react';
import { ChevronLeft, Calculator, AlertCircle, RefreshCw, Activity, ListChecks, CheckSquare, Square } from 'lucide-react';

// SLEDAI-2K Items with weights
const SLEDAI_ITEMS = [
    { id: 'seizure', name: 'Nöbet (Seizure)', weight: 8, description: 'Son başlangıçlı. Metabolik, enfeksiyöz veya ilaç nedenli değil.' },
    { id: 'psychosis', name: 'Psikoz', weight: 8, description: 'Gerçekle ilişkinin bozulması, halüsinasyonlar, sanrılar. Üremi veya ilaç nedenli değil.' },
    { id: 'obs', name: 'Organik Beyin Sendromu', weight: 8, description: 'Bilişsel işlevlerde bozulma, oryantasyon bozukluğu.' },
    { id: 'visual', name: 'Görsel Bozukluk', weight: 8, description: 'Retinal değişiklikler (cytoid body), optik nörit vs.' },
    { id: 'cranial', name: 'Kraniyal Sinir Bozukluğu', weight: 8, description: 'Yeni başlangıçlı duyusal veya motor nöropati.' },
    { id: 'headache', name: 'Lupus Başağrısı', weight: 8, description: 'Şiddetli, inatçı, narkotik analjezi gerektiren.' },
    { id: 'cva', name: 'Serebrovasküler Olay (CVA)', weight: 8, description: 'Yeni başlangıçlı inme. Ateroskleroz nedenli değil.' },
    { id: 'vasculitis', name: 'Vaskülit', weight: 8, description: 'Ülserasyon, gangren, periungual enfarktüs vb.' },
    { id: 'arthritis', name: 'Artrit', weight: 4, description: '≥2 eklemde ağrı, şişlik veya efüzyon.' },
    { id: 'myositis', name: 'Miyozit', weight: 4, description: 'Proksimal kas ağrısı/güçsüzlüğü ve artmış CK/aldolaz/EMG.' },
    { id: 'casts', name: 'İdrar Silindirleri', weight: 4, description: 'Heme-granular veya eritrosit silindirleri.' },
    { id: 'hematuria', name: 'Hematüri', weight: 4, description: '>5 RBC/hpf. Taş, enfeksiyon veya diğer nedenler dışlanmış.' },
    { id: 'proteinuria', name: 'Proteinüri', weight: 4, description: '>0.5g/24saat yeni başlangıçlı.' },
    { id: 'pyuria', name: 'Piyüri', weight: 4, description: '>5 WBC/hpf. Enfeksiyon dışlanmış.' },
    { id: 'rash', name: 'Döküntü (Rash)', weight: 2, description: 'İnflamatuar tipte yeni veya tekrarlayan döküntü.' },
    { id: 'alopecia', name: 'Alopesi', weight: 2, description: 'Yeni başlangıçlı veya tekrarlayan anormal saç dökülmesi.' },
    { id: 'mucosal', name: 'Mukozal Ülserler', weight: 2, description: 'Oral veya nazal ülserasyonlar.' },
    { id: 'pleurisy', name: 'Plörezi', weight: 2, description: 'Plöritik göğüs ağrısı veya sürtünme sesi veya efüzyon.' },
    { id: 'pericarditis', name: 'Perikardit', weight: 2, description: 'Perikardiyal ağrı veya sürtünme sesi veya efüzyon veya EKG.' },
    { id: 'low_compl', name: 'Düşük Kompleman', weight: 2, description: 'CH50, C3 veya C4 normalin altında.' },
    { id: 'dna_bind', name: 'Artmış DNA Bağlanması', weight: 2, description: '>25% dsDNA bağlanması (radioimmunoassay ile).' },
    { id: 'fever', name: 'Ateş', weight: 1, description: '>38°C. Enfeksiyon nedeni dışlanmış.' },
    { id: 'thrombocytopenia', name: 'Trombositopeni', weight: 1, description: '<100,000/mm3.' },
    { id: 'leukopenia', name: 'Lökopeni', weight: 1, description: '<3,000/mm3. İlaç nedenli değil.' },
];

interface CalculationResult {
    score: number;
    activityLevel: string;
    colorClass: string;
}

export default function SledaiCalculator({ onBack }: { onBack: () => void }) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [result, setResult] = useState<CalculationResult | null>(null);

    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const calculateSLEDAI = () => {
        let totalScore = 0;
        selectedItems.forEach(id => {
            const item = SLEDAI_ITEMS.find(i => i.id === id);
            if (item) totalScore += item.weight;
        });

        let activityLevel = '';
        let colorClass = '';

        // Categories (Common interpretation)
        // 0: No Activity
        // 1-5: Mild Activity
        // 6-10: Moderate Activity
        // 11-19: High Activity
        // ≥20: Very High Activity
        if (totalScore === 0) {
            activityLevel = 'Aktivite Yok';
            colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        } else if (totalScore <= 5) {
            activityLevel = 'Hafif Aktivite';
            colorClass = 'text-blue-600 bg-blue-50 border-blue-200';
        } else if (totalScore <= 10) {
            activityLevel = 'Orta Aktivite';
            colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
        } else if (totalScore <= 19) {
            activityLevel = 'Yüksek Aktivite';
            colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
        } else {
            activityLevel = 'Çok Yüksek Aktivite';
            colorClass = 'text-red-800 bg-red-100 border-red-300';
        }

        setResult({
            score: totalScore,
            activityLevel,
            colorClass
        });
    };

    const handleReset = () => {
        setSelectedItems([]);
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
                            <ListChecks className="text-red-600" size={24} />
                            SLEDAI Hesaplayıcı
                        </h1>
                        <p className="text-sm text-gray-500">Systemic Lupus Erythematosus Disease Activity Index</p>
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

                {/* Inputs: Features List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-gray-700">Klinik ve Laboratuvar Bulguları</span>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                                {selectedItems.length} seçili
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {SLEDAI_ITEMS.map((item) => {
                                const isSelected = selectedItems.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleItem(item.id)}
                                        className={`
                                            p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-gray-50
                                            ${isSelected ? 'bg-red-50/50 hover:bg-red-50' : ''}
                                        `}
                                    >
                                        <div className={`mt-0.5 transition-colors ${isSelected ? 'text-red-600' : 'text-gray-300'}`}>
                                            {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-bold ${isSelected ? 'text-red-700' : 'text-gray-800'}`}>
                                                    {item.name}
                                                </h4>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ml-2 ${isSelected ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-500'}`}>
                                                    {item.weight} Puan
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1 leading-snug">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-end gap-3 sticky bottom-4 z-10 lg:static mt-6">
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                        >
                            <RefreshCw size={18} />
                            Seçimi Temizle
                        </button>
                        <button
                            onClick={calculateSLEDAI}
                            className="px-8 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-w-[160px]"
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
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-2">HESAPLANAN SLEDAI</span>
                            <div className="text-7xl font-black mb-3 tracking-tighter">
                                {result.score}
                            </div>
                            <div className="text-lg font-bold px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm w-full leading-tight">
                                {result.activityLevel}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center text-gray-400 h-64">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <p className="font-medium text-lg">Sonuç Bekleniyor</p>
                            <p className="text-sm mt-2 max-w-[200px]">Listeden bulguları işaretledikten sonra hesapla butonuna basınız.</p>
                        </div>
                    )}

                    <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 text-sm text-red-900 leading-relaxed">
                        <h3 className="font-bold flex items-center gap-2 mb-3 text-red-700">
                            <AlertCircle size={18} />
                            Referans Değerler
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>0</span>
                                <span className="font-bold text-emerald-600 text-xs">Aktivite Yok</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>1 - 5</span>
                                <span className="font-bold text-blue-600 text-xs">Hafif</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>6 - 10</span>
                                <span className="font-bold text-orange-600 text-xs">Orta</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>11 - 19</span>
                                <span className="font-bold text-rose-600 text-xs">Yüksek</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>&ge; 20</span>
                                <span className="font-bold text-red-800 text-xs">Çok Yüksek</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
