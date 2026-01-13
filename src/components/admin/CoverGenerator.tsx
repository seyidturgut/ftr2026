'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    X, Save, Type, Image as ImageIcon, Palette,
    AlignCenter, AlignLeft, AlignRight, RefreshCw,
    Download, Layout
} from 'lucide-react';

interface CoverGeneratorProps {
    initialTitle: string;
    onSave: (file: File) => void;
    onClose: () => void;
}

const PRESET_GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490d1 100%)',
    'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)',
    'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
    'linear-gradient(135deg, #e31e24 0%, #7e1013 100%)', // FTR Red
];

const CoverGenerator: React.FC<CoverGeneratorProps> = ({ initialTitle, onSave, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [title, setTitle] = useState(initialTitle);
    const [subtitle, setSubtitle] = useState('FTR Online Akademi');
    const [bgColor, setBgColor] = useState(PRESET_GRADIENTS[0]);
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
    const [fontSize, setFontSize] = useState(60);
    const [isGenerating, setIsGenerating] = useState(false);
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        drawCanvas();
    }, [title, subtitle, bgColor, textColor, textAlign, fontSize, bgImage]);

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions (1280x720 - 16:9)
        canvas.width = 1280;
        canvas.height = 720;

        // Draw Background
        if (bgImage) {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            // Add a dark overlay to make text readable
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            if (bgColor.startsWith('linear-gradient')) {
                // Parse simple linear gradient
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                // Regex to find hex colors - simplified for this use case
                const colors = bgColor.match(/#[a-fA-F0-9]{6}/g) || ['#667eea', '#764ba2'];
                gradient.addColorStop(0, colors[0]);
                gradient.addColorStop(1, colors[1]);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = bgColor;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw Text
        ctx.fillStyle = textColor;
        ctx.textBaseline = 'middle';

        // Settings for main title
        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
        const maxWidth = canvas.width * 0.8;
        const x = textAlign === 'center' ? canvas.width / 2 : (textAlign === 'left' ? canvas.width * 0.1 : canvas.width * 0.9);
        ctx.textAlign = textAlign;

        // Wrap text
        const words = title.split(' ');
        let line = '';
        let lines = [];
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        const totalHeight = lines.length * (fontSize * 1.2);
        let startY = (canvas.height / 2) - (totalHeight / 2);

        lines.forEach((l, i) => {
            ctx.fillText(l.trim(), x, startY + (i * fontSize * 1.2));
        });

        // Draw Subtitle
        if (subtitle) {
            ctx.font = `500 ${fontSize * 0.4}px Inter, system-ui, sans-serif`;
            ctx.globalAlpha = 0.8;
            ctx.fillText(subtitle, x, startY + totalHeight + 40);
            ctx.globalAlpha = 1.0;
        }

        // Draw Logo Placeholder or Brand Text
        ctx.font = `bold 24px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText('FTR ONLINE', canvas.width - 50, canvas.height - 50);
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setBgImage(img);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsGenerating(true);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `cover_${Date.now()}.webp`, { type: 'image/webp' });
                onSave(file);
            }
            setIsGenerating(false);
        }, 'image/webp', 0.9); // Quality set to 0.9 for high quality webp
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row h-[90vh] overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Left: Preview */}
                <div className="flex-[1.5] bg-gray-900 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                    </div>

                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-black/40 border border-white/5 ring-1 ring-white/10">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 tracking-widest uppercase flex items-center gap-2">
                            <Layout size={12} /> Live Preview (1280x720)
                        </div>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex-1 bg-white border-l border-gray-100 flex flex-col overflow-y-auto">
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                        <div>
                            <h3 className="font-black text-gray-900 text-xl tracking-tight">Kapak Sihirbazı</h3>
                            <p className="text-xs text-gray-400 font-medium">Hızlı ve profesyonel kapaklar oluşturun</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-2xl transition-all active:scale-90"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Title Input */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Type size={14} className="text-blue-500" /> Ana Başlık
                            </label>
                            <textarea
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-bold"
                                rows={3}
                            />
                        </div>

                        {/* Subtitle Input */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Alt Başlık</label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Background Presets */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette size={14} className="text-purple-500" /> Arka Plan
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {PRESET_GRADIENTS.map((grad, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setBgColor(grad);
                                            setBgImage(null);
                                        }}
                                        style={{ background: grad }}
                                        className={`aspect-square rounded-2xl border-4 transition-all shadow-sm ${bgColor === grad && !bgImage ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                    />
                                ))}
                                <label className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all text-gray-400 hover:text-blue-500 group">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                                    <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-bold mt-1">Yükle</span>
                                </label>
                            </div>
                        </div>

                        {/* Styling Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Hizalama</label>
                                <div className="flex bg-gray-50 p-1 rounded-xl">
                                    <button onClick={() => setTextAlign('left')} className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${textAlign === 'left' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><AlignLeft size={16} /></button>
                                    <button onClick={() => setTextAlign('center')} className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${textAlign === 'center' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><AlignCenter size={16} /></button>
                                    <button onClick={() => setTextAlign('right')} className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${textAlign === 'right' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><AlignRight size={16} /></button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Font Boyutu</label>
                                <input
                                    type="range"
                                    min="30"
                                    max="120"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        </div>

                        {/* Text Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Yazı Rengi</label>
                            <div className="flex gap-2">
                                {['#FFFFFF', '#000000', '#FFD700', '#E31E24', '#00FF00'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setTextColor(color)}
                                        style={{ backgroundColor: color }}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${textColor === color ? 'border-blue-500 scale-110 ring-4 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'}`}
                                    />
                                ))}
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-8 h-8 rounded-full overflow-hidden p-0 border-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-[1.5rem] text-sm font-bold hover:bg-gray-50 transition-all active:scale-95"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isGenerating}
                            className="flex-[1.5] flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            {isGenerating ? 'Yükleniyor...' : 'Kapak Olarak Kaydet'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverGenerator;
