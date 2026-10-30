"""
FastAPI Server for SIH PS 26131 — Crop Disease & Pest Detection System
Govt of Maharashtra (Maharashtra State Innovation Society)
Serves ML inference, multilingual advisories, weather risk rules,
geospatial hotspots, and government surveillance dashboard APIs.
"""

import os
import hashlib
import requests
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from services.auth_service import init_auth_db, create_user, login as login_user, get_user_for_token, revoke_token

from ml.model import inference_engine
from ml.classes import CLASSES
from services.advisory_service import advisory_service
from services.weather_service import weather_service, MAHARASHTRA_DISTRICTS
from services.kvk_service import get_nearest_kvk, KVK_CENTERS
from services.db_service import db_service
from services.decision_service import build_action_plan, summarize_local_signal

app = FastAPI(
    title="Crop Disease & Pest Surveillance System (SIH PS 26131)",
    description="Farmer diagnosis and Government Outbreak Hotspot Surveillance for Maharashtra State",
    version="1.0.0"
)

init_auth_db()

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
        "ml_engine": "PyTorch MobileNetV2 (CPU; scores are not field-calibrated without validation evidence)",
        "demo_data_excluded_from_live_stats": True,
        "total_reports_stored": stats["total_reports"],
        "active_hotspots": stats["active_hotspots"]
    }


class SignupPayload(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    district: str = Field(default="", max_length=80)
    village: str = Field(default="", max_length=100)
    preferred_language: str = Field(default="en", max_length=2)


class LoginPayload(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)


def _bearer_token(authorization: Optional[str]):
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return authorization.split(" ", 1)[1].strip()


@app.post("/api/auth/signup")
def signup(payload: SignupPayload):
    try:
        user = create_user(payload.full_name, payload.email, payload.password, payload.district, payload.village, payload.preferred_language)
        token, user = login_user(payload.email, payload.password)
        return {"token": token, "user": user}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/auth/login")
def signin(payload: LoginPayload):
    try:
        token, user = login_user(payload.email, payload.password)
        return {"token": token, "user": user}
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))


@app.get("/api/auth/me")
def current_account(authorization: Optional[str] = Header(None)):
    # Authorization is supplied as a normal header by the frontend.
    user = get_user_for_token(_bearer_token(authorization))
    if not user:
        raise HTTPException(status_code=401, detail="Please sign in again.")
    return {"user": user}


@app.post("/api/auth/logout")
def signout(authorization: Optional[str] = Header(None)):
    revoke_token(_bearer_token(authorization))
    return {"ok": True}


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
    crop_stage: Optional[str] = Form(None),
    observed_symptoms: Optional[str] = Form(None),
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

        # Local outbreak signal uses non-demo farmer observations only.
        local_reports = db_service.get_reports(district=district, crop=prediction["crop"], limit=500, include_demo=False)
        outbreak_signal = summarize_local_signal(local_reports, district, prediction["crop"], prediction["id"])
        decision = build_action_plan(prediction, weather_info, outbreak_signal, crop_stage=crop_stage)

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
                "source_type": "farmer",
                "verification_status": "unverified",
                "crop_stage": crop_stage,
                "observed_symptoms": observed_symptoms,
                "image_hash": hashlib.sha256(contents).hexdigest(),
                "notes": f"AI screening suggestion (unverified): {prediction['disease']} ({prediction['confidence_pct']}); model status: {prediction.get('model_status', 'unknown')}"
            })

        return {
            "prediction": prediction,
            "advisory": advisory,
            "weather": weather_info,
            "nearest_kvk": kvk,
            "saved_report": saved_report,
            "decision": decision,
            "outbreak_signal": outbreak_signal
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.post("/api/assistant/chat")
def crop_assistant_chat(payload: dict):
    """Optional Gemini-backed multilingual crop helper. Never treats a photo score as confirmed diagnosis."""
    question = str(payload.get("question", "")).strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")
    if len(question) > 2000:
        raise HTTPException(status_code=400, detail="Question is too long (maximum 2000 characters).")

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return {"configured": False, "answer": None, "provider": "guided_fallback"}

    lang = str(payload.get("lang", "en")).lower()
    language_name = {"en": "English", "hi": "Hindi", "mr": "Marathi"}.get(lang, "English")
    context = payload.get("context") or {}
    # Only pass compact, user-visible context. Do not send uploaded image bytes or personal identifiers.
    safe_context = {
        "crop": context.get("crop"),
        "screening_result": context.get("disease"),
        "model_score": context.get("confidence"),
        "model_status": context.get("model_status"),
        "decision_action": context.get("decision_action"),
        "next_steps": context.get("next_steps", [])[:4] if isinstance(context.get("next_steps", []), list) else [],
        "weather_risk": context.get("weather_risk"),
        "organic_guidance": context.get("organic_guidance", [])[:3] if isinstance(context.get("organic_guidance", []), list) else [],
        "cultural_practices": context.get("cultural_practices", [])[:3] if isinstance(context.get("cultural_practices", []), list) else [],
    }
    prompt = (
        "You are Farm Saathi, a careful agricultural information assistant for smallholder farmers in Maharashtra, India. "
        f"Answer in {language_name}, using simple, respectful language and short practical steps. "
        "Use the supplied context when relevant. The model result is only an image-screening suggestion, never a confirmed diagnosis. "
        "Do not invent disease certainty, outbreak confirmation, pesticide registrations, doses, or local thresholds. "
        "Do not tell the farmer to spray based only on a photo. Recommend checking multiple plants and consulting a KVK/agriculture officer when uncertain. "
        "For chemical questions, tell the user to verify a product registered for the crop/problem, follow the label, PPE and pre-harvest interval; do not invent a dosage. "
        "If context is missing, say so. Be transparent and keep the answer under 180 words.\n\n"
        f"Current app context (untrusted farmer-facing data): {safe_context}\n\nFarmer question: {question}"
    )
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    try:
        response = requests.post(
            endpoint,
            params={"key": api_key},
            json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.3, "maxOutputTokens": 500}},
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()
        answer = "".join(part.get("text", "") for part in data.get("candidates", [{}])[0].get("content", {}).get("parts", [])).strip()
        if not answer:
            return {"configured": False, "answer": None, "provider": "guided_fallback", "detail": "Empty provider response"}
        return {"configured": True, "answer": answer, "provider": model}
    except Exception as exc:
        # Keep the farmer experience usable if a key, quota, or provider is unavailable.
        return {"configured": False, "answer": None, "provider": "guided_fallback", "detail": str(exc)[:240]}


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
    limit: int = Query(200),
    include_demo: bool = Query(True)
):
    reports = db_service.get_reports(
        district=district,
        crop=crop,
        disease_id=disease_id,
        status=status,
        flagged_only=flagged_only,
        limit=limit,
        include_demo=include_demo
    )
    return {"total": len(reports), "reports": reports}


