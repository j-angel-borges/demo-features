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

      {/* Main Container - padOS Fixed Two-Column Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* VIEW 1: Overview / All-in-One Live Cockpit (padOS Split-Screen) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Fixed Left Drawer / Card (Mateo Profile & Controls) */}
            <div className="lg:col-span-4 lg:sticky lg:top-20">
              <ChildProfileCard
                profile={childProfile}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onToggleCircadian={toggleCircadian}
                isEmergencyLocked={isEmergencyLocked}
                onToggleEmergencyLock={handleToggleEmergencyLock}
              />
            </div>

            {/* Right Pane: Document Vault / Activities */}
            <div className="lg:col-span-8">
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
