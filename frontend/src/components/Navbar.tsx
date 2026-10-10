import React from 'react';
import { Compass, BookOpen, BarChart3, Settings, Sparkles, Home, Cpu } from 'lucide-react';
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

  const navLinks: { id: ScreenType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'builder', label: 'Builder', icon: Compass },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'dashboard', label: 'Metrics', icon: BarChart3 },
    { id: 'library', label: 'Packs', icon: Settings },
  ];

  return (
    <>
      {/* Top Navbar for all screens */}
      <header className="sticky top-0 z-40 bg-[#fbf9f3]/95 backdrop-blur-md border-b border-[#e5dec9] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <button
            onClick={() => setScreen('home')}
            className="flex items-center gap-2 group text-left focus:outline-none shrink-0"
            id="nav-brand-btn"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1b382b] text-[#fbf9f3] flex items-center justify-center shadow-sm group-hover:bg-[#284d3d] transition-colors">
              <Compass className="w-5 h-5 text-[#dfd4be]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#122419]">
                  OUTSIDE//OS
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#4a6b53]/15 text-[#284d3d] font-semibold">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#608269] -mt-0.5 hidden xs:block">
                Touch Grass · Local AI Engine
              </p>
            </div>
          </button>

          {/* Desktop Navigation items (>= md) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#1b382b] text-[#fbf9f3] shadow-sm'
                      : 'text-[#284d3d] hover:bg-[#ede6d6]'
                  }`}
                  id={`nav-${item.id}-btn`}
                >
                  <Icon className="w-4 h-4" />
                  <span>
                    {item.id === 'builder'
                      ? 'Adventure Builder'
                      : item.id === 'journal'
                      ? 'Field Journal'
                      : item.id === 'dashboard'
                      ? 'Exploration Log'
                      : item.id === 'library'
                      ? 'Packs & Config'
                      : item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & Model Badges */}
          <div className="flex items-center gap-2">
            {/* Active Quest Alert Pill */}
            {activeSessionActive && (
              <button
                onClick={() => setScreen('expedition')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#c86432] text-white hover:bg-[#b24f1b] animate-pulse shadow-sm"
                id="nav-resume-expedition-btn"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Active Quest</span>
                <span className="sm:hidden">Active</span>
              </button>
            )}

            {/* Model Status Pill (Compact on mobile, descriptive on desktop) */}
            <div
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border text-[10px] sm:text-[11px] font-mono cursor-pointer transition-colors ${
                isModelLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
              onClick={() => setScreen('library')}
              title={modelStatus?.status_message || 'Inference Status'}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isModelLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium hidden sm:inline">
                {isModelLive
                  ? `Ollama: ${modelStatus?.active_model}`
                  : 'Offline Field Library'}
              </span>
              <span className="font-medium sm:hidden">
                {isModelLive ? 'AI Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#fbf9f3]/95 backdrop-blur-md border-t border-[#e2dac2] md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
                  isActive ? 'text-[#c86432] font-semibold' : 'text-[#4e6556] hover:text-[#122419]'
                }`}
                id={`mobile-nav-${item.id}-btn`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#c86432]/10 scale-105' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
