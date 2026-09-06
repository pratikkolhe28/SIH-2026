import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Camera, RefreshCw, AlertCircle, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";

import WeatherRiskBanner from "./WeatherRiskBanner";
import CameraModal from "./CameraModal";
import SampleSelector from "./SampleSelector";
import DiagnosisResult from "./DiagnosisResult";
import TreatmentAdvisory from "./TreatmentAdvisory";
import KVKSupportCard from "./KVKSupportCard";
import { TRANSLATIONS } from "../../translations";
import { predictCropDisease, fetchPresetSamples, fetchAgroWeather } from "../../utils/api";

export default function FarmerApp({
  weatherData,
  setWeatherData,
  selectedDistrict,
  setSelectedDistrict,
  districtsList,
  lang,
  onReportAdded
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [selectedCrop, setSelectedCrop] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [samples, setSamples] = useState([]);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [detectingGPS, setDetectingGPS] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);

  const fileInputRef = useRef(null);

  // Load preset sample leaves
  useEffect(() => {
    fetchPresetSamples()
      .then((data) => setSamples(data.samples || []))
      .catch((err) => console.warn("Failed to load sample cards:", err));
  }, []);

  // Update weather when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchAgroWeather(selectedDistrict, gpsCoords?.lat, gpsCoords?.lon)
        .then((w) => setWeatherData(w))
        .catch((err) => console.warn("Weather fetch failed:", err));
    }
  }, [selectedDistrict, gpsCoords]);

  // GPS geolocation detector
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoords({ lat: latitude, lon: longitude });
        setDetectingGPS(false);
      },
      (err) => {
        console.warn("GPS lookup denied or timed out:", err);
        setDetectingGPS(false);
      },
      { timeout: 8000 }
    );
  };

  // Run Inference API
  const runDiagnosis = async (fileObj, sampleMeta = null, overrideCrop = null) => {
    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", fileObj);
      const cropToUse = overrideCrop !== null ? overrideCrop : selectedCrop;
      if (cropToUse) formData.append("crop_hint", cropToUse);
      
      const lat = sampleMeta?.lat || gpsCoords?.lat || weatherData?.lat || 18.5204;
      const lon = sampleMeta?.lon || gpsCoords?.lon || weatherData?.lon || 73.8567;
      const dist = sampleMeta?.district || weatherData?.district || selectedDistrict || "Pune";

      formData.append("latitude", lat);
      formData.append("longitude", lon);
      formData.append("district", dist);
      formData.append("lang", lang);
      formData.append("auto_save_report", "true");

      const res = await predictCropDisease(formData);
      setDiagnosisData(res);

      if (onReportAdded && res.saved_report) {
        onReportAdded(res.saved_report);
      }

      // Trigger celebratory confetti on high-accuracy diagnosis
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#10b981", "#34d399", "#38bdf8"],
        });
      } catch (e) {
        // ignore if not supported
      }
    } catch (err) {
      console.error("Diagnosis error:", err);
      setErrorMessage(err.message || "Could not analyze crop photo. Please try another angle.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle local file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveSampleId(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    runDiagnosis(file);
  };

  // Handle camera snapshot
  const handleCameraCapture = (file) => {
    setActiveSampleId(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    runDiagnosis(file);
  };

  // Handle 1-click test sample selection
  const handleSelectSample = async (sample) => {
    setActiveSampleId(sample.id);
    setPreviewUrl(sample.image_url);
    setSelectedCrop(sample.crop);

    try {
      setAnalyzing(true);
      const resp = await fetch(sample.image_url);
      const blob = await resp.blob();
      const file = new File([blob], sample.image_file, { type: "image/jpeg" });
      setSelectedFile(file);
      await runDiagnosis(file, sample);
    } catch (err) {
      console.error("Sample fetch failed:", err);
      setAnalyzing(false);
    }
  };

  const handleCropSelect = (crop) => {
    setSelectedCrop(crop);
    if (selectedFile) {
      runDiagnosis(selectedFile, null, crop);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setActiveSampleId(null);
    setDiagnosisData(null);
    setErrorMessage(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Real-Time Agro-Climatic Warning Banner */}
      <WeatherRiskBanner
        weatherData={weatherData}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        districtsList={districtsList}
        lang={lang}
        onDetectGPS={handleDetectGPS}
        detectingGPS={detectingGPS}
      />

      <div className="farmer-grid-layout">
        {/* LEFT COLUMN: Photo Intake & Samples */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="intake-card">
            <div className="intake-header">
              <h2>{t.intake_heading}</h2>
              <p>{t.intake_sub}</p>
            </div>

            {/* Crop Filter Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>
                {t.filter_crop}
              </span>
              <div className="crop-filter-chips">
                <button
                  type="button"
                  className={`crop-chip-btn ${selectedCrop === "" ? "active" : ""}`}
                  onClick={() => handleCropSelect("")}
                >
                  {t.all_crops}
                </button>
                <button
                  type="button"
                  className={`crop-chip-btn ${selectedCrop === "Tomato" ? "active" : ""}`}
                  onClick={() => handleCropSelect("Tomato")}
                >
                  🍅 {t.tomato}
                </button>
                <button
                  type="button"
                  className={`crop-chip-btn ${selectedCrop === "Potato" ? "active" : ""}`}
                  onClick={() => handleCropSelect("Potato")}
                >
                  🥔 {t.potato}
                </button>
                <button
                  type="button"
                  className={`crop-chip-btn ${selectedCrop === "Cotton" ? "active" : ""}`}
                  onClick={() => handleCropSelect("Cotton")}
                >
                  🌿 {t.cotton}
                </button>
              </div>
            </div>

            {/* Dropzone / Preview Area */}
            {previewUrl ? (
              <div className="preview-box">
                <img src={previewUrl} alt="Diseased leaf preview" />
                <div className="preview-overlay">
                  <button
                    type="button"
                    className="btn-icon-pill"
                    onClick={handleReset}
                    title="Clear Image"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="dropzone-container"
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}
              >
                <div className="dropzone-icon-wrap">
                  <UploadCloud size={30} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", color: "#f8fafc" }}>{t.drop_title}</h4>
                  <p style={{ fontSize: "0.8rem" }}>{t.drop_sub}</p>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Action Buttons */}
            <div className="dropzone-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsCameraOpen(true)}
                id="btn-open-camera"
              >
                <Camera size={18} />
                <span>{t.btn_camera}</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                id="btn-upload-file"
              >
                <UploadCloud size={18} />
                <span>{t.btn_upload}</span>
              </button>
            </div>

            {analyzing && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  padding: "0.75rem",
                  background: "rgba(16, 185, 129, 0.1)",
                  borderRadius: "10px",
                  color: "#34d399",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                <span>{t.btn_analyzing}</span>
              </div>
            )}

            {errorMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.75rem",
                  background: "rgba(239, 68, 68, 0.15)",
                  borderRadius: "10px",
                  color: "#fca5a5",
                  fontSize: "0.85rem",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1-Click Test Demo Samples */}
            <SampleSelector
              samples={samples}
              onSelectSample={handleSelectSample}
              activeSampleId={activeSampleId}
              lang={lang}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnosis & Multilingual Advisory */}
        <div className="results-column">
          {diagnosisData ? (
            <>
              <DiagnosisResult
                result={diagnosisData}
                lang={lang}
                onSwitchCrop={handleCropSelect}
              />
              <TreatmentAdvisory advisory={diagnosisData.advisory} lang={lang} />
              <KVKSupportCard
                kvkData={diagnosisData.nearest_kvk}
                reportId={diagnosisData.saved_report?.id}
                lang={lang}
                initialFlagged={diagnosisData.saved_report?.flagged_for_expert}
              />
            </>
          ) : (
            <div
              className="diagnosis-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "420px",
                textAlign: "center",
                padding: "3rem 1.5rem",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#34d399",
                }}
              >
                <Sparkles size={36} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.35rem" }}>
                  {lang === "mr"
                    ? "निदान अहवाल येथे दिसेल"
                    : lang === "hi"
                    ? "निदान रिपोर्ट यहाँ दिखाई देगी"
                    : "Instant Diagnosis Ready"}
                </h3>
                <p style={{ maxWidth: "340px", fontSize: "0.85rem" }}>
                  {lang === "mr"
                    ? "कृपया वरील कॅमेऱ्याने फोटो काढा किंवा खालील १-क्लिक नमुन्यांवर क्लिक करा."
                    : lang === "hi"
                    ? "कृपया ऊपर दिए गए कैमरे से फोटो लें या 1-क्लिक सैंपल्स पर क्लिक करें।"
                    : "Snap a photo using your camera or click any 1-Click sample leaf on the left to see the instant AI diagnosis and advisory."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapturePhoto={handleCameraCapture}
      />
    </div>
  );
}
