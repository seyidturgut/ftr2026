import React from 'react';
import { Twitter, Linkedin, Github, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-slate-50 dark:bg-slate-950 pt-20 pb-10 overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>

            <div className="absolute -top-24 left-1/4 w-96 h-96 bg-sky-200/20 dark:bg-sky-900/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/10 dark:bg-blue-900/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-16">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://www.ftronline.com/wp-content/uploads/100x75.trbg_@2x.png"
                                alt="FTR Online"
                                className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                            />
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                                FTR<span className="font-light text-sky-500 dark:text-sky-400">Online</span>
                            </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                            Rehabilitasyon uzmanlarını yeni nesil yapay zeka araçları ve veri odaklı içgörülerle güçlendiriyoruz.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all hover:scale-110 hover:shadow-lg hover:shadow-sky-500/20"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-400">
                            {['Özellikler', 'YZ Analizi', 'Tele-Rehab', 'Fiyatlandırma'].map(item => (
                                <li key={item}><a href="#" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors block">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* ... other columns ... */}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-6 border-t border-slate-200 dark:border-white/5 pt-8">
                    <p>&copy; 2026 FTR Online Tüm hakları saklıdır.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
