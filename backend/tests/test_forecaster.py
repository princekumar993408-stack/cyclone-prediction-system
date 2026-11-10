from app.core.forecaster import TrajectoryForecaster

def test_trajectory_forecasting():
    forecaster = TrajectoryForecaster()
    res = forecaster.forecast_trajectory(
        cyclone_id="TEST-CYCLONE",
        current_lat=12.5,
        current_lon=86.0,
        current_wind_knots=75.0,
        current_pressure_hpa=965.0
    )

    assert "forecast_steps" in res
    assert len(res["forecast_steps"]) == 6  # 6h, 12h, 18h, 24h, 36h, 48h
    
    # Check that latitude moves northward
    first_step = res["forecast_steps"][0]
    last_step = res["forecast_steps"][-1]
    assert last_step["lat"] > first_step["lat"]
    assert last_step["uncertainty_radius_km"] > first_step["uncertainty_radius_km"]
    assert "ACADEMIC RESEARCH NOTICE" in res["disclaimer"]
