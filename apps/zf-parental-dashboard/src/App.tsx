import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChildProfileCard } from './components/ChildProfileCard';
import { ChildProfileModal } from './components/ChildProfileModal';
import { DocumentVault } from './components/DocumentVault';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { SkinnerObservador } from './components/skinner/SkinnerObservador';
import { DemoTelemetrySimulator } from './components/DemoTelemetrySimulator';
import { CreativeStudioGallery } from './components/creative/CreativeStudioGallery';
import { Sparkles, ArrowRight, Palette } from 'lucide-react';

import { useLiveSkinner } from './hooks/useLiveSkinner';
import { useLiveDevices } from './hooks/useLiveDevices';
import { useDocumentVault } from './hooks/useDocumentVault';
import type { DashboardTab, ChildProfileState } from './types';
import { parentFirestoreService } from './services/parentFirestore';
import { setEmergencyLock, subscribeToEmergencyLock, getEmergencyLock } from '@zentry/shared';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('zentry_theme') as 'light' | 'dark') || 'light';
  });

  const [isEmergencyLocked, setIsEmergencyLocked] = useState<boolean>(() => {
    return getEmergencyLock();
  });

  useEffect(() => {
    const unsub = subscribeToEmergencyLock((locked) => {
      setIsEmergencyLocked(locked);
    });
    return () => unsub();
  }, []);

  const handleToggleEmergencyLock = () => {
    setEmergencyLock(!isEmergencyLocked);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.remove('dark', 'theme-dark');
      root.classList.add('theme-light');
    }
  }, [theme]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [circadianActive, setCircadianActive] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('zentry_theme', next);
  };

  const { session } = useLiveSkinner();
  const { isChildOnline } = useLiveDevices();

  const [childProfile, setChildProfile] = useState<ChildProfileState>({
    id: 'child_mateo_01',
    name: 'Mateo Quispe Mendoza',
    age: 10,
    grade: '5to Primaria',
    school: 'Colegio San Agustín',
    avatarUrl: '',
    devicePaired: 'iPad Mini 6',
    batteryPct: 82,
    isOnline: isChildOnline,
    activeApp: session.status === 'active' ? 'skinner' : 'idle',
    circadianActive: false,
    dailyLimitMinutes: 90,
    usedMinutesToday: 42,
    sleepScheduleStart: '21:30',
    sleepScheduleEnd: '07:00',
    emergencyContact: '+51 987 654 321',
    riskLevel: 'moderate',
  });

  const {
    documents,
    allDocuments,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedDoc,
    setSelectedDoc,
    isUploadOpen,
    setIsUploadOpen,
    categoryCounts,
    handleUpload,
    handleDelete,
  } = useDocumentVault();

  const toggleCircadian = () => {
    const next = !circadianActive;
    setCircadianActive(next);
    setChildProfile((prev) => ({ ...prev, circadianActive: next }));
  };

  const handleSaveProfileSettings = (updated: Partial<ChildProfileState>) => {
    setChildProfile((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light text-[var(--text-main)]' : 'theme-dark text-[var(--text-main)] dark'} relative pb-16 transition-colors duration-300 bg-[var(--bg-canvas)]`}>
      {/* Top Ambient Glow Bar (Mesa de Trabajo 02.B) */}
      <div className="top-glow-bar" />

      {/* Circadian Warmth Overlay */}
      <div id="zentry-calidez-overlay" className={circadianActive ? 'active' : ''} />

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFirebaseOnline={parentFirestoreService.isCloudConnected()}
        circadianActive={circadianActive}
        onToggleCircadian={toggleCircadian}
        onToggleSimulator={() => setIsSimulatorOpen((prev) => !prev)}
        isSimulatorOpen={isSimulatorOpen}
        isEmergencyLocked={isEmergencyLocked}
        onToggleEmergencyLock={handleToggleEmergencyLock}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
        {/* VIEW 1: Overview / All-in-One Live Cockpit */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ChildProfileCard
                  profile={childProfile}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onToggleCircadian={toggleCircadian}
                  isEmergencyLocked={isEmergencyLocked}
                  onToggleEmergencyLock={handleToggleEmergencyLock}
                />
              </div>
              <div className="lg:col-span-2">
                <DocumentVault
                  documents={documents.slice(0, 4)}
                  allDocuments={allDocuments}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectDoc={setSelectedDoc}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  onDeleteDoc={handleDelete}
                  categoryCounts={categoryCounts}
                />
              </div>
            </div>

            {/* Quick-Access to Z-Art Creative WOW & Skinner Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creative WOW Studio Card */}
              <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-[#EC4899]/30 bg-gradient-to-r from-[#EC4899]/10 to-[#533B87]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <Palette className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Z-Art Creativo (Factor WOW)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-pink-500/20 text-pink-400 font-mono">IA 3D</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Transforma dibujos en 3D Pixar y mini-apps interactivas.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('creative')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#533B87] to-[#EC4899] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <span>Ver Galería</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Skinner Box Observer Card */}
              <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-[#D6C8FA]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-violet-500/20 text-[#D6C8FA] border border-[#D6C8FA]/30">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Observador Skinner Box</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Monitorea estímulos y hábitos de atención de tu hijo.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('skinner')}
                  className="px-4 py-2 rounded-xl bg-[#533B87] hover:bg-[#684BA8] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <span>Abrir Observador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Dedicated Creative Studio Gallery */}
        {activeTab === 'creative' && (
          <div>
            <CreativeStudioGallery />
          </div>
        )}

        {/* VIEW 3: Dedicated Skinner Box Observador */}
        {activeTab === 'skinner' && (
          <div>
            <SkinnerObservador />
          </div>
        )}

        {/* VIEW 4: Dedicated Family Document Vault */}
        {activeTab === 'vault' && (
          <div>
            <DocumentVault
              documents={documents}
              allDocuments={allDocuments}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectDoc={setSelectedDoc}
              onOpenUpload={() => setIsUploadOpen(true)}
              onDeleteDoc={handleDelete}
              categoryCounts={categoryCounts}
            />
          </div>
        )}

        {/* VIEW 5: Dedicated Child Profile & Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <ChildProfileCard
              profile={childProfile}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onToggleCircadian={toggleCircadian}
              isEmergencyLocked={isEmergencyLocked}
              onToggleEmergencyLock={handleToggleEmergencyLock}
            />
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <ChildProfileModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={childProfile}
        onSave={handleSaveProfileSettings}
      />

      <DocumentPreviewModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />

      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      {/* Demo Telemetry Ingestion Simulator */}
      <DemoTelemetrySimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentSession={session}
      />
    </div>
  );
};
