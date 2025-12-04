import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowRight } from 'lucide-react';

const DoctorCTA: React.FC = () => {
  return (
    <section className="relative w-full py-24 overflow-hidden border-y border-slate-200 dark:border-white/10">
      {/* Background Gradient & Blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-sky-50 to-white dark:from-blue-950/80 dark:via-blue-900/40 dark:to-sky-900/20 backdrop-blur-xl -z-20 transition-colors duration-500"></div>
      
      {/* Mesh/Noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] -z-10"></div>
      
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-sky-500/10 dark:bg-sky-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-600/10 dark:bg-blue-600/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center md:text-left space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-600 dark:text-sky-300 text-sm font-medium backdrop-blur-md">
            <Stethoscope size={16} className="text-sky-600 dark:text-sky-400" />
            <span className="tracking-wide uppercase text-xs font-bold">Sağlık Profesyonelleri</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Hassas Analitik ile <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400">Kliniğinizi Yükseltin</span>
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-xl mx-auto md:mx-0 font-light">
             Hasta gelişimini gerçek zamanlı izleyin, terapi protokollerini özelleştirin ve dünyanın her yerinden klinik düzeyde hareket verilerine erişin.
          </p>
        </motion.div>

        {/* Right Content - Premium Button */}
        <motion.div 
           initial={{ opacity: 0, x: 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
           className="relative z-10"
        >
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-10 py-5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl overflow-hidden shadow-2xl shadow-sky-900/20 dark:shadow-sky-900/40 hover:shadow-sky-500/40 transition-shadow duration-300"
          >
            {/* Liquid Ripple Simulation (Animated Gradient Sweep) */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[120%] group-hover:animate-liquid-sweep"></div>
            
            {/* Button Content */}
            <div className="relative flex items-center gap-3 text-white">
              <span className="font-bold text-lg tracking-wide">Doktor Portalı Girişi</span>
              <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        @keyframes liquid-sweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(50%) skewX(-15deg); }
        }
        .group:hover .animate-liquid-sweep {
          animation: liquid-sweep 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </section>
  );
};

export default DoctorCTA;