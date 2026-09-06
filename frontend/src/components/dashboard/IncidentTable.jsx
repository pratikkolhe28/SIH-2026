import React, { useState } from "react";
import { Flag, Search, CheckCircle2, Clock, AlertTriangle, Shield } from "lucide-react";
import { TRANSLATIONS } from "../../translations";
import { updateReportStatus, flagReportForExpert } from "../../utils/api";

export default function IncidentTable({ reports, onReportUpdated, lang }) {
  const [searchTerm, setSearchTerm] = useState("");
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleStatusSelect = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      if (onReportUpdated) onReportUpdated();
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleToggleFlag = async (reportId, currentFlag) => {
    try {
      await flagReportForExpert(reportId, !currentFlag);
      if (onReportUpdated) onReportUpdated();
    } catch (e) {
      console.error("Failed to toggle flag:", e);
    }
  };

  const filtered = reports.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.crop?.toLowerCase().includes(q) ||
      r.disease_name?.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q) ||
      r.taluka?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="table-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={20} style={{ color: "#34d399" }} />
            <span>{t.incidents_title}</span>
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Field geotags logged by farmers with agricultural officer triage status
          </p>
        </div>

        <div style={{ position: "relative", minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search crop, disease, district..."
            style={{ paddingLeft: "32px", fontSize: "0.82rem" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="incident-table">
        <thead>
          <tr>
            <th>{t.col_id}</th>
            <th>{t.col_crop}</th>
            <th>{t.col_disease}</th>
            <th>{t.col_location}</th>
            <th>{t.col_severity}</th>
            <th>{t.col_status}</th>
            <th>{t.col_actions}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 20).map((r) => {
            const isCrit = r.severity === "Critical Outbreak Risk" || r.severity === "High";
            const isHealthy = r.disease_name?.toLowerCase().includes("healthy");

            return (
              <tr key={r.id}>
                <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#94a3b8" }}>
                  {r.id.slice(0, 12)}
                </td>
                <td style={{ fontWeight: 600 }}>{r.crop}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{r.disease_name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {Math.round(r.confidence * 100)}% confidence
                  </div>
                </td>
                <td>
                  <div>{r.taluka || "Rural"}, {r.district}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    {parseFloat(r.latitude).toFixed(3)}, {parseFloat(r.longitude).toFixed(3)}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      background: isCrit ? "rgba(239, 68, 68, 0.15)" : isHealthy ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      color: isCrit ? "#f87171" : isHealthy ? "#4ade80" : "#fbbf24",
                    }}
                  >
                    {r.severity}
                  </span>
                </td>
                <td>
                  <select
                    className="filter-select"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.78rem" }}
                    value={r.status || "reported"}
                    onChange={(e) => handleStatusSelect(r.id, e.target.value)}
                  >
                    <option value="reported">Reported</option>
                    <option value="under_review">Under Review</option>
                    <option value="contained">Contained</option>
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className={`btn-icon-pill ${r.flagged_for_expert ? "active" : ""}`}
                    style={{
                      width: "30px",
                      height: "30px",
                      background: r.flagged_for_expert ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.05)",
                      borderColor: r.flagged_for_expert ? "#ef4444" : "transparent",
                    }}
                    onClick={() => handleToggleFlag(r.id, r.flagged_for_expert)}
                    title={r.flagged_for_expert ? "Expert review requested" : "Flag for Agronomist"}
                  >
                    <Flag size={14} style={{ color: r.flagged_for_expert ? "#ef4444" : "#94a3b8" }} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
