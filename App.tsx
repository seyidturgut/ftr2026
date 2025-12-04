
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import DoctorCTA from './components/DoctorCTA';
import DocumentsSection from './components/DocumentsSection';
import ForumTeaser from './components/ForumTeaser';
import LiquidBlobs from './components/LiquidBlobs';
import ParticleBackground from './components/ParticleBackground';
import Footer from './components/Footer';
import DiagnosticCriteria from './components/DiagnosticCriteria';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white selection:bg-sky-500/30 transition-colors duration-500">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LiquidBlobs />
        <ParticleBackground />
        
        {/* Noise Texture Overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          onNavigate={setCurrentView} 
          currentView={currentView}
        />
        
        <main className="flex-grow">
          {currentView === 'home' && (
            <>
              <Hero />
              <AboutSection />
              <DoctorCTA />
              <DocumentsSection />
              <ForumTeaser />
            </>
          )}

          {currentView === 'diagnostic-criteria' && (
            <DiagnosticCriteria onBack={() => setCurrentView('home')} />
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;
