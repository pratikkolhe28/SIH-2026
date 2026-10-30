import React, { useState } from "react";
import { ShieldCheck, MapPin, BarChart3, Activity, ClipboardCheck, Send } from "lucide-react";
import { submitReportFollowUp } from "../../utils/api";
import { TRANSLATIONS } from "../../translations";

export default function DiagnosisResult({ result, lang, onSwitchCrop }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [followUpStatus, setFollowUpStatus] = useState("improving");
  const [intervention, setIntervention] = useState("");
  const [cost, setCost] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");
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
  const decision = result.decision || {};
  const outbreak = result.outbreak_signal || {};

  const handleFollowUp = async (event) => {
    event.preventDefault();
    if (!saved?.id) return;
    setSavingFollowUp(true);
    setFollowUpMessage("");
    try {
      await submitReportFollowUp(saved.id, {
        symptoms_status: followUpStatus,
        intervention_used: intervention,
        intervention_cost: cost === "" ? null : Number(cost),
        notes: followUpNotes,
      });
      setFollowUpMessage("Follow-up saved. This is farmer-reported outcome data.");
      setFollowUpNotes("");
    } catch (error) {
      setFollowUpMessage(error.message || "Could not save follow-up.");
    } finally {
      setSavingFollowUp(false);
    }
  };

  return (
    <div className={`diagnosis-card ${!isHealthy ? "has-disease" : ""}`}>
      <div className="diagnosis-header">
        <div className="diagnosis-title-block">
          <div className="diagnosis-chips-row">
            <span className="diagnosis-crop-chip">
              {cropName}
            </span>

            <span className={`diagnosis-severity-badge ${isHealthy ? "healthy" : "danger"}`}>
              {pred.severity}
            </span>

            {/* Quick Switch Crop */}
            {onSwitchCrop && (
              <div className="diagnosis-switch-wrap">
                <span className="diagnosis-switch-label">Switch:</span>
                {["Tomato", "Potato", "Cotton"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onSwitchCrop(c)}
                    className={`diagnosis-switch-btn ${pred.crop.toLowerCase() === c.toLowerCase() ? "active" : ""}`}
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
          <div className="confidence-label">{lang === "mr" ? "मॉडेल स्कोअर" : lang === "hi" ? "मॉडल स्कोर" : "Model score"}</div>
        </div>
      </div>

      {/* Honest confidence and model validation disclosure */}
      <div className="diagnosis-disclosure-box">
        <strong>Screening result, not a confirmed diagnosis.</strong>{" "}
        {pred.model_status === "untrained_fallback"
          ? "The trained checkpoint was unavailable; this result is demonstration-only and must not guide treatment."
          : "The checkpoint has no bundled independent field-validation report. Confidence is a model score, not a proven accuracy percentage."}
        {pred.recommended_next_step && <div className="disclosure-next-step">{pred.recommended_next_step}</div>}
      </div>

      {/* Spray-or-wait decision support */}
      {decision.label && (
        <div className="diagnosis-decision-box">
          <div className="diagnosis-decision-header">
            <ShieldCheck size={18} className="decision-shield-icon" />
            <strong>Spray or wait? — {decision.label}</strong>
          </div>
          <ul className="diagnosis-decision-list">
            {(decision.next_steps || []).map((step, i) => <li key={i}>{step}</li>)}
          </ul>
          {decision.reasons?.length > 0 && <div className="diagnosis-decision-evidence">Evidence: {decision.reasons.join(" ")}</div>}
          {decision.disclaimer && <div className="diagnosis-decision-disclaimer">{decision.disclaimer}</div>}
        </div>
      )}

      {/* Local outbreak signal */}
      {outbreak.level && (
        <div className="diagnosis-outbreak-box">
          <div className="outbreak-header"><Activity size={16} /> Local outbreak intelligence</div>
          <div className="outbreak-msg">{outbreak.message}</div>
          <div className="outbreak-meta">{outbreak.matching_reports || 0} matching reports in the last {outbreak.window_days || 14} days · {outbreak.verified_reports || 0} expert-confirmed</div>
        </div>
      )}

      {/* Pathology Lesion Analysis */}
      <div>
        <div className="visual-indicators-heading">
          <Activity size={15} className="visual-icon" />
          <span>{t.visual_indicators}</span>
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
        <div className="diagnosis-symptoms-box">
          <strong className="symptoms-label">{t.symptoms}: </strong>
          <span className="symptoms-text">{symptomsText}</span>
        </div>
      )}

      {/* Top Alternative Predictions */}
      {pred.top_predictions && pred.top_predictions.length > 1 && (
        <div className="differentials-list">
          <div className="differentials-header">
            <BarChart3 size={14} />
            <span>{t.differentials}</span>
          </div>
          {pred.top_predictions.map((alt) => (
            <div key={alt.rank} className={`diff-row ${alt.rank === 1 ? "top-rank" : ""}`}>
              <span className="diff-name">
                {alt.rank}. {alt.disease} ({alt.crop})
              </span>
              <span className="diff-pct">
                {Math.round(alt.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Farmer outcome loop */}
      {saved?.id && (
        <form onSubmit={handleFollowUp} className="followup-form-card">
          <div className="followup-form-title">
            <ClipboardCheck size={17} className="followup-icon" />
            <strong>Track what happens next</strong>
          </div>
          <div className="followup-inputs-grid">
            <label className="followup-label">Symptoms after follow-up
              <select value={followUpStatus} onChange={(e) => setFollowUpStatus(e.target.value)} className="followup-input">
                <option value="improving">Improving</option><option value="unchanged">Unchanged</option><option value="worsening">Worsening</option><option value="unknown">Not sure</option>
              </select>
            </label>
            <label className="followup-label">Action taken
              <select value={intervention} onChange={(e) => setIntervention(e.target.value)} className="followup-input">
                <option value="">Select action</option><option value="monitoring">Monitoring only</option><option value="cultural">Cultural / physical control</option><option value="biological">Biological control</option><option value="chemical">Chemical treatment (expert/label guided)</option><option value="expert_review">Expert consultation</option>
              </select>
            </label>
            <label className="followup-label">Approx. cost (₹, optional)
              <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" className="followup-input" />
            </label>
          </div>
          <label className="followup-label followup-notes-label">Notes (optional)
            <textarea rows="2" value={followUpNotes} onChange={(e) => setFollowUpNotes(e.target.value)} placeholder="What changed since the first report?" className="followup-input" />
          </label>
          <button type="submit" disabled={savingFollowUp} className="followup-submit-btn">
            <Send size={14} />
            <span>{savingFollowUp ? "Saving…" : "Save follow-up"}</span>
          </button>
          {followUpMessage && <div role="status" className={`followup-feedback ${followUpMessage.includes("saved") ? "success" : "error"}`}>{followUpMessage}</div>}
        </form>
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
