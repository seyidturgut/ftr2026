
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Star, User, Quote, ArrowLeft, ChevronRight, Activity, Thermometer, HeartPulse, Download, FileCheck, AlertCircle, Info } from 'lucide-react';

interface DiagnosticCriteriaProps {
  onBack: () => void;
}

const criteriaList = [
  "Akut Romatizmal Ateş",
  "Antifosfolipid Kriterleri",
  "AS Modifiye NewYork",
  "Behçet 2010 Kriterleri",
  "Behçet Tanı Kriterleri",
  "Beighton Brighton Hipermobilite Kriterleri",
  "Churg-Strauss Kriterleri",
  "Diz OA Tanı Kriterleri",
  "El OA Tanı Kriterleri",
  "Erişkin Still Hastalığı",
  "FMF Tanı Kriterleri",
  "FMS ACR 1990 Kriterleri",
  "FMS ACR 2010 Kriterleri",
  "FMS ACR 2016 Kriterleri",
  "HSP ACR 1990 Kriterleri",
  "HSP Ankara 2008 Kriterleri",
  "HSP ICC 2006 Kriterleri",
  "Huzursuz Bacak Kriterleri",
  "Jüvenil İdiyopatik Artrit",
  "Kalça OA Tanı Kriterleri",
  "Kawasaki Hastalığı Kriterleri",
  "KBAS Budapeşte Kriterleri",
  "KBAS IASP Kriterleri",
  "Lupus ACR 1997 Kriterleri",
  "Lupus SLICC 2012 Kriterleri",
  "Mekanik Bel Ağrısı",
  "Nöropatik Ağrı DN4",
  "Nöropatik Ağrı LANSS",
  "Osteoporoz WHO Kriterleri",
  "Polimiyalji Romatika",
  "Psoriatik Artrit CASPAR",
  "Raynaud Fenomeni",
  "Reaktif Artrit",
  "Romatoid Artrit ACR 1987",
  "Romatoid Artrit ACR/EULAR 2010",
  "Sjögren Sendromu",
  "Sistemik Skleroz",
  "Takayasu Arteriti"
];

