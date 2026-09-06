import React, { useState } from "react";
import { Send, X, AlertCircle, CheckCircle, Radio } from "lucide-react";
import { broadcastDistrictAdvisory } from "../../utils/api";

export default function AdvisoryBroadcastModal({ isOpen, onClose, districtsList, onBroadcastSuccess }) {
  const [district, setDistrict] = useState("Nashik");
  const [crop, setCrop] = useState("Tomato");
  const [title, setTitle] = useState("EMERGENCY ADVISORY: High Late Blight Outbreak Risk");
  const [message, setMessage] = useState(
    "Heavy overcast spells and 88% humidity in Niphad/Dindori belt. Immediate preventive foliar spray of Mancozeb 75% WP (2.5g/L) recommended before afternoon showers. Do not flood furrows."
  );
  const [sending, setSending] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccessResult(null);

    try {
      const res = await broadcastDistrictAdvisory({
        district,
        crop,
        title,
        message,
      });
      setSuccessResult(res.broadcast);
      if (onBroadcastSuccess) onBroadcastSuccess();
    } catch (err) {
      console.error("Broadcast failed:", err);
      alert("Failed to broadcast advisory: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Radio size={22} style={{ color: "#ef4444" }} />
            <span>Broadcast Agricultural Advisory</span>
          </h3>
          <button type="button" className="btn-icon-pill" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {successResult ? (
          <div
            style={{
              padding: "1.5rem",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              textAlign: "center",
              alignItems: "center",
            }}
          >
            <CheckCircle size={36} style={{ color: "#34d399" }} />
            <h4 style={{ fontSize: "1.1rem", color: "#fff" }}>Advisory Dispatched!</h4>
            <p style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
              Successfully broadcasted alert to <strong>{successResult.target_farmers_count} registered farmers</strong> in {successResult.district} district.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: "0.5rem" }}
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>
                  Target District
                </label>
                <select
                  className="input-field"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  id="broadcast-select-district"
                >
                  {districtsList.map((d) => (
                    <option key={d.key} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>
                  Target Crop
                </label>
                <select
                  className="input-field"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  id="broadcast-select-crop"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Cotton">Cotton</option>
                  <option value="All Crops">All Crops</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>
                Advisory Headline
              </label>
              <input
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                id="broadcast-title"
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>
                Prescription & Action Instructions (SMS / App Push Notification)
              </label>
              <textarea
                className="input-field"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                id="broadcast-message"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={sending}
                id="btn-submit-broadcast"
              >
                <Send size={16} />
                <span>{sending ? "Transmitting..." : "Transmit Broadcast"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
