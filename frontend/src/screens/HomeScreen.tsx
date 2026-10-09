import React from 'react';
import { Compass, Sparkles, ShieldCheck, Cpu, ArrowRight, Eye, Footprints, Leaf, Clock, MapPin, Feather } from 'lucide-react';
import { ScreenType, ModelStatus } from '../types';

interface HomeScreenProps {
  setScreen: (screen: ScreenType) => void;
  modelStatus: ModelStatus | null;
  onSelectExampleQuest: (category: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setScreen,
  modelStatus,
  onSelectExampleQuest,
}) => {
  const isOllamaLive = modelStatus?.ollama_available && modelStatus?.model_ready;

  const exampleMissions = [
    {
      category: 'nature observation',
      title: 'Micro-Canopy Inventory',
      time: '15 min',
      env: 'Neighborhood',
      desc: 'Catalog 3 distinct leaf vascular patterns without plucking foliage.',
      icon: Leaf,
      tag: 'Zero Equipment',
    },
    {
      category: 'mindful exploration',
      title: 'Soundscape Topography',
      time: '20 min',
      env: 'Park / Bench',
      desc: 'Map acoustic thresholds from immediate breath to distant city horizons.',
      icon: Footprints,
      tag: 'Sensory Walk',
    },
    {
      category: 'gardening',
      title: 'Balcony Soil & Moisture Audit',
      time: '15 min',
      env: 'Balcony / Patio',
      desc: 'Inspect moisture depth, compacting crust, and companion node growth.',
      icon: Feather,
      tag: 'Urban Green',
    },
  ];

  return (
    <div className="min-h-screen bg-topo-pattern pb-16">
      {/* Top Banner / Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#e5dec9]">
        {/* Subtle contour SVG backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="contour-grid" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M 0 60 Q 30 10, 60 60 T 120 60" fill="none" stroke="#284d3d" strokeWidth="0.5" strokeOpacity="0.2" />
                <path d="M 0 30 Q 30 80, 60 30 T 120 30" fill="none" stroke="#284d3d" strokeWidth="0.5" strokeOpacity="0.15" />
                <circle cx="60" cy="60" r="1.5" fill="#c86432" fillOpacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contour-grid)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ede6d6] border border-[#dfd4be] text-xs font-semibold text-[#1b382b] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#c86432]" />
            <span>Hacktoberfest Special · Touch Grass Engine</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#0f241a] max-w-4xl mx-auto leading-[1.08]">
            Your AI should get you <span className="italic underline decoration-[#c86432]/60 decoration-wavy">out</span> of the app, not keep you inside it.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-[#38634f] max-w-2xl mx-auto leading-relaxed">
            OUTSIDE//OS transforms your available time, surroundings, and energy into tactile outdoor quests. 
            Generate a mission, stow your phone in Pocket Mode, and return only to record what you uncovered.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setScreen('builder')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1b382b] text-[#fbf9f3] text-base font-semibold hover:bg-[#284d3d] transition-all shadow-field flex items-center justify-center gap-2.5 group"
              id="hero-create-adventure-btn"
            >
              <Compass className="w-5 h-5 text-[#dfd4be] group-hover:rotate-45 transition-transform" />
              <span>Create an Adventure</span>
              <ArrowRight className="w-4 h-4 text-[#c86432] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setScreen('library')}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#ffffff] text-[#1b382b] border border-[#e2dac2] text-base font-medium hover:bg-[#f5f0e6] transition-colors shadow-sm flex items-center justify-center gap-2"
              id="hero-explore-packs-btn"
            >
              <span>Explore Quest Packs</span>
            </button>
          </div>

          {/* Truthful Model Status Indicator Card */}
          <div className="mt-12 max-w-xl mx-auto p-4 rounded-xl border border-[#e2dac2] bg-white/80 backdrop-blur-sm text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 p-2 rounded-lg ${isOllamaLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#122419]">
                    {isOllamaLive ? 'Local Open-Weight Model Connected' : 'Deterministic Offline Mode Active'}
                  </span>
                  <span className="font-mono text-[11px] text-[#608269]">
                    {isOllamaLive ? modelStatus?.active_model : '18 Verified Fallbacks'}
                  </span>
                </div>
                <p className="mt-1 text-[#4e6556] leading-normal">
                  {isOllamaLive
                    ? `Inference running locally via Ollama (${modelStatus?.active_model}). Zero data leaves your computer.`
                    : 'Ollama not detected locally. Operating seamlessly via verified deterministic field library with zero network calls.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Differentiation Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#c86432] font-bold">The Five Pillars</span>
          <h2 className="font-serif text-3xl font-bold text-[#0f241a] mt-2">Engineered for Physical Reality</h2>
          <p className="text-sm text-[#4e6556] max-w-xl mx-auto mt-2">
            No infinite feeds, no synthetic dopamine loops, no GPS battery drain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="field-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1b382b]/10 text-[#1b382b] flex items-center justify-center mb-4">
              <Eye className="w-5 h-5 text-[#c86432]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#122419]">The Disappearing Interface</h3>
            <p className="text-xs text-[#4e6556] mt-2 leading-relaxed">
              Once your mission starts, screens become counterproductive. Expedition Mode minimizes UI into a 
              dark Pocket Mode so your senses remain anchored in the physical world.
            </p>
          </div>

          <div className="field-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1b382b]/10 text-[#1b382b] flex items-center justify-center mb-4">
              <Compass className="w-5 h-5 text-[#c86432]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#122419]">Personalized Quest DNA</h3>
            <p className="text-xs text-[#4e6556] mt-2 leading-relaxed">
              Tailors difficulty, time (10–60 min), energy levels, and physical accessibility constraints. 
              Never assumes or invents specific local parks or opening hours.
            </p>
          </div>

          <div className="field-card rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#1b382b]/10 text-[#1b382b] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-[#c86432]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#122419]">Open Nature Memory</h3>
            <p className="text-xs text-[#4e6556] mt-2 leading-relaxed">
              A private, local-first field notebook stored entirely on your device SQLite database. 
              Zero telemetry, zero cloud tracking, zero location surveillance.
            </p>
          </div>
        </div>
      </section>

      {/* Example Field Missions Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-[#e2dac2]">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#0f241a]">Field Quest Archetypes</h2>
            <p className="text-xs text-[#4e6556] mt-1">Explore real actionable missions ready to generate right now.</p>
          </div>
          <button
            onClick={() => setScreen('builder')}
            className="mt-3 sm:mt-0 text-xs font-semibold text-[#c86432] hover:text-[#b24f1b] flex items-center gap-1"
          >
            <span>Open Custom Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exampleMissions.map((mission) => {
            const Icon = mission.icon;
            return (
              <div
                key={mission.title}
                className="field-card rounded-2xl p-6 flex flex-col justify-between hover:border-[#c86432]/40 transition-colors cursor-pointer group"
                onClick={() => onSelectExampleQuest(mission.category)}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#608269] mb-3">
                    <span className="px-2 py-0.5 rounded bg-[#ede6d6] text-[#284d3d] font-semibold">{mission.tag}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mission.time}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#122419] group-hover:text-[#c86432] transition-colors">
                    {mission.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-[#4a6b53] mt-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{mission.env}</span>
                  </div>
                  <p className="text-xs text-[#4e6556] leading-relaxed">{mission.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f0ead8] flex items-center justify-between text-xs font-semibold text-[#1b382b] group-hover:text-[#c86432]">
                  <span>Configure this Quest</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
