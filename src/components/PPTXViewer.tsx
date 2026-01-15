'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize, X, FileText, Download, Layout } from 'lucide-react';

interface PPTXViewerProps {
    fileUrl: string;
    onDownload?: () => void;
}

const PPTXViewer: React.FC<PPTXViewerProps> = ({ fileUrl, onDownload }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const viewerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = () => {
        if (!viewerRef.current) return;

        if (!document.fullscreenElement) {
            viewerRef.current.requestFullscreen().catch(err => {
                console.error(`Fullscreen error: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Office Viewer URL
    const officeViewerUrl = typeof window !== 'undefined'
        ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + fileUrl)}`
        : '';

    return (
        <div ref={viewerRef} className={`flex flex-col bg-white border border-gray-200 overflow-hidden shadow-sm transition-all ${isFullscreen ? 'h-screen w-screen rounded-0 border-none fixed inset-0 z-[9999]' : 'h-[85vh] rounded-xl'}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <h3 className="text-gray-800 font-bold px-2 hidden md:block uppercase tracking-wider text-xs">Sunum Görüntüleyici</h3>
                </div>

                <div className="flex items-center gap-2">
                    {onDownload && (
                        <button
                            onClick={onDownload}
                            className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-2 font-bold px-3"
                        >
                            <Download size={18} />
                            <span className="text-xs hidden sm:block">İndir</span>
                        </button>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        className={`ml-2 p-2 rounded-lg flex items-center gap-2 text-sm font-bold px-4 transition-all shadow-lg active:scale-95 ${isFullscreen ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'}`}
                    >
                        {isFullscreen ? <X size={16} /> : <Maximize size={16} />}
                        <span className="hidden sm:inline">{isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - Full Width */}
                <div className="flex-1 bg-gray-100/50 relative">
                    {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <div className="max-w-md space-y-6">
                                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                    <FileText size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-slate-900 leading-tight">Sunum Görüntüleyici</h4>
                                    <p className="text-[13px] text-slate-500 font-medium">Yerel geliştirme ortamında Microsoft Viewer kullanılamaz. Gerçek sunumu görmek için canlı yayında test edin veya sunumu indirin.</p>
                                </div>
                                {onDownload && (
                                    <button
                                        onClick={onDownload}
                                        className="inline-flex items-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg"
                                    >
                                        <Download size={16} /> Sunumu İndir
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <iframe
                            src={officeViewerUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            className="absolute inset-0"
                            title="PPTX Viewer"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PPTXViewer;
