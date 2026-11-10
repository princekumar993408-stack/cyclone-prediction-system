import React from 'react';
import { Wind, Gauge, Compass, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function IntensityGauge({ currentPoint, peakCategory, peakWindKnots, minPressureHpa }) {
  const windKnots = currentPoint?.wind_knots || 45;
  const windKmh = Math.round(windKnots * 1.852);
  const pressure = currentPoint?.pressure_hpa || 990;
  const dvorak = currentPoint?.dvorak || 'T3.0';
  const category = currentPoint?.category || 'Cyclonic Storm';

  // Compute percentage on 0 - 160 knots scale
  const gaugePercent = Math.min(100, Math.max(0, (windKnots / 150) * 100));

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Wind className="w-4 h-4 text-brand-cyan" />
          <span>Intensity &amp; Dvorak Scale</span>
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-purple/20 text-brand-violet border border-brand-purple/30">
          IMD Standards
        </span>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Wind Speed */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Max Sustained Wind</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-white">{windKnots}</span>
            <span className="text-xs font-mono text-brand-cyan">knots</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {windKmh} km/h (3-min avg)
          </div>
        </div>

        {/* Central Pressure */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Estimated Pressure</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold font-mono text-emerald-400">{pressure}</span>
            <span className="text-xs font-mono text-slate-400">hPa</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            &Delta;P: -{1010 - pressure} mb drop
          </div>
        </div>
      </div>

      {/* Category & Dvorak Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold">{category}</span>
          <span className="text-brand-violet font-semibold">{dvorak}</span>
        </div>

        {/* Multi-segmented intensity meter */}
        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 gap-1 border border-slate-800">
          <div
            style={{ width: `${gaugePercent}%` }}
            className="h-full rounded-full bg-gradient-to-r from-brand-cyan via-amber-400 to-rose-500 transition-all duration-500"
          />
        </div>

        <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-0.5">
          <span>Depression (17kt)</span>
          <span>Cyclonic (34kt)</span>
          <span>Severe (64kt)</span>
          <span>Super Cyclone (120kt+)</span>
        </div>
      </div>

      {/* Historical Peak Callout */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Peak Intensity Reached</span>
          <span className="text-white font-semibold">{peakCategory}</span>
        </div>
        <div className="text-right">
          <span className="text-brand-cyan font-bold block">{peakWindKnots} kt ({Math.round(peakWindKnots * 1.852)} km/h)</span>
          <span className="text-[10px] text-slate-500">Min {minPressureHpa} hPa</span>
        </div>
      </div>

    </div>
  );
}
