import React, { useState } from 'react';
import { Compass, Sparkles, Clock, Zap, MapPin, CheckSquare, Accessibility, Users, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { QuestConfig, ModelStatus } from '../types';

interface AdventureBuilderProps {
  initialConfig?: Partial<QuestConfig>;
  onGenerate: (config: QuestConfig, preferOffline: boolean) => void;
  isLoading: boolean;
  modelStatus: ModelStatus | null;
  error?: string | null;
}

export const AdventureBuilderScreen: React.FC<AdventureBuilderProps> = ({
  initialConfig,
  onGenerate,
  isLoading,
  modelStatus,
  error,
}) => {
  const [duration, setDuration] = useState<number>(initialConfig?.duration_minutes || 15);
  const [energy, setEnergy] = useState<'low' | 'balanced' | 'high'>(initialConfig?.energy_level || 'balanced');
  const [environment, setEnvironment] = useState<string>(initialConfig?.environment || 'neighborhood');
  const [customEnv, setCustomEnv] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'gentle' | 'moderate' | 'adventurous'>(initialConfig?.difficulty || 'gentle');
  const [activities, setActivities] = useState<string[]>(
    initialConfig?.activity_preferences || ['nature observation', 'mindful exploration']
  );
  const [accessibilityNotes, setAccessibilityNotes] = useState<string>(initialConfig?.accessibility_notes || '');
  const [socialMode, setSocialMode] = useState<'solo' | 'pair' | 'group'>(initialConfig?.social_mode || 'solo');
  const [noEquipment, setNoEquipment] = useState<boolean>(
    initialConfig?.no_equipment_only !== undefined ? initialConfig.no_equipment_only : true
  );
  const [preferOffline, setPreferOffline] = useState<boolean>(false);

  const durationOptions = [10, 15, 30, 45, 60];
  const standardEnvs = ['neighborhood', 'park', 'balcony', 'garden', 'campus', 'custom'];

  const availableActivities = [
    'nature observation',
    'mindful exploration',
    'photography',
    'gardening',
    'biodiversity',
    'walking',
    'community contribution',
  ];

  const toggleActivity = (act: string) => {
    if (activities.includes(act)) {
      if (activities.length > 1) {
        setActivities(activities.filter((a) => a !== act));
      }
    } else {
      setActivities([...activities, act]);
    }
  };

  const handleSurpriseMe = () => {
    const randomDuration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
    const energies: Array<'low' | 'balanced' | 'high'> = ['low', 'balanced', 'high'];
    const randomEnergy = energies[Math.floor(Math.random() * energies.length)];
    const envOptions = ['neighborhood', 'park', 'balcony', 'garden', 'campus'];
    const randomEnv = envOptions[Math.floor(Math.random() * envOptions.length)];
    const shuffledActs = [...availableActivities].sort(() => 0.5 - Math.random());
    const randomActivities = shuffledActs.slice(0, 2);

    setDuration(randomDuration);
    setEnergy(randomEnergy);
    setEnvironment(randomEnv);
    setCustomEnv('');
    setActivities(randomActivities);
    setDifficulty(randomEnergy === 'high' ? 'moderate' : 'gentle');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEnv = environment === 'custom' ? (customEnv.trim() || 'neighborhood') : environment;

    const config: QuestConfig = {
      duration_minutes: duration,
      energy_level: energy,
      activity_preferences: activities,
      environment: finalEnv,
      difficulty,
      accessibility_notes: accessibilityNotes.trim() || undefined,
      social_mode: socialMode,
      no_equipment_only: noEquipment,
    };

    onGenerate(config, preferOffline);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#e2dac2] gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#c86432] font-bold">Screen 2 // Adventure Builder</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f241a] mt-1">Configure Your Quest DNA</h1>
          <p className="text-xs text-[#4e6556] mt-1">
            Input your real-world parameters. Our local AI engine generates concrete steps tailored to physical reality.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSurpriseMe}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#dfd4be] text-xs font-semibold text-[#1b382b] hover:bg-[#ede6d6] shadow-sm transition-colors w-full sm:w-auto"
          id="builder-surprise-me-btn"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c86432]" />
          <span>Surprise Me</span>
        </button>
      </div>

      {error && (
        <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
        {/* 1. Available Time */}
        <div className="field-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#c86432]" />
            <h2 className="text-sm font-bold text-[#122419]">Available Time (Minutes)</h2>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
            {durationOptions.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDuration(mins)}
                className={`py-2.5 sm:py-3 px-1 rounded-xl text-center text-xs font-semibold transition-all ${
                  duration === mins
                    ? 'bg-[#1b382b] text-white shadow-md ring-2 ring-[#c86432]/50'
                    : 'bg-[#f5f0e6] text-[#284d3d] hover:bg-[#ede6d6]'
                }`}
                id={`builder-duration-${mins}`}
              >
                <span className="text-sm sm:text-base font-bold font-mono">{mins}</span>
                <span className="block text-[10px] text-opacity-80">min</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Energy Level & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Energy */}
          <div className="field-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#c86432]" />
              <h2 className="text-sm font-bold text-[#122419]">Current Energy Level</h2>
            </div>
            <div className="space-y-2">
              {(
                [
                  { id: 'low', label: 'Low Energy', sub: 'Gentle, stationary, sensory stillness' },
                  { id: 'balanced', label: 'Balanced', sub: 'Measured pace, light wandering' },
                  { id: 'high', label: 'High Energy', sub: 'Dynamic exploration, active perimeter search' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setEnergy(lvl.id)}
                  className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-start justify-between ${
                    energy === lvl.id
                      ? 'bg-[#1b382b] text-white shadow-sm ring-1 ring-[#c86432]'
                      : 'bg-[#f5f0e6] text-[#122419] hover:bg-[#ede6d6]'
                  }`}
                  id={`builder-energy-${lvl.id}`}
                >
                  <div>
                    <p className="font-semibold">{lvl.label}</p>
                    <p className={`text-[11px] mt-0.5 ${energy === lvl.id ? 'text-[#dfd4be]' : 'text-[#608269]'}`}>
                      {lvl.sub}
                    </p>
                  </div>
                  {energy === lvl.id && <span className="w-2 h-2 rounded-full bg-[#c86432] mt-1.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="field-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-[#c86432]" />
              <h2 className="text-sm font-bold text-[#122419]">Quest Difficulty</h2>
            </div>
            <div className="space-y-2">
              {(
                [
                  { id: 'gentle', label: 'Gentle', sub: 'High accessibility, simple observation' },
                  { id: 'moderate', label: 'Moderate', sub: 'Curated challenges, micro-investigation' },
                  { id: 'adventurous', label: 'Adventurous', sub: 'Broader search criteria, novel perspectives' },
                ] as const
              ).map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-start justify-between ${
                    difficulty === diff.id
                      ? 'bg-[#1b382b] text-white shadow-sm ring-1 ring-[#c86432]'
                      : 'bg-[#f5f0e6] text-[#122419] hover:bg-[#ede6d6]'
                  }`}
                  id={`builder-diff-${diff.id}`}
                >
                  <div>
                    <p className="font-semibold">{diff.label}</p>
                    <p className={`text-[11px] mt-0.5 ${difficulty === diff.id ? 'text-[#dfd4be]' : 'text-[#608269]'}`}>
                      {diff.sub}
                    </p>
                  </div>
                  {difficulty === diff.id && <span className="w-2 h-2 rounded-full bg-[#c86432] mt-1.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Environment */}
        <div className="field-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[#c86432]" />
            <h2 className="text-sm font-bold text-[#122419]">Immediate Surroundings</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {standardEnvs.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setEnvironment(env)}
                className={`p-3 rounded-xl text-center text-xs font-semibold capitalize transition-all ${
                  environment === env
                    ? 'bg-[#1b382b] text-white shadow-sm ring-1 ring-[#c86432]'
                    : 'bg-[#f5f0e6] text-[#284d3d] hover:bg-[#ede6d6]'
                }`}
                id={`builder-env-${env}`}
              >
                {env}
              </button>
            ))}
          </div>
          {environment === 'custom' && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#122419] mb-1">
                Describe your safe immediate surroundings:
              </label>
              <input
                type="text"
                value={customEnv}
                onChange={(e) => setCustomEnv(e.target.value)}
                placeholder="e.g., quiet alleyway, rooftop patio, apartment courtyard"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfd4be] text-xs focus:ring-2 focus:ring-[#c86432] bg-[#fdfcf9]"
                id="builder-custom-env-input"
              />
            </div>
          )}
        </div>

        {/* 4. Activity Preferences */}
        <div className="field-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#c86432]" />
              <h2 className="text-sm font-bold text-[#122419]">Activity Preferences</h2>
            </div>
            <span className="text-[11px] text-[#608269] font-mono">Select at least one</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableActivities.map((act) => {
              const isSelected = activities.includes(act);
              return (
                <button
                  key={act}
                  type="button"
                  onClick={() => toggleActivity(act)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                    isSelected
                      ? 'bg-[#284d3d] text-white shadow-sm ring-1 ring-[#c86432]'
                      : 'bg-[#f5f0e6] text-[#284d3d] hover:bg-[#ede6d6]'
                  }`}
                  id={`builder-act-${act.replace(/\s+/g, '-')}`}
                >
                  {act}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Accessibility & Inclusivity */}
        <div className="field-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Accessibility className="w-4 h-4 text-[#c86432]" />
            <h2 className="text-sm font-bold text-[#122419]">Physical Limitations & Accessibility (Optional)</h2>
          </div>
          <p className="text-[11px] text-[#4e6556] mb-3">
            Outdoor quests must be safe and achievable. Add any specific needs (e.g. step-free route, wheelchair access, stationary seated, no bright sunlight).
          </p>
          <input
            type="text"
            value={accessibilityNotes}
            onChange={(e) => setAccessibilityNotes(e.target.value)}
            placeholder="e.g. Wheelchair accessible, avoid steep stairs, stationary observation preferred"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#dfd4be] text-xs focus:ring-2 focus:ring-[#c86432] bg-[#fdfcf9]"
            id="builder-accessibility-input"
          />
        </div>

        {/* 6. Settings toggles: Social mode & No Equipment filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#e2dac2] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-4 h-4 text-[#608269]" />
              <span className="font-semibold text-[#122419]">Social Mode:</span>
            </div>
            <div className="flex items-center gap-1">
              {(['solo', 'pair', 'group'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSocialMode(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize font-medium ${
                    socialMode === m ? 'bg-[#1b382b] text-white' : 'bg-[#ede6d6] text-[#284d3d]'
                  }`}
                  id={`builder-social-${m}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#e2dac2] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#122419]">Zero Equipment Filter</p>
              <p className="text-[11px] text-[#608269]">Only quests requiring zero gear</p>
            </div>
            <button
              type="button"
              onClick={() => setNoEquipment(!noEquipment)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                noEquipment ? 'bg-[#284d3d]' : 'bg-[#dfd4be]'
              }`}
              id="builder-no-equipment-toggle"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  noEquipment ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 7. Inference Mode Selection (Ollama vs Offline) */}
        <div className="p-4 rounded-xl bg-[#f5f0e6] border border-[#dfd4be] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${modelStatus?.ollama_available ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[#122419] font-medium">
              Inference Source: {preferOffline ? 'Offline Field Library' : (modelStatus?.ollama_available ? `Local Ollama (${modelStatus.active_model})` : 'Offline Field Library')}
            </span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-[#284d3d]">
            <input
              type="checkbox"
              checked={preferOffline}
              onChange={(e) => setPreferOffline(e.target.checked)}
              className="rounded text-[#c86432] focus:ring-[#c86432]"
              id="builder-force-offline-toggle"
            />
            <span>Force Offline Mode</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-[#1b382b] text-[#fbf9f3] text-sm sm:text-base font-semibold hover:bg-[#284d3d] transition-all shadow-field flex items-center justify-center gap-2.5 sm:gap-3 disabled:opacity-50 min-h-[52px]"
            id="builder-generate-quest-btn"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#dfd4be]" />
                <span>Synthesizing Micro-Quest...</span>
              </>
            ) : (
              <>
                <Compass className="w-5 h-5 text-[#dfd4be]" />
                <span>Generate Outdoor Quest</span>
                <ArrowRight className="w-4 h-4 text-[#c86432]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
