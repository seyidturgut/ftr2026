
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Moon, Sun, ChevronDown, FileText, PenTool, Users, Stethoscope, Activity, Brain, Bone, Sparkles, Zap, ArrowRight, ClipboardList, Footprints, Smile, Pill, Calculator, FileJson, RefreshCw, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme, onNavigate, currentView }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Calculator State
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcValues, setCalcValues] = useState({
    tjc: '', // Tender Joint Count (0-28)
    sjc: '', // Swollen Joint Count (0-28)
    esr: '', // Erythrocyte Sedimentation Rate
    gh: ''   // Global Health (0-100)
  });
  const [dasResult, setDasResult] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCalculate = () => {
    // DAS28-ESR Formula: 0.56 * sqrt(tjc) + 0.28 * sqrt(sjc) + 0.70 * ln(esr) + 0.014 * gh
    const tjc = parseFloat(calcValues.tjc) || 0;
    const sjc = parseFloat(calcValues.sjc) || 0;
    const esr = parseFloat(calcValues.esr) || 0;
    const gh = parseFloat(calcValues.gh) || 0;

    if (esr <= 0) {
      alert("ESR değeri 0'dan büyük olmalıdır.");
      return;
    }

    const score = (0.56 * Math.sqrt(tjc)) + (0.28 * Math.sqrt(sjc)) + (0.70 * Math.log(esr)) + (0.014 * gh);
    setDasResult(parseFloat(score.toFixed(2)));
  };

  const getDiseaseActivity = (score: number) => {
    if (score < 2.6) return { label: "Remisyon", color: "text-green-500", bg: "bg-green-500" };
    if (score < 3.2) return { label: "Düşük Aktivite", color: "text-yellow-500", bg: "bg-yellow-500" };
    if (score <= 5.1) return { label: "Orta Aktivite", color: "text-orange-500", bg: "bg-orange-500" };
    return { label: "Yüksek Aktivite", color: "text-red-500", bg: "bg-red-500" };
  };

  const navLinks = [
    { 
      name: 'Akademik', 
      href: '#',
      hasDropdown: true 
    },
    { 
      name: 'Doküman', 
      href: '#',
      hasDropdown: true
    },
    { name: 'Seminer', href: '#' },
    { name: 'Hakkımızda', href: '#' },
  ];

  // Navigation Logic Handler
  const handleNavClick = (e: React.MouseEvent, itemTitle: string) => {
    if (itemTitle === "GÜNCEL TANI KRİTERLERİ") {
        e.preventDefault();
        onNavigate('diagnostic-criteria');
        setActiveDropdown(null);
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const academicItems = [
    { title: "GÜNCEL TANI KRİTERLERİ", href: "#", icon: FileText, desc: "2024 ACR/EULAR rehberleri" },
    { title: "OLGU SUNUMU NASIL YAZILIR?", href: "#", icon: PenTool, desc: "Bilimsel yayın formatı" },
    { title: "SAĞLIK KURULU", href: "#", icon: Users, desc: "Engellilik ve raporlama" },
    { title: "FİZİK MUAYENE", href: "#", icon: Stethoscope, desc: "Sistematik değerlendirme", hasSub: true },
    { title: "DEJENERATİF", href: "#", icon: Activity, desc: "Osteoartrit ve yaşlanma" },
    { title: "NÖROLOJİK REHAB", href: "#", icon: Brain, desc: "İnme, MS, Parkinson" },
    { title: "ORTOPEDİK REHAB", href: "#", icon: Bone, desc: "Post-op ve spor cerrahisi" },
    { title: "ÖZEL REHAB ALANLARI", href: "#", icon: Sparkles, desc: "Pediatri, el, onkoloji", hasSub: true },
    { title: "ROMATOLOJİ", href: "#", icon: Zap, desc: "İnflamatuar hastalıklar", hasSub: true },
  ];

  const documentItems = [
    { title: "FTR TANI GRUPLARI", href: "#", icon: ClipboardList, desc: "ICD-10 ve klinik sınıflandırma" },
    { title: "GÜNCEL ORTEZ LİSTESİ", href: "#", icon: Footprints, desc: "SUT kodları ve reçeteleme" },
    { title: "YÜZ FELCİ EGZERSİZLERİ", href: "#", icon: Smile, desc: "Resimli hasta eğitim materyalleri" },
    { title: "BİYOLOJİK İLAÇ RAPOR", href: "#", icon: Pill, desc: "Rapor çıkarma kriterleri" },
    { title: "DASKÜLATÖR", href: "#", icon: Calculator, desc: "DAS28 ve hastalık aktivite puanlama" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b ${
          scrolled
            ? 'h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-lg shadow-sky-900/5'
            : 'h-24 bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer z-50" onClick={() => onNavigate('home')}>
            <img 
              src="https://www.ftronline.com/wp-content/uploads/100x75.trbg_@2x.png" 
              alt="FTR Online" 
              className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-white/70">
              FTR<span className="font-light text-sky-500 dark:text-sky-400">Online</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 h-full">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative h-full flex items-center"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                  className="relative group text-base font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white transition-colors duration-300 flex items-center gap-1"
                  onClick={(e) => {
                      if (link.name === 'Hakkımızda' || link.name === 'Seminer') {
                          // Standard links behavior if any
                      } else {
                          // Prevent default for mega menu headers
                          e.preventDefault();
                      }
                  }}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)] transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
                </a>

                {/* Mega Menu Dropdowns */}
                <AnimatePresence>
                  {/* AKADEMIK DROPDOWN */}
                  {link.name === 'Akademik' && activeDropdown === 'Akademik' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[680px] pt-4 cursor-default"
                    >
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-sky-900/20 overflow-hidden flex">
                        
                        {/* Left: Main Grid */}
                        <div className="flex-1 p-6">
                           <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Akademik Kaynaklar</h3>
                              <a href="#" className="text-[10px] font-medium text-sky-500 hover:text-sky-400 flex items-center gap-1 group/link">
                                Tümünü Gör <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                              </a>
                           </div>
                           <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                              {academicItems.map((item, idx) => (
                                <a 
                                  key={idx} 
                                  href={item.href}
                                  onClick={(e) => handleNavClick(e, item.title)}
                                  className="group/item flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
                                >
                                  <div className="mt-0.5 w-7 h-7 rounded-md bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover/item:bg-sky-500 group-hover/item:text-white transition-colors shrink-0">
                                    <item.icon size={14} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-200 group-hover/item:text-sky-600 dark:group-hover/item:text-sky-400 transition-colors truncate">
                                      {item.title}
                                    </span>
                                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300">
                                      {item.desc}
                                    </span>
                                  </div>
                                </a>
                              ))}
                           </div>
                        </div>

                        {/* Right: Featured / Sidebar */}
                        <div className="w-64 bg-slate-50 dark:bg-black/20 border-l border-slate-200 dark:border-white/5 p-6 flex flex-col relative overflow-hidden group/card shrink-0">
                           <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                           
                           <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 relative z-10">Öne Çıkan</h3>
                           
                           <div className="flex-1 flex flex-col justify-end relative z-10">
                              <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 mb-3 overflow-hidden relative shadow-lg">
                                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                 <div className="absolute bottom-2 left-2">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white backdrop-blur-md border border-white/20">YENİ</span>
                                 </div>
                              </div>
                              
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-tight">
                                 2024 FTR Kongresi Özet Raporu
                              </h4>
                              <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                 Ulusal kongrede sunulan en çarpıcı bildiriler ve uzman görüşleri yayında.
                              </p>
                              
                              <button className="w-full py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-sky-600 dark:hover:bg-sky-400 transition-colors shadow-lg shadow-slate-900/10">
                                 Raporu Oku
                              </button>
                           </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {/* DOKUMAN DROPDOWN */}
                  {link.name === 'Doküman' && activeDropdown === 'Doküman' && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] pt-4 cursor-default"
                    >
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-sky-900/20 overflow-hidden flex">
                        
                        {/* Left: Main Grid */}
                        <div className="flex-1 p-6">
                           <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hızlı Erişim Araçları</h3>
                              <a href="#" className="text-[10px] font-medium text-sky-500 hover:text-sky-400 flex items-center gap-1 group/link">
                                Tüm Araçlar <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                              </a>
                           </div>
                           <div className="flex flex-col gap-2">
                              {documentItems.map((item, idx) => (
                                <a 
                                  key={idx} 
                                  href={item.href}
                                  onClick={(e) => {
                                    if(item.title === 'Daskülatör') { 
                                       e.preventDefault(); 
                                    }
                                  }}
                                  className="group/item flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover/item:bg-sky-500 group-hover/item:text-white transition-colors shrink-0">
                                    <item.icon size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 group-hover/item:text-sky-600 dark:group-hover/item:text-sky-400 transition-colors truncate">
                                      {item.title}
                                    </span>
                                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300">
                                      {item.desc}
                                    </span>
                                  </div>
                                </a>
                              ))}
                           </div>
                        </div>

                        {/* Right: Featured Tool */}
                        <div className="w-56 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-black/20 dark:to-black/40 border-l border-slate-200 dark:border-white/5 p-6 flex flex-col items-center text-center justify-center relative overflow-hidden group/card shrink-0">
                           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                           
                           <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center mb-4 relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                              <Calculator size={32} className="text-sky-500" />
                           </div>
                           
                           <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 relative z-10">
                              Daskülatör Pro
                           </h4>
                           <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-4 leading-relaxed relative z-10">
                              DAS28 hesaplamalarınızı saniyeler içinde yapın ve PDF raporu oluşturun.
                           </p>
                           
                           <button 
                             onClick={() => {
                               setIsCalculatorOpen(true);
                               setActiveDropdown(null);
                             }}
                             className="w-full py-2 rounded-lg bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20 relative z-10"
                           >
                              Hesapla
                           </button>
                        </div>

                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            ))}

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 pr-2">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">Dr. Ender Salbas</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Premium Üye</span>
              </div>
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full opacity-75 group-hover:opacity-100 blur-[2px] transition duration-200"></div>
                <img 
                  src="https://secure.gravatar.com/avatar/485d81509d17414fce2d845a26a171327f5e09e69d04769a6d4e38afa443f997?s=180&d=90&r=g" 
                  alt="Dr. Ender Salbas" 
                  className="relative w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-900"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
            </div>

            <button className="px-5 py-2 rounded-full text-sm font-semibold bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-white transition-all duration-300 backdrop-blur-md group flex items-center gap-2">
              Portal Giriş
              <ChevronRight className="w-4 h-4 text-sky-500 dark:text-sky-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-800 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 p-4 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 md:hidden overflow-y-auto max-h-[80vh]"
            >
              <div className="flex flex-col gap-4">
                {/* Mobile User Profile */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-white/5">
                  <img 
                    src="https://secure.gravatar.com/avatar/485d81509d17414fce2d845a26a171327f5e09e69d04769a6d4e38afa443f997?s=180&d=90&r=g" 
                    alt="Dr. Ender Salbas" 
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. Ender Salbas</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Premium Üye</p>
                  </div>
                </div>

                {navLinks.map((link) => (
                  <div key={link.name} className="flex flex-col">
                    <a
                      href={link.href}
                      className="text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 font-medium p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex justify-between items-center"
                      onClick={(e) => {
                        if(link.hasDropdown) {
                          e.preventDefault();
                          setActiveDropdown(activeDropdown === link.name ? null : link.name);
                        }
                      }}
                    >
                      {link.name}
                      {link.hasDropdown && <ChevronDown size={16} className={`${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                    </a>
                    
                    {/* Mobile Dropdown Logic */}
                    {link.name === 'Akademik' && activeDropdown === 'Akademik' && (
                      <div className="pl-4 mt-2 space-y-2 border-l-2 border-slate-200 dark:border-white/10 ml-2">
                         {academicItems.map((item, idx) => (
                           <a 
                             key={idx} 
                             href={item.href} 
                             onClick={(e) => handleNavClick(e, item.title)}
                             className="block text-sm text-slate-500 dark:text-slate-400 py-1 hover:text-sky-500 dark:hover:text-white"
                           >
                             {item.title}
                           </a>
                         ))}
                      </div>
                    )}

                    {link.name === 'Doküman' && activeDropdown === 'Doküman' && (
                      <div className="pl-4 mt-2 space-y-2 border-l-2 border-slate-200 dark:border-white/10 ml-2">
                         {documentItems.map((item, idx) => (
                           <a key={idx} href={item.href} className="block text-sm text-slate-500 dark:text-slate-400 py-1 hover:text-sky-500 dark:hover:text-white">
                             {item.title}
                           </a>
                         ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="h-px bg-slate-200 dark:bg-white/10 my-2"></div>
                <button className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg">
                  Hasta Portalı Girişi
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* CALCULATOR MODAL */}
      <AnimatePresence>
        {isCalculatorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsCalculatorOpen(false)}
            ></div>
            
            {/* Modal Content */}
            <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
               {/* Modal Header */}
               <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white relative">
                 <button 
                   onClick={() => setIsCalculatorOpen(false)}
                   className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                 >
                   <X size={18} />
                 </button>
                 <div className="flex items-center gap-3 mb-1">
                   <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                     <Calculator size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold">Daskülatör Pro</h3>
                     <p className="text-sky-100 text-xs">DAS28 - ESR Hesaplayıcı</p>
                   </div>
                 </div>
               </div>

               {/* Modal Body */}
               <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Hassas Eklem (0-28)</label>
                      <input 
                        type="number" 
                        min="0" max="28"
                        value={calcValues.tjc}
                        onChange={(e) => setCalcValues({...calcValues, tjc: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 dark:text-white font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Şiş Eklem (0-28)</label>
                      <input 
                        type="number" 
                        min="0" max="28"
                        value={calcValues.sjc}
                        onChange={(e) => setCalcValues({...calcValues, sjc: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 dark:text-white font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">ESR (mm/h)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={calcValues.esr}
                        onChange={(e) => setCalcValues({...calcValues, esr: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 dark:text-white font-medium"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">Global Sağlık (0-100) <Info size={12}/></label>
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={calcValues.gh}
                        onChange={(e) => setCalcValues({...calcValues, gh: e.target.value})}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 dark:text-white font-medium"
                        placeholder="VAS Skoru"
                      />
                    </div>
                  </div>

                  {/* Result Section */}
                  {dasResult !== null && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-center"
                    >
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">DAS28 Skorunuz</p>
                      <div className="flex items-center justify-center gap-3">
                         <span className="text-4xl font-bold text-slate-900 dark:text-white">{dasResult}</span>
                         <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getDiseaseActivity(dasResult).bg}`}>
                           {getDiseaseActivity(dasResult).label}
                         </span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setCalcValues({ tjc: '', sjc: '', esr: '', gh: '' });
                        setDasResult(null);
                      }}
                      className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold transition-colors flex items-center gap-2"
                    >
                      <RefreshCw size={18} />
                      <span className="hidden sm:inline">Sıfırla</span>
                    </button>
                    <button 
                      onClick={handleCalculate}
                      className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98]"
                    >
                      Hesapla
                    </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
