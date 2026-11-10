import React from 'react';
import { Compass, Wind, Globe, RefreshCw, Activity, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, storms, selectedStormId, setSelectedStormId, backendHealthy, onRefresh }) {
  const tabs = [
    { id: 'dashboard', label: 'Live Operations' },
    { id: 'satellite', label: 'Satellite Vision' },
    { id: 'map', label: 'Geospatial Trajectory' },
    { id: 'database', label: 'Historical Cyclones' },
    { id: 'models', label: 'Model Evaluation' },
  ];

  return (
    <header className="border-b border-slate-800 bg-dark-900/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center text-white shadow-md shadow-brand-cyan/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-base text-white tracking-tight flex items-center gap-2">
              <span>CycloneSight</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                PyTorch v2.0
              </span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400">
              North Indian Ocean Meteorological Intelligence
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-dark-850 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Storm Selector & Telemetry Status */}
        <div className="flex items-center gap-3">
          <select
            value={selectedStormId || ''}
            onChange={(e) => setSelectedStormId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
          >
            {storms.map((s) => (
              <option key={s.cyclone_id} value={s.cyclone_id}>
                {s.name} ({s.year})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900 border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300">{backendHealthy ? 'PyTorch Ready' : 'Connecting'}</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
