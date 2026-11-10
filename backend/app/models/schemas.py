from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class TrackPoint(BaseModel):
    step: int
    time: str
    lat: float
    lon: float
    wind_knots: float
    pressure_hpa: float
    category: str
    dvorak: Optional[str] = None

class CycloneRecord(BaseModel):
    cyclone_id: str
    name: str
    year: int
    basin: str
    peak_category: str
    peak_wind_knots: float
    peak_wind_kmh: float
    min_pressure_hpa: float
    life_span: str
    landfall_location: str
    track: List[TrackPoint]

class DetectionResponse(BaseModel):
    cyclone_detected: bool
    detection_confidence: float
    eye_detected: bool
    eye_coordinates: Optional[Dict[str, float]] = None  # {"x": float, "y": float} in normalized coords
    bounding_box: Optional[Dict[str, float]] = None    # {"ymin": float, "xmin": float, "ymax": float, "xmax": float}
    spiral_organization_score: float
    dvorak_curvature_degrees: float
    processing_time_ms: float

class IntensityResponse(BaseModel):
    wind_knots: float
    wind_kmh: float
    pressure_hpa: float
    category_code: str
    category_name: str
    dvorak_t_number: float
    confidence_score: float
    uncertainty_knots: float
    badge_color: str

class ForecastStep(BaseModel):
    forecast_hours: int
    target_time: str
    lat: float
    lon: float
    wind_knots: float
    wind_kmh: float
    pressure_hpa: float
    category_name: str
    uncertainty_radius_nm: float
    uncertainty_radius_km: float

class TrajectoryForecastResponse(BaseModel):
    cyclone_id: str
    model_architecture: str
    base_coordinates: Dict[str, float]
    current_intensity: Dict[str, Any]
    forecast_steps: List[ForecastStep]
    trajectory_confidence: float
    disclaimer: str
