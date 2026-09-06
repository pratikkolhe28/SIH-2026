import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import FarmerApp from "./components/farmer/FarmerApp";
import GovernmentDashboard from "./components/dashboard/GovernmentDashboard";
import { fetchHealth, fetchDistricts, fetchAgroWeather } from "./utils/api";

export default function App() {
  const [currentTab, setCurrentTab] = useState("farmer"); // "farmer" or "dashboard"
  const [lang, setLang] = useState(() => localStorage.getItem("maha_agri_lang") || "en");
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("pune");
  const [weatherData, setWeatherData] = useState(null);

  // Sync language to localStorage
  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("maha_agri_lang", newLang);
  };

  // Initial backend check and districts fetch
  useEffect(() => {
    fetchHealth()
      .then((data) => {
        if (data.status === "healthy") setBackendHealthy(true);
      })
      .catch((e) => console.warn("Backend health check failed:", e));

    fetchDistricts()
      .then((data) => {
        if (data.districts) setDistrictsList(data.districts);
      })
      .catch((e) => console.warn("Districts load failed:", e));

    fetchAgroWeather("pune")
      .then((data) => setWeatherData(data))
      .catch((e) => console.warn("Initial weather failed:", e));
  }, []);

  return (
    <div className="app-wrapper">
      <div className="app-bg-glow" />

      {/* Common Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={handleSetLang}
        backendHealthy={backendHealthy}
      />

      {/* Main View Switcher */}
      <main>
        {currentTab === "farmer" ? (
          <FarmerApp
            weatherData={weatherData}
            setWeatherData={setWeatherData}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            districtsList={districtsList}
            lang={lang}
            onReportAdded={() => {
              // Can trigger background sync or count update
            }}
          />
        ) : (
          <GovernmentDashboard
            districtsList={districtsList}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Smart India Hackathon (SIH) Problem Statement ID 26131 &bull; Government of Maharashtra (Maharashtra State Innovation Society)
        </p>
        <p style={{ marginTop: "0.25rem", fontSize: "0.74rem", opacity: 0.75 }}>
          Built with PyTorch MobileNetV2 (PlantVillage), Leaflet.js, OpenStreetMap, OpenWeatherMap, & FastAPI. Free-tier cloud deployable.
        </p>
      </footer>
    </div>
  );
}
