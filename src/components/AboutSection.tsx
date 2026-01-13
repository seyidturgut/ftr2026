'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, MessageSquare } from 'lucide-react';

const features = [
    {
        icon: FileText,
        title: "Güncel Kılavuzlar",
        description: "En son bilimsel verilere dayalı, sürekli güncellenen rehabilitasyon protokolleri ve tedavi kılavuzları.",
        color: "blue",
        iconBg: "bg-blue-500",
        glow: "shadow-blue-500/20"
    },
    {
        icon: Video,
        title: "Video Eğitimler",
        description: "Uzman hekimler tarafından hazırlanmış, uygulamalı teknik ve yöntemleri gösteren eğitim videoları.",
        color: "emerald",
        iconBg: "bg-emerald-500",
        glow: "shadow-emerald-500/20"
    },
    {
        icon: MessageSquare,
        title: "Hekim Forumu",
        description: "Meslektaşlarınızla vaka tartışmaları yapın, deneyimlerinizi paylaşın ve sorularınıza cevap bulun.",
        color: "purple",
        iconBg: "bg-purple-500",
        glow: "shadow-purple-500/20"
    }
];

const AboutSection: React.FC = () => {
    return (
        <section className="relative py-32 w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 -left-[50%] w-[50%] h-full bg-gradient-to-r from-transparent via-sky-500/5 to-transparent skew-x-12 animate-light-sweep"></div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl mx-auto bg-gradient-to-b from-sky-900/5 to-transparent rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.25
                            }
                        }
                    }}
                    className="text-center max-w-4xl mx-auto mb-24 space-y-6 flex flex-col items-center"
                >
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        className="inline-block px-5 py-2 rounded-full bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-sky-400 text-sm font-medium mb-2 backdrop-blur-md"
                    >
                        Platform Hakkında
                    </motion.div>

                    <motion.h2
                        variants={{
                            hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: "easeOut" } }
                        }}
                        className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight"
                    >
                        FTR Online Nedir?
                    </motion.h2>

                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
                            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: "easeOut" } }
                        }}
                        className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto"
                    >
                        FTR Online, fizik tedavi ve rehabilitasyon alanında çalışan hekimler için özel olarak tasarlanmış kapsamlı bir dijital kaynak platformudur. Güncel kılavuzlar, kanıta dayalı protokoller ve meslektaşlarınızla bilgi paylaşımı için ihtiyacınız olan her şey tek bir yerde.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.12, delayChildren: 0.2 }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => {
                        let bgHoverClass = "";
                        let textHoverClass = "";
                        let iconContainerClass = "";
                        let iconColorClass = "";

                        if (feature.color === 'blue') {
                            bgHoverClass = "group-hover:bg-blue-500/5";
                            textHoverClass = "group-hover:text-blue-600 dark:group-hover:text-blue-300";
                            iconContainerClass = "bg-blue-500";
                            iconColorClass = "text-white";
                        } else if (feature.color === 'emerald') {
                            bgHoverClass = "group-hover:bg-emerald-500/5";
                            textHoverClass = "group-hover:text-emerald-600 dark:group-hover:text-emerald-300";
                            iconContainerClass = "bg-emerald-500";
                            iconColorClass = "text-white";
                        } else if (feature.color === 'purple') {
                            bgHoverClass = "group-hover:bg-purple-500/5";
                            textHoverClass = "group-hover:text-purple-600 dark:group-hover:text-purple-300";
                            iconContainerClass = "bg-purple-500";
                            iconColorClass = "text-white";
                        }

                        return (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 40 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                }}
                                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                                className={`group relative p-8 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl ${feature.glow ? `hover:${feature.glow}` : ''}`}
                            >
                                <div className={`absolute inset-0 rounded-2xl transition-colors duration-500 ${bgHoverClass}`}></div>

                                <div className={`relative w-14 h-14 rounded-xl ${iconContainerClass} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`relative z-10 w-7 h-7 ${iconColorClass}`} />
                                </div>

                                <h3 className={`relative z-10 text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors ${textHoverClass}`}>
                                    {feature.title}
                                </h3>

                                <p className="relative z-10 text-slate-700 dark:text-slate-400 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            <style jsx>{`
        @keyframes light-sweep {
          0% { transform: translateX(0) skewX(-12deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(350%) skewX(-12deg); opacity: 0; }
        }
        .animate-light-sweep {
          animation: light-sweep 8s linear infinite;
        }
      `}</style>
        </section>
    );
};

export default AboutSection;
