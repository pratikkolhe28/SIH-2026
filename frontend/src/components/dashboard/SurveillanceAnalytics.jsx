import React from "react";
import { FileText, Flame, ShieldAlert, Cpu, PieChart, TrendingUp } from "lucide-react";
import { TRANSLATIONS } from "../../translations";

export default function SurveillanceAnalytics({ stats, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!stats) return null;

  const totalReports = stats.total_reports || 1;
  const criticalCount = stats.critical_alerts ?? stats.critical_incidents ?? 0;

  // Normalize crop breakdown (can be array of {crop, count} or object {crop: count})
  let cropList = [];
  if (Array.isArray(stats.crop_breakdown)) {
    cropList = stats.crop_breakdown.map((item) => ({
      crop: item.crop || "Unknown",
      count: Number(item.count) || 0,
    }));
  } else if (stats.crop_breakdown && typeof stats.crop_breakdown === "object") {
    cropList = Object.entries(stats.crop_breakdown).map(([crop, count]) => ({
      crop,
      count: Number(count) || 0,
    }));
  }

  // Normalize disease breakdown (can be array of {disease_name, count} or object)
  let diseaseList = [];
  const diseaseSource = stats.top_diseases || stats.disease_breakdown || [];
  if (Array.isArray(diseaseSource)) {
    diseaseList = diseaseSource.map((item) => ({
      disease: item.disease_name || item.disease || "Unknown",
      count: Number(item.count) || 0,
    }));
  } else if (typeof diseaseSource === "object") {
    diseaseList = Object.entries(diseaseSource).map(([disease, count]) => ({
      disease,
      count: Number(count) || 0,
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 4 Top KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <FileText size={24} />
          </div>
          <div className="kpi-val-block">
            <div className="num">{stats.total_reports || 0}</div>
            <div className="title">{t.kpi_reports}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap crit">
            <Flame size={24} />
          </div>
          <div className="kpi-val-block">
            <div className="num" style={{ color: "#ef4444" }}>{stats.active_hotspots || 0}</div>
            <div className="title">{t.kpi_hotspots}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap warn">
            <ShieldAlert size={24} />
          </div>
          <div className="kpi-val-block">
            <div className="num" style={{ color: "#f97316" }}>{criticalCount}</div>
            <div className="title">{t.kpi_critical}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap info">
            <Cpu size={24} />
          </div>
          <div className="kpi-val-block">
            <div className="num" style={{ color: "#38bdf8" }}>{stats.iot_traps?.length || 4}</div>
            <div className="title">{t.kpi_traps}</div>
          </div>
        </div>
      </div>

      {/* 2-Column Visual Distribution Cards */}
      <div className="dashboard-secondary-grid">
        {/* Crop Breakdown */}
        <div className="analytics-card">
          <h3>
            <PieChart size={18} style={{ color: "#34d399" }} />
            <span>Crop Surveillance Distribution</span>
          </h3>

          <div className="stat-bar-group">
            {cropList.map(({ crop, count }) => {
              const pct = Math.round((count / totalReports) * 100);
              return (
                <div key={crop} className="stat-bar-item">
                  <div className="stat-bar-labels">
                    <span>{crop}</span>
                    <span className="val">{count} reports ({pct}%)</span>
                  </div>
                  <div className="stat-bar-track">
                    <div className="stat-bar-fill" style={{ width: `${Math.max(8, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disease Breakdown */}
        <div className="analytics-card">
          <h3>
            <TrendingUp size={18} style={{ color: "#ef4444" }} />
            <span>Top Pathogen Outbreaks</span>
          </h3>

          <div className="stat-bar-group">
            {diseaseList.slice(0, 5).map(({ disease, count }) => {
              const pct = Math.round((count / totalReports) * 100);
              const isCrit = disease.toLowerCase().includes("blight") || disease.toLowerCase().includes("curl");
              return (
                <div key={disease} className="stat-bar-item">
                  <div className="stat-bar-labels">
                    <span>{disease}</span>
                    <span className="val">{count} ({pct}%)</span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className={`stat-bar-fill ${isCrit ? "crit" : ""}`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
