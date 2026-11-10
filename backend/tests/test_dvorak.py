from app.core.dvorak_scale import DvorakScale

def test_dvorak_classification():
    # Depression: 17 - 27 knots
    dep = DvorakScale.classify_wind(25)
    assert dep["code"] == "D"
    assert dep["name"] == "Depression"
    assert dep["t_number"] == 1.5

    # Cyclonic Storm: 34 - 47 knots
    cs = DvorakScale.classify_wind(40)
    assert cs["code"] == "CS"
    assert cs["name"] == "Cyclonic Storm"

    # Very Severe Cyclonic Storm: 64 - 89 knots
    vscs = DvorakScale.classify_wind(80)
    assert vscs["code"] == "VSCS"
    assert vscs["name"] == "Very Severe Cyclonic Storm"

    # Super Cyclonic Storm: >= 120 knots
    sucs = DvorakScale.classify_wind(140)
    assert sucs["code"] == "SuCS"
    assert sucs["name"] == "Super Cyclonic Storm"

def test_pressure_calculation():
    # Higher wind should produce lower central barometric pressure
    p_dep = DvorakScale.estimate_pressure_from_wind(25)
    p_super = DvorakScale.estimate_pressure_from_wind(140)
    assert p_dep > p_super
    assert p_super < 930.0

def test_cone_of_uncertainty():
    r12_nm, r12_km = DvorakScale.get_forecast_uncertainty_radius_nm(12)
    r48_nm, r48_km = DvorakScale.get_forecast_uncertainty_radius_nm(48)
    assert r48_nm > r12_nm
    assert r48_km > r12_km
    assert r12_nm > 20.0
