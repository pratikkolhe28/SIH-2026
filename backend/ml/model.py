"""
PyTorch MobileNetV2 Disease Classifier for SIH PS 26131
Optimized for CPU inference on free-tier hosting (Render/Railway/Local).
"""

import io
import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
from .classes import CLASSES, CLASS_INDEX, INDEX_TO_CLASS, CLASS_NAMES

MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_mobilenet_v2.pth")

class CropDiseaseModel(nn.Module):
    def __init__(self, num_classes=10):
        super(CropDiseaseModel, self).__init__()
        # Load MobileNetV2 backbone
        try:
            # Try loading default weights or uninitialized backbone
            self.backbone = models.mobilenet_v2(weights=None)
        except Exception:
            self.backbone = models.mobilenet_v2(pretrained=False)
        
        # Replace classifier head for our 10 target classes
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.25),
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)


class DiseaseInferenceEngine:
    def __init__(self):
        self.device = torch.device("cpu")
        self.model = CropDiseaseModel(num_classes=len(CLASSES))
        self.model.to(self.device)
        self.model.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        self._initialize_or_load_weights()

    def _initialize_or_load_weights(self):
        self.weights_loaded = False
        if os.path.exists(MODEL_PATH):
            try:
                try:
                    state_dict = torch.load(MODEL_PATH, map_location=self.device, weights_only=True)
                except TypeError:  # compatibility with older PyTorch releases
                    state_dict = torch.load(MODEL_PATH, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.weights_loaded = True
                print(f"[ML] Loaded checkpoint from {MODEL_PATH}; validation/calibration status must be established separately.")
                return
            except Exception as e:
                print(f"[ML] Checkpoint could not be loaded: {e}. Using untrained fallback weights; predictions are demonstration-only.")

        # Do not describe random initialization as trained or calibrated.
        torch.manual_seed(42)
        for m in self.model.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0.0)

    def _analyze_leaf_features(self, pil_img: Image.Image, filename: str = ""):
        """Extract simple colour indicators for context; these are not disease proof."""
        img_np = np.array(pil_img.convert("RGB"))
        r = img_np[:, :, 0].astype(float)
        g = img_np[:, :, 1].astype(float)
        b = img_np[:, :, 2].astype(float)
        green_excess = (2 * g - r - b) / (2 * g + r + b + 1e-6)
        healthy_green_ratio = np.mean(green_excess > 0.15)
        necrotic_ratio = np.mean((r > 50) & (r < 185) & (g < 145) & (b < 110) & (r > g + 10))
        yellow_ratio = np.mean((r > 155) & (g > 145) & (b < 115) & (r + g > 2 * b + 40))
        dark_green_ratio = np.mean((g > r + 15) & (g > b + 10) & (g < 130))
        return {
            "healthy_green_ratio": float(healthy_green_ratio),
            "necrotic_ratio": float(necrotic_ratio),
            "yellow_ratio": float(yellow_ratio),
            "dark_green_ratio": float(dark_green_ratio),
        }

    def predict(self, image_bytes: bytes, filename: str = "", crop_filter: str = None):
        """Return transparent model scores; filenames never influence the diagnosis.

        The current repository checkpoint has no bundled held-out validation report,
        so these values are model scores, not a claim of calibrated real-world accuracy.
        """
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid image file: {str(e)}")

        leaf_features = self._analyze_leaf_features(pil_img)
        input_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)
        with torch.no_grad():
            logits = self.model(input_tensor).squeeze(0).cpu().numpy()

        # A user-selected crop is a valid constraint; do not infer crop from filenames
        # or force a diagnosis based on hand-written colour thresholds.
        active_crop = crop_filter.strip().title() if crop_filter and crop_filter.strip().lower() in {"tomato", "potato", "cotton"} else None
        eligible = [i for i, item in enumerate(CLASSES) if not active_crop or item["crop"].lower() == active_crop.lower()]
        eligible_logits = logits[eligible]
        shifted = eligible_logits - np.max(eligible_logits)
        probs = np.exp(shifted) / np.sum(np.exp(shifted))
        order = np.argsort(probs)[::-1]
        top_idx = eligible[int(order[0])]
        top_class = CLASSES[top_idx]
        top_probability = float(probs[order[0]])
        margin = top_probability - (float(probs[order[1]]) if len(order) > 1 else 0.0)

        # Untrained fallback weights must never be presented as a reliable diagnosis.
        if not self.weights_loaded:
            confidence_level = "unvalidated_model"
            next_step = "Model checkpoint is unavailable or untrained. Use expert review; do not act on this result alone."
        elif top_probability < 0.45 or margin < 0.10:
            confidence_level = "uncertain"
            next_step = "The image result is inconclusive. Capture a clear image of both leaf surfaces and request expert verification."
        else:
            confidence_level = "model_suggested"
            next_step = "Treat this as a preliminary screening result. Confirm field symptoms and local guidance before treatment."

        top_3 = []
        for rank, pos in enumerate(order[:3]):
            cls_meta = CLASSES[eligible[int(pos)]]
            top_3.append({
                "rank": rank + 1,
                "id": cls_meta["id"],
                "crop": cls_meta["crop"],
                "disease": cls_meta["disease"],
                "confidence": round(float(probs[pos]), 4),
            })

        return {
            "id": top_class["id"], "crop": top_class["crop"],
            "crop_mr": top_class["crop_mr"], "crop_hi": top_class["crop_hi"],
            "disease": top_class["disease"], "disease_mr": top_class["disease_mr"],
            "disease_hi": top_class["disease_hi"], "pathogen": top_class["pathogen"],
            "type": top_class["type"], "severity": top_class["severity"],
            "confidence": round(top_probability, 4),
            "confidence_pct": f"{round(top_probability * 100, 1)}%",
            "confidence_level": confidence_level, "recommended_next_step": next_step,
            "model_status": "checkpoint_loaded_unvalidated" if self.weights_loaded else "untrained_fallback",
            "symptoms": top_class["symptoms"], "symptoms_mr": top_class["symptoms_mr"],
            "symptoms_hi": top_class["symptoms_hi"], "top_predictions": top_3,
            "visual_indicators": {
                "necrotic_lesion_pct": round(leaf_features["necrotic_ratio"] * 100, 1),
                "chlorosis_yellow_pct": round(leaf_features["yellow_ratio"] * 100, 1),
                "healthy_tissue_pct": round(leaf_features["healthy_green_ratio"] * 100, 1),
            },
        }


# Singleton instance
inference_engine = DiseaseInferenceEngine()
