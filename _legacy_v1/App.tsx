

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import Login from './src/components/auth/Login';
import AdminDashboard from './src/components/admin/AdminDashboard';
import CategoryManagement from './src/components/admin/CategoryManagement';
import ContentManagement from './src/components/admin/ContentManagement';
import ContentPage from './src/pages/ContentPage';
import ProfilePage from './src/pages/ProfilePage';
import ContentListPage from './src/pages/ContentListPage';
import LiquidBlobs from './components/LiquidBlobs';
import ParticleBackground from './components/ParticleBackground';
import Footer from './components/Footer';
import DiagnosticCriteria from './components/DiagnosticCriteria';

const HomePage: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

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
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        <main className="flex-grow">
          <Hero />
          <AboutSection />
        </main>

        <Footer />
      </div>
    </div>
  );
};

const DiagnosticPage: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LiquidBlobs />
        <ParticleBackground />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        <main className="flex-grow">
          <DiagnosticCriteria onBack={() => navigate('/')} />
        </main>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/content" element={<ContentListPage />} />
          <Route path="/content/:slug" element={<ContentListPage />} />
          <Route path="/diagnostic-criteria" element={<DiagnosticPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute>
                <ContentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <CategoryManagement />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
