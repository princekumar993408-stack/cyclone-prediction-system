from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.core.detector import CycloneDetector
from app.core.intensity import CycloneIntensityEstimator
from app.core.forecaster import TrajectoryForecaster
from app.models.schemas import DetectionResponse, IntensityResponse, TrajectoryForecastResponse

router = APIRouter(prefix="/cyclones", tags=["Machine Learning Analysis"])

detector = CycloneDetector()
intensity_estimator = CycloneIntensityEstimator()
forecaster = TrajectoryForecaster()

@router.post("/detect", response_model=DetectionResponse)
async def detect_cyclone(file: Optional[UploadFile] = File(None)):
    """
    Applies Convolutional Neural Network (CNN) to detect cyclone eye formations,
    spiral rainband organization, and estimate bounding box coordinates.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()

    result = detector.analyze_satellite_image(image_bytes=image_bytes)
    return DetectionResponse(**result)

@router.post("/intensity", response_model=IntensityResponse)
async def estimate_intensity(
    file: Optional[UploadFile] = File(None),
    wind_hint: Optional[float] = Form(None)
):
    """
    Estimates maximum sustained wind speed (knots & km/h), central barometric pressure (hPa),
    and assigns official IMD category and Dvorak T-number.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()

    result = intensity_estimator.estimate_intensity(image_bytes=image_bytes, base_wind_hint=wind_hint)
    return IntensityResponse(**result)

@router.post("/forecast", response_model=TrajectoryForecastResponse)
def forecast_trajectory(
    cyclone_id: str = "CYCLONE-SIM",
    lat: float = 14.9,
    lon: float = 86.5,
    wind_knots: float = 115.0,
    pressure_hpa: float = 930.0
):
    """
    Forecasts future storm trajectory (+6h, +12h, +24h, +36h, +48h) with
    expanding Cone of Uncertainty radii and recurvature steering.
    """
    forecast = forecaster.forecast_trajectory(
        cyclone_id=cyclone_id,
        current_lat=lat,
        current_lon=lon,
        current_wind_knots=wind_knots,
        current_pressure_hpa=pressure_hpa
    )
    return TrajectoryForecastResponse(**forecast)
