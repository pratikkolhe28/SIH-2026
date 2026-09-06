import React from "react";
import { TRANSLATIONS } from "../../translations";

export default function SampleSelector({ samples, onSelectSample, activeSampleId, lang }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!samples || samples.length === 0) return null;

  return (
    <div className="samples-gallery-card">
      <h4>{t.demo_samples_title}</h4>
      <div className="sample-pills-scroll">
        {samples.map((s) => {
          const label = lang === "mr" && s.label_mr
            ? s.label_mr
            : lang === "hi" && s.label_hi
            ? s.label_hi
            : s.label;

          return (
            <div
              key={s.id}
              className={`sample-chip ${activeSampleId === s.id ? "active" : ""}`}
              onClick={() => onSelectSample(s)}
              title={`Test ${s.expected_disease} on ${s.crop}`}
              id={`sample-chip-${s.id}`}
            >
              <img src={s.image_url} alt={label} loading="lazy" />
              <span className="crop-badge">{s.crop}</span>
              <span className="disease-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
