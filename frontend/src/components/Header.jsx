import React from "react";
import { Sprout, ShieldAlert, Activity, Globe } from "lucide-react";
import { TRANSLATIONS } from "../translations";

export default function Header({ currentTab, setCurrentTab, lang, setLang, backendHealthy }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <header className="header-glass">
      <div className="brand-section">
        <div className="brand-logo-badge" title="Government of Maharashtra | SIH PS 26131">
          <Sprout size={26} />
        </div>
        <div className="brand-title-wrap">
          <h1>
            {t.app_title}
            <span className="brand-govt-tag">MH-AGRI</span>
          </h1>
          <p className="brand-govt-tag">{t.app_subtitle}</p>
        </div>
      </div>

      <nav className="nav-switcher">
        <button
          className={`nav-tab-btn ${currentTab === "farmer" ? "active" : ""}`}
          onClick={() => setCurrentTab("farmer")}
          id="btn-nav-farmer"
        >
          <Sprout size={18} />
          <span>{t.tab_farmer}</span>
        </button>

        <button
          className={`nav-tab-btn ${currentTab === "dashboard" ? "active" : ""}`}
          onClick={() => setCurrentTab("dashboard")}
          id="btn-nav-dashboard"
        >
          <ShieldAlert size={18} />
          <span>{t.tab_dashboard}</span>
        </button>
      </nav>

      <div className="header-actions">
        <div className="lang-selector-pills" title="Select Language">
          <Globe size={15} style={{ alignSelf: "center", marginLeft: "4px", color: "#94a3b8" }} />
          <button
            className={`lang-pill-btn ${lang === "mr" ? "active" : ""}`}
            onClick={() => setLang("mr")}
            title="मराठी"
          >
            मराठी
          </button>
          <button
            className={`lang-pill-btn ${lang === "hi" ? "active" : ""}`}
            onClick={() => setLang("hi")}
            title="हिंदी"
          >
            हिंदी
          </button>
          <button
            className={`lang-pill-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
            title="English"
          >
            EN
          </button>
        </div>

        <div className="live-pulse-badge" title="PyTorch CNN & Hotspot Engine Online">
          <span className="pulse-dot"></span>
          <span>{backendHealthy ? t.live_status : "Connecting..."}</span>
        </div>
      </div>
    </header>
  );
}
