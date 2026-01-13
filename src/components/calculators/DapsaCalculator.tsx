import React, { useState } from 'react';
import { ChevronLeft, Calculator, AlertCircle, RefreshCw, Activity, TestTube, Thermometer } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

interface DapsaData {
    tjc: number; // Tender Joint Count (0-68)
    sjc: number; // Swollen Joint Count (0-66)
    patientGlobal: number; // Patient Global Assessment (0-10)
    patientPain: number; // Patient Pain Assessment (0-10)
    crp: string; // CRP (mg/dL)
}

interface CalculationResult {
    score: number;
    activityLevel: string;
    colorClass: string;
}

export default function DapsaCalculator({ onBack }: { onBack: () => void }) {
    const [data, setData] = useState<DapsaData>({
        tjc: 0,
        sjc: 0,
        patientGlobal: 0,
        patientPain: 0,
        crp: ''
    });

    const [alertModal, setAlertModal] = useState<{ isOpen: boolean, message: string }>({
        isOpen: false,
        message: ''
    });

    const [result, setResult] = useState<CalculationResult | null>(null);

    const calculateDAPSA = () => {
        const crpValue = parseFloat(data.crp);

        if (isNaN(crpValue) || crpValue < 0) {
            setAlertModal({
                isOpen: true,
                message: 'Lütfen geçerli bir CRP değeri giriniz (mg/dL).'
            });
            return;
        }

        // Formula: DAPSA = TJC(68) + SJC(66) + PtGlobal(10) + PtPain(10) + CRP(mg/dL)
        const { tjc, sjc, patientGlobal, patientPain } = data;
        const score = tjc + sjc + patientGlobal + patientPain + crpValue;

        let activityLevel = '';
        let colorClass = '';

        // Classification for PsA
        // Remission: ≤ 4
        // Low: > 4 and ≤ 14
        // Moderate: > 14 and ≤ 28
        // High: > 28
        if (score <= 4) {
            activityLevel = 'Remisyon';
            colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        } else if (score <= 14) {
            activityLevel = 'Düşük Hastalık Aktivitesi';
            colorClass = 'text-blue-600 bg-blue-50 border-blue-200';
        } else if (score <= 28) {
            activityLevel = 'Orta Hastalık Aktivitesi';
            colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
            activityLevel = 'Yüksek Hastalık Aktivitesi';
            colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
        }

        setResult({
            score: parseFloat(score.toFixed(1)),
            activityLevel,
            colorClass
        });
    };

    const handleReset = () => {
        setData({
            tjc: 0,
            sjc: 0,
            patientGlobal: 0,
            patientPain: 0,
            crp: ''
        });
        setResult(null);
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
        <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2 gap-2">
                <div>
                    <label className="text-sm font-bold text-gray-800 leading-tight block">{label}</label>
                    {description && <p className="text-xs text-gray-500 mt-1 leading-snug">{description}</p>}
                </div>
                <div className="w-12 h-9 flex items-center justify-center bg-blue-50 text-blue-700 font-bold rounded-lg text-lg shrink-0">
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-1 mt-1 font-medium">
                <span>0</span>
                <span>{Math.round(max / 2)}</span>
                <span>{max}</span>
            </div>
        </div>
    );

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
                            <Thermometer className="text-cyan-600" size={24} />
                            DAPSA Hesaplayıcı
                        </h1>
                        <p className="text-sm text-gray-500">Disease Activity in Psoriatic Arthritis</p>
                    </div>
                </div>

                {/* Result Mini-Summary if calculated */}
                {result && (
                    <div className={`hidden sm:block px-5 py-2 rounded-full border text-sm font-bold animate-in fade-in ${result.colorClass.replace('bg-', 'bg-opacity-20 ')}`}>
                        Skor: {result.score} — {result.activityLevel}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <RangeInput
                            label="Hassas Eklem Sayısı (TJC)"
                            description="Tender Joint Count (0-68)"
                            value={data.tjc}
                            max={68}
                            onChange={(val) => setData({ ...data, tjc: val })}
                        />

                        <RangeInput
                            label="Şiş Eklem Sayısı (SJC)"
                            description="Swollen Joint Count (0-66)"
                            value={data.sjc}
                            max={66}
                            onChange={(val) => setData({ ...data, sjc: val })}
                        />

                        <RangeInput
                            label="Hasta Global Değerlendirmesi"
                            description="Patient Global Assessment (0-10)"
                            value={data.patientGlobal}
                            max={10}
                            onChange={(val) => setData({ ...data, patientGlobal: val })}
                        />

                        <RangeInput
                            label="Hasta Ağrı Değerlendirmesi"
                            description="Patient Pain Assessment (0-10)"
                            value={data.patientPain}
                            max={10}
                            onChange={(val) => setData({ ...data, patientPain: val })}
                        />
                    </div>

                    {/* CRP Input */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <TestTube size={16} className="text-cyan-600" />
                                CRP Değeri (mg/dL)
                                <span className="text-xs font-normal text-gray-500 ml-1">(Dikkat: mg/dL)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Örn: 0.8"
                                value={data.crp}
                                onChange={(e) => setData({ ...data, crp: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                            />
                        </div>
                        <div className="w-full md:w-1/2 flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all flex-1"
                            >
                                <RefreshCw size={18} />
                                Sıfırla
                            </button>
                            <button
                                onClick={calculateDAPSA}
                                className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex-[2]"
                            >
                                <Calculator size={20} />
                                HESAPLA
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Info & Result */}
                <div className="space-y-6">
                    {/* Sticky Result Card */}
                    {result ? (
                        <div className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-xl sticky top-6 ${result.colorClass}`}>
                            <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-2">HESAPLANAN DAPSA</span>
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
                            <p className="text-sm mt-2 max-w-[200px]">Değerleri girdikten sonra hesapla butonuna basınız.</p>
                        </div>
                    )}

                    <div className="bg-cyan-50/50 p-6 rounded-2xl border border-cyan-100 text-sm text-cyan-900 leading-relaxed">
                        <h3 className="font-bold flex items-center gap-2 mb-3 text-cyan-700">
                            <AlertCircle size={18} />
                            Referans Değerler
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>≤ 4</span>
                                <span className="font-bold text-emerald-600 text-xs">Remisyon</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>4 - 14</span>
                                <span className="font-bold text-blue-600 text-xs">Düşük Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>14 - 28</span>
                                <span className="font-bold text-orange-600 text-xs">Orta Aktivite</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-white/60 rounded-lg">
                                <span>&gt; 28</span>
                                <span className="font-bold text-rose-600 text-xs">Yüksek Aktivite</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={alertModal.isOpen}
                title="Eksik Bilgi"
                message={alertModal.message}
                confirmText="Tamam"
                onConfirm={() => setAlertModal({ ...alertModal, isOpen: false })}
                type="warning"
            />
        </div>
    );
}
