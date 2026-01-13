'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, PlayCircle, FileText, Video, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-sky-50 via-blue-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-sky-400/20 dark:bg-sky-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Content */}
          <div className="text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 tracking-wide uppercase">Yeni Nesil Rehabilitasyon</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="block text-slate-900 dark:text-white">Fizik Tedavi ve</span>
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 dark:from-sky-400 dark:via-blue-500 dark:to-purple-500 text-transparent bg-clip-text pb-2 inline-block">
                Rehabilitasyon Kaynakları
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-lg">
              En güncel kılavuzlar, protokoller ve eğitim materyallerine tek bir platformdan ulaşın. Meslektaşlarınızla deneyimlerinizi paylaşın.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/login"
                className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden shadow-xl shadow-sky-500/20 transition-all hover:scale-[1.02] bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800"
              >
                <span className="relative flex items-center gap-2">
                  Hekim Girişi <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/content"
                className="px-8 py-4 rounded-xl font-semibold text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <PlayCircle className="w-5 h-5 text-sky-500" />
                Kılavuzları Gör
              </Link>
            </div>

            {/* Stats */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700 w-full max-w-xl">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-0.5">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">2,500+</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Klinik Kılavuz</p>
                </div>
                <div className="hidden sm:block w-px h-10 bg-slate-300 dark:bg-slate-700"></div>
                <div className="space-y-0.5">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">500+</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Bilimsel Makale</p>
                </div>
                <div className="hidden sm:block w-px h-10 bg-slate-300 dark:bg-slate-700"></div>
                <div className="space-y-0.5">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">1700+</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Hekim Üye</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div
            className="relative w-full aspect-square md:aspect-[4/3]"
            style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
          >
            <div className="relative w-full h-full rounded-3xl">
              <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/50 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">

                {/* Mock Browser Header */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center opacity-70">
                  <div className="w-24 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="absolute top-20 left-6 right-6 bottom-6 flex gap-4">
                  <div className="w-2/3 h-full rounded-xl bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 p-4 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
                    <svg className="w-full h-full" preserveAspectRatio="none">
                      <path d="M0,100 C50,80 80,120 150,60 S200,40 250,80" stroke="url(#lineGradient)" strokeWidth="3" fill="none" />
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="w-1/3 h-full flex flex-col gap-4">
                    <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-slate-200 dark:border-slate-600 p-4 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 p-4">
                      <div className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-full mb-2">
                        <div className="w-[70%] h-full bg-sky-500 rounded-full"></div>
                      </div>
                      <div className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-full">
                        <div className="w-[40%] h-full bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest text-slate-600 dark:text-slate-400 uppercase">Kaydır</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-400 dark:border-slate-600 flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="relative py-32 w-full overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500">

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl mx-auto bg-gradient-to-b from-sky-900/5 to-transparent dark:from-sky-500/5 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-24 space-y-6">
            <div className="inline-block px-5 py-2 rounded-full bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-sky-400 text-sm font-medium backdrop-blur-md">
              Platform Hakkında
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              FTR Online Nedir?
            </h2>

            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              FTR Online, fizik tedavi ve rehabilitasyon alanında çalışan hekimler için özel olarak tasarlanmış kapsamlı bir dijital kaynak platformudur. Güncel kılavuzlar, kanıta dayalı protokoller ve meslektaşlarınızla bilgi paylaşımı için ihtiyacınız olan her şey tek bir yerde.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Güncel Kılavuzlar",
                description: "En son bilimsel verilere dayalı, sürekli güncellenen rehabilitasyon protokolleri ve tedavi kılavuzları.",
                color: "blue",
                iconBg: "bg-blue-500",
              },
              {
                icon: Video,
                title: "Video Eğitimler",
                description: "Uzman hekimler tarafından hazırlanmış, uygulamalı teknik ve yöntemleri gösteren eğitim videoları.",
                color: "emerald",
                iconBg: "bg-emerald-500",
              },
              {
                icon: MessageSquare,
                title: "Hekim Forumu",
                description: "Meslektaşlarınızla vaka tartışmaları yapın, deneyimlerinizi paylaşın ve sorularınıza cevap bulun.",
                color: "purple",
                iconBg: "bg-purple-500",
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
