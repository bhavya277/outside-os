import React, { useState } from 'react';
import { CheckCircle2, Camera, Upload, ArrowRight, Heart, Sparkles, AlertCircle, X } from 'lucide-react';
import { ActiveSession, JournalEntry } from '../types';

interface ReturnReflectProps {
  session: ActiveSession;
  elapsedMinutes: number;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
}

export const ReturnReflectScreen: React.FC<ReturnReflectProps> = ({
  session,
  elapsedMinutes,
  onSave,
  onCancel,
}) => {
  const [selfReportedMins, setSelfReportedMins] = useState<number>(Math.max(1, elapsedMinutes));
  const [completionStatus, setCompletionStatus] = useState<'full' | 'partial' | 'curtailed'>(
    session.checkedItems.length >= session.quest.checklist.length ? 'full' : 'partial'
  );
  const [checkedItems, setCheckedItems] = useState<string[]>(session.checkedItems);
  const [observations, setObservations] = useState<string>('');
  const [reflectionResponse, setReflectionResponse] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(['outside', session.quest.environment]);
  const [tagInput, setTagInput] = useState<string>('');

  const toggleCheckItem = (item: string) => {
    if (checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter((i) => i !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSave = () => {
    const entry: JournalEntry = {
      id: `entry_${Date.now()}`,
      quest_id: session.quest.id,
      quest_title: session.quest.title,
      quest_objective: session.quest.objective,
      environment: session.quest.environment,
      activity_types: [session.quest.energy_level, session.quest.difficulty],
      completion_status: completionStatus,
      started_at: session.startedAt,
      completed_at: new Date().toISOString(),
      self_reported_duration_minutes: selfReportedMins,
      checked_items: checkedItems,
      checklist_total: session.quest.checklist.length,
      observations: observations.trim(),
      reflection_response: reflectionResponse.trim(),
      photo_data_url: photoDataUrl || undefined,
      provenance: session.quest.provenance,
      tags: tags,
    };

    onSave(entry);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 sm:pb-12">
      <div className="pb-5 border-b border-[#e2dac2]">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#c86432] font-bold">
          Screen 5 // Field Reflection
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f241a] mt-1">
          Welcome Back to Your Field Journal
        </h1>
        <p className="text-xs text-[#4e6556] mt-1">
          Record your genuine discoveries. Partial exploration is celebrated; no proof or surveillance required.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* Expedition Summary header */}
        <div className="field-card rounded-2xl p-6">
          <span className="text-[11px] font-mono uppercase text-[#608269] block">Completed Quest</span>
          <h2 className="font-serif text-xl font-bold text-[#122419] mt-0.5">{session.quest.title}</h2>
          <p className="text-xs font-serif italic text-[#284d3d] mt-1">"{session.quest.objective}"</p>
        </div>

        {/* 1. Self-Reported Duration */}
        <div className="field-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[#122419]">Self-Reported Outdoor Duration</h3>
            <span className="font-mono text-base font-bold text-[#c86432]">{selfReportedMins} minutes</span>
          </div>
          <p className="text-[11px] text-[#608269] mb-4">
            Based on active timestamp calculation (~{elapsedMinutes} mins recorded). Adjust if your excursion differed.
          </p>
          <input
            type="range"
            min={1}
            max={120}
            value={selfReportedMins}
            onChange={(e) => setSelfReportedMins(parseInt(e.target.value, 10))}
            className="w-full accent-[#c86432] cursor-pointer"
            id="reflect-duration-slider"
          />
        </div>

        {/* 2. Completion Status */}
        <div className="field-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#122419] mb-3">Expedition Outcome</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'full', label: 'Full Expedition', desc: 'Explored objectives thoroughly' },
              { id: 'partial', label: 'Partial Journey', desc: 'Accomplished parts of the route' },
              { id: 'curtailed', label: 'Curtailed Early', desc: 'Weather or conditions changed' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setCompletionStatus(st.id as any)}
                className={`p-3 rounded-xl text-left border transition-all text-xs ${
                  completionStatus === st.id
                    ? 'bg-[#1b382b] text-white border-[#1b382b] shadow-sm'
                    : 'bg-[#f5f0e6] text-[#284d3d] border-[#dfd4be] hover:bg-[#ede6d6]'
                }`}
                id={`reflect-status-${st.id}`}
              >
                <p className="font-semibold">{st.label}</p>
                <p className={`text-[10px] mt-0.5 ${completionStatus === st.id ? 'text-[#dfd4be]' : 'text-[#608269]'}`}>
                  {st.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Confirmed Checklist Observations */}
        <div className="field-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#122419] mb-1">What did you encounter or complete?</h3>
          <p className="text-[11px] text-[#608269] mb-4">Tap items that you verified in the physical world.</p>
          <div className="space-y-2">
            {session.quest.checklist.map((item, idx) => {
              const isChecked = checkedItems.includes(item);
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheckItem(item)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-white border-[#e2dac2] text-[#4e6556]'
                  }`}
                  id={`reflect-check-${idx}`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${isChecked ? 'text-emerald-700' : 'text-[#a3beab]'}`}
                  />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Reflection Prompt */}
        <div className="field-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#122419] mb-1">Quest Reflection Prompt</h3>
          <p className="text-xs font-serif italic text-[#c86432] mb-3">"{session.quest.reflection_question}"</p>
          <textarea
            rows={3}
            value={reflectionResponse}
            onChange={(e) => setReflectionResponse(e.target.value)}
            placeholder="Share what caught your attention or how your perspective shifted..."
            className="w-full p-3 rounded-xl border border-[#dfd4be] text-xs focus:ring-2 focus:ring-[#c86432] bg-[#fdfcf9]"
            id="reflect-reflection-input"
          />
        </div>

        {/* 5. Field Notes & Optional Photo */}
        <div className="field-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-[#122419] mb-1">Field Notes & Optional Photo</h3>
          <p className="text-[11px] text-[#608269] mb-3">
            Stored locally on your device. Never transmitted over the cloud.
          </p>
          <textarea
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Log sensory details, species shapes, sunlight warmth, quiet moments..."
            className="w-full p-3 rounded-xl border border-[#dfd4be] text-xs focus:ring-2 focus:ring-[#c86432] bg-[#fdfcf9] mb-4"
            id="reflect-observations-input"
          />

          {/* Photo attachment */}
          {photoDataUrl ? (
            <div className="relative inline-block border rounded-xl overflow-hidden shadow-sm">
              <img src={photoDataUrl} alt="Field observation" className="max-h-48 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setPhotoDataUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                id="reflect-remove-photo-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#c86432]/60 bg-[#fdfcf9] text-xs font-medium text-[#c86432] hover:bg-[#ede6d6] cursor-pointer">
              <Camera className="w-4 h-4" />
              <span>Attach Optional Field Photo (Local Only)</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="reflect-photo-upload" />
            </label>
          )}

          {/* Tag pills */}
          <div className="mt-6 pt-4 border-t border-[#f0ead8]">
            <label className="block text-xs font-semibold text-[#122419] mb-2">Notebook Tags (Press Enter):</label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ede6d6] text-[11px] font-mono text-[#284d3d]"
                >
                  #{t}
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    <X className="w-3 h-3 text-[#608269] hover:text-black" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag..."
                className="px-2.5 py-1 rounded-lg border border-[#dfd4be] text-xs bg-white w-28 focus:w-40 transition-all font-mono"
                id="reflect-tag-input"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-[#dfd4be] text-xs font-semibold text-[#4e6556] hover:bg-[#ede6d6] text-center"
            id="reflect-cancel-btn"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-3.5 rounded-xl bg-[#1b382b] text-white text-sm font-semibold hover:bg-[#284d3d] flex items-center justify-center gap-2 shadow-field"
            id="reflect-save-btn"
          >
            <span>Save to Field Journal</span>
            <ArrowRight className="w-4 h-4 text-[#c86432]" />
          </button>
        </div>
      </div>
    </div>
  );
};
