"""
FastAPI Server for SIH PS 26131 — Crop Disease & Pest Detection System
Govt of Maharashtra (Maharashtra State Innovation Society)
Serves ML inference, multilingual advisories, weather risk rules,
geospatial hotspots, and government surveillance dashboard APIs.
"""

import os
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from ml.model import inference_engine
from ml.classes import CLASSES
from services.advisory_service import advisory_service
from services.weather_service import weather_service, MAHARASHTRA_DISTRICTS
from services.kvk_service import get_nearest_kvk, KVK_CENTERS
from services.db_service import db_service

app = FastAPI(
    title="Crop Disease & Pest Surveillance System (SIH PS 26131)",
    description="Farmer diagnosis and Government Outbreak Hotspot Surveillance for Maharashtra State",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and cloud frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sample images directory
SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "sample_images")
if os.path.exists(SAMPLES_DIR):
    app.mount("/sample_images", StaticFiles(directory=SAMPLES_DIR), name="sample_images")


@app.get("/api/health")
def health_check():
    stats = db_service.get_dashboard_stats()
    return {
        "status": "healthy",
        "service": "SIH PS 26131 Crop Surveillance Engine",
        "state": "Maharashtra",
        "ml_engine": "PyTorch MobileNetV2 (CPU)",
        "total_reports_stored": stats["total_reports"],
        "active_hotspots": stats["active_hotspots"]
    }


@app.get("/api/classes")
def list_supported_classes():
    return {"total": len(CLASSES), "classes": CLASSES}


@app.get("/api/districts")
def list_maharashtra_districts():
    return {
        "districts": [
            {
                "key": k,
                "name": v["name"],
                "name_mr": v["name_mr"],
                "name_hi": v["name_hi"],
                "lat": v["lat"],
                "lon": v["lon"],
                "primary_crops": v["primary_crops"]
            }
            for k, v in MAHARASHTRA_DISTRICTS.items()
        ]
    }


