import React from 'react';
import { Compass, Clock, Zap, Shield, ArrowRight, RotateCw, Edit3, Bookmark, AlertTriangle, CheckCircle2, Sparkles, Feather } from 'lucide-react';
import { Quest } from '../types';

interface GeneratedQuestProps {
  quest: Quest;
  onAccept: () => void;
  onRegenerate: () => void;
  onModify: () => void;
  onSaveLater: () => void;
  isSaved?: boolean;
}

export const GeneratedQuestScreen: React.FC<GeneratedQuestProps> = ({
  quest,
  onAccept,
  onRegenerate,
  onModify,
  onSaveLater,
  isSaved = false,
}) => {
  const isFromAI = quest.provenance.startsWith('ollama:');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top provenance & action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2dac2] gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold">Screen 3 // Field Card</span>
          <span className="text-gray-300">·</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
              isFromAI
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {isFromAI ? `Generated via ${quest.provenance}` : `Verified via ${quest.provenance}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onModify}
            className="px-3 py-1.5 rounded-lg border border-[#dfd4be] bg-white text-[#1b382b] hover:bg-[#ede6d6] flex items-center gap-1.5 font-medium transition-colors"
            id="quest-modify-btn"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#608269]" />
            <span>Modify</span>
          </button>
          <button
            onClick={onRegenerate}
            className="px-3 py-1.5 rounded-lg border border-[#dfd4be] bg-white text-[#1b382b] hover:bg-[#ede6d6] flex items-center gap-1.5 font-medium transition-colors"
            id="quest-regenerate-btn"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#608269]" />
            <span>Regenerate</span>
          </button>
          <button
            onClick={onSaveLater}
            className={`px-3 py-1.5 rounded-lg border border-[#dfd4be] flex items-center gap-1.5 font-medium transition-colors ${
              isSaved ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-[#1b382b] hover:bg-[#ede6d6]'
            }`}
            id="quest-save-later-btn"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#c86432]" />
            <span>{isSaved ? 'Saved' : 'Save for Later'}</span>
          </button>
        </div>
      </div>

      {/* Structured Field Card */}
      <div className="mt-6 field-card rounded-3xl p-6 sm:p-10 shadow-field-lg">
        {/* Card Header */}
        <div className="border-b border-[#f0ead8] pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-md bg-[#1b382b] text-[#dfd4be] text-xs font-mono font-semibold uppercase">
              {quest.environment}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#ede6d6] text-[#284d3d] text-xs font-medium capitalize">
              {quest.difficulty} Difficulty
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-[#608269] px-2 py-1">
              <Clock className="w-3.5 h-3.5 text-[#c86432]" />
              {quest.duration_minutes} min
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-[#608269] px-2 py-1">
              <Zap className="w-3.5 h-3.5 text-[#c86432]" />
              {quest.energy_level} energy
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f241a] leading-tight tracking-tight">
            {quest.title}
          </h1>

          <p className="mt-3 text-base sm:text-lg font-serif italic text-[#284d3d]">
            "{quest.objective}"
          </p>

          <p className="mt-2 text-xs text-[#608269] bg-[#fbf9f3] p-3 rounded-xl border border-[#ede6d6]">
            <span className="font-semibold text-[#1b382b]">Why this suits you:</span> {quest.suitability_reason}
          </p>
        </div>

        {/* Action Steps */}
        <div className="py-6 border-b border-[#f0ead8]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold mb-4">
            Expedition Protocol ({quest.steps.length} Steps)
          </h2>
          <div className="space-y-3">
            {quest.steps.map((st) => (
              <div
                key={st.step_number}
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#fdfcf9] border border-[#f0ead8]"
              >
                <div className="w-6 h-6 rounded-full bg-[#1b382b] text-[#fbf9f3] text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {st.step_number}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#122419]">{st.instruction}</p>
                  {st.detail && <p className="text-xs text-[#608269] mt-0.5">{st.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist & Bonus Challenge */}
        <div className="py-6 border-b border-[#f0ead8] grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold mb-3">
              Field Checklist (To Notice / Record)
            </h2>
            <ul className="space-y-2">
              {quest.checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#284d3d]">
                  <CheckCircle2 className="w-4 h-4 text-[#4a6b53] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            {quest.bonus_challenge && (
              <div className="p-4 rounded-xl bg-[#fbf9f3] border border-[#dfd4be]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#c86432] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bonus Challenge</span>
                </div>
                <p className="text-xs text-[#122419]">{quest.bonus_challenge}</p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                <span>Safe Alternative (If Conditions Change)</span>
              </div>
              <p className="text-xs text-amber-950">{quest.safe_alternative}</p>
            </div>
          </div>
        </div>

        {/* Safety & Reflection */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#4e6556]">
          <div>
            <h3 className="font-semibold text-[#122419] flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Environmental & Physical Safety</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              {quest.safety_notes.map((sn, idx) => (
                <li key={idx}>{sn}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-[#122419] mb-1">Completion Criteria</h3>
            <p className="text-[11px] mb-3">{quest.completion_criteria}</p>

            <h3 className="font-semibold text-[#122419] mb-1">Post-Expedition Reflection Prompt</h3>
            <p className="text-[11px] italic bg-[#f5f0e6] p-2 rounded-lg">"{quest.reflection_question}"</p>
          </div>
        </div>

        {/* Primary Accept Action */}
        <div className="mt-8 pt-6 border-t border-[#f0ead8]">
          <button
            onClick={onAccept}
            className="w-full py-4 rounded-2xl bg-[#1b382b] text-[#fbf9f3] text-base font-semibold hover:bg-[#284d3d] transition-all shadow-field flex items-center justify-center gap-3 group"
            id="quest-accept-btn"
          >
            <Compass className="w-5 h-5 text-[#dfd4be] group-hover:rotate-45 transition-transform" />
            <span>Accept Quest & Enter Expedition Mode</span>
            <ArrowRight className="w-4 h-4 text-[#c86432] group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center text-[11px] text-[#608269] mt-2">
            The app will transition into minimal Pocket Mode. No screen monitoring needed.
          </p>
        </div>
      </div>
    </div>
  );
};
