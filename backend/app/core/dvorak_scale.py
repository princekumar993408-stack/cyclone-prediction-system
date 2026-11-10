from typing import Dict, Any, Tuple

class DvorakScale:
    """
    Standardized classification mapping for tropical cyclones in the North Indian Ocean basin,
    following India Meteorological Department (IMD) guidelines and the Dvorak Technique.
    """

    CATEGORIES = [
        {"code": "LOW",  "name": "Low Pressure Area",                "min_knots": 0,   "max_knots": 16,  "min_kmh": 0,   "max_kmh": 30,  "t_min": 0.0, "t_max": 1.0, "color": "#94a3b8"},
        {"code": "D",    "name": "Depression",                       "min_knots": 17,  "max_knots": 27,  "min_kmh": 31,  "max_kmh": 49,  "t_min": 1.5, "t_max": 1.5, "color": "#38bdf8"},
        {"code": "DD",   "name": "Deep Depression",                  "min_knots": 28,  "max_knots": 33,  "min_kmh": 50,  "max_kmh": 61,  "t_min": 2.0, "t_max": 2.0, "color": "#0ea5e9"},
        {"code": "CS",   "name": "Cyclonic Storm",                   "min_knots": 34,  "max_knots": 47,  "min_kmh": 62,  "max_kmh": 88,  "t_min": 2.5, "t_max": 3.0, "color": "#eab308"},
        {"code": "SCS",  "name": "Severe Cyclonic Storm",            "min_knots": 48,  "max_knots": 63,  "min_kmh": 89,  "max_kmh": 117, "t_min": 3.5, "t_max": 3.5, "color": "#f97316"},
        {"code": "VSCS", "name": "Very Severe Cyclonic Storm",       "min_knots": 64,  "max_knots": 89,  "min_kmh": 118, "max_kmh": 166, "t_min": 4.0, "t_max": 4.5, "color": "#ef4444"},
        {"code": "ESCS", "name": "Extremely Severe Cyclonic Storm",  "min_knots": 90,  "max_knots": 119, "min_kmh": 167, "max_kmh": 221, "t_min": 5.0, "t_max": 6.0, "color": "#ec4899"},
        {"code": "SuCS", "name": "Super Cyclonic Storm",             "min_knots": 120, "max_knots": 200, "min_kmh": 222, "max_kmh": 350, "t_min": 6.5, "t_max": 8.0, "color": "#a855f7"},
    ]

    @staticmethod
    def classify_wind(wind_knots: float) -> Dict[str, Any]:
        """Classifies a continuous wind speed (knots) into standard IMD category and Dvorak T-number."""
        knots = max(0.0, float(wind_knots))
        for cat in DvorakScale.CATEGORIES:
            if cat["min_knots"] <= knots <= cat["max_knots"]:
                # Interpolate T-number proportionally within category
                span = max(1, cat["max_knots"] - cat["min_knots"])
                ratio = (knots - cat["min_knots"]) / span
                t_num = round(cat["t_min"] + ratio * (cat["t_max"] - cat["t_min"]), 1)
                return {
                    "code": cat["code"],
                    "name": cat["name"],
                    "wind_knots": round(knots, 1),
                    "wind_kmh": round(knots * 1.852, 1),
                    "t_number": t_num,
                    "color": cat["color"]
                }
        
        # Fallback for > 200 knots
        return {
            "code": "SuCS",
            "name": "Super Cyclonic Storm",
            "wind_knots": round(knots, 1),
            "wind_kmh": round(knots * 1.852, 1),
            "t_number": 8.0,
            "color": "#a855f7"
        }

    @staticmethod
    def estimate_pressure_from_wind(wind_knots: float, env_pressure: float = 1010.0) -> float:
        """
        Computes estimated central barometric pressure (hPa/mb) from maximum sustained wind
        using the Atkinson-Holliday empirical relationship adapted for the Indian Ocean:
        V_max = 6.7 * (P_env - P_c) ^ 0.644  ==>  P_c = P_env - (V_max / 6.7) ^ 1.552
        """
        knots = max(5.0, float(wind_knots))
        delta_p = (knots / 6.7) ** 1.552
        central_p = env_pressure - delta_p
        return round(max(880.0, central_p), 1)

    @staticmethod
    def get_forecast_uncertainty_radius_nm(lead_time_hours: int) -> Tuple[float, float]:
        """
        Returns average Cone of Uncertainty radius in nautical miles (nm) and kilometers (km)
        based on historical IMD/NHC official forecast verification stats:
        - 12h: ~35 nm (65 km)
        - 24h: ~60 nm (111 km)
        - 36h: ~85 nm (157 km)
        - 48h: ~110 nm (204 km)
        """
        t = max(0, lead_time_hours)
        radius_nm = 15.0 + (t * 2.0)  # Linear approximation of cone radius expansion
        radius_km = radius_nm * 1.852
        return round(radius_nm, 1), round(radius_km, 1)
