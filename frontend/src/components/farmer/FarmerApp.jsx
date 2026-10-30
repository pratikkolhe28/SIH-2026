import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Camera, RefreshCw, AlertCircle, Sparkles, X, ShieldCheck, Leaf, ArrowRight, ImagePlus, CheckCircle2 } from "lucide-react";

import WeatherRiskBanner from "./WeatherRiskBanner";
import CameraModal from "./CameraModal";
import SampleSelector from "./SampleSelector";
import DiagnosisResult from "./DiagnosisResult";
import TreatmentAdvisory from "./TreatmentAdvisory";
import KVKSupportCard from "./KVKSupportCard";
import CropAssistant from "./CropAssistant";
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
  const heroCopy = {
    en: { eyebrow: "FARM SAATHI · CROP HEALTH", title: <>A healthier crop starts with an <em>early check.</em></>, desc: "Upload a clear leaf photo for AI-assisted screening, practical next steps and local weather context.", action: "Check a crop", note: "Photo screening · Advisory support", floatTitle: "Early screening", floatSub: "Clear photo works best", steps: [["Choose a crop", "Tell us what you grow"], ["Add a leaf photo", "Use camera or upload"], ["Review guidance", "Check the result carefully"]] },
    hi: { eyebrow: "फार्म साथी · फसल स्वास्थ्य", title: <>स्वस्थ फसल के लिए <em>समय पर जाँच।</em></>, desc: "AI-सहायता वाली शुरुआती जाँच, अगले कदम और स्थानीय मौसम की जानकारी के लिए पत्ती की साफ़ तस्वीर अपलोड करें।", action: "फसल की जाँच करें", note: "फोटो जाँच · सलाह सहायता", floatTitle: "शुरुआती जाँच", floatSub: "साफ़ फोटो बेहतर है", steps: [["फसल चुनें", "बताएँ क्या उगाते हैं"], ["पत्ती की फोटो दें", "कैमरा या अपलोड"], ["सलाह देखें", "नतीजे को ध्यान से जाँचें"]] },
    mr: { eyebrow: "फार्म साथी · पीक आरोग्य", title: <>निरोगी पिकासाठी <em>वेळीच तपासणी.</em></>, desc: "AI-सहाय्यित प्राथमिक तपासणी, पुढील उपाय आणि स्थानिक हवामानासाठी पानाचा स्पष्ट फोटो अपलोड करा.", action: "पिक तपासा", note: "फोटो तपासणी · सल्ला सहाय्य", floatTitle: "प्राथमिक तपासणी", floatSub: "स्पष्ट फोटो अधिक उपयुक्त", steps: [["पीक निवडा", "काय पिकवता ते सांगा"], ["पानाचा फोटो द्या", "कॅमेरा किंवा अपलोड"], ["सल्ला पाहा", "निकाल काळजीपूर्वक तपासा"]] }
  }[lang] || { eyebrow: "FARM SAATHI · CROP HEALTH", title: <>A healthier crop starts with an <em>early check.</em></>, desc: "Upload a clear leaf photo for AI-assisted screening, practical next steps and local weather context.", action: "Check a crop", note: "Photo screening · Advisory support", floatTitle: "Early screening", floatSub: "Clear photo works best", steps: [["Choose a crop", "Tell us what you grow"], ["Add a leaf photo", "Use camera or upload"], ["Review guidance", "Check the result carefully"]] };

  const [selectedCrop, setSelectedCrop] = useState("");
  const [cropStage, setCropStage] = useState("");
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
  const [dragActive, setDragActive] = useState(false);

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
      if (cropStage) formData.append("crop_stage", cropStage);

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

    } catch (err) {
      console.error("Diagnosis error:", err);
      setErrorMessage(err.message || "Could not analyze crop photo. Please try another angle.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Validate every image before sending it to the inference API.
  const handleIncomingFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setErrorMessage("Please choose an image file (JPG, PNG or WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image is larger than 10 MB. Please choose a smaller photo.");
      return;
    }
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setErrorMessage(null);
    setActiveSampleId(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    runDiagnosis(file);
  };

  const handleFileChange = (e) => {
    handleIncomingFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleIncomingFile(e.dataTransfer.files?.[0]);
  };

  // Handle camera snapshot
  const handleCameraCapture = (file) => {
    handleIncomingFile(file);
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
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setActiveSampleId(null);
    setDiagnosisData(null);
    setErrorMessage(null);
  };

  return (
    <div className="farmer-page">
      <section className="farmer-welcome-panel" aria-labelledby="farmer-welcome-title">
        <div className="welcome-copy">
          <div className="welcome-eyebrow"><span className="welcome-eyebrow-dot" /> {heroCopy.eyebrow}</div>
          <h2 id="farmer-welcome-title">{heroCopy.title}</h2>
          <p>{heroCopy.desc}</p>
          <div className="welcome-actions">
            <button type="button" className="welcome-primary" onClick={() => fileInputRef.current?.click()}><ImagePlus size={17} /> {heroCopy.action} <ArrowRight size={16} /></button>
            <span className="welcome-note"><ShieldCheck size={15} /> {heroCopy.note}</span>
          </div>
        </div>
        <div className="welcome-visual" aria-hidden="true">
          <div className="clean-wave wave-1" />
          <div className="clean-wave wave-2" />
          <div className="clean-wave wave-3" />
          <div className="welcome-base-ring" />
          <div className="welcome-leaf-disc">
            <Leaf size={76} strokeWidth={1.25} />
          </div>
          <div className="welcome-float-card">
            <CheckCircle2 size={17} />
            <span>
              <strong>{heroCopy.floatTitle}</strong>
              <small>{heroCopy.floatSub}</small>
            </span>
          </div>
        </div>
        <div className="welcome-steps" aria-label="How it works">
          {heroCopy.steps.map((step, index) => <div key={step[0]}><span>0{index + 1}</span><strong>{step[0]}</strong><small>{step[1]}</small></div>)}
        </div>
      </section>

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
              <span className="farmer-field-label">
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

            {/* Optional crop stage improves the relevance of local advice */}
            <label className="crop-stage-label">
              <span>Crop growth stage (optional)</span>
              <select value={cropStage} onChange={(e) => setCropStage(e.target.value)} className="crop-stage-select">
                <option value="">Select stage (optional)</option>
                <option value="seedling">Seedling / nursery</option>
                <option value="vegetative">Vegetative growth</option>
                <option value="flowering">Flowering</option>
                <option value="fruiting">Fruiting / boll formation</option>
                <option value="maturity">Maturity / near harvest</option>
              </select>
            </label>

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
                className={`dropzone-container ${dragActive ? "drag-active" : ""}`}
                role="button"
                tabIndex={0}
                aria-label="Choose or drop a crop leaf image"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false); }}
                onDrop={handleDrop}
              >
                <div className="dropzone-icon-wrap">
                  <UploadCloud size={30} />
                </div>
                <div>
                  <h4 className="dropzone-title">{t.drop_title}</h4>
                  <p className="dropzone-subtitle">{dragActive ? "Drop your leaf photo to begin" : "Click to browse or drag and drop a photo"}</p>
                  <span className="dropzone-file-note">JPG, PNG or WEBP · up to 10 MB</span>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
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
              <div className="analysis-progress" role="status" aria-live="polite">
                <div className="analysis-progress-top"><RefreshCw size={17} className="animate-spin" /><strong>Reviewing your crop photo</strong><span>Usually takes a few seconds</span></div>
                <div className="analysis-progress-track"><span /></div>
                <p>Keep in mind: AI screening is a guide, not a confirmed laboratory diagnosis.</p>
              </div>
            )}

            {errorMessage && (
              <div className="farmer-error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

          </div>

          {/* 1-Click Test Demo Samples — kept below the primary two-panel workspace */}
          <div className="samples-panel-wrap">
            <SampleSelector
              samples={samples}
              onSelectSample={handleSelectSample}
              activeSampleId={activeSampleId}
              lang={lang}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Instant Diagnosis Result OR Guided Empty State */}
        <div className="results-column">
          {diagnosisData ? (
            <DiagnosisResult
              result={diagnosisData}
              lang={lang}
              onSwitchCrop={handleCropSelect}
            />
          ) : (
            <div className="diagnosis-card diagnosis-empty-state">
              <div className="empty-state-icon-disc">
                <Sparkles size={36} />
              </div>
              <div className="empty-state-content">
                <h3 className="empty-state-title">
                  {lang === "mr"
                    ? "निदान अहवाल येथे दिसेल"
                    : lang === "hi"
                    ? "निदान रिपोर्ट यहाँ दिखाई देगी"
                    : "Instant Diagnosis Ready"}
                </h3>
                <div className="empty-state-checklist">
                  <span><CheckCircle2 size={16} /> Use a clear, well-lit leaf photo</span>
                  <span><CheckCircle2 size={16} /> Include the affected area in focus</span>
                  <span><CheckCircle2 size={16} /> Compare advice with local expert guidance</span>
                </div>
                <p className="empty-state-desc">
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

      {/* Actionable Treatment & KVK Advisory Stage (Balanced 2-Column Grid) */}
      {diagnosisData && (
        <section className="farmer-advisory-layout" aria-label="Treatment & Extension Support">
          <div className="advisory-left-col">
            <TreatmentAdvisory advisory={diagnosisData.advisory} lang={lang} />
          </div>
          <div className="advisory-right-col">
            <KVKSupportCard
              kvkData={diagnosisData.nearest_kvk}
              reportId={diagnosisData.saved_report?.id}
              lang={lang}
              initialFlagged={diagnosisData.saved_report?.flagged_for_expert}
            />
          </div>
        </section>
      )}

      {/* Interactive Farm Saathi AI Consultation Hub (Balanced full-width stage with companion) */}
      <section className="farmer-ai-layout" aria-label="Farm Saathi AI & Intelligent Field Companion">
        <CropAssistant lang={lang} diagnosisData={diagnosisData} weatherData={weatherData} />
      </section>

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapturePhoto={handleCameraCapture}
      />
    </div>
  );
}
