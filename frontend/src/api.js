/**
 * Cyclone Prediction Intelligence Platform - API Client
 */

const API_BASE = '/api/cyclones';

export const api = {
  async getHealth() {
    try {
      const res = await fetch('/health');
      return await res.json();
    } catch (err) {
      return { status: 'disconnected', error: err.message };
    }
  },

  async getHistoricalCyclones(year = null, basin = null) {
    let url = `${API_BASE}/historical`;
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (basin) params.append('basin', basin);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch historical cyclones');
    return await res.json();
  },

  async getActiveCyclone() {
    const res = await fetch(`${API_BASE}/active`);
    if (!res.ok) throw new Error('Failed to fetch active storm telemetry');
    return await res.json();
  },

  async getCycloneTrack(cycloneId) {
    const res = await fetch(`${API_BASE}/track/${encodeURIComponent(cycloneId)}`);
    if (!res.ok) throw new Error(`Cyclone ${cycloneId} not found`);
    return await res.json();
  },

  async detectCyclone(file = null) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    const res = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      body: file ? formData : undefined,
    });
    if (!res.ok) throw new Error('Cyclone detection failed');
    return await res.json();
  },

  async estimateIntensity(file = null, windHint = null) {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (windHint) formData.append('wind_hint', windHint);

    const res = await fetch(`${API_BASE}/intensity`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Intensity estimation failed');
    return await res.json();
  },

  async forecastTrajectory(cycloneId, lat, lon, windKnots, pressureHpa) {
    const params = new URLSearchParams({
      cyclone_id: cycloneId || 'CYCLONE-PRED',
      lat: lat.toString(),
      lon: lon.toString(),
      wind_knots: windKnots.toString(),
      pressure_hpa: pressureHpa.toString()
    });

    const res = await fetch(`${API_BASE}/forecast?${params.toString()}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Trajectory forecast computation failed');
    return await res.json();
  }
};
