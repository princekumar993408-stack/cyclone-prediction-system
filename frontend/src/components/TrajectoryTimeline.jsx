import React from 'react';
import { Clock, Navigation, Wind, Activity, ShieldAlert, ArrowRight } from 'lucide-react';

export default function TrajectoryTimeline({ forecast }) {
  const steps = forecast?.forecast_steps || [];

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-cyan" />
            <span>Predicted Trajectory &amp; Uncertainty Schedule</span>
          </h3>
          <p className="text-[11px] font-mono text-slate-500">
            Temporal GRU Recurrence with Beta-Drift Steering Kinematics.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
          6h - 48h Projections
        </span>
      </div>

      {/* Steps Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="p-3">Forecast Lead</th>
              <th className="p-3">Projected Coordinates</th>
              <th className="p-3">Sustained Wind</th>
              <th className="p-3">Est. Pressure</th>
              <th className="p-3">IMD Category</th>
              <th className="p-3 text-right">Cone Uncertainty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {steps.map((step) => (
              <tr key={step.forecast_hours} className="hover:bg-slate-800/20 transition-colors">
                <td className="p-3 font-bold text-brand-cyan">
                  +{step.forecast_hours} Hours
                  <span className="block text-[10px] text-slate-500 font-normal">
                    {step.target_time.slice(11, 16)} UTC
                  </span>
                </td>
                <td className="p-3 text-white">
                  {step.lat}°N, {step.lon}°E
                </td>
                <td className="p-3">
                  <span className="font-bold text-white">{step.wind_knots} kt</span>
                  <span className="text-[10px] text-slate-400 block">{step.wind_kmh} km/h</span>
                </td>
                <td className="p-3 text-emerald-400 font-bold">
                  {step.pressure_hpa} hPa
                </td>
                <td className="p-3 text-brand-violet">
                  {step.category_name}
                </td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                    &plusmn;{step.uncertainty_radius_km} km ({step.uncertainty_radius_nm} nm)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
