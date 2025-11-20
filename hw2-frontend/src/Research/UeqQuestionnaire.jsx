// src/Research/UeqQuestionnaire.jsx
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AnonymousHeader from "./AnonymousHeader";
import Footer from "../layout/Footer";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import { useAnonymousStudent as useStudent } from "../context/AnonymousStudentContext";

import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

const SCALE_VALUES = [1, 2, 3, 4, 5, 6, 7];

function UeqQuestionnaireContent() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";

  const { t } = useI18n("ueqQuestionnaire");

  const { student } =
    typeof useStudent === "function"
      ? useStudent()
      : { student: null };
  const anonId = student?.anonId || null;

  const [alreadyDone, setAlreadyDone] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  const UEQ_CACHE_KEY =
    lang === "he"
      ? "ueq_questions_he_v1"
      : "ueq_questions_en_v1";

  useEffect(() => {
    if (!anonId) {
      setStatusChecked(true);
      return;
    }

    try {
      const key = `experienceQuestionnaireDone:${anonId}`;
      const flag = localStorage.getItem(key);
      if (flag === "1") {
        setAlreadyDone(true);
      }
    } catch (e) {
      console.warn("experienceQuestionnaireDone check failed:", e);
    } finally {
      setStatusChecked(true);
    }
  }, [anonId]);

  const [items, setItems] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(UEQ_CACHE_KEY);
      if (!raw) {
        console.warn("UEQ-S not found in localStorage for key:", UEQ_CACHE_KEY);
        setItems([]);
        setError(
          t("err_load") ||
            "לא נמצאו פריטי שאלון חוויית משתמש (UEQ-S) בזיכרון המקומי."
        );
        return;
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        console.warn("UEQ-S format is not an array:", parsed);
        setItems([]);
        setError(
          t("err_load") ||
            "פורמט השאלון ב-localStorage אינו תקין."
        );
        return;
      }

      const sorted = [...parsed].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setItems(sorted);
      setError("");
    } catch (e) {
      console.warn("UEQ-S parse error:", e);
      setItems([]);
      setError(
        t("err_load") ||
          "אירעה שגיאה בקריאת השאלון מהזיכרון המקומי."
      );
    }
  }, [UEQ_CACHE_KEY]);

  const answeredCount = useMemo(
    () => Object.keys(responses).length,
    [responses]
  );

  const isComplete = items.length > 0 && answeredCount === items.length;

  const mapToUeqScale = (v) => v - 4;

  const calculateScores = () => {
    if (!items.length) return null;

    const pragmaticItems = items.filter((i) =>
      (i.category || "").toLowerCase().includes("pragmatic")
    );
    const hedonicItems = items.filter((i) =>
      (i.category || "").toLowerCase().includes("hedonic")
    );

    const sumFor = (arr) =>
      arr.reduce((sum, item) => {
        const key = item.key || item.id;
        const v = responses[key];
        if (!v) return sum;
        return sum + mapToUeqScale(v);
      }, 0);

    const pragmaticScore =
      pragmaticItems.length > 0
        ? sumFor(pragmaticItems) / pragmaticItems.length
        : 0;

    const hedonicScore =
      hedonicItems.length > 0
        ? sumFor(hedonicItems) / hedonicItems.length
        : 0;

    const overallScore = (pragmaticScore + hedonicScore) / 2;

    return { pragmaticScore, hedonicScore, overallScore };
  };

  const handleSelect = (itemKey, value) => {
    setResponses((prev) => ({
      ...prev,
      [itemKey]: value,
    }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      setError(t("err_incomplete") || "נא לענות על כל הסעיפים.");
      return;
    }

    setSubmitting(true);
    setError("");

    const scores = calculateScores();
    try {
      await fetch("/api/ueq/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonId: student?.anonId || null,
          groupType: student?.assignment?.groupType || null,
          lang,
          responses,
          scores,
        }),
      });

      console.log("UEQ-S responses", responses);
      console.log("UEQ-S scores", scores);

      if (anonId) {
        try {
          localStorage.setItem(
            `experienceQuestionnaireDone:${anonId}`,
            "1"
          );
        } catch (e) {
          console.warn("Failed to persist experience flag:", e);
        }
      }

      setSubmitted(true);
      navigate("/thanks");

    } catch (e) {
      console.error("UEQ-S submit failed:", e);
      setError(t("err_submit") || "חלה שגיאה בשמירת השאלון.");
    } finally {
      setSubmitting(false);
    }
  };

  const anonBadge = useMemo(
    () =>
      student?.anonId ? (
        <div
          className={`mt-2 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
            isDark
              ? "bg-slate-700/80 text-slate-200 border border-slate-600"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          <span className="font-medium">anonId:</span>
          <code
            className={`font-mono ${
              isDark ? "text-emerald-300" : "text-emerald-700"
            }`}
          >
            {student.anonId}
          </code>
        </div>
      ) : null,
    [student?.anonId, isDark]
  );

if (!statusChecked) {
  return (
    <div
      key={lang}
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
      style={{
        fontFamily:
          'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">
              {t("checkingStatus") || "בודקים את מצב השאלון..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

if (alreadyDone) {
  return (
    <div
      key={lang}
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
      style={{
        fontFamily:
          'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >

        <div className="px-4 mt-4">
          <AnonymousHeader />
        </div>

        <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
          <section
            className={`${
              isDark ? "bg-slate-700" : "bg-slate-200"
            } p-4 sm:p-6 md:p-7 rounded-xl`}
          >
            <div
              className={`rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border-2 max-w-3xl mx-auto ${
                isDark
                  ? "bg-slate-800 border-emerald-500/30 shadow-emerald-500/10"
                  : "bg-white border-emerald-200 shadow-emerald-100"
              }`}
            >
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 ${
                    isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                  }`}
                >
                  <svg
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {t("alreadyDoneTitle") ||
                    "כבר מילאת את שאלון הערכת החוויה"}
                </h2>
                <p
                  className={`mt-2 text-sm sm:text-base ${
                    isDark ? "text-emerald-200" : "text-emerald-700"
                  }`}
                >
                  {t("alreadyDoneBody") ||
                    "אין צורך למלא אותו שוב. אפשר להמשיך לסיכום."}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/thanks")}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>{t("goToSummary") || "מעבר לסיכום"}</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </main>

        <div className="px-4 pb-4">
          <Footer />
        </div>
      </div>
    );
  }

