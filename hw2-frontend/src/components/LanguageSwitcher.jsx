// src/components/LanguageSwitcher.jsx
import React, { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { ThemeContext } from "../DarkLightMood/ThemeContext";

export default function LanguageSwitcher({ compact = false, disabled = false, title }) {
    const { lang, setLang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // 🎨 צבעים
  const baseBg    = isDark ? "#1e293b" : "#f8fafc";  // רקע לא פעיל
  const activeBg  = isDark ? "#334155" : "#e2e8f0";  // רקע פעיל
  const baseText  = isDark ? "#f8fafc" : "#1e293b";
  const offBorder = isDark ? "#64748b" : "#cbd5e1";
  const onBorder  = "#3b82f6";

  // מידות קשיחות לשני המצבים (מונע קפיצות)
  const BTN_W = compact ? 40 : 48;  // px
  const BTN_H = compact ? 30 : 36;  // px

  const buttonStyle = (active) => ({
    width: BTN_W,
    height: BTN_H,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    // 🧱 אותו עובי גבול בשני המצבים
    border: `1px solid ${active ? onBorder : offBorder}`,
    // ✅ הדגשה שלא שוברת לייאאוט
    outline: active ? `2px solid ${onBorder}33` : "2px solid transparent",
    outlineOffset: 2,
    background: active ? activeBg : baseBg,
    color: baseText,
    cursor: "pointer",
    fontWeight: 500,             // קבוע, לא משתנה
    letterSpacing: 0.2,          // קלילות קבועה
    transition: "background 0.2s ease, outline-color 0.2s ease, border-color 0.2s ease",
    boxSizing: "border-box",     // חשוב כדי שה־outline לא ישנה מידה
    userSelect: "none",
  });

  return (
    <div
      style={{
          display: "flex",
        gap: 8,
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
      aria-disabled={disabled}
      title={title}
   >
      {!compact && (
        <span style={{ opacity: 0.8, fontSize: 12, color: baseText, minWidth: 48, textAlign: "center" }}>
          {lang === "he" ? "עברית" : "English"}
        </span>
      )}

            <button
       type="button"
       disabled={disabled}
       onClick={() => !disabled && setLang("he")}
       style={{ ...buttonStyle(lang === "he"), cursor: disabled ? "not-allowed" : "pointer" }}
     >
        IL
      </button>

           <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setLang("en")}
        style={{ ...buttonStyle(lang === "en"), cursor: disabled ? "not-allowed" : "pointer" }}
      >
        GB
      </button>
    </div>
  );
}
