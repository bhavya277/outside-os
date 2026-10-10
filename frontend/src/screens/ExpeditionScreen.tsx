import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckSquare, Square as UncheckedSquare, Moon, Sun, ArrowLeft, CheckCircle, Smartphone, Bell, BellOff, Volume2 } from 'lucide-react';
import { ActiveSession } from '../types';
import { chimeService, ChimeMode } from '../services/chimeService';

interface ExpeditionScreenProps {
  session: ActiveSession;
  onUpdateSession: (updated: ActiveSession) => void;
  onFinish: () => void;
  onAbandon: () => void;
}

export const ExpeditionScreen: React.FC<ExpeditionScreenProps> = ({
  session,
  onUpdateSession,
  onFinish,
  onAbandon,
}) => {
  const [pocketMode, setPocketMode] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [chimeMode, setChimeMode] = useState<ChimeMode>(() => {
    try {
      const saved = localStorage.getItem('outside_os_chime_mode');
      return (saved as ChimeMode) || 'milestones';
    } catch {
      return 'milestones';
    }
  });
  const triggeredMilestonesRef = useRef<Set<string>>(new Set());

  // Real elapsed time calculated via timestamp differences
  useEffect(() => {
    const timer = setInterval(() => {
      if (!session.isPaused) {
        setCurrentTime(Date.now());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [session.isPaused]);

  // Calculate elapsed active seconds from timestamps
  const calculateElapsedSeconds = (): number => {
    if (session.isPaused) {
      return session.accumulatedElapsedSeconds;
    }
    const currentRun = Math.floor((currentTime - session.startTimestamp) / 1000);
    return Math.max(0, session.accumulatedElapsedSeconds + currentRun);
  };

  const elapsedSeconds = calculateElapsedSeconds();
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const targetSeconds = (session.quest.duration_minutes || 15) * 60;
  const halfwaySeconds = Math.floor(targetSeconds / 2);

  // Monitor elapsed time and trigger peaceful audio singing bowl chimes at milestones
  useEffect(() => {
    if (session.isPaused || chimeMode === 'off') return;

    // 1. Halfway mark
    if (elapsedSeconds >= halfwaySeconds && elapsedSeconds < halfwaySeconds + 5 && !triggeredMilestonesRef.current.has('halfway')) {
      triggeredMilestonesRef.current.add('halfway');
      chimeService.playMilestoneChime();
    }

    // 2. Target completion mark
    if (elapsedSeconds >= targetSeconds && elapsedSeconds < targetSeconds + 5 && !triggeredMilestonesRef.current.has('complete')) {
      triggeredMilestonesRef.current.add('complete');
      chimeService.playCompletionChime();
    }

    // 3. Periodic interval chime (every 5min or 10min)
    if (chimeMode === '5min' || chimeMode === '10min') {
      const intervalSec = chimeMode === '5min' ? 300 : 600;
      const intervalIndex = Math.floor(elapsedSeconds / intervalSec);
      const intervalKey = `interval-${intervalSec}-${intervalIndex}`;
      if (intervalIndex > 0 && elapsedSeconds % intervalSec < 4 && !triggeredMilestonesRef.current.has(intervalKey)) {
        triggeredMilestonesRef.current.add(intervalKey);
        chimeService.playMilestoneChime();
      }
    }
  }, [elapsedSeconds, session.isPaused, chimeMode, halfwaySeconds, targetSeconds]);

  const cycleChimeMode = () => {
    chimeService.unlock();
    const modes: ChimeMode[] = ['milestones', '5min', '10min', 'off'];
    const nextIdx = (modes.indexOf(chimeMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setChimeMode(nextMode);
    try {
      localStorage.setItem('outside_os_chime_mode', nextMode);
    } catch {}
    if (nextMode !== 'off') {
      chimeService.playPreviewChime();
    } else {
      triggerHaptic(20);
    }
  };

  const getChimeModeLabel = (mode: ChimeMode): string => {
    switch (mode) {
      case 'milestones':
        return 'Halfway & Finish';
      case '5min':
        return 'Every 5m';
      case '10min':
        return 'Every 10m';
      case 'off':
        return 'Muted';
    }
  };

  const handleEnterPocketMode = () => {
    triggerHaptic(30);
    chimeService.unlock();
    setPocketMode(true);
  };

  // Request Screen WakeLock so phone doesn't sleep while reading instructions outdoors
  useEffect(() => {
    let wakeLockSentinel: any = null;
    if ('wakeLock' in navigator && !pocketMode && !session.isPaused) {
      (navigator as any).wakeLock
        ?.request('screen')
        .then((lock: any) => {
          wakeLockSentinel = lock;
        })
        .catch(() => {});
    }
    return () => {
      wakeLockSentinel?.release().catch(() => {});
    };
  }, [pocketMode, session.isPaused]);

  // Haptic feedback helper for mobile devices
  const triggerHaptic = (ms: number = 25) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch {
      // Ignore on devices without vibration support
    }
  };

  const handleTogglePause = () => {
    triggerHaptic(30);
    if (!session.isPaused) {
      // Pause
      const additional = Math.floor((Date.now() - session.startTimestamp) / 1000);
      onUpdateSession({
        ...session,
        isPaused: true,
        pausedAt: Date.now(),
        accumulatedElapsedSeconds: session.accumulatedElapsedSeconds + Math.max(0, additional),
      });
    } else {
      // Resume
      onUpdateSession({
        ...session,
        isPaused: false,
        startTimestamp: Date.now(),
        pausedAt: undefined,
      });
    }
  };

  const handleToggleCheckItem = (itemText: string) => {
    triggerHaptic(25);
    const current = session.checkedItems;
    const next = current.includes(itemText)
      ? current.filter((i) => i !== itemText)
      : [...current, itemText];
    onUpdateSession({ ...session, checkedItems: next });
  };

  const handleStepToggle = (stepNumber: number) => {
    triggerHaptic(25);
    const current = session.completedSteps;
    const next = current.includes(stepNumber)
      ? current.filter((s) => s !== stepNumber)
      : [...current, stepNumber];
    onUpdateSession({ ...session, completedSteps: next });
  };

  // POCKET MODE OVERLAY — The core disappearing interface feature!
  if (pocketMode) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#070e0a] text-[#ede6d6] flex flex-col justify-between p-4 sm:p-12 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(1.5rem+env(safe-area-inset-top,0px))] cursor-pointer select-none transition-colors min-h-[100dvh]"
        onClick={() => setPocketMode(false)}
        id="pocket-mode-overlay"
      >
        <div className="flex items-center justify-between text-xs font-mono text-[#7c9e85]">
          <span>OUTSIDE//OS // POCKET MODE</span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            EXPEDITION ACTIVE
          </span>
        </div>

        <div className="text-center max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#1b382b]/60 border border-[#284d3d] mx-auto flex items-center justify-center text-[#dfd4be]">
            <Smartphone className="w-8 h-8 opacity-75" />
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#fbf9f3] leading-snug">
            Put your phone in your pocket.
          </h1>

          <p className="text-sm sm:text-base text-[#a3beab] leading-relaxed">
            The app will track elapsed time in the background. Look at the trees, listen to the air, and explore. 
            Do not look at this screen while crossing roads.
          </p>

          <div className="pt-4">
            <span className="text-xs font-mono text-[#7c9e85] uppercase tracking-wider block">Elapsed Outdoor Time</span>
            <span className="font-mono text-4xl sm:text-5xl font-bold text-[#dfd4be] tracking-wider mt-1 block">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cycleChimeMode();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b382b]/80 border border-[#284d3d] text-xs font-mono text-[#dfd4be] hover:border-[#7c9e85] active:scale-95 transition-all shadow-sm"
              id="pocket-chime-toggle-btn"
              title="Tap to cycle audio chime milestone mode"
            >
              {chimeMode !== 'off' ? (
                <Bell className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-[#7c9e85]" />
              )}
              <span>Chime: {getChimeModeLabel(chimeMode)}</span>
            </button>

            <span className="inline-block px-4 py-2 rounded-full bg-[#1b382b]/50 border border-[#284d3d] text-xs text-[#a3beab] font-mono">
              Tap anywhere to awaken controls
            </span>
          </div>
        </div>

        <div className="text-center text-[11px] text-[#608269] font-mono">
          Touch Grass · Hacktoberfest 2026
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-white text-black' : 'bg-[#fbf9f3] text-[#122419]'} pb-16`}>
      {/* Top minimal bar */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#e2dac2]">
        <button
          onClick={onAbandon}
          className="text-xs font-medium text-[#608269] hover:text-[#1b382b] flex items-center gap-1"
          id="expedition-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Expedition</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="p-2 rounded-lg border border-[#dfd4be] text-xs text-[#4e6556] hover:bg-[#ede6d6]"
            title="Toggle Outdoor Sun Contrast"
            id="expedition-contrast-toggle"
          >
            {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={handleEnterPocketMode}
            className="px-3.5 py-1.5 rounded-lg bg-[#1b382b] text-[#fbf9f3] text-xs font-semibold hover:bg-[#284d3d] flex items-center gap-1.5 shadow-sm"
            id="expedition-pocket-mode-btn"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#dfd4be]" />
            <span>Pocket Mode</span>
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Timer & State Card */}
        <div className="text-center bg-white p-6 rounded-3xl border border-[#e2dac2] shadow-sm">
          <span className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold">
            Elapsed Outdoor Time
          </span>
          <div className="text-5xl sm:text-6xl font-mono font-bold text-[#0f241a] my-2 tracking-tight">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-xs text-[#608269]">
            Target: {session.quest.duration_minutes} minutes ({session.quest.environment})
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
            <button
              onClick={handleTogglePause}
              className="px-4 py-2.5 rounded-xl border border-[#dfd4be] text-xs font-semibold text-[#1b382b] hover:bg-[#ede6d6] flex items-center justify-center gap-2"
              id="expedition-pause-btn"
            >
              {session.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Resume Timer</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pause Timer</span>
                </>
              )}
            </button>

            <button
              onClick={handleEnterPocketMode}
              className="px-4 py-2.5 rounded-xl bg-[#c86432] text-white text-xs font-semibold hover:bg-[#b24f1b] flex items-center justify-center gap-2 shadow-sm"
              id="expedition-stow-phone-btn"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Stow Phone Away (Pocket Mode)</span>
            </button>
          </div>

          {/* Audio Chime Mode Selector Strip */}
          <div className="mt-5 pt-4 border-t border-[#f0ebd9] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center justify-between sm:justify-start gap-2 text-[#4e6556]">
              <div className="flex items-center gap-1.5">
                {chimeMode !== 'off' ? (
                  <Bell className="w-4 h-4 text-amber-600" />
                ) : (
                  <BellOff className="w-4 h-4 text-[#8fa797]" />
                )}
                <span className="font-semibold text-[#1b382b]">Pocket Chime:</span>
              </div>
              <span className="text-[#608269] font-mono text-[11px] bg-[#ede6d6]/60 px-2 py-0.5 rounded sm:bg-transparent sm:p-0">
                {getChimeModeLabel(chimeMode)}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:flex items-center gap-1.5">
              {(['milestones', '5min', '10min', 'off'] as ChimeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    chimeService.unlock();
                    setChimeMode(mode);
                    try {
                      localStorage.setItem('outside_os_chime_mode', mode);
                    } catch {}
                    if (mode !== 'off') chimeService.playPreviewChime();
                  }}
                  className={`py-1.5 px-1.5 sm:px-2.5 rounded-lg text-[10px] sm:text-[11px] font-mono transition-colors text-center ${
                    chimeMode === mode
                      ? 'bg-[#1b382b] text-[#fbf9f3] font-semibold shadow-sm'
                      : 'bg-[#ede6d6]/70 text-[#4e6556] hover:bg-[#e2dac2]'
                  }`}
                  id={`expedition-chime-mode-${mode}`}
                >
                  {mode === 'milestones' ? 'Halfway' : mode === '5min' ? '5m' : mode === '10min' ? '10m' : 'Mute'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  chimeService.unlock();
                  chimeService.playPreviewChime();
                }}
                className="col-span-4 sm:col-span-1 p-1.5 rounded-lg text-[#608269] hover:text-[#1b382b] hover:bg-[#ede6d6] flex items-center justify-center gap-1 text-[11px] border border-dashed border-[#dfd4be] sm:border-none"
                title="Preview Singing Bowl Chime"
                id="expedition-chime-preview-btn"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="sm:hidden font-mono text-[10px]">Preview Sound</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quest Title & Objective */}
        <div>
          <span className="text-[11px] font-mono text-[#608269] uppercase tracking-wider block">
            Current Objective
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f241a] mt-1 leading-tight">
            {session.quest.title}
          </h1>
          <p className="mt-2 text-base text-[#284d3d] font-serif italic">
            "{session.quest.objective}"
          </p>
        </div>

        {/* Concrete Steps Protocol */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold">
            Expedition Protocol Steps
          </h2>
          {session.quest.steps.map((st) => {
            const isCompleted = session.completedSteps.includes(st.step_number);
            return (
              <div
                key={st.step_number}
                onClick={() => handleStepToggle(st.step_number)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-[#e5ece7]/60 border-[#a3beab] text-[#3e5843]'
                    : 'bg-white border-[#e2dac2] text-[#122419]'
                }`}
                id={`expedition-step-${st.step_number}`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-[#1b382b] focus:outline-none"
                >
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <UncheckedSquare className="w-5 h-5 text-[#8fa797]" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`text-xs sm:text-sm font-semibold ${isCompleted ? 'line-through text-[#608269]' : ''}`}>
                    Step {st.step_number}: {st.instruction}
                  </p>
                  {st.detail && (
                    <p className="text-xs text-[#608269] mt-0.5">{st.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Observable Checklist */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold">
            Field Checklist (Tap when observed)
          </h2>
          <div className="space-y-2">
            {session.quest.checklist.map((item, idx) => {
              const checked = session.checkedItems.includes(item);
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleCheckItem(item)}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                    checked
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                      : 'bg-white border-[#e2dac2] text-[#122419]'
                  }`}
                  id={`expedition-check-${idx}`}
                >
                  <button type="button" className="text-[#1b382b] focus:outline-none">
                    {checked ? (
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <UncheckedSquare className="w-4 h-4 text-[#8fa797]" />
                    )}
                  </button>
                  <span className={`text-xs ${checked ? 'font-medium' : ''}`}>{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Big Return / Complete CTA */}
        <div className="pt-6">
          <button
            onClick={onFinish}
            className="w-full py-4 rounded-2xl bg-[#1b382b] text-[#fbf9f3] text-base font-semibold hover:bg-[#284d3d] transition-all shadow-field flex items-center justify-center gap-2 group"
            id="expedition-finish-btn"
          >
            <span>I Have Returned — Record Field Notes</span>
            <CheckCircle className="w-5 h-5 text-[#c86432]" />
          </button>
          <p className="text-center text-[11px] text-[#608269] mt-2">
            Record what you discovered. Partial completions are completely celebrated!
          </p>
        </div>
      </main>
    </div>
  );
};
