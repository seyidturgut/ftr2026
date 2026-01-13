'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';

// Use local worker instead of CDN
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
    fileUrl: string;
    onDownload?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const viewerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    // Intersection Observer to track current page while scrolling
    useEffect(() => {
        if (!numPages) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const pageIdx = pageRefs.current.indexOf(entry.target as HTMLDivElement);
                        if (pageIdx !== -1) {
                            setPageNumber(pageIdx + 1);
                        }
                    }
                });
            },
            {
                root: scrollContainerRef.current,
                threshold: 0.5, // 50% of the page must be visible to trigger update
            }
        );

        pageRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [numPages, scale]); // Re-run if scale changes as it might affect visibility

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        pageRefs.current = new Array(numPages).fill(null);
    };

    const jumpToPage = (targetPage: number) => {
        const targetRef = pageRefs.current[targetPage - 1];
        if (targetRef) {
            targetRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div ref={viewerRef} className={`flex flex-col bg-white border border-gray-200 overflow-hidden shadow-sm transition-all ${isFullscreen ? 'h-screen w-screen rounded-0 border-none fixed inset-0 z-[9999]' : 'h-[85vh] rounded-xl'}`}>
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <h3 className="text-gray-800 font-bold px-2 hidden md:block">Belge Görüntüleyici</h3>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => jumpToPage(Math.max(1, pageNumber - 1))}
                            disabled={pageNumber <= 1}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-white rounded disabled:opacity-50 transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-gray-700 text-sm font-mono px-3 font-semibold">
                            {pageNumber} / {numPages || '--'}
                        </span>
                        <button
                            onClick={() => jumpToPage(Math.min(numPages || 1, pageNumber + 1))}
                            disabled={pageNumber >= (numPages || 1)}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-white rounded disabled:opacity-50 transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-gray-600 text-xs w-12 text-center font-medium">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                        <ZoomIn size={18} />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className={`ml-2 p-2 rounded-lg flex items-center gap-2 text-sm font-bold px-4 transition-all shadow-lg active:scale-95 ${isFullscreen ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'}`}
                    >
                        {isFullscreen ? <X size={16} /> : <Maximize size={16} />}
                        <span>{isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {sidebarOpen && (
                    <div className="w-24 md:w-56 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0 custom-scrollbar p-4 flex flex-col gap-4">
                        {numPages && Array.from(new Array(numPages), (el, index) => (
                            <div
                                key={`thumb_${index + 1}`}
                                onClick={() => jumpToPage(index + 1)}
                                className={`cursor-pointer group relative transition-all ${pageNumber === index + 1 ? 'ring-2 ring-sky-500 rounded-lg shadow-md' : 'opacity-70 hover:opacity-100'}`}
                            >
                                <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                    <Document file={fileUrl} loading={<div className="w-full h-full animate-pulse bg-gray-200" />}>
                                        <Page
                                            pageNumber={index + 1}
                                            width={180}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                    </Document>
                                </div>
                                <div className={`text-center text-[10px] mt-1 font-mono font-bold ${pageNumber === index + 1 ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    Sayfa {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div ref={scrollContainerRef} className="flex-1 bg-gray-100/50 overflow-auto flex flex-col items-center gap-8 py-8 px-4 md:px-8 custom-scrollbar">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-medium">Belge yükleniyor...</p>
                            </div>
                        }
                    >
                        {numPages && Array.from(new Array(numPages), (el, index) => (
                            <div
                                key={`page_${index + 1}`}
                                ref={el => pageRefs.current[index] = el}
                                className="shadow-2xl shadow-gray-200/80 border border-gray-200 rounded-sm overflow-hidden bg-white"
                            >
                                <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    className="bg-white"
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;
