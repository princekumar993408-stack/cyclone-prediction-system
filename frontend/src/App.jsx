import React, { useState, useEffect } from 'react';
import DisclaimerBanner from './components/DisclaimerBanner';
import Navbar from './components/Navbar';
import CycloneMap from './components/CycloneMap';
import IntensityGauge from './components/IntensityGauge';
import SatelliteViewer from './components/SatelliteViewer';
import TrajectoryTimeline from './components/TrajectoryTimeline';
import HistoricalDatabase from './components/HistoricalDatabase';
import ModelEvaluation from './components/ModelEvaluation';
import { api } from './api';
import { 
  AlertTriangle, 
  Compass, 
  Wind, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Info, 
  Globe, 
  ExternalLink,
  Cpu,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [storms, setStorms] = useState([]);
  const [selectedStormId, setSelectedStormId] = useState('AMPHAN-2020');
  const [currentStorm, setCurrentStorm] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [detectionData, setDetectionData] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize data
  useEffect(() => {
    initPlatform();
  }, []);

  // When selected storm changes, fetch track and calculate forecast
  useEffect(() => {
    if (selectedStormId) {
      loadStormTrack(selectedStormId);
    }
  }, [selectedStormId]);

  const initPlatform = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check backend health
      const health = await api.getHealth();
      setBackendHealthy(health.status === 'ok');

      // Fetch historical storms list
      const stormList = await api.getHistoricalCyclones();
      setStorms(stormList);

      if (stormList.length > 0) {
        const initialId = stormList[0].cyclone_id;
        setSelectedStormId(initialId);
      }
    } catch (err) {
      console.warn('Backend connection warning; using fallback initial state:', err);
      setBackendHealthy(false);
      // Fallback storms list in case of network issue
      const fallbackStorms = [
        {
          cyclone_id: 'AMPHAN-2020',
          name: 'Super Cyclonic Storm AMPHAN',
          year: 2020,
          basin: 'Bay of Bengal',
          peak_category: 'Super Cyclonic Storm',
          peak_wind_knots: 140,
          min_pressure_hpa: 907
        },
        {
          cyclone_id: 'BIPARJOY-2023',
          name: 'Extremely Severe Cyclonic Storm BIPARJOY',
          year: 2023,
          basin: 'Arabian Sea',
          peak_category: 'Extremely Severe Cyclonic Storm',
          peak_wind_knots: 90,
          min_pressure_hpa: 960
        },
        {
          cyclone_id: 'FANI-2019',
          name: 'Extremely Severe Cyclonic Storm FANI',
          year: 2019,
          basin: 'Bay of Bengal',
          peak_category: 'Extremely Severe Cyclonic Storm',
          peak_wind_knots: 115,
          min_pressure_hpa: 932
        },
        {
          cyclone_id: 'MOCHA-2023',
          name: 'Extremely Severe Cyclonic Storm MOCHA',
          year: 2023,
          basin: 'Bay of Bengal',
          peak_category: 'Extremely Severe Cyclonic Storm',
          peak_wind_knots: 150,
          min_pressure_hpa: 918
        }
      ];
      setStorms(fallbackStorms);
      setSelectedStormId('AMPHAN-2020');
    } finally {
      setLoading(false);
    }
  };

  const loadStormTrack = async (stormId) => {
    try {
      const stormData = await api.getCycloneTrack(stormId);
      setCurrentStorm(stormData);

      // Extract latest synoptic observation
      const track = stormData.track || [];
      if (track.length > 0) {
        const lastPt = track[track.length - 1];
        // Request forward forecast trajectory
        const fcast = await api.forecastTrajectory(
          stormId,
          lastPt.lat,
          lastPt.lon,
          lastPt.wind_knots,
          lastPt.pressure_hpa
        );
        setForecast(fcast);
      }
    } catch (err) {
      console.warn(`Failed to load track for ${stormId}:`, err);
    }
  };

  // Get current active/selected point
  const currentPoint = currentStorm?.track?.[currentStorm.track.length - 1] || null;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      {/* Mandatory IMD Academic Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Top Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        storms={storms}
        selectedStormId={selectedStormId}
        setSelectedStormId={setSelectedStormId}
        backendHealthy={backendHealthy}
        onRefresh={initPlatform}
      />

      {/* Main Application Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-brand-cyan animate-spin" />
            <div className="text-xs font-mono text-slate-400">
              Initializing Deep Learning Meteorological Engine...
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* VIEW 1: LIVE OPERATIONS / DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Active Storm Hero Alert Bar */}
                <div className="card-glass p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                    <div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                        <span>ACTIVE MONITORING TARGET:</span>
                        <span className="font-bold text-white">{currentStorm?.name || selectedStormId}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-brand-cyan">{currentStorm?.basin || 'North Indian Ocean'}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Synoptic Time: {currentPoint?.time?.replace('T', ' ') || 'Real-time observation'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-dark-900 border border-slate-800 text-slate-300">
                      Coordinates: <strong className="text-brand-cyan">{currentPoint?.lat}°N, {currentPoint?.lon}°E</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-brand-purple/20 border border-brand-purple/40 text-brand-purple font-semibold">
                      {currentPoint?.category || 'Cyclonic System'}
                    </span>
                  </div>
                </div>

                {/* Primary Map & Intensity Dual Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Interactive Leaflet Map with Track & Cone */}
                  <div className="lg:col-span-2 space-y-4">
                    <CycloneMap storm={currentStorm} forecast={forecast} />
                  </div>

                  {/* Right 1 Col: Intensity Gauge & Atkinson-Holliday Physics */}
                  <div className="space-y-4">
                    <IntensityGauge
                      currentPoint={currentPoint}
                      peakCategory={currentStorm?.peak_category}
                      peakWindKnots={currentStorm?.peak_wind_knots}
                      minPressureHpa={currentStorm?.min_pressure_hpa}
                    />
                  </div>
                </div>

                {/* Trajectory Timeline Projections */}
                <TrajectoryTimeline forecast={forecast} />
              </div>
            )}

            {/* VIEW 2: SATELLITE VISION (INSAT-3D / NOAA) */}
            {activeTab === 'satellite' && (
              <div className="space-y-6">
                <SatelliteViewer
                  detectionData={detectionData}
                  setDetectionData={setDetectionData}
                />
              </div>
            )}

            {/* VIEW 3: FULL GEOSPATIAL TRAJECTORY MAP */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="card-glass p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-brand-cyan" />
                      Geospatial Navigation &amp; Uncertainty Propagation
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Visualizing synoptic track history, predicted recurrence path, and Atkinson-Holliday pressure dynamics.
                    </p>
                  </div>
                </div>

                <CycloneMap storm={currentStorm} forecast={forecast} />

                <TrajectoryTimeline forecast={forecast} />
              </div>
            )}

            {/* VIEW 4: HISTORICAL CYCLONES ARCHIVE */}
            {activeTab === 'database' && (
              <HistoricalDatabase
                storms={storms}
                onSelectStorm={(id) => {
                  setSelectedStormId(id);
                  setActiveTab('dashboard');
                }}
                setActiveTab={setActiveTab}
              />
            )}

            {/* VIEW 5: MODEL EVALUATION & BENCHMARKS */}
            {activeTab === 'models' && (
              <ModelEvaluation />
            )}
          </>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-800/80 bg-dark-900/90 backdrop-blur-sm px-6 py-5 mt-12 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-cyan" />
            <span className="text-white font-semibold">CycloneSight Intelligence System</span>
            <span className="text-slate-600">|</span>
            <span>Developed by Prince Kumar (B.Tech CSE IoT, Jain University)</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/princekumar993408-stack/cyclone-prediction-system"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-brand-purple" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href="https://github.com/princekumar993408-stack/ai-research-assistant"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-brand-cyan" />
              <span>AI Research Assistant</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <span className="text-slate-600">v2.0.0 Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
