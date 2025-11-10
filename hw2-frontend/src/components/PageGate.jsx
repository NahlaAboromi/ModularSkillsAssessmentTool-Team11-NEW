// src/components/PageGate.jsx
import React, { useContext } from "react";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";

export default function PageGate({ loading, children, message }) {
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext);

  const isDark = theme === "dark";
  const isHe = lang === "he";
  const dir = isHe ? "rtl" : "ltr";

  // 🟦 ברירת מחדל וטקסט מוצג רק אם message !== null
  const defaultMsg = isHe ? "טוען נתונים..." : "Loading data...";
  const showText = message !== null; // null = בלי טקסט בכלל
  const textToShow = message ?? defaultMsg; // undefined => ברירת מחדל

  if (loading) {
    return (
      <div
        dir={dir}
        lang={lang}
        className={`flex flex-col items-center justify-center min-h-[65vh] transition-colors duration-300 ${
          isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        {/* 🔄 Spinner */}
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"
          style={{ marginBottom: showText ? "1rem" : 0 }}
        />
        {/* 🗣️ הודעה (אם לא הועבר null) */}
        {showText && <p className="text-sm opacity-80">{textToShow}</p>}
      </div>
    );
  }

  return <>{children}</>;
}
