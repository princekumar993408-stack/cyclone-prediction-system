from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_root():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "North Indian Ocean" in res_root.json()["basin"]

def test_historical_cyclones():
    res = client.get("/api/cyclones/historical")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    names = [c["name"] for c in data]
    assert any("Amphan" in n for n in names)
    assert any("Biparjoy" in n for n in names)

def test_track_retrieval():
    res = client.get("/api/cyclones/track/AMPHAN-2020")
    assert res.status_code == 200
    track_data = res.json()
    assert track_data["cyclone_id"] == "AMPHAN-2020"
    assert len(track_data["track"]) > 5

def test_detection_and_intensity():
    # Detection endpoint
    det_res = client.post("/api/cyclones/detect")
    assert det_res.status_code == 200
    det_data = det_res.json()
    assert "cyclone_detected" in det_data
    assert "detection_confidence" in det_data

    # Intensity endpoint
    int_res = client.post("/api/cyclones/intensity", data={"wind_hint": "90.0"})
    assert int_res.status_code == 200
    int_data = int_res.json()
    assert int_data["category_code"] == "ESCS"
    assert int_data["wind_knots"] == 90.0

def test_forecast_endpoint():
    res = client.post("/api/cyclones/forecast", params={
        "cyclone_id": "AMPHAN-2020",
        "lat": 14.9,
        "lon": 86.5,
        "wind_knots": 140.0,
        "pressure_hpa": 907.0
    })
    assert res.status_code == 200
    fc = res.json()
    assert len(fc["forecast_steps"]) > 0
    assert fc["current_intensity"]["wind_knots"] == 140.0
