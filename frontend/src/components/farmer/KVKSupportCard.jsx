import React, { useState } from "react";
import { Building2, Phone, Flag, Check, MapPin, Mail } from "lucide-react";
import { TRANSLATIONS } from "../../translations";
import { flagReportForExpert } from "../../utils/api";

export default function KVKSupportCard({ kvkData, reportId, lang, initialFlagged = false }) {
  const [isFlagged, setIsFlagged] = useState(initialFlagged);
  const [flagging, setFlagging] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!kvkData) return null;

  const handleToggleFlag = async () => {
    if (!reportId) return;
    setFlagging(true);
    try {
      const nextState = !isFlagged;
      await flagReportForExpert(reportId, nextState);
      setIsFlagged(nextState);
    } catch (e) {
      console.error("Flagging failed:", e);
    } finally {
      setFlagging(false);
    }
  };

  const kvkName = lang === "mr" && kvkData.name_mr ? kvkData.name_mr : kvkData.name;

  return (
    <div className="kvk-card">
      <div className="kvk-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Building2 size={20} style={{ color: "#34d399" }} />
          <div>
            <h4 style={{ fontSize: "1rem", color: "#f8fafc" }}>{kvkName}</h4>
            <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{t.kvk_sub}</p>
          </div>
        </div>

        {reportId && (
          <button
            type="button"
            className={`btn-flag-expert ${isFlagged ? "flagged" : ""}`}
            onClick={handleToggleFlag}
            disabled={flagging}
            id="btn-flag-expert-review"
            title="Request agronomist verification"
          >
            {isFlagged ? <Check size={16} /> : <Flag size={16} />}
            <span>{isFlagged ? t.flagged_msg : t.flag_expert}</span>
          </button>
        )}
      </div>

      <div style={{ fontSize: "0.85rem", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <MapPin size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
          <span>{kvkData.address}</span>
        </div>

        {kvkData.contact_person && (
          <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            <strong>Officer:</strong> {kvkData.contact_person}
          </div>
        )}
      </div>

      <div className="kvk-actions">
        {kvkData.phone && (
          <a
            href={`tel:${kvkData.phone.split("/")[0].trim()}`}
            className="btn-call"
            style={{ textDecoration: "none" }}
          >
            <Phone size={15} />
            <span>{t.call_scientist}: {kvkData.phone.split("/")[0].trim()}</span>
          </a>
        )}

        {kvkData.toll_free && (
          <div
            style={{
              fontSize: "0.8rem",
              background: "rgba(255,255,255,0.05)",
              padding: "0.5rem 0.8rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#94a3b8",
            }}
          >
            <span>{t.toll_free}: <strong>{kvkData.toll_free}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
