import React, { useState } from "react";
import { Leaf, FlaskConical, Tractor, ShieldAlert, Clock, AlertCircle } from "lucide-react";
import { TRANSLATIONS } from "../../translations";

export default function TreatmentAdvisory({ advisory, lang }) {
  const [activeTab, setActiveTab] = useState("organic");
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!advisory) return null;

  const organic = advisory.organic || {};
  const chemical = advisory.chemical || {};
  const cultural = advisory.cultural_practices || [];

  return (
    <div className="advisory-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldAlert size={20} style={{ color: "#34d399" }} />
          <span>{t.advisory_heading}</span>
        </h3>
      </div>

      {/* Advisory Tabs */}
      <div className="advisory-tabs-nav">
        <button
          type="button"
          className={`advisory-tab-btn ${activeTab === "organic" ? "active" : ""}`}
          onClick={() => setActiveTab("organic")}
          id="btn-tab-organic"
        >
          <Leaf size={16} />
          <span>{t.tab_organic}</span>
        </button>

        <button
          type="button"
          className={`advisory-tab-btn ${activeTab === "chemical" ? "active" : ""}`}
          onClick={() => setActiveTab("chemical")}
          id="btn-tab-chemical"
        >
          <FlaskConical size={16} />
          <span>{t.tab_chemical}</span>
        </button>

        <button
          type="button"
          className={`advisory-tab-btn ${activeTab === "cultural" ? "active" : ""}`}
          onClick={() => setActiveTab("cultural")}
          id="btn-tab-cultural"
        >
          <Tractor size={16} />
          <span>{t.tab_cultural}</span>
        </button>
      </div>

      {/* TAB CONTENT: Organic */}
      {activeTab === "organic" && (
        <div>
          <p className="advisory-tab-desc">
            {organic.title || "Biological and traditional bio-pesticide treatments without chemical residues."}
          </p>
          <ul className="remedies-list">
            {(organic.remedies || []).map((rem, i) => (
              <li key={i} className="remedy-item">
                <Leaf size={18} className="remedy-icon-organic" />
                <span>{rem}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TAB CONTENT: Chemical */}
      {activeTab === "chemical" && (
        <div>
          <div className="advisory-warning-banner">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>
              Always wear gloves & mask when spraying. Adhere strictly to the recommended Pre-Harvest Interval (PHI).
            </span>
          </div>

          {chemical.verified_for_region === true ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {(chemical.medicines || []).map((med, idx) => (
                <div key={idx} className="remedy-item chemical">
                  <FlaskConical size={20} className="remedy-icon-chemical" />
                  <div className="chemical-details">
                    <div className="chemical-header">
                      <span>{med.name}</span>
                      {med.phi_days && <span className="badge-phi">{med.phi_days}</span>}
                    </div>
                    <div className="chemical-meta-tags">
                      <span><strong>{t.dosage}:</strong> {med.dosage}</span>
                      {med.timing && <span><strong>{t.timing}:</strong> {med.timing}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="advisory-withheld-notice">
              <strong>Product-specific chemical advice is withheld.</strong> This project's treatment catalogue has not been independently verified against current crop/pest registrations and local label directions. Ask your KVK/agriculture officer to confirm the product, dose, protective equipment and pre-harvest interval before use.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Cultural Practices */}
      {activeTab === "cultural" && (
        <div>
          <p className="advisory-tab-desc">
            Agronomic field hygiene and sanitation practices to break the pathogen life cycle:
          </p>
          <ul className="remedies-list">
            {(cultural || []).map((practice, i) => (
              <li key={i} className="remedy-item cultural">
                <Tractor size={18} className="remedy-icon-cultural" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