return (
  <div
    key={lang}
    dir={isRTL ? "rtl" : "ltr"}
    lang={lang}
    className={`flex flex-col min-h-screen w-screen ${
      isDark
        ? "bg-slate-800 text-white"
        : "bg-slate-100 text-slate-800"
    }`}
    style={{
      fontFamily:
        'Heebo, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}
  >

      {/* HEADER */}
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      {/* BODY */}
      <main className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <section
          className={`${
            isDark ? "bg-slate-700" : "bg-slate-200"
          } p-3 sm:p-6 md:p-7 rounded-xl`}
        >
          <div
            className={`rounded-xl shadow-lg p-4 sm:p-6 md:p-8 ${
              isDark
                ? "bg-slate-600 border border-slate-500 text-white"
                : "bg-white border border-slate-200 text-slate-800"
            } max-w-5xl mx-auto`}
          >
            {anonBadge}

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3 mb-2">
              {t("title") || "שאלון חוויית משתמש (UEQ-S)"}
            </h2>
            <p
              className={`text-sm sm:text-base mb-6 ${
                isDark ? "text-gray-300" : "text-slate-600"
              }`}
            >
              {t("intro") ||
                "אנא דרג/י את חווייתך עם המערכת בכל אחד מההיבטים הבאים."}
            </p>

            {items.length === 0 && (
              <div className={`mb-4 p-4 rounded-lg text-sm ${
                isDark 
                  ? "bg-red-900/20 text-red-300 border border-red-800" 
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {error ||
                  t("err_load") ||
                  "השאלון לא נטען. אם זה מופיע במחקר אמיתי – נא לפנות לחוקרת."}
              </div>
            )}

            {items.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-xs sm:text-sm mb-2 font-medium">
                  <span>{t("progress") || "התקדמות"}</span>
                  <span className={isDark ? "text-emerald-300" : "text-emerald-600"}>
                    {answeredCount} / {items.length || 0}
                  </span>
                </div>
                <div className={`w-full rounded-full h-2.5 overflow-hidden ${
                  isDark ? "bg-slate-700" : "bg-gray-200"
                }`}>
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width:
                        items.length === 0
                          ? "0%"
                          : `${
                              (answeredCount / items.length) * 100
                            }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {error && items.length > 0 && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                isDark 
                  ? "bg-red-900/20 text-red-300 border border-red-800" 
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {error}
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-6 sm:space-y-8">
                {items.map((item, idx) => {
                  const key = item.key || item._id || `q${idx + 1}`;

                  const rawText = item.text || "";
                  const parts = rawText.split("/");
                  const left = (parts[0] || "").trim();
                  const right = (parts[1] || "").trim();

                  const catRaw = item.category || "";
                  const dim = catRaw
                    .toLowerCase()
                    .includes("pragmatic")
                    ? "pragmatic"
                    : catRaw
                        .toLowerCase()
                        .includes("hedonic")
                    ? "hedonic"
                    : "";

                  return (
                    <div
                      key={key}
                      className={`pb-6 sm:pb-8 border-b last:border-b-0 ${
                        isDark ? "border-slate-500/50" : "border-slate-200"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-bold shadow-sm ${
                            isDark
                              ? "bg-slate-700 text-emerald-300 border border-slate-600"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        {dim === "pragmatic" && idx === 0 && (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                            isDark
                              ? "bg-blue-900/30 text-blue-300 border border-blue-700"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            {t("dim_pragmatic") ||
                              "שימושיות / איכות פרגמטית"}
                          </span>
                        )}
                        {dim === "hedonic" &&
                          !items
                            .slice(0, idx)
                            .some((i) =>
                              (i.category || "")
                                .toLowerCase()
                                .includes("hedonic")
                            ) && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                              isDark
                                ? "bg-purple-900/30 text-purple-300 border border-purple-700"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}>
                              {t("dim_hedonic") ||
                                "חוויה רגשית / איכות הדונית"}
                            </span>
                          )}
                      </div>

                      <div className="flex justify-between items-center mb-4 gap-4">
                        <span className={`text-xs sm:text-sm font-semibold ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}>
                          {left}
                        </span>
                        <span className={`text-xs sm:text-sm font-semibold ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}>
                          {right}
                        </span>
                      </div>

<div className="flex flex-wrap justify-center items-end gap-1 sm:gap-2 md:gap-3 px-0">
                        {SCALE_VALUES.map((v) => (
               <button
  key={v}
  type="button"
  onClick={() => handleSelect(key, v)}
  className="flex flex-col items-center gap-1 flex-[0_0_13%] xs:flex-1 min-w-[2.1rem] touch-manipulation"
>

                            <div
                              className={`w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                                ${
                                  responses[key] === v
                                    ? isDark
                                      ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50 scale-105 sm:scale-110"
                                      : "bg-emerald-500 border-emerald-600 shadow-lg shadow-emerald-500/30 scale-105 sm:scale-110"
                                    : isDark
                                    ? "bg-slate-700 border-slate-500 hover:border-emerald-400 hover:bg-slate-600 active:scale-95"
                                    : "bg-white border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 active:scale-95"
                                }`}
                            >
                              {responses[key] === v && (
                                <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-white rounded-full shadow-inner" />
                              )}
                            </div>
                            <span className={`text-[10px] xs:text-[11px] sm:text-xs font-medium whitespace-nowrap ${
                              responses[key] === v
                                ? isDark ? "text-emerald-300" : "text-emerald-600"
                                : isDark ? "text-slate-400" : "text-slate-500"
                            }`}>
                              {v}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                disabled={!isComplete || submitting || items.length === 0}
                onClick={handleSubmit}
                className={`w-full px-6 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md
                  ${
                    !isComplete || submitting || items.length === 0
                      ? isDark
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("saving") || "שומר..."}</span>
                  </>
                ) : (
                  <>
                    <span>{t("submit") || "שליחת השאלון"}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {submitted && !error && (
              <div className={`mt-4 p-4 rounded-lg text-sm ${
                isDark 
                  ? "bg-emerald-900/20 text-emerald-300 border border-emerald-800" 
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {t("thanks") ||
                  "תודה רבה! תשובותיך נשמרו כחלק מהמחקר על חוויית השימוש במערכת."}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function UeqQuestionnaire() {
  return <UeqQuestionnaireContent />;
}