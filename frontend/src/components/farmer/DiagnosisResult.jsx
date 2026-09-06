import React from "react";
import { CheckCircle, AlertTriangle, ShieldCheck, MapPin, BarChart3, Activity } from "lucide-react";
import { TRANSLATIONS } from "../../translations";

export default function DiagnosisResult({ result, lang, onSwitchCrop }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (!result || !result.prediction) return null;

  const pred = result.prediction;
  const isHealthy = pred.disease.toLowerCase().includes("healthy");

  // Multilingual disease & crop name
  const diseaseName = lang === "mr" && pred.disease_mr
    ? pred.disease_mr
    : lang === "hi" && pred.disease_hi
    ? pred.disease_hi
    : pred.disease;

  const cropName = lang === "mr" && pred.crop_mr
    ? pred.crop_mr
    : lang === "hi" && pred.crop_hi
    ? pred.crop_hi
    : pred.crop;

  const symptomsText = lang === "mr" && pred.symptoms_mr
    ? pred.symptoms_mr
    : lang === "hi" && pred.symptoms_hi
    ? pred.symptoms_hi
    : pred.symptoms;

  const visual = pred.visual_indicators || {
    necrotic_lesion_pct: 0,
    chlorosis_yellow_pct: 0,
    healthy_tissue_pct: 100,
  };

  const saved = result.saved_report;

  return (
    <div className={`diagnosis-card ${!isHealthy ? "has-disease" : ""}`}>
      <div className="diagnosis-header">
        <div className="diagnosis-title-block">
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
              }}
            >
              {cropName}
            </span>

            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                background: isHealthy ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                color: isHealthy ? "#4ade80" : "#f87171",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
              }}
            >
              {pred.severity}
            </span>

            {/* Quick Switch Crop */}
            {onSwitchCrop && (
              <div style={{ display: "inline-flex", gap: "0.3rem", marginLeft: "0.4rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Switch:</span>
                {["Tomato", "Potato", "Cotton"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onSwitchCrop(c)}
                    style={{
                      fontSize: "0.68rem",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "4px",
                      background: pred.crop.toLowerCase() === c.toLowerCase() ? "#10b981" : "rgba(255,255,255,0.08)",
                      color: "#fff",
                      cursor: "pointer",
                      border: "none"
                    }}
                    title={`Re-analyze specifically for ${c}`}
                  >
                    {c === "Tomato" ? "🍅" : c === "Potato" ? "🥔" : "🌿"} {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <h3>{diseaseName}</h3>
          <p className="pathogen-meta">
            <span>{t.pathogen}: {pred.pathogen} ({pred.type})</span>
          </p>
        </div>

        <div className="confidence-gauge-wrap">
          <div className="confidence-value">{pred.confidence_pct}</div>
          <div className="confidence-label">{t.confidence_label}</div>
        </div>
      </div>

      {/* Pathology Lesion Analysis */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
          <Activity size={15} style={{ color: "#34d399" }} />
          <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "#94a3b8" }}>
            {t.visual_indicators}
          </span>
        </div>
        <div className="pathology-indicators">
          <div className="indicator-item necrotic">
            <span className="pct">{visual.necrotic_lesion_pct}%</span>
            <span className="tag">{t.necrotic_tissue}</span>
          </div>
          <div className="indicator-item chlorosis">
            <span className="pct">{visual.chlorosis_yellow_pct}%</span>
            <span className="tag">{t.chlorosis_tissue}</span>
          </div>
          <div className="indicator-item healthy">
            <span className="pct">{visual.healthy_tissue_pct}%</span>
            <span className="tag">{t.healthy_tissue}</span>
          </div>
        </div>
      </div>

      {/* Symptoms Description */}
      {symptomsText && (
        <div style={{ background: "rgba(0,0,0,0.25)", padding: "0.85rem 1rem", borderRadius: "10px", fontSize: "0.88rem" }}>
          <strong style={{ color: "#34d399" }}>{t.symptoms}: </strong>
          <span style={{ color: "#e2e8f0" }}>{symptomsText}</span>
        </div>
      )}

      {/* Top Alternative Predictions */}
      {pred.top_predictions && pred.top_predictions.length > 1 && (
        <div className="differentials-list">
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.2rem" }}>
            <BarChart3 size={14} style={{ color: "#94a3b8" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
              {t.differentials}
            </span>
          </div>
          {pred.top_predictions.map((alt) => (
            <div key={alt.rank} className="diff-row">
              <span style={{ color: alt.rank === 1 ? "#34d399" : "#cbd5e1", fontWeight: alt.rank === 1 ? 700 : 500 }}>
                {alt.rank}. {alt.disease} ({alt.crop})
              </span>
              <span style={{ fontWeight: 700, color: "#94a3b8" }}>
                {Math.round(alt.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Geotag Confirmation */}
      {saved && (
        <div className="geotag-synced-pill">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={16} style={{ color: "#34d399" }} />
            <span>{t.geotag_synced}</span>
          </div>
          <span style={{ fontSize: "0.75rem", opacity: 0.85, fontWeight: 600 }}>
            {saved.district} ({Number(saved.latitude).toFixed(4)}, {Number(saved.longitude).toFixed(4)})
          </span>
        </div>
      )}
    </div>
  );
}
