import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.models.schemas import CycloneRecord

router = APIRouter(prefix="/cyclones", tags=["Cyclone Database"])

def load_historical_data() -> List[dict]:
    data_file = settings.data_dir / "historical_cyclones.json"
    if data_file.exists():
        with open(data_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/historical", response_model=List[CycloneRecord])
def get_historical_cyclones(year: Optional[int] = None, basin: Optional[str] = None):
    """Retrieves verified historical North Indian Ocean cyclones (IMD / NOAA IBTrACS)."""
    all_cyclones = load_historical_data()
    results = all_cyclones

    if year:
        results = [c for c in results if c.get("year") == year]
    if basin:
        results = [c for c in results if basin.lower() in c.get("basin", "").lower()]

    return results

@router.get("/track/{cyclone_id}", response_model=CycloneRecord)
def get_cyclone_track(cyclone_id: str):
    """Retrieves full synoptic step-by-step track for a specific cyclone."""
    all_cyclones = load_historical_data()
    for c in all_cyclones:
        if c.get("cyclone_id").upper() == cyclone_id.upper():
            return c
    raise HTTPException(status_code=404, detail=f"Cyclone {cyclone_id} not found in database.")

@router.get("/active", response_model=CycloneRecord)
def get_active_cyclone():
    """
    Returns current active or latest synoptic monitoring target.
    Defaults to the latest synoptic track of Biparjoy or Amphan for real-time visualization.
    """
    all_cyclones = load_historical_data()
    if all_cyclones:
        return all_cyclones[0]  # Super Cyclone Amphan baseline
    raise HTTPException(status_code=404, detail="No active cyclones monitored.")
