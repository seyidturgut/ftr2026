import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, User, Heart, Share2 } from 'lucide-react';

const discussions = [
  {
    user: "Dr. Elif Yılmaz",
    role: "Fizyoterapist",
    text: "Nörolojik rehabilitasyonda yeni VR protokollerini deneyimleyen var mı? Sonuçlar şaşırtıcı derecede hızlı.",
    likes: 24,
    comments: 8,
    avatarColor: "bg-rose-500"
  },
  {
    user: "Uzm. Fzt. Ahmet Demir",
    role: "Spor Hekimi",
    text: "ÖÇB rekonstrüksiyonu sonrası 3. hafta yük bindirme kriterleri hakkında güncel yaklaşım tartışması.",
    likes: 45,
    comments: 12,
    avatarColor: "bg-blue-500"
  },
  {
    user: "Klinik Pilot",
    role: "Moderatör",
    text: "FTR Online v2.0 güncellemesi ile gelen yeni hasta takip metriklerini incelediniz mi?",
    likes: 156,
    comments: 42,
    avatarColor: "bg-emerald-500"
  }
];

const ForumTeaser: React.FC = () => {
  return (
    <section className="relative py-32 w-full overflow-hidden bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 dark:from-slate-950 dark:via-slate-900 dark:to-black transition-colors duration-500">
      
      {/* Background Ambience */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>
      
      {/* Stars / Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-slate-400 dark:bg-white rounded-full opacity-20 animate-pulse"
            style={{
              top: `${Math.random() * 50}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-sky-200/50 dark:bg-sky-900/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-300 text-sm font-medium backdrop-blur-md mb-4">
             <MessageSquare size={14} className="fill-current" />
             <span>Topluluk Merkezi</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Meslektaş <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400">Paylaşımları</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Türkiye'nin en büyük fizyoterapi topluluğunda vaka tartışmaları ve güncel literatür paylaşımları.
          </p>
        </motion.div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
          {discussions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ 
                scale: 1.02, 
                rotate: [0, 1, -1, 0],
                transition: { duration: 0.3 }
              }}
              className="group relative flex flex-col p-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 hover:border-white dark:hover:border-white/20 hover:shadow-lg hover:shadow-sky-500/10 transition-all cursor-pointer"
            >
              {/* Top User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${item.avatarColor} flex items-center justify-center text-white font-bold shadow-lg`}>
                  <User size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-1">{item.user}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.role}</span>
                </div>
              </div>

              {/* Message Body */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 flex-grow">
                {item.text}
              </p>

              {/* Footer Interactions */}
              <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-200 dark:border-white/5 pt-4 group-hover:border-slate-300 dark:group-hover:border-white/10 transition-colors">
                <div className="flex items-center gap-1 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                  <Heart size={14} /> {item.likes}
                </div>
                <div className="flex items-center gap-1 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  <MessageSquare size={14} /> {item.comments}
                </div>
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Share2 size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Futuristic CTA */}
        <motion.button 
          whileHover="hover"
          initial="initial"
          className="relative group px-8 py-4 bg-transparent overflow-hidden rounded-full flex items-center gap-4"
        >
          {/* Button Backgrounds */}
          <div className="absolute inset-0 border border-slate-300 dark:border-white/20 rounded-full group-hover:border-slate-400 dark:group-hover:border-white/40 transition-colors"></div>
          <div className="absolute inset-0 bg-white/50 dark:bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"></div>
          
          {/* Text */}
          <span className="relative z-10 font-semibold text-slate-800 dark:text-white text-lg tracking-wide">Foruma Git</span>
          
          {/* Animated Arrow Container */}
          <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-sky-500 transition-colors duration-300">
             <motion.div
               variants={{
                 initial: { x: 0 },
                 hover: { x: 50, opacity: 0, transition: { duration: 0.2 } }
               }}
               className="absolute"
             >
               <ArrowRight size={16} className="text-slate-700 dark:text-white" />
             </motion.div>
             <motion.div
               variants={{
                 initial: { x: -50, opacity: 0 },
                 hover: { x: 0, opacity: 1, transition: { duration: 0.2, delay: 0.1 } }
               }}
               className="absolute"
             >
               <ArrowRight size={16} className="text-white" />
             </motion.div>
          </div>
        </motion.button>
      
      </div>
    </section>
  );
};

export default ForumTeaser;