import React, { useState } from 'react';
import { Eye, UploadCloud, Sparkles, AlertCircle, Scan, CheckCircle2, Layers } from 'lucide-react';
import { api } from '../api';

export default function SatelliteViewer({ detectionData, setDetectionData }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUploadCustomImage = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAnalyzing(true);
      setUploadError(null);
      try {
        const res = await api.detectCyclone(file);
        setDetectionData(res);
      } catch (err) {
        setUploadError(err.message);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const handleRunModelDetection = async () => {
    setAnalyzing(true);
    setUploadError(null);
    try {
      const res = await api.detectCyclone(null);
      setDetectionData(res);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-purple" />
            <span>Multi-Spectral Satellite Vision (INSAT-3D / NOAA)</span>
          </h3>
          <p className="text-[11px] font-mono text-slate-400">
            Thermal Infrared (TIR1 10.8µm) cloud brightness temperature analysis.
          </p>
        </div>

        <button
          onClick={handleRunModelDetection}
          disabled={analyzing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-blue text-white text-xs font-mono font-medium hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run PyTorch Detection</span>
            </>
          )}
        </button>
      </div>

      {/* Satellite Imagery Display Canvas */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-950 border border-slate-800 aspect-square max-w-md mx-auto flex items-center justify-center group">
        
        {/* Synthetic or Live Thermal IR Cloud Visualization */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 via-slate-600 to-dark-950 opacity-90 filter contrast-150">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_transparent_15%,_rgba(139,92,246,0.3)_45%,_rgba(56,189,248,0.2)_70%,_transparent_100%)] animate-spin [animation-duration:60s]" />
        </div>

        {/* Storm Eye Core */}
        <div className="w-8 h-8 rounded-full bg-dark-950/80 border-2 border-red-500 flex items-center justify-center relative z-10 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-red-400" />
        </div>

        {/* CNN Bounding Box Overlay */}
        {detectionData?.bounding_box && (
          <div
            style={{
              top: `${detectionData.bounding_box.ymin * 100}%`,
              left: `${detectionData.bounding_box.xmin * 100}%`,
              width: `${(detectionData.bounding_box.xmax - detectionData.bounding_box.xmin) * 100}%`,
              height: `${(detectionData.bounding_box.ymax - detectionData.bounding_box.ymin) * 100}%`
            }}
            className="absolute border-2 border-brand-cyan/80 bg-brand-cyan/10 rounded-lg pointer-events-none transition-all duration-300 z-10"
          >
            <span className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono bg-brand-cyan text-dark-950 font-bold">
              Cyclone Cloud Shield ({(detectionData.detection_confidence * 100).toFixed(0)}%)
            </span>
          </div>
        )}

        {/* Grid reticle overlay */}
        <div className="absolute inset-0 border border-slate-700/40 pointer-events-none flex items-center justify-center">
          <div className="w-full h-0.5 border-t border-dashed border-slate-600/30" />
          <div className="h-full w-0.5 border-l border-dashed border-slate-600/30 absolute" />
        </div>

        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-300 bg-dark-900/80 px-2 py-1 rounded backdrop-blur-sm z-10">
          Sensor: INSAT-3D TIR1 (10.8 µm) &bull; 4km Resolution
        </div>
      </div>

      {/* Model Detection Telemetry Output */}
      {detectionData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Detection Confidence</span>
            <span className="text-emerald-400 font-bold text-sm">
              {(detectionData.detection_confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Eye Center</span>
            <span className="text-brand-cyan font-bold text-sm">
              {detectionData.eye_coordinates ? `(${detectionData.eye_coordinates.x}, ${detectionData.eye_coordinates.y})` : 'Diffuse'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Vortex Organization</span>
            <span className="text-brand-purple font-bold text-sm">
              {detectionData.spiral_organization_score} / 100
            </span>
          </div>
          <div className="p-3 rounded-xl bg-dark-900 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Inference Latency</span>
            <span className="text-white font-bold text-sm">
              {detectionData.processing_time_ms} ms
            </span>
          </div>
        </div>
      )}

      {/* Custom Upload Option */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <label className="text-slate-400 flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
          <UploadCloud className="w-4 h-4 text-brand-cyan" />
          <span>Upload Real Satellite Imagery (.png, .jpg)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadCustomImage}
            className="hidden"
          />
        </label>
        <span className="text-slate-500 text-[10px]">PyTorch CNN Engine</span>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs font-mono text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

    </div>
  );
}
