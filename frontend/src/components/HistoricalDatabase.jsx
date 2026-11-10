import React, { useState } from 'react';
import { Database, Search, Calendar, Globe, Wind, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HistoricalDatabase({ storms, onSelectStorm, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [basinFilter, setBasinFilter] = useState('all');

  const filtered = storms.filter((s) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(term);
    const idMatch = s.cyclone_id.toLowerCase().includes(term);
    const basinMatch = basinFilter === 'all' || s.basin.toLowerCase().includes(basinFilter.toLowerCase());
    return (nameMatch || idMatch) && basinMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-purple" />
            <span>North Indian Ocean Historical Cyclone Archive</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Verified ground-truth storm tracks from the India Meteorological Department (IMD) &amp; NOAA IBTrACS.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={basinFilter}
            onChange={(e) => setBasinFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
          >
            <option value="all">All Basins</option>
            <option value="Bay of Bengal">Bay of Bengal</option>
            <option value="Arabian Sea">Arabian Sea</option>
          </select>

          <div className="relative w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cyclone name..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple"
            />
          </div>
        </div>
      </div>

      {/* Grid of Cyclone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map((storm) => (
          <div
            key={storm.cyclone_id}
            className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between glass-card-hover group"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="flex items-center gap-1.5 text-brand-cyan">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{storm.basin}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-brand-violet border border-brand-purple/40">
                  {storm.year}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold font-mono text-white mb-1 group-hover:text-brand-cyan transition-colors">
                {storm.name}
              </h3>

              <div className="text-xs text-rose-400 font-mono font-semibold mb-3">
                {storm.peak_category}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-dark-900 border border-slate-800 text-xs font-mono mb-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Peak Wind</span>
                  <span className="text-white font-bold">{storm.peak_wind_knots} kt</span>
                  <span className="text-[9px] text-slate-500 block">{storm.peak_wind_kmh} km/h</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Min Pressure</span>
                  <span className="text-emerald-400 font-bold">{storm.min_pressure_hpa} hPa</span>
                  <span className="text-[9px] text-slate-500 block">&Delta;P: -{1010 - storm.min_pressure_hpa}mb</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Synoptic Steps</span>
                  <span className="text-brand-purple font-bold">{storm.track.length} Steps</span>
                  <span className="text-[9px] text-slate-500 block">6-hr intervals</span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 space-y-1 mb-4">
                <div><span className="text-slate-500">Duration:</span> {storm.life_span}</div>
                <div><span className="text-slate-500">Landfall:</span> {storm.landfall_location}</div>
              </div>
            </div>

            {/* Load Button */}
            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => {
                  onSelectStorm(storm.cyclone_id);
                  setActiveTab('dashboard');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-cyan text-xs font-mono font-medium hover:scale-[1.02] transition-transform"
              >
                <span>Load Live Telemetry &amp; Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
