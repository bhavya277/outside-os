import React from 'react';
import { Compass, BookOpen, BarChart3, Settings, Sparkles, Feather } from 'lucide-react';
import { ScreenType, ModelStatus } from '../types';

interface NavbarProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  modelStatus: ModelStatus | null;
  activeSessionActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  setScreen,
  modelStatus,
  activeSessionActive,
}) => {
  // Hide navbar in expedition mode for complete distraction-free disappearing interface!
  if (currentScreen === 'expedition') {
    return null;
  }

  const isModelLive = modelStatus?.ollama_available && modelStatus?.model_ready;

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f3]/90 backdrop-blur-md border-b border-[#e5dec9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => setScreen('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
          id="nav-brand-btn"
        >
          <div className="w-9 h-9 rounded-lg bg-[#1b382b] text-[#fbf9f3] flex items-center justify-center shadow-sm group-hover:bg-[#284d3d] transition-colors">
            <Compass className="w-5 h-5 text-[#dfd4be]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg tracking-tight text-[#122419]">OUTSIDE//OS</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#4a6b53]/15 text-[#284d3d] font-semibold">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#608269] -mt-0.5 hidden sm:block">Touch Grass · Local AI Engine</p>
          </div>
        </button>

        {/* Navigation items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {activeSessionActive && (
            <button
              onClick={() => setScreen('expedition')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#c86432] text-white hover:bg-[#b24f1b] animate-pulse shadow-sm"
              id="nav-resume-expedition-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Quest</span>
            </button>
          )}

          <button
            onClick={() => setScreen('builder')}
            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              currentScreen === 'builder'
                ? 'bg-[#1b382b] text-[#fbf9f3]'
                : 'text-[#284d3d] hover:bg-[#ede6d6]'
            }`}
            id="nav-builder-btn"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">Adventure Builder</span>
          </button>

          <button
            onClick={() => setScreen('journal')}
            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              currentScreen === 'journal'
                ? 'bg-[#1b382b] text-[#fbf9f3]'
                : 'text-[#284d3d] hover:bg-[#ede6d6]'
            }`}
            id="nav-journal-btn"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Field Journal</span>
          </button>

          <button
            onClick={() => setScreen('dashboard')}
            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              currentScreen === 'dashboard'
                ? 'bg-[#1b382b] text-[#fbf9f3]'
                : 'text-[#284d3d] hover:bg-[#ede6d6]'
            }`}
            id="nav-dashboard-btn"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">Exploration Log</span>
          </button>

          <button
            onClick={() => setScreen('library')}
            className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              currentScreen === 'library'
                ? 'bg-[#1b382b] text-[#fbf9f3]'
                : 'text-[#284d3d] hover:bg-[#ede6d6]'
            }`}
            id="nav-library-btn"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Packs & Settings</span>
          </button>
        </nav>

        {/* Live Model Status Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${
              isModelLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
            title={modelStatus?.status_message || 'Inference Status'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isModelLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-medium">
              {isModelLive
                ? `Ollama: ${modelStatus?.active_model}`
                : 'Offline Field Library'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