@app.post("/api/predict")
async def predict_disease(
    file: UploadFile = File(...),
    crop_hint: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    district: Optional[str] = Form("Pune"),
    taluka: Optional[str] = Form(""),
    village: Optional[str] = Form(""),
    lang: Optional[str] = Form("en"),
    auto_save_report: Optional[bool] = Form(True)
):
    """
    Primary Farmer Endpoint:
    1. Runs PyTorch MobileNetV2 inference on uploaded leaf image.
    2. Retrieves structured biological/chemical treatment advisory in Marathi/Hindi/English.
    3. Identifies nearest Krishi Vigyan Kendra (KVK).
    4. Evaluates local agro-climatic risk for the farmer's district.
    5. Geotags and stores report into the outbreak database.
    """
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # ML Inference
        prediction = inference_engine.predict(contents, filename=file.filename or "", crop_filter=crop_hint)

        # Treatment Advisory Lookup
        advisory = advisory_service.get_advisory(prediction["id"], lang=lang)

        # Weather & Agro-climatic Risk
        weather_info = weather_service.get_weather_data(lat=latitude, lon=longitude, district_key=district)

        # Nearest KVK Center
        kvk = get_nearest_kvk(district)

        # Auto-save report to database
        saved_report = None
        if auto_save_report and latitude is not None and longitude is not None:
            saved_report = db_service.add_report({
                "crop": prediction["crop"],
                "disease_id": prediction["id"],
                "disease_name": prediction["disease"],
                "confidence": prediction["confidence"],
                "latitude": latitude,
                "longitude": longitude,
                "district": district or "Pune",
                "taluka": taluka or "Rural",
                "village": village or "",
                "severity": prediction["severity"],
                "notes": f"Detected via Mobile App. Top match: {prediction['disease']} ({prediction['confidence_pct']})"
            })

        return {
            "prediction": prediction,
            "advisory": advisory,
            "weather": weather_info,
            "nearest_kvk": kvk,
            "saved_report": saved_report
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.get("/api/advisory/{disease_id}")
def get_disease_advisory(disease_id: str, lang: str = "en"):
    return advisory_service.get_advisory(disease_id, lang=lang)


@app.get("/api/weather")
def get_agro_weather(
    district: str = "pune",
    lat: Optional[float] = None,
    lon: Optional[float] = None
):
    return weather_service.get_weather_data(lat=lat, lon=lon, district_key=district)


@app.get("/api/reports")
def get_all_reports(
    district: Optional[str] = Query(None),
    crop: Optional[str] = Query(None),
    disease_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    flagged_only: bool = Query(False),
    limit: int = Query(200)
):
    reports = db_service.get_reports(
        district=district,
        crop=crop,
        disease_id=disease_id,
        status=status,
        flagged_only=flagged_only,
        limit=limit
    )
    return {"total": len(reports), "reports": reports}


@app.post("/api/reports")
def submit_farmer_report(report_data: dict):
    saved = db_service.add_report(report_data)
    return {"message": "Report logged successfully", "report": saved}


@app.post("/api/reports/{report_id}/flag-expert")
def flag_for_expert_review(report_id: str, flag: bool = True):
    ok = db_service.set_expert_flag(report_id, flag)
    if not ok:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Expert review flag updated", "report_id": report_id, "flagged": flag}


@app.put("/api/reports/{report_id}/status")
def update_report_incident_status(report_id: str, status: str = Form(...), notes: Optional[str] = Form(None)):
    ok = db_service.update_report_status(report_id, status, notes)
    if not ok:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Status updated successfully", "report_id": report_id, "new_status": status}


@app.get("/api/clusters")
def get_hotspot_clusters(district: Optional[str] = None, crop: Optional[str] = None):
    clusters = db_service.get_hotspot_clusters(district=district, crop=crop)
    return {"total_clusters": len(clusters), "clusters": clusters}


@app.get("/api/stats")
def get_surveillance_stats():
    return db_service.get_dashboard_stats()


@app.get("/api/kvk")
def list_kvk_centers(district: Optional[str] = None):
    if district:
        return get_nearest_kvk(district)
    return {"centers": KVK_CENTERS}


@app.post("/api/broadcast-advisory")
def broadcast_district_advisory(payload: dict):
    district = payload.get("district", "Pune")
    crop = payload.get("crop", "Tomato")
    title = payload.get("title", "High Outbreak Risk Advisory")
    message = payload.get("message", "Fungicide spray recommended.")
    result = db_service.broadcast_advisory(district, crop, title, message)
    return {"success": True, "broadcast": result}


@app.get("/api/samples")
def list_preset_samples():
    """
    Returns preset test leaf images for 1-click demo in frontend.
    """
    return {
        "samples": [
            {
                "id": "sample-tomato-early-blight",
                "label": "Tomato — Early Blight",
                "label_mr": "टोमॅटो — लवकर येणारा करपा",
                "label_hi": "टमाटर — अगेती झुलसा",
                "crop": "Tomato",
                "expected_disease": "Early Blight",
                "image_file": "tomato_early_blight_sample.jpg",
                "image_url": "/sample_images/tomato_early_blight_sample.jpg",
                "district": "Pune",
                "lat": 19.2088,
                "lon": 73.8765
            },
            {
                "id": "sample-tomato-late-blight",
                "label": "Tomato — Late Blight (Rot)",
                "label_mr": "टोमॅटो — उशिरा येणारा करपा (सड)",
                "label_hi": "टमाटर — पछेती झुलसा",
                "crop": "Tomato",
                "expected_disease": "Late Blight",
                "image_file": "tomato_late_blight_sample.jpg",
                "image_url": "/sample_images/tomato_late_blight_sample.jpg",
                "district": "Nashik",
                "lat": 20.0820,
                "lon": 74.1250
            },
            {
                "id": "sample-potato-early-blight",
                "label": "Potato — Early Blight",
                "label_mr": "बटाटा — लवकर येणारा करपा",
                "label_hi": "आलू — अगेती झुलसा",
                "crop": "Potato",
                "expected_disease": "Early Blight",
                "image_file": "potato_early_blight_sample.jpg",
                "image_url": "/sample_images/potato_early_blight_sample.jpg",
                "district": "Nashik",
                "lat": 20.0150,
                "lon": 74.0120
            },
            {
                "id": "sample-cotton-bacterial-blight",
                "label": "Cotton — Bacterial Blight",
                "label_mr": "कापूस — काळा हात / जिवाणू करपा",
                "label_hi": "कपास — ब्लैक आर्म",
                "crop": "Cotton",
                "expected_disease": "Bacterial Blight (Black Arm)",
                "image_file": "cotton_bacterial_blight_sample.jpg",
                "image_url": "/sample_images/cotton_bacterial_blight_sample.jpg",
                "district": "Wardha",
                "lat": 20.7510,
                "lon": 78.5980
            },
            {
                "id": "sample-cotton-leaf-curl",
                "label": "Cotton — Leaf Curl (Whitefly)",
                "label_mr": "कापूस — चुरडा मुरडा (पांढरी माशी)",
                "label_hi": "कपास — पत्ती मरोड़ रोग",
                "crop": "Cotton",
                "expected_disease": "Leaf Curl / Sucking Pest Damage",
                "image_file": "cotton_leaf_curl_sample.jpg",
                "image_url": "/sample_images/cotton_leaf_curl_sample.jpg",
                "district": "Amravati",
                "lat": 20.9450,
                "lon": 77.7850
            },
            {
                "id": "sample-tomato-healthy",
                "label": "Tomato — Healthy Leaf",
                "label_mr": "टोमॅटो — निरोगी पान",
                "label_hi": "टमाटर — स्वस्थ पत्ती",
                "crop": "Tomato",
                "expected_disease": "Healthy Plant",
                "image_file": "tomato_healthy_sample.jpg",
                "image_url": "/sample_images/tomato_healthy_sample.jpg",
                "district": "Ahmednagar",
                "lat": 19.6450,
                "lon": 74.4820
            }
        ]
    }


# ==========================================
# STUB / PLACEHOLDER ENDPOINTS (SIH Scope)
# Marked clearly per prompt requirements
# ==========================================

@app.get("/api/iot/pest-traps")
def get_iot_smart_traps():
    """
    [STUB - REPRESENTED FEATURE]:
    Pest-trap / IoT sensor hardware integration.
    Simulates real-time telemetry from automated solar pheromone traps
    and optical fungal spore counters installed across Maharashtra farmlands.
    """
    stats = db_service.get_dashboard_stats()
    return {
        "_notice": "Feature represented via simulated IoT hardware telemetry stub per SIH scope",
        "active_devices": len(stats["iot_traps"]),
        "telemetry_stream": stats["iot_traps"]
    }


@app.post("/api/model/retrain-trigger")
def trigger_model_retrain_loop(trigger_reason: str = "field_confirmations_threshold_reached"):
    """
    [STUB - REPRESENTED FEATURE]:
    Model retraining / continuous learning loop.
    In full production, this triggers an automated pipeline in Google Colab / Kubeflow
    to ingest agronomist-verified field photos, fine-tune MobileNetV2,
    and deploy updated ONNX/PyTorch checkpoints.
    """
    return {
        "_notice": "Continuous learning loop architecture stubbed per hackathon scope",
        "pipeline": "PyTorch Fine-Tuning Pipeline (PlantVillage + Field Validations)",
        "status": "Queued for nocturnal batch retraining",
        "trigger": trigger_reason
    }


# Mount built React frontend if dist directory exists (for 1-click full-stack cloud deployment)
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend_dist")

