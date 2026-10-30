import React, { useState } from "react";
import { Sprout, X, Eye, EyeOff, ShieldCheck, UserRound, LogIn, UserPlus, MapPin } from "lucide-react";
import { authRequest } from "../utils/api";

const copy = {
  en: { signIn: "Sign in", create: "Create farmer account", subtitle: "Access your farm profile and keep your details ready for future visits.", name: "Full name", email: "Email address", password: "Password", district: "District", village: "Village (optional)", confirm: "Confirm password", submitLogin: "Sign in securely", submitSignup: "Create account", noAccount: "New to Farm Saathi?", haveAccount: "Already have an account?", createLink: "Create an account", loginLink: "Sign in", forgot: "Use at least 8 characters for your password.", privacy: "Your password is stored as a secure hash. Never share it with anyone.", guest: "Continue without signing in", loading: "Please wait…" },
  hi: { signIn: "साइन इन", create: "किसान खाता बनाएँ", subtitle: "अपनी खेती की प्रोफ़ाइल रखें और अगली बार आसानी से उपयोग करें।", name: "पूरा नाम", email: "ईमेल पता", password: "पासवर्ड", district: "ज़िला", village: "गाँव (वैकल्पिक)", confirm: "पासवर्ड की पुष्टि करें", submitLogin: "सुरक्षित साइन इन", submitSignup: "खाता बनाएँ", noAccount: "पहली बार Farm Saathi पर?", haveAccount: "पहले से खाता है?", createLink: "खाता बनाएँ", loginLink: "साइन इन", forgot: "पासवर्ड कम से कम 8 अक्षरों का हो।", privacy: "पासवर्ड सुरक्षित रूप से हैश किया जाता है।", guest: "बिना साइन इन जारी रखें", loading: "कृपया प्रतीक्षा करें…" },
  mr: { signIn: "साइन इन", create: "शेतकरी खाते तयार करा", subtitle: "तुमची शेती प्रोफाइल जतन करा आणि पुढील वेळी सहज वापरा.", name: "पूर्ण नाव", email: "ईमेल पत्ता", password: "पासवर्ड", district: "जिल्हा", village: "गाव (ऐच्छिक)", confirm: "पासवर्ड पुन्हा लिहा", submitLogin: "सुरक्षित साइन इन", submitSignup: "खाते तयार करा", noAccount: "Farm Saathi वर नवीन आहात?", haveAccount: "आधीच खाते आहे?", createLink: "खाते तयार करा", loginLink: "साइन इन", forgot: "पासवर्ड किमान 8 अक्षरांचा असावा.", privacy: "पासवर्ड सुरक्षित हॅश स्वरूपात साठवला जातो.", guest: "साइन इन न करता पुढे जा", loading: "कृपया थांबा…" }
};

export default function AuthModal({ lang = "en", onClose, onAuthenticated }) {
  const t = copy[lang] || copy.en;
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [district, setDistrict] = useState("Pune");
  const [village, setVillage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (mode === "signup" && password !== confirmPassword) {
      setError(lang === "mr" ? "पासवर्ड जुळत नाहीत." : lang === "hi" ? "पासवर्ड मेल नहीं खाते।" : "Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const payload = mode === "signup"
        ? { full_name: fullName, email, password, district, village, preferred_language: lang }
        : { email, password };
      const result = await authRequest(mode === "signup" ? "signup" : "login", payload);
      onAuthenticated(result.token, result.user);
      onClose();
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close sign in"><X size={20} /></button>
        <div className="auth-brand"><span><Sprout size={25} /></span><div><strong>Farm Saathi</strong><small>Maharashtra crop support</small></div></div>
        <div className="auth-intro">
          <div className="auth-heading-icon">{mode === "login" ? <LogIn size={21} /> : <UserPlus size={21} />}</div>
          <h2 id="auth-title">{mode === "login" ? t.signIn : t.create}</h2>
          <p>{t.subtitle}</p>
        </div>
        <div className="auth-mode-tabs" role="tablist" aria-label="Account options">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>{t.signIn}</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>{t.createLink}</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && <label>{t.name}<input autoComplete="name" required minLength={2} maxLength={80} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rahul Patil" /></label>}
          <label>{t.email}<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>{t.password}<span className="auth-password-wrap"><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 8 : 1} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          {mode === "signup" && <>
            <label>{t.district}<span className="auth-field-icon"><MapPin size={16} /><input required maxLength={80} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Pune" /></span></label>
            <label>{t.village}<input maxLength={100} value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Village or town" /></label>
            <label>{t.confirm}<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" /></label>
            <p className="auth-helper">{t.forgot}</p>
          </>}
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? t.loading : mode === "login" ? t.submitLogin : t.submitSignup}</button>
        </form>
        <div className="auth-security"><ShieldCheck size={17} /><span>{t.privacy}</span></div>
        <button type="button" className="auth-guest" onClick={onClose}>{t.guest}</button>
        <p className="auth-switch">{mode === "login" ? t.noAccount : t.haveAccount} <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? t.createLink : t.loginLink}</button></p>
      </section>
    </div>
  );
}
