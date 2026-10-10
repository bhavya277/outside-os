import React from 'react';
import { Compass, Clock, Zap, CheckCircle, Flame, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { JournalStats, ScreenType } from '../types';

interface DashboardScreenProps {
  stats: JournalStats;
  setScreen: (screen: ScreenType) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ stats, setScreen }) => {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-12">
      {/* Header */}
      <div className="pb-5 border-b border-[#e2dac2]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#c86432] font-bold">
          Screen 7 // Exploration Log
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f241a] mt-1">Real-World Exploration Metrics</h1>
        <p className="text-xs text-[#4e6556] mt-1">
          Honest, non-compulsive outdoor metrics derived strictly from your verified local SQLite records.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="field-card rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-mono text-[#608269] mb-2">
            <span>EXPEDITIONS</span>
            <CheckCircle className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-3xl font-mono font-bold text-[#0f241a]">
            {stats.total_quests_completed}
          </div>
          <p className="text-[11px] text-[#608269] mt-1">Completed quests recorded</p>
        </div>

        <div className="field-card rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-mono text-[#608269] mb-2">
            <span>TIME OUTDOORS</span>
            <Clock className="w-4 h-4 text-[#c86432]" />
          </div>
          <div className="text-3xl font-mono font-bold text-[#0f241a]">
            {stats.total_self_reported_minutes}
            <span className="text-sm font-sans font-normal text-[#608269] ml-1">min</span>
          </div>
          <p className="text-[11px] text-[#608269] mt-1">Accurately self-reported</p>
        </div>

        <div className="field-card rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-mono text-[#608269] mb-2">
            <span>ACTIVITY MODES</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-mono font-bold text-[#0f241a]">
            {stats.distinct_activity_types.length}
          </div>
          <p className="text-[11px] text-[#608269] mt-1">Unique sensory modes</p>
        </div>

        <div className="field-card rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs font-mono text-[#608269] mb-2">
            <span>CONSECUTIVE DAYS</span>
            <Flame className="w-4 h-4 text-[#c86432]" />
          </div>
          <div className="text-3xl font-mono font-bold text-[#0f241a]">
            {stats.calculated_streak_days}
            <span className="text-sm font-sans font-normal text-[#608269] ml-1">days</span>
          </div>
          <p className="text-[11px] text-[#608269] mt-1">Calm metric, zero streak pressure</p>
        </div>
      </div>

      {/* Activity Diversity & Discoveries */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Diversity */}
        <div className="field-card rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold text-[#122419] mb-1">Sensory Horizons Explored</h2>
          <p className="text-xs text-[#4e6556] mb-4">
            Breadth of observational modes recorded in your local notebook.
          </p>

          {stats.distinct_activity_types.length === 0 ? (
            <p className="text-xs text-[#8fa797] italic p-4 bg-[#fdfcf9] rounded-xl text-center">
              No expeditions recorded yet. Complete an adventure to map your sensory range.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.distinct_activity_types.map((act) => (
                <span
                  key={act}
                  className="px-3 py-1.5 rounded-xl bg-[#ede6d6] text-xs font-medium text-[#284d3d] capitalize"
                >
                  {act}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Recent Field Discoveries */}
        <div className="field-card rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold text-[#122419] mb-1">Recent Field Notes</h2>
          <p className="text-xs text-[#4e6556] mb-4">Snippets of recent physical observations.</p>

          {stats.recent_discoveries.length === 0 ? (
            <p className="text-xs text-[#8fa797] italic p-4 bg-[#fdfcf9] rounded-xl text-center">
              No observation notes yet. After your next walk, record a brief note in your journal.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {stats.recent_discoveries.map((disc, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#fdfcf9] border border-[#f0ead8] text-xs text-[#284d3d] italic"
                >
                  {disc}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ethical Tech / Non-Compulsive Design Guarantee */}
      <div className="mt-8 p-6 rounded-2xl bg-white border border-[#dfd4be] flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-[#1b382b]/10 text-[#1b382b] shrink-0 mt-0.5">
          <Shield className="w-5 h-5 text-[#c86432]" />
        </div>
        <div>
          <h3 className="font-serif text-sm font-bold text-[#0f241a]">
            Non-Compulsive Design Philosophy
          </h3>
          <p className="text-xs text-[#4e6556] mt-1 leading-relaxed">
            OUTSIDE//OS will never send you push notifications shaming you for missing a streak, 
            nor will it gamify your outdoor time with fake levels or badges. Outdoor exploration is 
            its own reward. Return when you need to step away from screens.
          </p>
        </div>
      </div>
    </div>
  );
};
