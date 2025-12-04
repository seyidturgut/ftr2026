import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, ArrowUpRight, FileBarChart, BookOpen } from 'lucide-react';

const docs = [
  {
    type: "PDF",
    size: "2.4 MB",
    title: "2024 Klinik Sonuç Raporu",
    category: "Araştırma",
    icon: FileBarChart,
    gradient: "from-blue-400 to-indigo-400"
  },
  {
    type: "PDF",
    size: "1.8 MB",
    title: "Post-Op ÖÇB İyileşme Protokolü",
    category: "Klinik Kılavuz",
    icon: FileText,
    gradient: "from-sky-400 to-cyan-300"
  },
  {
    type: "PPT",
    size: "5.1 MB",
    title: "Nöro-Rehab'da YZ Analizi",
    category: "Sunum",
    icon: BookOpen,
    gradient: "from-purple-400 to-pink-400"
  },
  {
    type: "PDF",
    size: "1.2 MB",
    title: "Hasta Başlangıç El Kitabı",
    category: "Kılavuz",
    icon: FileText,
    gradient: "from-emerald-400 to-teal-300"
  }
];

const DocumentsSection: React.FC = () => {
  return (
    <section className="relative py-24 w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-sky-200/20 dark:bg-sky-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:flex md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Son <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500">Kaynaklar</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Araştırma ekibimiz tarafından oluşturulan klinik çalışmalara, kullanım kılavuzlarına ve performans raporlarına erişin.
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-white transition-colors mt-6 md:mt-0 font-medium group">
            Tüm belgeleri görüntüle <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Cards Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {docs.map((doc, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.95 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { type: "spring", stiffness: 100, damping: 20 }
                }
              }}
              className="group relative p-6 rounded-2xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-900/10 dark:hover:shadow-sky-900/20 flex flex-col h-full"
            >
              {/* Top Row: Icon & Badge */}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${doc.gradient} bg-opacity-10 bg-clip-border relative overflow-hidden`}>
                   {/* Icon Background opacity hack since we can't use bg-opacity on gradient directly easily without alpha values */}
                   <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient} opacity-20`}></div>
                   <doc.icon className="relative z-10 w-6 h-6 text-slate-800 dark:text-white" />
                </div>
                <div className="px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 backdrop-blur-md group-hover:bg-white/80 dark:group-hover:bg-white/10 transition-colors">
                  {doc.type}
                </div>
              </div>

              {/* Content */}
              <div className="mb-8 flex-grow">
                <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wider">{doc.category}</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all">
                  {doc.title}
                </h3>
              </div>

              {/* Bottom: Meta & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 transition-colors">
                <span className="text-xs text-slate-500">{doc.size}</span>
                <button className="flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400 group-hover:text-sky-500 dark:group-hover:text-sky-300 transition-colors">
                  İndir <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Button */}
        <div className="mt-8 md:hidden flex justify-center">
          <button className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium">
            Tüm belgeleri görüntüle <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default DocumentsSection;