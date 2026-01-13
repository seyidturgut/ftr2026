
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Moon, Sun, ChevronDown, FileText, PenTool, Users, Stethoscope, Activity, Brain, Bone, Sparkles, Zap, ArrowRight, ClipboardList, Footprints, Smile, Pill, Calculator, FileJson, RefreshCw, Info, User, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../src/contexts/AuthContext';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    { name: 'Akademik', href: '/content?type=akademik' },
    { name: 'Doküman', href: '/content?type=dokuman' },
    { name: 'Seminer', href: '/content?type=seminer' },
    { name: 'Hakkımızda', href: '#' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b ${scrolled
          ? 'h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-lg shadow-sky-900/5'
          : 'h-24 bg-transparent border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer z-50">
            <img
              src="https://www.ftronline.com/wp-content/uploads/100x75.trbg_@2x.png"
              alt="FTR Online"
              className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-white/70">
              FTR<span className="font-light text-sky-500 dark:text-sky-400">Online</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 h-full">
            {navLinks.map((link) => (
              <div key={link.name} className="relative h-full flex items-center">
                <a
                  href={link.href}
                  className="relative group text-base font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white transition-colors duration-300 flex items-center gap-1"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)] transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
                </a>
              </div>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>



            {/* Right Side - Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user?.first_name?.charAt(0) || 'U'}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.title} {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {user?.role === 'fulladmin' ? 'Tam Yönetici' :
                          user?.role === 'admin' ? 'Yönetici' :
                            user?.role === 'editor' ? 'Editör' : 'Abone'}
                      </p>
                    </div>

                    <Link
                      to="/content?type=akademik"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FileText size={16} />
                      İçerikler
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User size={16} />
                      Profil
                    </Link>

                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={16} />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-sm font-semibold bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-white transition-all duration-300 backdrop-blur-md group flex items-center gap-2"
              >
                Portal Giriş
                <ChevronRight className="w-4 h-4 text-sky-500 dark:text-sky-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
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
                {navLinks.map((link) => (
                  <div key={link.name} className="flex flex-col">
                    <a
                      href={link.href}
                      className="text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 font-medium p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex justify-between items-center"
                    >
                      {link.name}
                    </a>
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
                      onChange={(e) => setCalcValues({ ...calcValues, tjc: e.target.value })}
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
                      onChange={(e) => setCalcValues({ ...calcValues, sjc: e.target.value })}
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
                      onChange={(e) => setCalcValues({ ...calcValues, esr: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 dark:text-white font-medium"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">Global Sağlık (0-100) <Info size={12} /></label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={calcValues.gh}
                      onChange={(e) => setCalcValues({ ...calcValues, gh: e.target.value })}
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
