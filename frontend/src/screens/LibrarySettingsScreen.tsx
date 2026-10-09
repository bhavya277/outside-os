import React, { useState } from 'react';
import { Package, Shield, Cpu, Download, Trash2, CheckCircle2, AlertTriangle, RefreshCw, FileCode, ExternalLink, Moon, Eye } from 'lucide-react';
import { QuestPack, ModelStatus, QuestPackValidationResult } from '../types';
import { validateQuestPack, importQuestPack } from '../services/api';

interface LibrarySettingsProps {
  packs: QuestPack[];
  modelStatus: ModelStatus | null;
  onRefreshModelStatus: () => void;
  onExportAll: () => void;
  onClearAll: () => void;
  onSelectQuestFromPack: (quest: any) => void;
}

export const LibrarySettingsScreen: React.FC<LibrarySettingsProps> = ({
  packs,
  modelStatus,
  onRefreshModelStatus,
  onExportAll,
  onClearAll,
  onSelectQuestFromPack,
}) => {
  const [packJsonInput, setPackJsonInput] = useState<string>('');
  const [validationResult, setValidationResult] = useState<QuestPackValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleValidateJson = async () => {
    if (!packJsonInput.trim()) return;
    setIsValidating(true);
    setValidationResult(null);
    setImportMessage(null);
    try {
      const parsed = JSON.parse(packJsonInput);
      const res = await validateQuestPack(parsed);
      setValidationResult(res);
    } catch (e: any) {
      setValidationResult({
        is_valid: false,
        errors: [`Invalid JSON syntax: ${e.message}`],
        warnings: [],
        total_quests: 0,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImportPack = async () => {
    if (!packJsonInput.trim() || !validationResult?.is_valid) return;
    try {
      const parsed = JSON.parse(packJsonInput);
      const res = await importQuestPack(parsed);
      setImportMessage(res.message);
      onRefreshModelStatus();
    } catch (e: any) {
      setImportMessage(`Import failed: ${e.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-[#e2dac2]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold">
          Screen 8 // Quest Library & Architecture
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#0f241a] mt-1">Quest Packs & System Config</h1>
        <p className="text-xs text-[#4e6556] mt-1">
          Community-authored packs, local inference controls, and zero-telemetry data sovereignty.
        </p>
      </div>

      {/* 1. Starter Quest Packs */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-[#c86432]" />
          <h2 className="font-serif text-xl font-bold text-[#122419]">Curated Starter Quest Packs</h2>
        </div>
        <p className="text-xs text-[#4e6556] mb-6">
          Community packs authored to strict physical safety and non-intrusive observation standards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div key={pack.meta.id} className="field-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#608269] mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#ede6d6] text-[#284d3d] font-semibold">
                    v{pack.meta.version}
                  </span>
                  <span>{pack.quests.length} Quests</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0f241a]">{pack.meta.name}</h3>
                <p className="text-xs text-[#4e6556] mt-2 leading-relaxed">{pack.meta.description}</p>

                <div className="mt-4 pt-3 border-t border-[#f0ead8]">
                  <span className="text-[11px] font-mono text-[#c86432] block mb-1">Safety Guidelines:</span>
                  <ul className="text-[11px] text-[#608269] list-disc list-inside space-y-1">
                    {pack.meta.safety_guidelines.slice(0, 2).map((sg, idx) => (
                      <li key={idx} className="line-clamp-1">{sg}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0ead8] space-y-2">
                <span className="text-[11px] font-mono text-[#284d3d] font-semibold block">Quests inside:</span>
                {pack.quests.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => onSelectQuestFromPack(q)}
                    className="w-full text-left p-2 rounded-lg bg-[#fdfcf9] hover:bg-[#ede6d6] border border-[#f0ead8] text-xs font-medium text-[#122419] flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{q.title}</span>
                    <span className="font-mono text-[10px] text-[#608269] shrink-0 ml-1">{q.duration_minutes}m</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Community Quest Pack Schema Validator */}
      <section className="field-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <FileCode className="w-5 h-5 text-[#c86432]" />
          <h2 className="font-serif text-xl font-bold text-[#122419]">Community Pack JSON Validator</h2>
        </div>
        <p className="text-xs text-[#4e6556] mb-4">
          Open-source contributors can author new quest packs and validate them against the Pydantic/TypeScript schema.
        </p>

        <textarea
          rows={6}
          value={packJsonInput}
          onChange={(e) => setPackJsonInput(e.target.value)}
          placeholder='Paste pack JSON conforming to {"meta": {"id": "...", "name": "...", "safety_guidelines": [...]}, "quests": [...]}'
          className="w-full font-mono text-xs p-3.5 rounded-xl border border-[#dfd4be] bg-[#fdfcf9] focus:ring-2 focus:ring-[#c86432]"
          id="pack-json-input"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleValidateJson}
            disabled={isValidating || !packJsonInput.trim()}
            className="px-4 py-2 rounded-xl bg-[#1b382b] text-white text-xs font-semibold hover:bg-[#284d3d] disabled:opacity-50 flex items-center gap-1.5"
            id="pack-validate-btn"
          >
            {isValidating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Validate Schema</span>
          </button>

          {validationResult?.is_valid && (
            <button
              onClick={handleImportPack}
              className="px-4 py-2 rounded-xl bg-[#c86432] text-white text-xs font-semibold hover:bg-[#b24f1b]"
              id="pack-import-btn"
            >
              Import Into Local Library
            </button>
          )}
        </div>

        {importMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
            {importMessage}
          </div>
        )}

        {validationResult && (
          <div
            className={`mt-4 p-4 rounded-xl border text-xs ${
              validationResult.is_valid
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {validationResult.is_valid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Schema Validated Successfully ({validationResult.total_quests} quests found)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Validation Errors Detected</span>
                </>
              )}
            </div>

            {validationResult.errors.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 mt-2 text-[11px] font-mono">
                {validationResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}

            {validationResult.warnings.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 mt-2 text-[11px] text-amber-800 font-mono">
                {validationResult.warnings.map((w, idx) => (
                  <li key={idx}>Warning: {w}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* 3. Local Model Architecture & Status */}
      <section className="field-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#c86432]" />
            <h2 className="font-serif text-xl font-bold text-[#122419]">Local AI Model Adapter</h2>
          </div>
          <button
            onClick={onRefreshModelStatus}
            className="p-2 rounded-lg border border-[#dfd4be] text-xs text-[#284d3d] hover:bg-[#ede6d6] flex items-center gap-1.5"
            id="settings-refresh-model-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Daemon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-[#dfd4be]">
            <span className="font-mono text-[#608269] block mb-1">INFERENCE HOST</span>
            <span className="font-mono font-semibold text-[#122419]">{modelStatus?.base_url}</span>
            <p className="text-[11px] text-[#608269] mt-1">Default Ollama local API port</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#dfd4be]">
            <span className="font-mono text-[#608269] block mb-1">ACTIVE MODEL</span>
            <span className="font-mono font-semibold text-[#122419]">{modelStatus?.active_model}</span>
            <p className="text-[11px] text-[#608269] mt-1">{modelStatus?.license_info}</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-[#f5f0e6] border border-[#dfd4be] text-xs">
          <h3 className="font-bold text-[#122419] mb-1">How to pull a local model with Ollama:</h3>
          <p className="text-[#4e6556] mb-2 leading-relaxed">
            Run the following in your terminal to install the recommended lightweight model:
          </p>
          <div className="bg-[#1b382b] text-[#fbf9f3] font-mono text-[11px] p-2.5 rounded-lg select-all">
            ollama run gemma2:2b
          </div>
          <p className="text-[11px] text-[#608269] mt-2">
            Or use Qwen: <code className="bg-[#ede6d6] px-1.5 py-0.5 rounded text-black">ollama run qwen2.5:1.5b</code>. 
            When Ollama is not active, OUTSIDE//OS uses its verified offline field library automatically.
          </p>
        </div>
      </section>

      {/* 4. Privacy & Data Sovereignty Controls */}
      <section className="field-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-emerald-700" />
          <h2 className="font-serif text-xl font-bold text-[#122419]">Privacy & Data Sovereignty</h2>
        </div>
        <p className="text-xs text-[#4e6556] mb-6 leading-relaxed">
          OUTSIDE//OS is local-first. All journal entries, completed quests, observations, and configuration 
          live exclusively inside your machine's SQLite database (<code className="font-mono">backend/data/outside_os.db</code>).
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            onClick={onExportAll}
            className="px-5 py-3 rounded-xl bg-[#1b382b] text-white text-xs font-semibold hover:bg-[#284d3d] flex items-center justify-center gap-2"
            id="settings-export-all-btn"
          >
            <Download className="w-4 h-4 text-[#dfd4be]" />
            <span>Export Complete Data Archive (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to permanently erase all local journal records and custom packs?')) {
                onClearAll();
              }
            }}
            className="px-5 py-3 rounded-xl border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold flex items-center justify-center gap-2"
            id="settings-wipe-all-btn"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Wipe All Local Data</span>
          </button>
        </div>
      </section>
    </div>
  );
};
