import React, { useState } from 'react';
import { Search, Download, Trash2, Calendar, Clock, MapPin, Tag, FileText, CheckCircle2, ChevronRight, X, Sparkles, BookOpen } from 'lucide-react';
import { JournalEntry, ScreenType } from '../types';

interface JournalScreenProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
  onExportData: () => void;
  setScreen: (screen: ScreenType) => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({
  entries,
  onDeleteEntry,
  onExportData,
  setScreen,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(entries.flatMap((e) => [...(e.tags || []), ...(e.activity_types || [])]))
  );

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      !search ||
      e.quest_title.toLowerCase().includes(search.toLowerCase()) ||
      e.observations.toLowerCase().includes(search.toLowerCase()) ||
      e.environment.toLowerCase().includes(search.toLowerCase()) ||
      e.quest_objective.toLowerCase().includes(search.toLowerCase());

    const matchesTag =
      !selectedTag ||
      e.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase()) ||
      e.activity_types?.some((a) => a.toLowerCase() === selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  const exportAsMarkdown = (entry: JournalEntry) => {
    const md = `# OUTSIDE//OS Field Note: ${entry.quest_title}
**Date:** ${new Date(entry.completed_at).toLocaleDateString()}
**Objective:** ${entry.quest_objective}
**Environment:** ${entry.environment}
**Outdoor Duration:** ${entry.self_reported_duration_minutes} minutes
**Outcome:** ${entry.completion_status}
**Provenance:** ${entry.provenance}

## Field Checklist
${entry.checked_items.map((i) => `- [x] ${i}`).join('\n')}

## Field Observations
${entry.observations || '_No notes recorded._'}

## Reflection
${entry.reflection_response || '_No reflection recorded._'}

---
_Generated locally with OUTSIDE//OS — Touch Grass_
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field_note_${entry.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#e2dac2] gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#c86432] font-bold">
            Screen 6 // Field Journal
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f241a] mt-1">Personal Nature Memory</h1>
          <p className="text-xs text-[#4e6556] mt-1">
            Persisted locally in SQLite on this machine. Private, immutable, and exportable at any time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportData}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#dfd4be] text-xs font-semibold text-[#1b382b] hover:bg-[#ede6d6] flex items-center gap-1.5 shadow-sm transition-colors"
            id="journal-export-json-btn"
          >
            <Download className="w-3.5 h-3.5 text-[#c86432]" />
            <span>Export All JSON</span>
          </button>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8fa797] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, notes, species, or environment..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dfd4be] text-xs focus:ring-2 focus:ring-[#c86432] bg-white shadow-sm"
            id="journal-search-input"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-colors ${
                selectedTag === null ? 'bg-[#1b382b] text-white' : 'bg-white border border-[#dfd4be] text-[#284d3d]'
              }`}
            >
              All Tags
            </button>
            {allTags.slice(0, 6).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-colors ${
                  selectedTag === t ? 'bg-[#1b382b] text-white' : 'bg-white border border-[#dfd4be] text-[#284d3d]'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="mt-12 text-center p-12 field-card rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-[#ede6d6] text-[#4a6b53] mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-[#c86432]" />
          </div>
          <h2 className="font-serif text-xl font-bold text-[#122419]">
            {search || selectedTag ? 'No Matching Field Notes' : 'Your Field Journal is Empty'}
          </h2>
          <p className="text-xs text-[#4e6556] max-w-md mx-auto mt-2 leading-relaxed">
            {search || selectedTag
              ? 'Try clearing your search query or tag filters to see all recorded entries.'
              : 'Complete your first expedition to record genuine observations, leaf shapes, soundscapes, or soil checks.'}
          </p>
          <button
            onClick={() => setScreen('builder')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#1b382b] text-white text-xs font-semibold hover:bg-[#284d3d]"
            id="journal-empty-create-btn"
          >
            Start Your First Adventure
          </button>
        </div>
      ) : (
        /* Journal Entries List */
        <div className="mt-8 space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="field-card rounded-2xl p-5 hover:border-[#c86432]/50 transition-all cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
              id={`journal-card-${entry.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0ead8] pb-3 mb-3">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#608269]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#c86432]" />
                    {new Date(entry.completed_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {entry.self_reported_duration_minutes} min (self-reported)
                  </span>
                  <span>·</span>
                  <span className="capitalize px-2 py-0.5 rounded bg-[#ede6d6] text-[#284d3d] font-semibold">
                    {entry.completion_status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {entry.provenance}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="font-serif text-lg font-bold text-[#0f241a] leading-tight">
                    {entry.quest_title}
                  </h2>
                  <p className="text-xs font-serif italic text-[#38634f] mt-1">"{entry.quest_objective}"</p>

                  {entry.observations && (
                    <p className="text-xs text-[#4e6556] mt-2 line-clamp-2 bg-[#fdfcf9] p-2.5 rounded-xl border border-[#f0ead8]">
                      <span className="font-semibold text-[#122419]">Notes:</span> {entry.observations}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {entry.tags.map((tg) => (
                      <span
                        key={tg}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f5f0e6] text-[#284d3d]"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>

                {entry.photo_data_url && (
                  <img
                    src={entry.photo_data_url}
                    alt="Field observation"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#dfd4be]"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fbf9f3] max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-[#e2dac2] shadow-2xl relative">
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#ede6d6] text-[#4e6556]"
              id="journal-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-mono text-[#c86432] uppercase tracking-wider block">
              Field Journal Record // {selectedEntry.environment}
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#0f241a] mt-1">{selectedEntry.quest_title}</h2>
            <p className="text-xs italic font-serif text-[#284d3d] mt-1">"{selectedEntry.quest_objective}"</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-[#608269] pb-4 border-b border-[#e2dac2]">
              <span>Date: {new Date(selectedEntry.completed_at).toLocaleString()}</span>
              <span>·</span>
              <span>Self-Reported: {selectedEntry.self_reported_duration_minutes} min</span>
              <span>·</span>
              <span>Outcome: {selectedEntry.completion_status}</span>
            </div>

            {selectedEntry.photo_data_url && (
              <div className="mt-4">
                <img
                  src={selectedEntry.photo_data_url}
                  alt="Field observation"
                  className="w-full max-h-64 object-cover rounded-2xl border border-[#dfd4be]"
                />
              </div>
            )}

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-[#122419] mb-1">Checklist Items Verified:</h3>
                <ul className="space-y-1">
                  {selectedEntry.checked_items.map((ci, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[#284d3d]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{ci}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedEntry.observations && (
                <div>
                  <h3 className="font-bold text-[#122419] mb-1">Field Observations:</h3>
                  <p className="bg-white p-3 rounded-xl border border-[#dfd4be] text-[#3e5843] whitespace-pre-wrap">
                    {selectedEntry.observations}
                  </p>
                </div>
              )}

              {selectedEntry.reflection_response && (
                <div>
                  <h3 className="font-bold text-[#122419] mb-1">Reflection:</h3>
                  <p className="bg-[#f5f0e6] p-3 rounded-xl border border-[#dfd4be] italic text-[#122419]">
                    "{selectedEntry.reflection_response}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#e2dac2] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (confirm('Permanently delete this field note from your local database?')) {
                    onDeleteEntry(selectedEntry.id);
                    setSelectedEntry(null);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5"
                id="journal-modal-delete-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Entry</span>
              </button>

              <button
                onClick={() => exportAsMarkdown(selectedEntry)}
                className="px-4 py-2.5 rounded-xl bg-[#1b382b] text-white text-xs font-semibold hover:bg-[#284d3d] flex items-center justify-center gap-1.5"
                id="journal-modal-export-md-btn"
              >
                <FileText className="w-3.5 h-3.5 text-[#dfd4be]" />
                <span>Download Field Note (.md)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
