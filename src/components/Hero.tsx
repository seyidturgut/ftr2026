'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Activity } from 'lucide-react';
import Link from 'next/link';

const Hero: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = (clientX - window.innerWidth / 2) / 40;
            const y = (clientY - window.innerHeight / 2) / 40;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleCardMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
    };

    return (
        <section ref={containerRef} className="relative min-h-screen pt-32 pb-20 px-6 flex flex-col justify-center items-center overflow-hidden">

            <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-left space-y-8"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-sky-600 dark:text-sky-300 tracking-wide uppercase">Yeni Nesil Rehabilitasyon</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                        <span className="block text-slate-900 dark:text-white">Fizik Tedavi ve</span>
                        <span
                            className="bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 dark:from-sky-400 dark:via-blue-500 dark:to-purple-600 text-transparent bg-clip-text pb-2 inline-block"
                            style={{ backgroundSize: '200% auto', animation: 'shimmer 4s linear infinite' }}
                        >
                            Rehabilitasyon Kaynakları
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-400 leading-relaxed max-w-lg">
                        En güncel kılavuzlar, protokoller ve eğitim materyallerine tek bir platformdan ulaşın. Meslektaşlarınızla deneyimlerinizi paylaşın.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <Link href="/login" className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden shadow-xl shadow-sky-500/20 transition-all hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-700 transition-all duration-300 group-hover:brightness-110"></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] transform" style={{ transform: 'skewX(-20deg)' }}></div>
                            <span className="relative flex items-center gap-2">
                                Hekim Girişi <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link href="/content" className="px-8 py-4 rounded-xl font-semibold text-slate-800 dark:text-white border border-slate-300 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md transition-all flex items-center gap-2 hover:border-slate-400 dark:hover:border-white/20">
                            <PlayCircle className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                            Kılavuzları Gör
                        </Link>
                    </div>

                    <div className="pt-8 border-t border-slate-200 dark:border-white/10 w-full max-w-xl">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="space-y-0.5">
                                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">2,500+</p>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Klinik Kılavuz</p>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-slate-300 dark:bg-white/10"></div>

                            <div className="space-y-0.5">
                                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">500+</p>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Bilimsel Makale</p>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-slate-300 dark:bg-white/10"></div>

                            <div className="space-y-0.5">
                                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">1700B+</p>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Hekim Üye</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="relative perspective-1000"
                    style={{
                        transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)`,
                        perspective: '1000px'
                    }}
                >
                    <div
                        ref={cardRef}
                        onMouseMove={handleCardMouseMove}
                        onMouseLeave={handleCardMouseLeave}
                        className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl transition-transform duration-100 ease-linear"
                        style={{
                            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl shadow-sky-900/10 dark:shadow-sky-900/20 overflow-hidden">
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-center opacity-70">
                                <div className="w-24 h-6 rounded-full bg-slate-200 dark:bg-white/10"></div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                            </div>

                            <div className="absolute top-20 left-6 right-6 bottom-6 flex gap-4">
                                <div className="w-2/3 h-full rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 p-4 relative overflow-hidden group">
                                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <path d="M0,100 C50,80 80,120 150,60 S200,40 250,80" stroke="url(#lineGradient)" strokeWidth="3" fill="none" className="drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#38bdf8" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute top-[30%] left-[60%] w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse"></div>
                                </div>
                                <div className="w-1/3 h-full flex flex-col gap-4">
                                    <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 border border-white/20 dark:border-white/10 p-4 flex items-center justify-center relative overflow-hidden">
                                        <Activity className="w-10 h-10 text-sky-600 dark:text-white/80" />
                                        <div className="absolute inset-0 bg-sky-400/10 blur-xl animate-pulse"></div>
                                    </div>
                                    <div className="flex-1 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 p-4">
                                        <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full mb-2">
                                            <div className="w-[70%] h-full bg-sky-500 rounded-full"></div>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full">
                                            <div className="w-[40%] h-full bg-purple-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-8 top-1/4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center gap-4 animate-[bounce_4s_infinite]" style={{ transform: 'translateZ(40px)' }}>
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                <Activity size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Makale Sayısı</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-white">500+</p>
                            </div>
                        </div>

                        <div className="absolute -left-6 bottom-1/4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl flex items-center gap-3 animate-[bounce_5s_infinite]" style={{ animationDelay: '1s', transform: 'translateZ(60px)' }}>
                            <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">Kullanım Oranı</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
            >
                <span className="text-xs tracking-widest text-slate-600 dark:text-slate-500 uppercase">Kaydır</span>
                <div className="w-6 h-10 rounded-full border-2 border-slate-400 dark:border-slate-700 flex justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></div>
                </div>
            </motion.div>

        </section>
    );
};

export default Hero;
