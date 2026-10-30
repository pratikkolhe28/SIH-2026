// API Client for SIH PS 26131 Crop Surveillance Backend

export const API_BASE = import.meta.env.VITE_API_URL || "";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

export async function fetchDistricts() {
  const res = await fetch(`${API_BASE}/api/districts`);
  return res.json();
}

export async function fetchAgroWeather(district = "pune", lat = null, lon = null) {
  let url = `${API_BASE}/api/weather?district=${encodeURIComponent(district)}`;
  if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  }
  const res = await fetch(url);
  return res.json();
}

export async function predictCropDisease(formData) {
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Inference failed" }));
    throw new Error(err.detail || "Prediction error");
  }
  return res.json();
}

export async function fetchReports({ district, crop, disease_id, status, flagged_only, limit = 200 } = {}) {
  const params = new URLSearchParams();
  if (district) params.append("district", district);
  if (crop) params.append("crop", crop);
  if (disease_id) params.append("disease_id", disease_id);
  if (status) params.append("status", status);
  if (flagged_only) params.append("flagged_only", "true");
  params.append("limit", limit);

  const res = await fetch(`${API_BASE}/api/reports?${params.toString()}`);
  return res.json();
}

export async function fetchHotspotClusters(district = null, crop = null, includeDemo = true) {
  const params = new URLSearchParams();
  if (includeDemo) params.append("include_demo", "true");
  if (district) params.append("district", district);
  if (crop) params.append("crop", crop);
  const res = await fetch(`${API_BASE}/api/clusters?${params.toString()}`);
  return res.json();
}

export async function fetchSurveillanceStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  return res.json();
}

export async function fetchPresetSamples() {
  const res = await fetch(`${API_BASE}/api/samples`);
  const data = await res.json();
  if (data && data.samples && API_BASE) {
    data.samples = data.samples.map(s => ({
      ...s,
      image_url: s.image_url && !s.image_url.startsWith("http") ? `${API_BASE}${s.image_url}` : s.image_url
    }));
  }
  return data;
}

export async function flagReportForExpert(reportId, flag = true) {
  const res = await fetch(`${API_BASE}/api/reports/${reportId}/flag-expert?flag=${flag}`, {
    method: "POST"
  });
  return res.json();
}

export async function updateReportStatus(reportId, status, notes = "") {
  const formData = new FormData();
  formData.append("status", status);
  if (notes) formData.append("notes", notes);

  const res = await fetch(`${API_BASE}/api/reports/${reportId}/status`, {
    method: "PUT",
    body: formData
  });
  return res.json();
}

export async function broadcastDistrictAdvisory(payload) {
  const res = await fetch(`${API_BASE}/api/broadcast-advisory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchIoTTraps() {
  const res = await fetch(`${API_BASE}/api/iot/pest-traps`);
  return res.json();
}

export async function submitReportFollowUp(reportId, payload) {
  const res = await fetch(`${API_BASE}/api/reports/${encodeURIComponent(reportId)}/follow-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Could not save follow-up");
  return data;
}

export async function fetchOutbreakIntelligence(district = null, crop = null, diseaseId = null) {
  const params = new URLSearchParams();
  if (district) params.append("district", district);
  if (crop) params.append("crop", crop);
  if (diseaseId) params.append("disease_id", diseaseId);
  const res = await fetch(`${API_BASE}/api/outbreak-intelligence?${params.toString()}`);
  if (!res.ok) throw new Error("Could not load outbreak intelligence");
  return res.json();
}

export async function fetchImpactMetrics() {
  const res = await fetch(`${API_BASE}/api/impact-metrics`);
  if (!res.ok) throw new Error("Could not load impact metrics");
  return res.json();
}

export async function askCropAssistant(payload) {
  const res = await fetch(`${API_BASE}/api/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Assistant request failed");
  }
  return res.json();
}

export async function authRequest(path, payload = null, token = null, method = "POST") {
  const headers = {};
  if (payload) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api/auth/${path}`, {
    method,
    headers,
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.map((item) => item.msg).join(" ") : data.detail;
    throw new Error(detail || "Authentication request failed. Please try again.");
  }
  return data;
}
