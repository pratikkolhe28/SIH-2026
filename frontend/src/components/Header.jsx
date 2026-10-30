import React from "react";
import { Sprout, ShieldAlert, Globe, UserRound, LogOut, Sun, Moon } from "lucide-react";
import { TRANSLATIONS } from "../translations";

export default function Header({ currentTab, setCurrentTab, lang, setLang, backendHealthy, backendChecked, user, onSignIn, onSignOut, theme, onToggleTheme }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const signInLabel = lang === "mr" ? "साइन इन" : lang === "hi" ? "साइन इन" : "Sign in";
  const signOutLabel = lang === "mr" ? "बाहेर पडा" : lang === "hi" ? "साइन आउट" : "Sign out";

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
          <Globe size={15} className="header-globe-icon" />
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

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <div className="account-chip" title={`${user.full_name} · ${user.district || "Farmer account"}`}>
            <span className="account-avatar"><UserRound size={16} /></span>
            <span className="account-copy"><strong>{user.full_name.split(" ")[0]}</strong><small>{user.district || "Farmer account"}</small></span>
            <button type="button" onClick={onSignOut} aria-label={signOutLabel} title={signOutLabel} className="account-signout"><LogOut size={16} /></button>
          </div>
        ) : (
          <button type="button" className="header-signin-btn" onClick={onSignIn}><UserRound size={16} /><span>{signInLabel}</span></button>
        )}
        <div className={`live-pulse-badge ${backendChecked && !backendHealthy ? "status-offline" : ""} ${!backendChecked ? "status-checking" : ""}`} title={backendHealthy ? "Backend services are reachable" : backendChecked ? "Backend is not reachable. Start the backend and refresh." : "Checking backend connection"} role="status" aria-live="polite">
          <span className="pulse-dot"></span>
          <span>{backendHealthy ? (lang === "mr" ? "सेवा सुरू" : lang === "hi" ? "सेवा चालू" : "Services online") : backendChecked ? (lang === "mr" ? "सेवा ऑफलाइन" : lang === "hi" ? "सेवा ऑफलाइन" : "Service offline") : (lang === "mr" ? "तपासत आहे…" : lang === "hi" ? "जाँच रहे हैं…" : "Checking…")}</span>
        </div>
      </div>
    </header>
  );
}
