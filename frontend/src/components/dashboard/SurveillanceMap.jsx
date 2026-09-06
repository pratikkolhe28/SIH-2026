import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { TRANSLATIONS } from "../../translations";

export default function SurveillanceMap({
  reports,
  clusters,
  selectedDistrict,
  selectedCrop,
  lang,
  onStatusChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const circlesGroupRef = useRef(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on Maharashtra State
      const map = L.map(mapContainerRef.current, {
        center: [19.7515, 75.7139],
        zoom: 7,
        zoomControl: true,
        attributionControl: false
      });

      // Free OpenStreetMap standard tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: "abc",
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: "bottomright", prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
        .addTo(map);

      mapInstanceRef.current = map;

      // Marker cluster group
      const clusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        maxClusterRadius: 45,
      });
      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;

      // Circles layer group for outbreak hotspots
      const circlesGroup = L.layerGroup().addTo(map);
      circlesGroupRef.current = circlesGroup;
    }

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Hotspot Circles when reports or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const clusterGroup = clusterGroupRef.current;
    const circlesGroup = circlesGroupRef.current;

    if (!map || !clusterGroup || !circlesGroup) return;

    clusterGroup.clearLayers();
    circlesGroup.clearLayers();

    const bounds = [];

    // 1. Draw Outbreak Hotspot Circles
    if (clusters && clusters.length > 0) {
      clusters.forEach((cluster) => {
        const isCrit =
          cluster.outbreak_severity === "CRITICAL" ||
          cluster.intensity === "CRITICAL OUTBREAK" ||
          cluster.has_critical;
        const color = cluster.color || (isCrit ? "#ef4444" : "#f97316");
        const radius = cluster.radius_meters || (cluster.radius_km ? cluster.radius_km * 1000 : 12000);
        const count = cluster.reports_count || cluster.incident_count || 1;

        const circle = L.circle([cluster.center_lat, cluster.center_lon], {
          color: color,
          fillColor: color,
          fillOpacity: 0.18,
          radius: radius,
          weight: 2,
          dashArray: "4, 6",
        });

        circle.bindTooltip(
          `<strong>OUTBREAK HOTSPOT</strong><br/>${cluster.disease_name} (${cluster.crop || "Crop"})<br/>District: ${cluster.district}<br/>Incidents: ${count} reports`,
          { permanent: false, direction: "top" }
        );

        circlesGroup.addLayer(circle);
      });
    }

    // 2. Add individual markers into Cluster Group
    reports.forEach((report) => {
      const lat = parseFloat(report.latitude);
      const lon = parseFloat(report.longitude);
      if (isNaN(lat) || isNaN(lon)) return;

      bounds.push([lat, lon]);

      const isCrit = report.severity === "Critical Outbreak Risk" || report.severity === "High";
      const isHealthy = report.disease_name.toLowerCase().includes("healthy");
      const pinColor = isCrit ? "#ef4444" : isHealthy ? "#10b981" : "#f59e0b";

      // Crop Initial
      const cropInitial = report.crop ? report.crop.charAt(0) : "P";

      const iconHtml = `
        <div class="custom-crop-pin" style="background: ${pinColor}; width: 28px; height: 28px;">
          <span>${cropInitial}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "leaflet-custom-marker",
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      const dateStr = report.timestamp ? new Date(report.timestamp).toLocaleDateString() : "Recent";

      const popupHtml = `
        <div class="popup-incident-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="status-pill" style="background:${pinColor}22; color:${pinColor}; border:1px solid ${pinColor}44;">
              ${report.severity}
            </span>
            <span style="font-size:0.75rem; color:#94a3b8;">${dateStr}</span>
          </div>
          <h4>${report.disease_name}</h4>
          <div class="meta">
            <strong>Crop:</strong> ${report.crop} &bull; <strong>Confidence:</strong> ${Math.round(report.confidence * 100)}%
          </div>
          <div class="meta">
            <strong>Location:</strong> ${report.taluka || "Rural"}, ${report.district}
          </div>
          ${report.flagged_for_expert ? `<div style="font-size:0.75rem; color:#f87171; font-weight:700;">🚩 Flagged for Expert Review</div>` : ""}
          <div style="margin-top:0.4rem; padding-top:0.4rem; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75rem; color:#94a3b8;">Status: <strong>${report.status || "reported"}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      clusterGroup.addLayer(marker);
    });

    // Auto-fit to filtered reports if points exist
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [reports, clusters]);

  return (
    <div className="map-card-container">
      <div className="map-card-header">
        <div>
          <h3 style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{t.map_title}</span>
            <span style={{ fontSize: "0.75rem", background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "0.2rem 0.6rem", borderRadius: "6px" }}>
              {reports.length} Reports
            </span>
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.15rem" }}>
            OpenStreetMap Free Tiles with Leaflet.markercluster & Outbreak Hotspot Overlays
          </p>
        </div>

        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot crit"></span>
            <span>Critical Hotspot</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot high"></span>
            <span>High Risk</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot elev"></span>
            <span>Moderate</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot safe"></span>
            <span>Healthy Crop</span>
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="leaflet-map-view" id="surveillance-map" />
    </div>
  );
}
