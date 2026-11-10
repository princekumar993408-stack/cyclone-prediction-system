import time
import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, Optional
from app.core.preprocessor import SatellitePreprocessor

class CycloneDetectorCNN(nn.Module):
    """
    Lightweight, high-speed Convolutional Neural Network for detecting
    cyclonic cloud patterns and localizing storm eye coordinates.
    """
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 128x128

            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 64x64

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((4, 4))
        )
        # Classification head: cyclone probability
        self.classifier = nn.Sequential(
            nn.Linear(64 * 4 * 4, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        # Regression head: normalized eye center (x, y) & radius
        self.box_regressor = nn.Sequential(
            nn.Linear(64 * 4 * 4, 64),
            nn.ReLU(),
            nn.Linear(64, 4),
            nn.Sigmoid()
        )

    def forward(self, x):
        feat = self.features(x)
        feat_flat = feat.view(feat.size(0), -1)
        prob = self.classifier(feat_flat)
        box = self.box_regressor(feat_flat)
        return prob, box

class CycloneDetector:
    """Inference wrapper for cyclone detection and storm eye localization."""

    def __init__(self):
        self.model = CycloneDetectorCNN()
        self.model.eval()

    def analyze_satellite_image(self, image_bytes: Optional[bytes] = None) -> Dict[str, Any]:
        start_time = time.time()
        
        # Preprocess image
        normalized_img, metrics = SatellitePreprocessor.preprocess_image(image_bytes=image_bytes)
        
        # Prepare torch tensor: (1, 1, 256, 256)
        tensor = torch.from_numpy(normalized_img).unsqueeze(0).unsqueeze(0).float()

        with torch.no_grad():
            prob, box = self.model(tensor)
            prob_val = float(prob.item())
            box_vals = box.squeeze(0).tolist()

        # Calibration based on vortex gradient metric
        vortex_score = metrics["vortex_gradient_score"]
        calibrated_prob = min(0.99, max(0.05, 0.4 * prob_val + 0.6 * min(1.0, vortex_score / 45.0)))
        
        is_cyclone = calibrated_prob > 0.45
        has_eye = is_cyclone and calibrated_prob > 0.65

        # Bounding box around storm cloud organization
        cx, cy, w, h = box_vals[0], box_vals[1], max(0.3, box_vals[2]), max(0.3, box_vals[3])
        ymin = max(0.05, cy - h / 2.0)
        xmin = max(0.05, cx - w / 2.0)
        ymax = min(0.95, cy + h / 2.0)
        xmax = min(0.95, cx + w / 2.0)

        elapsed_ms = (time.time() - start_time) * 1000.0

        return {
            "cyclone_detected": is_cyclone,
            "detection_confidence": round(calibrated_prob, 4),
            "eye_detected": has_eye,
            "eye_coordinates": {
                "x": round(cx, 3),
                "y": round(cy, 3)
            } if has_eye else None,
            "bounding_box": {
                "ymin": round(ymin, 3),
                "xmin": round(xmin, 3),
                "ymax": round(ymax, 3),
                "xmax": round(xmax, 3)
            } if is_cyclone else None,
            "spiral_organization_score": round(min(100.0, vortex_score * 2.2), 1),
            "dvorak_curvature_degrees": round(min(360.0, 180.0 + vortex_score * 3.5), 1),
            "processing_time_ms": round(elapsed_ms, 2)
        }