@app.post("/api/reports")
def submit_farmer_report(report_data: dict):
    saved = db_service.add_report(report_data)
    return {"message": "Report logged successfully", "report": saved}


@app.post("/api/reports/{report_id}/follow-up")
def submit_report_follow_up(report_id: str, payload: dict):
    """Record a farmer follow-up; reported outcomes are self-reported, not causal proof."""
    try:
        for field in ("intervention_cost", "estimated_loss"):
            if payload.get(field) is not None:
                value = float(payload[field])
                if value < 0:
                    raise ValueError(f"{field} cannot be negative")
                payload[field] = value
        follow_up = db_service.add_follow_up(report_id, payload)
        if not follow_up:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Follow-up recorded", "follow_up": follow_up}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@app.get("/api/reports/{report_id}/follow-up")
def list_report_follow_ups(report_id: str):
    reports = db_service.get_reports(limit=1000)
    if not any(r["id"] == report_id for r in reports):
        raise HTTPException(status_code=404, detail="Report not found")
    return {"report_id": report_id, "follow_ups": db_service.get_follow_ups(report_id)}


@app.get("/api/outbreak-intelligence")
def get_outbreak_intelligence(district: Optional[str] = None, crop: Optional[str] = None, disease_id: Optional[str] = None):
    reports = db_service.get_reports(district=district, crop=crop, limit=1000, include_demo=False)
    return summarize_local_signal(reports, district, crop, disease_id)


@app.get("/api/reports/{report_id}/flag-expert")
def get_report_review_status(report_id: str):
    reports = db_service.get_reports(limit=1000)
    report = next((r for r in reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"report_id": report_id, "verification_status": report.get("verification_status", "unverified"), "status": report.get("status")}


@app.post("/api/reports/{report_id}/flag-expert")
def flag_for_expert_review(report_id: str, flag: bool = True):
    ok = db_service.set_expert_flag(report_id, flag)
    if not ok:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Expert review flag updated", "report_id": report_id, "flagged": flag}


@app.put("/api/reports/{report_id}/status")
def update_report_incident_status(report_id: str, status: str = Form(...), notes: Optional[str] = Form(None)):
    try:
        ok = db_service.update_report_status(report_id, status, notes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    if not ok:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Status updated successfully", "report_id": report_id, "new_status": status}


@app.get("/api/clusters")
def get_hotspot_clusters(district: Optional[str] = None, crop: Optional[str] = None, include_demo: bool = Query(False)):
    clusters = db_service.get_hotspot_clusters(district=district, crop=crop, include_demo=include_demo)
    return {"total_clusters": len(clusters), "clusters": clusters, "includes_demo_data": include_demo}


@app.get("/api/stats")
def get_surveillance_stats():
    return db_service.get_dashboard_stats()


@app.get("/api/impact-metrics")
def get_impact_metrics():
    return db_service.get_impact_metrics()


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

