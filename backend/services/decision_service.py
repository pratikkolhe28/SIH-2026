"""Evidence-aware crop decision support. Rules are triage guidance, not prescriptions."""
from datetime import datetime, timedelta, timezone

HEALTHY_TOKENS = ("healthy",)


def build_action_plan(prediction: dict, weather: dict | None = None, outbreak: dict | None = None, crop_stage: str | None = None) -> dict:
    weather = weather or {}
    outbreak = outbreak or {}
    disease_id = str(prediction.get("id", "")).lower()
    disease_name = prediction.get("disease", "Unknown condition")
    confidence_level = prediction.get("confidence_level", "uncertain")
    is_healthy = any(token in disease_id for token in HEALTHY_TOKENS)
    weather_risk = str(weather.get("risk_level", "LOW")).upper()
    local_reports = int(outbreak.get("matching_reports", 0) or 0)
    verified_reports = int(outbreak.get("verified_reports", 0) or 0)

    if confidence_level == "unvalidated_model":
        action = "expert_review"
        label = "Expert review required"
        urgency = "high"
        reasons = ["The model checkpoint has no validated field-performance evidence available."]
    elif confidence_level == "uncertain":
        action = "inspect_verify"
        label = "Inspect and verify"
        urgency = "medium"
        reasons = ["The image model's leading score is too close to alternatives for confident triage."]
    elif is_healthy:
        action = "monitor"
        label = "Monitor — no treatment indicated by this image alone"
        urgency = "low"
        reasons = ["The model's leading class is healthy; this does not rule out pests, nutrient issues or early infection."]
    else:
        action = "inspect_verify"
        label = "Inspect and verify before treatment"
        urgency = "medium"
        reasons = [f"Image screening suggests {disease_name}, but a photo alone cannot confirm field diagnosis."]

    if weather_risk in {"HIGH", "CRITICAL", "ELEVATED"}:
        reasons.append(f"Weather service reports {weather_risk.lower()} agro-climatic risk; scout the crop promptly.")
        if action == "monitor":
            action, label, urgency = "monitor_closely", "Monitor closely and scout the field", "medium"
    if crop_stage:
        reasons.append(f"Farmer-reported crop stage: {crop_stage}. Stage is recorded as context; stage-specific thresholds still require locally validated rules.")
        if crop_stage == "maturity":
            reasons.append("Near-harvest crops require particular attention to the product label and pre-harvest interval before any chemical use.")
    if local_reports:
        reasons.append(f"{local_reports} non-demo report(s) for this crop/condition are recorded in the district in the recent window.")
    if verified_reports:
        reasons.append(f"{verified_reports} report(s) have expert-confirmed status.")

    next_steps = [
        "Inspect several plants across the field, including both sides of leaves, and note how widely symptoms occur.",
        "Compare symptoms with a local KVK/agriculture officer advisory, especially if the crop is at a sensitive growth stage.",
        "Do not spray solely from this AI result. If treatment is indicated by an approved local threshold, follow the product label, PPE and pre-harvest interval.",
    ]
    if action == "expert_review":
        next_steps.insert(0, "Request KVK or agriculture-officer verification before making a crop-protection decision.")
    if action == "monitor":
        next_steps = [
            "Continue routine scouting and capture a clear follow-up photo if symptoms appear or spread.",
            "Avoid unnecessary pesticide use; the image result alone is not a guarantee that the plant is disease-free.",
        ]

    return {
        "action": action,
        "label": label,
        "urgency": urgency,
        "spray_or_wait": "WAIT_AND_VERIFY" if action in {"expert_review", "inspect_verify", "monitor", "monitor_closely"} else "REVIEW_LOCAL_THRESHOLD",
        "reasons": reasons,
        "next_steps": next_steps,
        "evidence": {
            "model_confidence": prediction.get("confidence"),
            "model_status": prediction.get("model_status"),
            "weather_risk": weather_risk,
            "matching_recent_reports": local_reports,
            "expert_confirmed_reports": verified_reports,
            "crop_stage": crop_stage,
        },
        "disclaimer": "Decision support only. Confirm diagnosis and action thresholds with local agricultural experts; this output is not a pesticide prescription.",
    }


def summarize_local_signal(reports: list[dict], district: str | None, crop: str | None, disease_id: str | None = None) -> dict:
    cutoff = datetime.now(timezone.utc) - timedelta(days=14)
    relevant = []
    for report in reports:
        if report.get("source_type") == "demo" or report.get("verification_status") == "rejected":
            continue
        try:
            ts = datetime.fromisoformat(str(report.get("timestamp", "")).replace("Z", "+00:00"))
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        if ts < cutoff:
            continue
        if district and str(report.get("district", "")).lower() != district.lower():
            continue
        if crop and str(report.get("crop", "")).lower() != crop.lower():
            continue
        if disease_id and str(report.get("disease_id", "")).lower() != disease_id.lower():
            continue
        if "healthy" not in str(report.get("disease_id", "")).lower():
            relevant.append(report)
    confirmed = sum(1 for r in relevant if r.get("verification_status") == "confirmed")
    if confirmed >= 2 and len(relevant) >= 3:
        level = "expert_supported_cluster"
    elif len(relevant) >= 3:
        level = "suspected_cluster_verify"
    elif len(relevant) >= 2:
        level = "emerging_signal_verify"
    elif len(relevant) == 1:
        level = "isolated_observation"
    else:
        level = "no_recent_signal"
    return {
        "level": level,
        "matching_reports": len(relevant),
        "verified_reports": confirmed,
        "window_days": 14,
        "is_confirmed_outbreak": False,
        "message": "A report cluster is a signal for investigation, not proof of an outbreak." if relevant else "No recent non-demo reports matched these filters. This does not mean the area is disease-free.",
        "report_ids": [r.get("id") for r in relevant[:20]],
    }
