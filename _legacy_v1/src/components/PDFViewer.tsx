import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize } from 'lucide-react';

// Configure worker
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

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onDownload }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col h-[85vh] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <h3 className="text-gray-800 font-bold px-2 hidden md:block">Belge Görüntüleyici</h3>
                    <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                            disabled={pageNumber <= 1}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-white rounded disabled:opacity-50 transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-gray-700 text-sm font-mono px-3 font-semibold">
                            {pageNumber} / {numPages || '--'}
                        </span>
                        <button
                            onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
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
                    {onDownload && (
                        <button onClick={onDownload} className="ml-2 p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center gap-2 text-sm font-bold px-3 transition-colors shadow-sky-100 shadow-lg">
                            <Download size={16} />
                            <span className="hidden sm:inline">İndir</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Thumbnails Sidebar */}
                {sidebarOpen && (
                    <div className="w-24 md:w-56 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0 custom-scrollbar p-4 flex flex-col gap-4">
                        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} className="hidden" />
                        {numPages && Array.from(new Array(numPages), (el, index) => (
                            <div
                                key={`thumb_${index + 1}`}
                                onClick={() => setPageNumber(index + 1)}
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

                {/* Main View */}
                <div className="flex-1 bg-gray-100/50 overflow-auto flex items-start justify-center p-4 md:p-8 relative">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-medium">Belge yükleniyor...</p>
                            </div>
                        }
                        error={
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                                    <Maximize size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Önizleme Görüntülenemedi</h3>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    Dosya güvenlik ayarları nedeniyle önizlenemiyor ancak dosyayı indirerek veya yeni sekmede açarak görüntüleyebilirsiniz.
                                </p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Download size={20} />
                                    Dosyayı Görüntüle / İndir
                                </a>
                            </div>
                        }
                    >
                        <div className="shadow-xl shadow-gray-200/50 border border-gray-200 rounded-sm overflow-hidden">
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                className="bg-white"
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            />
                        </div>
                    </Document>
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;
