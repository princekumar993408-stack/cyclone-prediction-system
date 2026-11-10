import React, { useEffect, useRef, useState } from 'react';
import { Layers, Compass, Wind, Eye, ShieldCheck, MapPin } from 'lucide-react';
import L from 'leaflet';

export default function CycloneMap({ storm, forecast }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [showCone, setShowCone] = useState(true);
  const [showPastTrack, setShowPastTrack] = useState(true);

  // Fallback / initial center: Bay of Bengal (15°N, 87°E)
  const defaultCenter = [16.0, 85.0];

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const leafletLib = window.L || L;
    if (!leafletLib) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = leafletLib.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 5,
        minZoom: 4,
        maxZoom: 9,
      });

      // Dark CartoDB Map Tiles
      leafletLib.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = leafletLib.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderLayers();
  }, [storm, forecast, showCone, showPastTrack]);

  const renderLayers = () => {
    const leafletLib = window.L || L;
    if (!mapInstanceRef.current || !layerGroupRef.current || !leafletLib) return;
    const group = layerGroupRef.current;
    group.clearLayers();

    const track = storm?.track || [];
    if (track.length === 0) return;

    // 1. Render Historical / Past Track Points
    if (showPastTrack) {
      const pastCoords = track.map(p => [p.lat, p.lon]);
      
      // Polyline for past track
      L.polyline(pastCoords, {
        color: '#8B5CF6',
        weight: 3,
        opacity: 0.85,
        smoothFactor: 1
      }).addTo(group);

      // Markers for each synoptic step
      track.forEach((pt, idx) => {
        const isCurrent = idx === track.length - 1;
        const color = isCurrent ? '#EF4444' : '#38BDF8';
        
        const circle = L.circleMarker([pt.lat, pt.lon], {
          radius: isCurrent ? 8 : 4.5,
          color: color,
          fillColor: color,
          fillOpacity: 0.9,
          weight: 1.5
        }).addTo(group);

        circle.bindPopup(`
          <div style="font-family: monospace; font-size: 11px;">
            <strong style="color: #38BDF8;">${storm.name}</strong><br/>
            <span>Time: ${pt.time.replace('T', ' ').replace('Z', ' UTC')}</span><br/>
            <span>Wind: <strong>${pt.wind_knots} knots</strong> (${Math.round(pt.wind_knots * 1.852)} km/h)</span><br/>
            <span>Central Pressure: <strong>${pt.pressure_hpa} hPa</strong></span><br/>
            <span>Category: <strong style="color: #A78BFA;">${pt.category}</strong></span>
          </div>
        `);
      });
    }

    // Current position
    const currentPoint = track[track.length - 1];
    if (currentPoint) {
      // Pulsing current eye circle
      L.circleMarker([currentPoint.lat, currentPoint.lon], {
        radius: 12,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.35,
        weight: 2
      }).addTo(group);
    }

    // 2. Render Forward Forecast Track & Cone of Uncertainty
    const steps = forecast?.forecast_steps || [];
    if (steps.length > 0 && currentPoint) {
      const forecastCoords = [[currentPoint.lat, currentPoint.lon], ...steps.map(s => [s.lat, s.lon])];

      // Dashed forecast trajectory line
      L.polyline(forecastCoords, {
        color: '#38BDF8',
        weight: 3.5,
        dashArray: '6, 8',
        opacity: 0.9
      }).addTo(group);

      // Cone of Uncertainty Circles
      if (showCone) {
        steps.forEach((step) => {
          // Leaflet circle takes radius in meters
          const radiusMeters = step.uncertainty_radius_km * 1000;
          
          L.circle([step.lat, step.lon], {
            radius: radiusMeters,
            color: '#38BDF8',
            fillColor: '#38BDF8',
            fillOpacity: 0.12,
            weight: 1,
            dashArray: '4, 4'
          }).addTo(group);

          // Forecast Marker
          const mark = L.circleMarker([step.lat, step.lon], {
            radius: 5,
            color: '#38BDF8',
            fillColor: '#0E1424',
            fillOpacity: 1,
            weight: 2
          }).addTo(group);

          mark.bindPopup(`
            <div style="font-family: monospace; font-size: 11px;">
              <strong style="color: #38BDF8;">+${step.forecast_hours}h Forecast (${step.target_time.slice(11, 16)} UTC)</strong><br/>
              <span>Coords: ${step.lat}°N, ${step.lon}°E</span><br/>
              <span>Est. Wind: <strong>${step.wind_knots} knots</strong> (${step.wind_kmh} km/h)</span><br/>
              <span>Pressure: <strong>${step.pressure_hpa} hPa</strong></span><br/>
              <span>Uncertainty Radius: <strong>${step.uncertainty_radius_km} km</strong> (${step.uncertainty_radius_nm} nm)</span>
            </div>
          `);
        });
      }

      // Pan to fit current storm track
      if (mapInstanceRef.current && pastCoordsOrCurrent(track, steps).length > 0) {
        mapInstanceRef.current.fitBounds(L.polyline(pastCoordsOrCurrent(track, steps)).getBounds(), {
          padding: [50, 50]
        });
      }
    }
  };

  const pastCoordsOrCurrent = (track, steps) => {
    const coords = track.map(p => [p.lat, p.lon]);
    steps.forEach(s => coords.push([s.lat, s.lon]));
    return coords;
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden relative">
      
      {/* Top Map Control Bar */}
      <div className="p-3.5 bg-dark-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-brand-cyan" />
          <span className="font-bold text-white">{storm?.name || 'Cyclone Track'}</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-brand-violet">{storm?.basin || 'North Indian Ocean'}</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showCone}
              onChange={(e) => setShowCone(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-brand-cyan focus:ring-0"
            />
            <span>Cone of Uncertainty</span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showPastTrack}
              onChange={(e) => setShowPastTrack(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-brand-purple focus:ring-0"
            />
            <span>Recorded Synoptic Track</span>
          </label>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[520px] bg-dark-950"
      />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-card p-3 rounded-xl border border-slate-800 text-[10px] font-mono space-y-1.5 shadow-xl bg-dark-900/95 backdrop-blur-md">
        <div className="text-slate-400 font-bold uppercase tracking-wider mb-1">Geospatial Legend</div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Current Storm Eye</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-0.5 bg-brand-purple" />
          <span>Historical Synoptic Track</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-3 h-0.5 border-t border-dashed border-brand-cyan" />
          <span>Predicted Trajectory Path</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan/30 border border-brand-cyan" />
          <span>Expanding Cone of Uncertainty (6h-48h)</span>
        </div>
      </div>

    </div>
  );
}
