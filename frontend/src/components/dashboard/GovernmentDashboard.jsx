import React, { useState, useEffect } from "react";
import { Filter, Send, RefreshCw } from "lucide-react";
import SurveillanceMap from "./SurveillanceMap";
import SurveillanceAnalytics from "./SurveillanceAnalytics";
import IncidentTable from "./IncidentTable";
import IoTTrapPanel from "./IoTTrapPanel";
import AdvisoryBroadcastModal from "./AdvisoryBroadcastModal";
import { TRANSLATIONS } from "../../translations";
import { fetchReports, fetchHotspotClusters, fetchSurveillanceStats } from "../../utils/api";

export default function GovernmentDashboard({ districtsList, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reports, setReports] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [repData, clusData, statsData] = await Promise.all([
        fetchReports({
          district: selectedDistrict || undefined,
          crop: selectedCrop || undefined,
          status: selectedStatus || undefined,
        }),
        fetchHotspotClusters(selectedDistrict || undefined, selectedCrop || undefined),
        fetchSurveillanceStats(),
      ]);

      setReports(repData.reports || []);
      setClusters(clusData.clusters || []);
      setStats(statsData);
    } catch (e) {
      console.error("Dashboard data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedDistrict, selectedCrop, selectedStatus]);

  return (
    <div className="dashboard-wrapper">
      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#94a3b8", fontSize: "0.85rem" }}>
            <Filter size={16} />
            <span>Surveillance Filters:</span>
          </div>

          <select
            className="filter-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            id="filter-dashboard-district"
          >
            <option value="">{t.filter_all_districts}</option>
            {districtsList.map((d) => (
              <option key={d.key} value={d.name}>
                {lang === "mr" ? d.name_mr : lang === "hi" ? d.name_hi : d.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            id="filter-dashboard-crop"
          >
            <option value="">{t.filter_all_crops}</option>
            <option value="Tomato">Tomato</option>
            <option value="Potato">Potato</option>
            <option value="Cotton">Cotton</option>
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            id="filter-dashboard-status"
          >
            <option value="">{t.filter_all_status}</option>
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="contained">Contained</option>
          </select>

          <button
            type="button"
            className="btn-icon-pill"
            style={{ width: "32px", height: "32px" }}
            onClick={loadDashboardData}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", padding: "0.55rem 1.15rem", fontSize: "0.88rem" }}
          onClick={() => setIsBroadcastOpen(true)}
          id="btn-open-broadcast"
        >
          <Send size={15} />
          <span>{t.btn_broadcast}</span>
        </button>
      </div>

      {/* Analytics KPI and charts */}
      <SurveillanceAnalytics stats={stats} lang={lang} />

      {/* Leaflet Geospatial Hotspot Map */}
      <SurveillanceMap
        reports={reports}
        clusters={clusters}
        selectedDistrict={selectedDistrict}
        selectedCrop={selectedCrop}
        lang={lang}
        onStatusChange={loadDashboardData}
      />

      {/* IoT Hardware Telemetry Panel */}
      <IoTTrapPanel traps={stats?.iot_traps} lang={lang} />

      {/* Field Incidents Triage Table */}
      <IncidentTable
        reports={reports}
        onReportUpdated={loadDashboardData}
        lang={lang}
      />

      {/* Broadcast Advisory Modal */}
      <AdvisoryBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        districtsList={districtsList}
        onBroadcastSuccess={loadDashboardData}
      />
    </div>
  );
}
