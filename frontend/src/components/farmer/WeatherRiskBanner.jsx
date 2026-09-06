import React from "react";
import { CloudRain, Droplets, Thermometer, Wind, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { TRANSLATIONS } from "../../translations";

export default function WeatherRiskBanner({
  weatherData,
  selectedDistrict,
  setSelectedDistrict,
  districtsList,
  lang,
  onDetectGPS,
  detectingGPS
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!weatherData) return null;

  const alerts = weatherData.risk_alerts || [];
  const primaryAlert = weatherData.primary_risk || (alerts.length > 0 ? alerts[0] : null);
  const isCritical = primaryAlert?.risk_level === "CRITICAL";
  const isHigh = primaryAlert?.risk_level === "HIGH";

  // District name translated
  const districtDisplay = lang === "mr" && weatherData.district_mr
    ? weatherData.district_mr
    : lang === "hi" && weatherData.district_hi
    ? weatherData.district_hi
    : weatherData.district;

  return (
    <section className={`weather-risk-card ${isCritical ? "risk-critical" : isHigh ? "risk-high" : ""}`}>
      <div className="weather-header">
        <div className="weather-location">
          <MapPin size={18} className="text-emerald-400" style={{ color: "#34d399" }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            {districtDisplay} {t.weather_title}
          </span>
          <select
            className="district-picker-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            id="select-farmer-district"
          >
            {districtsList.map((d) => (
              <option key={d.key} value={d.key}>
                {lang === "mr" ? d.name_mr : lang === "hi" ? d.name_hi : d.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-icon-pill"
            style={{ width: "32px", height: "32px" }}
            onClick={onDetectGPS}
            title="Detect My Field GPS Coordinates"
            disabled={detectingGPS}
          >
            <MapPin size={14} />
          </button>
        </div>

        <div className="weather-metrics-grid">
          <div className="weather-stat-chip">
            <Thermometer size={16} style={{ color: "#f87171" }} />
            <span>{weatherData.temp}°C</span>
            <span className="label">{t.temp}</span>
          </div>

          <div className="weather-stat-chip">
            <Droplets size={16} style={{ color: "#60a5fa" }} />
            <span>{weatherData.humidity}%</span>
            <span className="label">{t.humidity}</span>
          </div>

          <div className="weather-stat-chip">
            <Wind size={16} style={{ color: "#a78bfa" }} />
            <span>{weatherData.wind_speed} km/h</span>
            <span className="label">{t.wind}</span>
          </div>

          {weatherData.rain_1h > 0 && (
            <div className="weather-stat-chip">
              <CloudRain size={16} style={{ color: "#38bdf8" }} />
              <span>{weatherData.rain_1h} mm</span>
              <span className="label">{t.rain}</span>
            </div>
          )}
        </div>
      </div>

      {/* Agro-Risk Alerts Box */}
      {alerts.map((alert, idx) => {
        const title = lang === "mr" && alert.disease_mr
          ? alert.disease_mr
          : lang === "hi" && alert.disease_hi
          ? alert.disease_hi
          : alert.disease;

        const reason = lang === "mr" && alert.reason_mr
          ? alert.reason_mr
          : lang === "hi" && alert.reason_hi
          ? alert.reason_hi
          : alert.reason_en;

        const action = lang === "mr" && alert.preventive_action_mr
          ? alert.preventive_action_mr
          : lang === "hi" && alert.preventive_action_hi
          ? alert.preventive_action_hi
          : alert.preventive_action_en;

        return (
          <div key={idx} className={`risk-alert-box ${alert.risk_level}`}>
            {alert.risk_level === "CRITICAL" || alert.risk_level === "HIGH" ? (
              <AlertTriangle size={22} style={{ color: alert.severity_color, flexShrink: 0, marginTop: "2px" }} />
            ) : (
              <CheckCircle2 size={22} style={{ color: alert.severity_color, flexShrink: 0, marginTop: "2px" }} />
            )}
            <div className="risk-alert-content">
              <h4>
                <span>{title}</span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.1rem 0.5rem",
                    borderRadius: "4px",
                    background: alert.severity_color,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  {alert.risk_level}
                </span>
              </h4>
              <p>{reason}</p>
              {action && <p className="preventive-tip">💡 {action}</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}