const DiagnosticCriteria: React.FC<DiagnosticCriteriaProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);

  const filteredList = criteriaList.filter(item => 
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Detail View Component for Acute Rheumatic Fever
  const renderDetail = () => {
    if (selectedCriteria === "Akut Romatizmal Ateş") {
      return (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Detail Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-sky-500 rounded-lg text-white">
                <Activity size={24} />
              </div>
              Akut Romatizmal Ateş
            </h2>
            <p className="text-lg text-sky-600 dark:text-sky-400 font-medium">
              (2002-2003 WHO; Revize Jones Kriterleri)
            </p>
          </div>

          {/* Major & Minor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Major Criteria */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-l-4 border-blue-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <HeartPulse size={100} />
               </div>
               <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm">M</span>
                 Majör Kriterler
               </h3>
               <ul className="space-y-3 relative z-10">
                 {['Kardit', 'Poliartrit', 'Kore', 'Eritema Marjinatum', 'Subkütan Nodüller'].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/5">
                     <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                     <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span>
                   </li>
                 ))}
               </ul>
            </div>

            {/* Minor Criteria */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border-l-4 border-emerald-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Thermometer size={100} />
               </div>
               <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-sm">m</span>
                 Minör Kriterler
               </h3>
               <ul className="space-y-3 relative z-10">
                 {[
                   'Ateş', 
                   'Artralji (poliartralji)', 
                   'Akut Faz Reaktanlarında Yükseklik\n(Sedimantasyon veya Lökosit Sayısı)'
                  ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-white/5 border border-emerald-100 dark:border-white/5">
                     <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                     <span className="font-medium text-slate-700 dark:text-slate-200 whitespace-pre-line">{item}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* Diagnostic Rules Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-10">
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileCheck className="text-sky-500" />
                Tanı Algoritması
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200 w-1/3">Tanı Kategorisi</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">Kesin Tanı İçin Gerekli Kriterler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {[
                    { cat: "Yeni Tanı Akut Romatizmal Ateş", req: "2 Majör veya 1 majör 2 minör kritere ilaveten\nGeçirilmiş A Grubu Streptokok enfeksiyona ait kanıtın varlığı*" },
                    { cat: "Tekrarlayan Atak (Kalp Hast. yok)", req: "2 Majör veya 1 majör 2 minör kritere ilaveten\nGeçirilmiş A Grubu Streptokok enfeksiyona ait kanıtın varlığı*" },
                    { cat: "Tekrarlayan Atak (Kalp Hast. var)", req: "2 minör kritere ilaveten\nGeçirilmiş A Grubu Streptokok enfeksiyona ait kanıtın varlığı*" },
                    { cat: "Kore (Romatizmal Nedenli)", req: "Tanı için başka bulgu, kriter, kanıt gerekmez" },
                    { cat: "Sinsi Başlangıçlı Romatizmal Kardit", req: "Tanı için başka bulgu, kriter, kanıt gerekmez" },
                    { cat: "Kronik Kapak Lezyonları", req: "Romatizmal Kalp Hastalığı tanısı için başka bulgu gerekmez.\n(saf mitral stenoz veya mikst mitral kapak hastalığı)" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{row.cat}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">{row.req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supporting Evidence */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/30 rounded-2xl p-6 mb-10">
            <h3 className="text-amber-800 dark:text-amber-400 font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              *Geçirilmiş A Grubu Streptokok Enfeksiyonu Destekleyen Bulgular
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {[
                 "Bu bulgular son 45 güne ait olmalı",
                 "EKG'de uzamış P-R aralığı",
                 "Artmış/artan ASO veya diğer antikor",
                 "Pozitif Boğaz kültürü",
                 "Pozitif Hızlı antijen testi",
                 "Yakın zamanda geçirilmiş Kızıl (Scarlet Fever)"
               ].map((item, i) => (
                 <div key={i} className="flex items-start gap-2 text-amber-900 dark:text-amber-200 text-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                   {item}
                 </div>
               ))}
            </div>
            <p className="mt-4 text-xs text-amber-700/60 dark:text-amber-500/60">
              Referans: Rheumatic Fever And Rheumatic Heart Disease Who Technical Report Series 923 Report of a WHO Expert Consultation Geneva, 29 October–1 Geneva 2004
            </p>
          </div>

          {/* Download Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button className="flex items-center justify-between p-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-lg shadow-sky-500/20 group">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/20 rounded-lg">
                   <Download size={20} />
                 </div>
                 <div className="text-left">
                   <p className="font-bold text-sm">Akut Romatizmal Ateş Tanı Kriterleri</p>
                   <p className="text-xs text-sky-100">PDF • 324 KB</p>
                 </div>
               </div>
               <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
             </button>

             <button className="flex items-center justify-between p-4 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white transition-all shadow-lg group">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/10 rounded-lg">
                   <FileText size={20} />
                 </div>
                 <div className="text-left">
                   <p className="font-bold text-sm">Referans Makale: ARA WHO</p>
                   <p className="text-xs text-slate-400">PDF • 489 KB</p>
                 </div>
               </div>
               <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
             </button>
          </div>
        </motion.div>
      );
    }
    
    // Default placeholder for other criteria
    return (
      <div className="text-center py-20">
        <div className="inline-block p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <Info size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedCriteria}</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Bu kriter seti için detaylı içerik hazırlanmaktadır. Lütfen daha sonra tekrar deneyiniz.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      
      {/* Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button 
          onClick={() => selectedCriteria ? setSelectedCriteria(null) : onBack()}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-sky-500 transition-colors mb-6 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {selectedCriteria ? 'Listeye Dön' : 'Ana Sayfaya Dön'}
        </button>
        
        {!selectedCriteria && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                Tanı <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Kriterleri</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                FTR Hekimlerinin karşılaştığı hastalıklara ait toplamda {criteriaList.length} adet kriter bulunmaktadır.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Kriter ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-white/10 rounded-xl leading-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all shadow-sm"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Main List View */}
      {!selectedCriteria && (
        <>
          {/* Acknowledgement Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/10 border border-blue-100 dark:border-blue-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Quote size={64} className="text-sky-600 dark:text-sky-400" />
            </div>
            <div className="relative z-10 flex items-start gap-4">
               <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-md shrink-0">
                  <User size={24} className="text-sky-600 dark:text-sky-400" />
               </div>
               <div>
                  <p className="text-slate-700 dark:text-slate-200 italic leading-relaxed text-sm md:text-base">
                    "Kriterlerin sitede olması fikrini veren ve sayfaları beraber hazırladığımız meslektaşım <span className="font-bold text-sky-600 dark:text-sky-400">Dr. Sertaç Ketenci</span>’ye katkılarından dolayı teşekkür ederim."
                  </p>
                  <div className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    — Editörün Notu
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Enhanced Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => {
                // Determine icon and color based on content keywords for variety
                let Icon = FileText;
                let colorClass = "from-sky-500 to-blue-600";
                
                if (item.includes("Romatizmal")) { Icon = Activity; colorClass = "from-rose-500 to-red-600"; }
                else if (item.includes("Artrit")) { Icon = Activity; colorClass = "from-orange-400 to-red-500"; }
                else if (item.includes("Kriterleri")) { Icon = FileCheck; colorClass = "from-emerald-400 to-teal-500"; }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setSelectedCriteria(item);
                    }}
                    className="group cursor-pointer relative p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-sky-900/10 dark:hover:shadow-black/40 overflow-hidden transition-all duration-300"
                  >
                    {/* Decorative Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${colorClass} opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>

                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors pr-4">
                          {item}
                        </h3>
                      </div>
                      <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400">
                Aradığınız kriter bulunamadı.
              </div>
            )}
          </div>
        </>
      )}

      {/* Selected Detail View */}
      <AnimatePresence>
        {selectedCriteria && renderDetail()}
      </AnimatePresence>

    </div>
  );
};

export default DiagnosticCriteria;
