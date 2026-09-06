import React from "react";
import { Cpu, BatteryCharging, Radio, Bug, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TRANSLATIONS } from "../../translations";

export default function IoTTrapPanel({ traps, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!traps || traps.length === 0) return null;

  return (
    <div className="analytics-card" style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Cpu size={20} style={{ color: "#38bdf8" }} />
            <span>{t.iot_heading}</span>
            <span
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              Simulated Telemetry Stub
            </span>
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            Solar-powered automated spore counters & digital pheromone traps transmitting microclimate and pest counts
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#34d399" }}>
          <Radio size={14} className="animate-pulse" />
          <span>4 Gateway Nodes Active</span>
        </div>
      </div>

      <div className="iot-telemetry-grid">
        {traps.map((trap) => {
          const isAlert = trap.status?.toLowerCase().includes("alert") || trap.status?.toLowerCase().includes("critical");
          const isWarning = trap.status?.toLowerCase().includes("warning");

          return (
            <div key={trap.id} className={`trap-card ${isAlert ? "alert" : ""}`}>
              <div className="trap-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f8fafc" }}>
                    {trap.id} &bull; {trap.crop}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {trap.taluka}, {trap.district} ({trap.trap_type})
                  </div>
                </div>

                <div className="battery-pill" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <BatteryCharging size={13} />
                  <span>{trap.battery_level}%</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0.4rem 0" }}>
                {trap.spore_count > 0 ? (
                  <div>
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color: isAlert ? "#f87171" : "#38bdf8" }}>
                      {trap.spore_count}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginLeft: "4px" }}>spores/m³</span>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color: isWarning ? "#fbbf24" : "#34d399" }}>
                      {trap.moth_count}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginLeft: "4px" }}>moths/night</span>
                  </div>
                )}

                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  Last sync: 12m ago
                </div>
              </div>

              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: isAlert ? "#f87171" : isWarning ? "#fbbf24" : "#4ade80",
                }}
              >
                {isAlert ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                <span>{trap.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
