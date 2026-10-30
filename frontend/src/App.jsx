import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import FarmerApp from "./components/farmer/FarmerApp";
import GovernmentDashboard from "./components/dashboard/GovernmentDashboard";
import { fetchHealth, fetchDistricts, fetchAgroWeather, authRequest } from "./utils/api";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [currentTab, setCurrentTab] = useState("farmer"); // "farmer" or "dashboard"
  const [lang, setLang] = useState(() => localStorage.getItem("maha_agri_lang") || "en");
  const [theme, setTheme] = useState(() => localStorage.getItem("maha_agri_theme") || "dark");
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [backendChecked, setBackendChecked] = useState(false);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("pune");
  const [weatherData, setWeatherData] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("maha_agri_token") || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("maha_agri_user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("maha_agri_theme", theme);
  }, [theme]);

  const handleToggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  // Sync language to localStorage
  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("maha_agri_lang", newLang);
  };

  const handleAuthenticated = (token, account) => {
    setAuthToken(token);
    setUser(account);
    localStorage.setItem("maha_agri_token", token);
    localStorage.setItem("maha_agri_user", JSON.stringify(account));
    if (account.preferred_language && ["en", "hi", "mr"].includes(account.preferred_language)) handleSetLang(account.preferred_language);
    if (account.district) setSelectedDistrict(account.district.toLowerCase());
  };

  const handleSignOut = async () => {
    try { if (authToken) await authRequest("logout", null, authToken); } catch (e) { console.warn("Sign-out request failed", e); }
    localStorage.removeItem("maha_agri_token");
    localStorage.removeItem("maha_agri_user");
    setAuthToken("");
    setUser(null);
  };

  // Restore a saved session only after checking it with the backend.
  useEffect(() => {
    if (!authToken) return;
    authRequest("me", null, authToken, "GET")
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("maha_agri_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("maha_agri_token");
        localStorage.removeItem("maha_agri_user");
        setAuthToken("");
        setUser(null);
      });
  }, []);

  // Initial backend check and districts fetch
  useEffect(() => {
    fetchHealth()
      .then((data) => setBackendHealthy(data.status === "healthy"))
      .catch((e) => {
        setBackendHealthy(false);
        console.warn("Backend health check failed:", e);
      })
      .finally(() => setBackendChecked(true));

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
        backendChecked={backendChecked}
        user={user}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={handleToggleTheme}
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

      {authOpen && <AuthModal lang={lang} onClose={() => setAuthOpen(false)} onAuthenticated={handleAuthenticated} />}

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
