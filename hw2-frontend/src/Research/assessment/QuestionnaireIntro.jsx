// src/Research/assessment/QuestionnaireIntro.jsx
import React, { useContext, useEffect, useState } from "react";
import { Brain, Zap, Keyboard } from "lucide-react";
import { LanguageContext } from "../../context/LanguageContext";
import { useI18n } from "../../utils/i18n"; // ✅ במקום translateUI

export default function QuestionnaireIntro({ CATEGORIES = {}, onStart }) {
  const { lang } = useContext(LanguageContext);
  const isHeb = lang === "he";
  const { t } = useI18n("questionnaireIntro"); // ✅ טעינה מקובץ JSON
  const T = {
    title: t("title"),
    subtitle: t("subtitle"),
    chip: t("chip"),
    quickOn: t("quickOn"),
    quickHelp1: t("quickHelp1"),
    quickHelp2: t("quickHelp2"),
    start: t("start"),
  };

  // ===== Dynamic category name translations =====
  const [catLabels, setCatLabels] = useState({});

  useEffect(() => {
    let cancelled = false;
    const names = Object.keys(CATEGORIES);
    if (!names.length) {
      setCatLabels({});
      return () => {
        cancelled = true;
      };
    }

    // תרגום דו-כיווני: EN→HE כשעברית, HE→EN כשאנגלית
    const sourceLang = lang === "he" ? "EN" : "HE";
    const targetLang = lang === "he" ? "HE" : "EN";

    (async () => {
      try {
        // נשאר עם translateUI רק לקטגוריות הדינמיות
        const { translateUI } = await import("../../utils/translateUI");
        const out = await translateUI({ sourceLang, targetLang, texts: names });
        if (!cancelled) {
          const map = {};
          names.forEach((n, i) => (map[n] = out[i] ?? n));
          setCatLabels(map);
        }
      } catch {
        if (!cancelled) setCatLabels({});
      }
    })();

    return () => {
      cancelled = true;
      setCatLabels({});
    };
  }, [lang, CATEGORIES]);

  // —— render quickHelp2 with LTR numbers inside RTL sentence —— //
  const renderQuickHelp2 = () => {
    if (!isHeb) return T.quickHelp2;
    const parts = String(T.quickHelp2).split(/(1\s*\/\s*2\s*\/\s*3\s*\/\s*4)/);
    if (parts.length < 3) return T.quickHelp2;
    return (
      <>
        {parts[0]}
        <bdi dir="ltr" className="inline-block">
          1 / 2 / 3 / 4
        </bdi>
        {parts[2]}
      </>
    );
  };

  return (
    <div
      className="min-h-screen bg-transparent flex items-stretch justify-center p-4 md:p-6 lg:p-8"
      dir={isHeb ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-[96vw] mx-auto">
        {/* Card */}
        <div className="rounded-lg shadow-md p-6 md:p-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Header */}
          <div className={`text-center mb-10 ${isHeb ? "rtl" : ""}`}>
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-xl mb-6 shadow"
              style={{ background: "#6b21a8" }}
            >
              <Brain className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              {T.title}
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 mb-3">
              {T.subtitle}
            </p>

            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 px-4 py-2 rounded-full">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">{T.chip}</span>
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(CATEGORIES).map(([name, { icon: Icon }]) => (
              <div
                key={name}
                className="
                  flex items-center justify-between rounded-xl border p-5
                  bg-slate-50 dark:bg-slate-600/70
                  border-slate-200 dark:border-slate-500
                "
                dir={isHeb ? "rtl" : "ltr"}
              >
                {/* Label */}
                <span
                  className={`font-semibold text-slate-700 dark:text-slate-100 leading-snug break-words ${
                    isHeb ? "text-right" : "text-left"
                  }`}
                >
                  {isHeb ? catLabels[name] || name : name}
                </span>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md bg-slate-600 dark:bg-slate-500 ${
                    isHeb ? "mr-3" : "ml-3"
                  }`}
                >
                  {Icon ? <Icon className="w-7 h-7 text-white" /> : null}
                </div>
              </div>
            ))}
          </div>

          {/* Quick mode info */}
          <div
            dir={isHeb ? "rtl" : "ltr"}
            className={`
              flex flex-row items-center gap-3 rounded-xl mb-8 border p-5
              ${isHeb ? "text-right" : "text-left"}
              bg-slate-50 dark:bg-slate-700
              border-slate-200 dark:border-slate-600
            `}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-700 dark:bg-slate-600">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <div className="text-slate-700 dark:text-slate-100">
              <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                {T.quickOn}
              </div>
              <div className="text-sm">
                {T.quickHelp1}
                <br />
                <span className="font-semibold">{renderQuickHelp2()}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              try {
                localStorage.setItem("langLock", "1");
              } catch {}
              window.dispatchEvent(new Event("lang-lock-change"));
              onStart?.();
            }}
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-semibold hover:shadow"
          >
            {T.start}
          </button>
        </div>
      </div>
    </div>
  );
}
