import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './screens/HomeScreen';
import { AdventureBuilderScreen } from './screens/AdventureBuilderScreen';
import { GeneratedQuestScreen } from './screens/GeneratedQuestScreen';
import { ExpeditionScreen } from './screens/ExpeditionScreen';
import { ReturnReflectScreen } from './screens/ReturnReflectScreen';
import { JournalScreen } from './screens/JournalScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LibrarySettingsScreen } from './screens/LibrarySettingsScreen';

import {
  ScreenType,
  Quest,
  QuestConfig,
  ActiveSession,
  JournalEntry,
  JournalStats,
  QuestPack,
  ModelStatus,
} from './types';

import {
  getModelStatus,
  generateQuest,
  getQuestPacks,
  addJournalEntry,
  getJournalEntries,
  deleteJournalEntry,
  getJournalStats,
  exportJournalData,
  clearUserData,
} from './services/api';

export function App() {
  const [currentScreen, setScreen] = useState<ScreenType>('home');
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [generatedQuest, setGeneratedQuest] = useState<Quest | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [builderConfig, setBuilderConfig] = useState<Partial<QuestConfig>>({
    duration_minutes: 15,
    energy_level: 'balanced',
    environment: 'neighborhood',
    difficulty: 'gentle',
    activity_preferences: ['nature observation', 'mindful exploration'],
    no_equipment_only: true,
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats>({
    total_quests_completed: 0,
    total_self_reported_minutes: 0,
    distinct_activity_types: [],
    recent_discoveries: [],
    calculated_streak_days: 0,
  });
  const [packs, setPacks] = useState<QuestPack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial data
  const loadData = async () => {
    try {
      const [status, fetchedPacks, entries, st] = await Promise.all([
        getModelStatus(),
        getQuestPacks(),
        getJournalEntries(),
        getJournalStats(),
      ]);
      setModelStatus(status);
      setPacks(fetchedPacks);
      setJournalEntries(entries);
      setStats(st);
    } catch (err) {
      console.warn('Backend loading note:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleGenerate = async (config: QuestConfig, preferOffline: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const quest = await generateQuest(config, preferOffline);
      setGeneratedQuest(quest);
      setScreen('quest');
    } catch (err: any) {
      setError(err.message || 'Quest generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptQuest = () => {
    if (!generatedQuest) return;
    const session: ActiveSession = {
      quest: generatedQuest,
      startedAt: new Date().toISOString(),
      startTimestamp: Date.now(),
      accumulatedElapsedSeconds: 0,
      isPaused: false,
      checkedItems: [],
      completedSteps: [],
    };
    setActiveSession(session);
    setScreen('expedition');
    showToast('Expedition started. You can safely lock your phone or enter Pocket Mode.');
  };

  const handleFinishExpedition = () => {
    if (!activeSession) return;
    setScreen('reflect');
  };

  const handleAbandonExpedition = () => {
    if (confirm('Leave expedition mode? You can restart another quest anytime.')) {
      setActiveSession(null);
      setScreen('home');
    }
  };

  const handleSaveJournal = async (entry: JournalEntry) => {
    try {
      await addJournalEntry(entry);
      setActiveSession(null);
      const [entries, st] = await Promise.all([getJournalEntries(), getJournalStats()]);
      setJournalEntries(entries);
      setStats(st);
      setScreen('journal');
      showToast('Field notes saved to your local notebook!');
    } catch (err: any) {
      alert(`Error saving entry: ${err.message}`);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteJournalEntry(id);
    const [entries, st] = await Promise.all([getJournalEntries(), getJournalStats()]);
    setJournalEntries(entries);
    setStats(st);
    showToast('Entry deleted from local storage.');
  };

  const handleExportAll = async () => {
    try {
      const data = await exportJournalData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `outside_os_archive_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export archive generated.');
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    await clearUserData();
    setJournalEntries([]);
    setStats({
      total_quests_completed: 0,
      total_self_reported_minutes: 0,
      distinct_activity_types: [],
      recent_discoveries: [],
      calculated_streak_days: 0,
    });
    showToast('All local records permanently cleared.');
  };

  const handleSelectExampleQuest = (category: string) => {
    setBuilderConfig({
      ...builderConfig,
      activity_preferences: [category],
    });
    setScreen('builder');
  };

  const handleSelectQuestFromPack = (quest: Quest) => {
    setGeneratedQuest(quest);
    setScreen('quest');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f3]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#1b382b] text-[#fbf9f3] text-xs font-semibold shadow-field-lg flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#c86432]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Primary Navigation */}
      <Navbar
        currentScreen={currentScreen}
        setScreen={setScreen}
        modelStatus={modelStatus}
        activeSessionActive={!!activeSession}
      />

      {/* Screen Router */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeScreen
            setScreen={setScreen}
            modelStatus={modelStatus}
            onSelectExampleQuest={handleSelectExampleQuest}
          />
        )}

        {currentScreen === 'builder' && (
          <AdventureBuilderScreen
            initialConfig={builderConfig}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            modelStatus={modelStatus}
            error={error}
          />
        )}

        {currentScreen === 'quest' && generatedQuest && (
          <GeneratedQuestScreen
            quest={generatedQuest}
            onAccept={handleAcceptQuest}
            onRegenerate={() => handleGenerate(builderConfig as QuestConfig, false)}
            onModify={() => setScreen('builder')}
            onSaveLater={() => {
              showToast('Quest preserved in session cache.');
            }}
          />
        )}

        {currentScreen === 'expedition' && activeSession && (
          <ExpeditionScreen
            session={activeSession}
            onUpdateSession={setActiveSession}
            onFinish={handleFinishExpedition}
            onAbandon={handleAbandonExpedition}
          />
        )}

        {currentScreen === 'reflect' && activeSession && (
          <ReturnReflectScreen
            session={activeSession}
            elapsedMinutes={Math.max(
              1,
              Math.round(
                (activeSession.accumulatedElapsedSeconds +
                  (activeSession.isPaused
                    ? 0
                    : Math.floor((Date.now() - activeSession.startTimestamp) / 1000))) /
                  60
              )
            )}
            onSave={handleSaveJournal}
            onCancel={() => setScreen('expedition')}
          />
        )}

        {currentScreen === 'journal' && (
          <JournalScreen
            entries={journalEntries}
            onDeleteEntry={handleDeleteEntry}
            onExportData={handleExportAll}
            setScreen={setScreen}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen stats={stats} setScreen={setScreen} />
        )}

        {currentScreen === 'library' && (
          <LibrarySettingsScreen
            packs={packs}
            modelStatus={modelStatus}
            onRefreshModelStatus={loadData}
            onExportAll={handleExportAll}
            onClearAll={handleClearAll}
            onSelectQuestFromPack={handleSelectQuestFromPack}
          />
        )}
      </main>

      {/* Footer (hidden in expedition mode) */}
      {currentScreen !== 'expedition' && (
        <footer className="border-t border-[#e5dec9] bg-white py-8 text-center text-xs text-[#608269]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#122419]">OUTSIDE//OS</span>
              <span>— Hacktoberfest Touch Grass</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span>Local-First</span>
              <span>·</span>
              <span>Open Weight AI</span>
              <span>·</span>
              <span>Zero Cloud Surveillance</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
