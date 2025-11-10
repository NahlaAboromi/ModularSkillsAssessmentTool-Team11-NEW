// src/Research/AnonymousStart.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { useAnonymousStudent as useStudent } from "../context/AnonymousStudentContext";
import SharedHeader from "../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../layout/Footer";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { LanguageContext } from "../context/LanguageContext";
import { translateUI } from "../utils/translateUI";
import PageGate from "../components/PageGate";
const AnonymousStartContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();
  const { setStudent, startSessionTimer, loadQuestionnaire } = useStudent();

  const [form, setForm] = useState({
    gender: "",
    ageRange: "",
    fieldOfStudy: "",
    customFieldOfStudy: "",
    semester: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
const [tLoading, setTLoading] = useState(lang === "he");
  const refs = {
    fieldOfStudy: useRef(null),
    customFieldOfStudy: useRef(null),
    semester: useRef(null),
    gender: useRef(null),
    ageRange: useRef(null),
  };
const SEMESTER_VALUES_EN = [
  "1st Semester","2nd Semester","3rd Semester","4th Semester",
  "5th Semester","6th Semester","7th Semester","8th Semester or higher"
];
  // 🔤 מחרוזות מקור באנגלית (פעם אחת בקובץ)
  const SOURCE = {
    brandTitle: "✨ CASELy ✨",
    brandSubtitle: "Social-Emotional Learning Platform",
    welcomeTitle: "Welcome to the Experiment",
    welcomeDesc: "Please fill in the short anonymous demographic form below.",
    welcomeNote: "All data is collected anonymously and used for research purposes only.",
    missing:
      "Almost there! Please complete the highlighted fields below so we can start your anonymous experience 🌟",

   ar_18_22: "18–22",
   ar_23_26: "23–26",
   ar_27_30: "27–30",
   ar_31_35: "31–35",
   ar_36p:   "36 or above",
    // Labels
    fieldOfStudy: "Field of Study",
    selectField: "Select your field of study",
    otherFieldPh: "✏️ Please specify your field of study",
    currentSemester: "Current Semester",
    selectSemester: "Select your semester",
    gender: "Gender",
    ageRange: "Age Range",
    selectAgeRange: "Select your age range",

    // Options (fields of study)
    fs_SW: "💻 Software Engineering",
    fs_CS: "🖥️ Computer Science",
    fs_IS: "📊 Information Systems",
    fs_PSY: "🧠 Psychology",
    fs_EDU: "👩‍🏫 Education",
    fs_BIZ: "💼 Business Management",
    fs_IE: "⚙️ Industrial Engineering",
    fs_BIO: "🧬 Biology",
    fs_NUR: "🏥 Nursing",
    fs_LAW: "⚖️ Law",
    fs_OTHER: "✏️ Other",

    // Semester options
    s_1: "1st Semester",
    s_2: "2nd Semester",
    s_3: "3rd Semester",
    s_4: "4th Semester",
    s_5: "5th Semester",
    s_6: "6th Semester",
    s_7: "7th Semester",
    s_8: "8th Semester or higher",

    // Gender options
    male: "Male",
    female: "Female",
    other: "Other",

    // Help/CTA
    ageHelp: "We collect age ranges to understand different student populations.",
    startCTA: "Start the Experience",
    privacyTitle: "Your privacy matters:",
    privacyText:
      "Your data is completely anonymous. We do not collect names, emails, or any identifying information. Responses are used solely for research to improve SEL learning tools.",

    // Validation / errors
    v_field: "Please choose your field.",
    v_fieldOther: "Please specify your field of study.",
    v_semester: "Please select your current semester.",
    v_gender: "Please select your gender.",
    v_age: "Please select your age range.",
    err_auth: "Anonymous auth failed",
    err_noAnon: "Server did not return anonId",
    err_demo: "Saving demographics failed",
    err_assign: "Assignment failed",
    err_generic: "Request failed. Please try again.",
  };

  const [T, setT] = useState(SOURCE);
  const t = (k) => T[k] ?? k;
// ⬇️ טוען תרגומים פעם אחת לפי השפה, באותו פאטרן כמו בהדר
useEffect(() => {
  let cancelled = false;
  async function loadTranslations() {
    if (lang === "he") {
      setTLoading(true);
      const keys = Object.keys(SOURCE);
      const values = Object.values(SOURCE);
      try {
        // שלב 1 – תרגום רגיל
        const translated = await translateUI({
          sourceLang: "EN",
          targetLang: "HE",
          texts: values,
        });

        // שלב 2 – אם לא בוטל, בונים map
        if (!cancelled) {
          const map = {};
          keys.forEach((k, i) => (map[k] = translated[i]));

          // שלב 3 – תרגום טוקנים נפרדים להרכבת סמסטרים (בלי עברית בקוד)
          const tokenSrc = [
            "Semester",
            "First", "Second", "Third", "Fourth",
            "Fifth", "Sixth", "Seventh", "Eighth",
            "or higher"
          ];
          const tokenTr = await translateUI({
            sourceLang: "EN",
            targetLang: "HE",
            texts: tokenSrc
          });
          const [
            SEM, FIRST, SECOND, THIRD, FOURTH,
            FIFTH, SIXTH, SEVENTH, EIGHTH, OR_HIGHER
          ] = tokenTr;

          // מרכיבים תוויות לסמסטרים — ה-value נשאר באנגלית
          map.s_1 = `${SEM} ${FIRST}`;
          map.s_2 = `${SEM} ${SECOND}`;
          map.s_3 = `${SEM} ${THIRD}`;
          map.s_4 = `${SEM} ${FOURTH}`;
          map.s_5 = `${SEM} ${FIFTH}`;
          map.s_6 = `${SEM} ${SIXTH}`;
          map.s_7 = `${SEM} ${SEVENTH}`;
          map.s_8 = `${SEM} ${EIGHTH} ${OR_HIGHER}`;
   setT(map);
        }
      } catch {
        if (!cancelled) setT(SOURCE);
      } finally {
        if (!cancelled) setTLoading(false);   // ✅ חשוב: לכבות את הספינר בעברית
      }
    } else {
      setT(SOURCE);
      setTLoading(false);
    }
  }
  loadTranslations();
  return () => { cancelled = true; };
}, [lang]);

  const friendlyMissingMessage = useMemo(() => t("missing"), [T]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setOkMsg("");
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      if (name === "fieldOfStudy" && value !== "other") {
        delete copy.customFieldOfStudy;
      }
      return copy;
    });
  };

  const validate = () => {
    const errs = {};
    const finalField =
      form.fieldOfStudy === "other"
        ? (form.customFieldOfStudy || "").trim()
        : form.fieldOfStudy;

    if (!form.fieldOfStudy) errs.fieldOfStudy = t("v_field");
    if (form.fieldOfStudy === "other" && !finalField) {
      errs.customFieldOfStudy = t("v_fieldOther");
    }
    if (!form.semester) errs.semester = t("v_semester");
    if (!form.gender) errs.gender = t("v_gender");
    if (!form.ageRange) errs.ageRange = t("v_age");

    return { errs, finalField };
  };

  const focusFirstError = (errs) => {
    const order = ["fieldOfStudy", "customFieldOfStudy", "semester", "gender", "ageRange"];
    const first = order.find((f) => errs[f]);
    if (first && refs[first]?.current) {
      refs[first].current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => refs[first].current?.focus?.(), 250);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setOkMsg("");

    const { errs, finalField } = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      focusFirstError(errs);
      setIsLoading(false);
      return;
    }

    try {
      const authRes = await fetch("/api/anonymous/auth/anonymous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!authRes.ok) {
        const err = await authRes.json().catch(() => ({}));
        throw new Error(err.message || t("err_auth"));
      }

      const { user } = await authRes.json();
      const serverAnonId = user?.anonId;
      if (!serverAnonId) throw new Error(t("err_noAnon"));

      const payload = {
        anonId: serverAnonId,
        gender: form.gender,
        ageRange: form.ageRange,
        fieldOfStudy: finalField,
        semester: String(form.semester || "").trim(),
      };

      const demoRes = await fetch("/api/anonymous/demographics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!demoRes.ok) {
        const err = await demoRes.json().catch(() => ({}));
        throw new Error(err.message || t("err_demo"));
      }

      await demoRes.json();

 setStudent({
   anonId: serverAnonId,
   demographics: payload,
   assessmentStatus: "not-started",
  uiLang: lang,            // ⭐ נשמור את שפת ה-UI
 });
      startSessionTimer();

      // 🔄 טוען את השאלון (phase=both) – נשאיר ספינר עד שזה מסיים
      await loadQuestionnaire({ lang }); 

      // 📨 שיוך לקבוצה + סנריו עוד לפני שמתחילים את ה-PRE
      const asgRes = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId: serverAnonId }),
      });
      if (!asgRes.ok) {
        const err = await asgRes.json().catch(() => ({}));
        throw new Error(err.details || err.error || t("err_assign"));
      }
      const assignment = await asgRes.json(); // { groupType, group, scenarioId, scenario }

      // אופציונלי: לשמור גם בקונטקסט למעקב
      setStudent((s) => ({ ...s, assignment }));

      // ✅ עכשיו עוברים למסך ה-Assignment Summary
      navigate("/assignment", { state: { assignment } });
    } catch (err) {
      console.error("❌ Anonymous start error:", err);
      setError(err.message || t("err_generic"));
    } finally {

      setIsLoading(false);
    }
  };

  const baseFieldClass =
    "mt-1 block w-full rounded-md border p-3 bg-white dark:bg-gray-700 dark:text-white transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorBorder = "border-red-500";
  const normalBorder = "border-gray-300 dark:border-gray-600";

  return (
    <div
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Header */}
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      {/* Main content */}
      <PageGate loading={isLoading || tLoading} message={null}>
      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? "bg-slate-700" : "bg-slate-200"} p-6 rounded`}>
          {/* Brand header with gradient */}
          <div className="mb-6 text-center">
            <h1
              className={`text-4xl font-extrabold bg-gradient-to-r ${
                isDark ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent mb-2`}
            >
              {t("brandTitle")}
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-slate-600"
              } flex items-center justify-center gap-2`}
            >
              <span>💡</span>
              <span>{t("brandSubtitle")}</span>
              <span>🎓</span>
            </p>
          </div>

          {/* Card */}
          <div className={`rounded-lg shadow-md p-8 ${isDark ? "bg-slate-600" : "bg-white"}`}>
            <div className="mb-6 text-center">
              <div className="text-5xl mb-3">🤖💡</div>
              <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-800"} mb-2`}>
                {t("welcomeTitle")}
              </h2>
              <p className={`text-lg ${isDark ? "text-gray-300" : "text-slate-600"}`}>
                {t("welcomeDesc")}
                <br />
                <span className="text-sm italic opacity-80 flex items-center justify-center gap-1 mt-2">
                  <span>🔒</span>
                  <span>{t("welcomeNote")}</span>
                </span>
              </p>
            </div>

            {/* top messages */}
            {error && <Alert type="error" message={error} />}
            {okMsg && <Alert type="success" message={okMsg} />}

            {Object.keys(fieldErrors).length > 0 && (
              <Alert type="warning" message={friendlyMissingMessage} />
            )}

            {/* Form */}
            <form className="space-y-6 mt-6" onSubmit={handleSubmit} noValidate>
              {/* Field of Study */}
              <div className="group">
                <label
                  htmlFor="fieldOfStudy"
                  className="block text-sm font-semibold mb-2 flex items-center gap-2"
                >
                  <span className="text-xl">📚</span>
                  <span>{t("fieldOfStudy")}</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  ref={refs.fieldOfStudy}
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  value={form.fieldOfStudy}
                  onChange={handleChange}
                  className={`${baseFieldClass} ${
                    fieldErrors.fieldOfStudy ? errorBorder : normalBorder
                  } group-hover:border-blue-400`}
                  aria-invalid={!!fieldErrors.fieldOfStudy}
                >
                  <option value="" disabled>
                    {t("selectField")}
                  </option>
                  <option value="Software Engineering">{t("fs_SW")}</option>
                  <option value="Computer Science">{t("fs_CS")}</option>
                  <option value="Information Systems">{t("fs_IS")}</option>
                  <option value="Psychology">{t("fs_PSY")}</option>
                  <option value="Education">{t("fs_EDU")}</option>
                  <option value="Business Management">{t("fs_BIZ")}</option>
                  <option value="Industrial Engineering">{t("fs_IE")}</option>
                  <option value="Biology">{t("fs_BIO")}</option>
                  <option value="Nursing">{t("fs_NUR")}</option>
                  <option value="Law">{t("fs_LAW")}</option>
                  <option value="other">{t("fs_OTHER")}</option>
                </select>
                {fieldErrors.fieldOfStudy && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.fieldOfStudy}</span>
                  </p>
                )}

                {form.fieldOfStudy === "other" && (
                  <>
                    <input
                      ref={refs.customFieldOfStudy}
                      type="text"
                      name="customFieldOfStudy"
                      placeholder={t("otherFieldPh")}
                      value={form.customFieldOfStudy}
                      onChange={handleChange}
                      className={`${baseFieldClass} mt-3 ${
                        fieldErrors.customFieldOfStudy ? errorBorder : normalBorder
                      }`}
                      aria-invalid={!!fieldErrors.customFieldOfStudy}
                    />
                    {fieldErrors.customFieldOfStudy && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{fieldErrors.customFieldOfStudy}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Semester */}
              <div className="group">
                <label
                  htmlFor="semester"
                  className="block text-sm font-semibold mb-2 flex items-center gap-2"
                >
                  <span className="text-xl">📅</span>
                  <span>{t("currentSemester")}</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  ref={refs.semester}
                  id="semester"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className={`${baseFieldClass} ${
                    fieldErrors.semester ? errorBorder : normalBorder
                  } group-hover:border-blue-400`}
                  aria-invalid={!!fieldErrors.semester}
                >
                  <option value="" disabled>
                    {t("selectSemester")}
                  </option>
 {SEMESTER_VALUES_EN.map((value, i) => (
   <option key={value} value={value}>
     {t(`s_${i+1}`)}
   </option>
 ))}
                </select>
                {fieldErrors.semester && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.semester}</span>
                  </p>
                )}
              </div>

              {/* Gender (Radio buttons) */}
              <div ref={refs.gender} className="group">
                <span className="block text-sm font-semibold mb-3 flex items-center gap-2">
                  <span>{t("gender")}</span>
                  <span className="text-red-500">*</span>
                </span>
                <div
                  className={`rounded-xl p-4 ${
                    fieldErrors.gender
                      ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20"
                      : "bg-gray-50 dark:bg-slate-800/50"
                  } transition-all`}
                >
                  <div className="flex items-center gap-8 justify-center">
                    <label className="inline-flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={form.gender === "male"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-lg">{t("male")}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={form.gender === "female"}
                        onChange={handleChange}
                        className="w-4 h-4 text-pink-600"
                      />
                      <span className="text-lg">{t("female")}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={form.gender === "other"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-lg">{t("other")}</span>
                    </label>
                  </div>
                </div>
                {fieldErrors.gender && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.gender}</span>
                  </p>
                )}
              </div>

              {/* Age Range */}
              <div className="group">
                <label
                  htmlFor="ageRange"
                  className="block text-sm font-semibold mb-2 flex items-center gap-2"
                >
                  <span className="text-xl">😊</span>
                  <span>{t("ageRange")}</span>
                  <span className="text-red-500">*</span>
                </label>
                <select
                  ref={refs.ageRange}
                  id="ageRange"
                  name="ageRange"
                  value={form.ageRange}
                  onChange={handleChange}
                  className={`${baseFieldClass} ${
                    fieldErrors.ageRange ? errorBorder : normalBorder
                  } group-hover:border-blue-400`}
                  aria-invalid={!!fieldErrors.ageRange}
                >
                  <option value="" disabled>
                    {t("selectAgeRange")}
                  </option>
<option value="18-22">{t("ar_18_22")}</option>
 <option value="23-26">{t("ar_23_26")}</option>
 <option value="27-30">{t("ar_27_30")}</option>
 <option value="31-35">{t("ar_31_35")}</option>
 <option value="36+">{t("ar_36p")}</option>
                </select>
                {fieldErrors.ageRange && (
                  <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{fieldErrors.ageRange}</span>
                  </p>
                )}
                <p className="text-xs mt-2 opacity-70 flex items-center gap-1">
                  <span>ℹ️</span>
                  <span>{t("ageHelp")}</span>
                </p>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                  <span className="flex items-center justify-center gap-2 text-lg">
                    <span>🚀</span>
                    <span>{t("startCTA")}</span>
                  </span>
                </Button>
              </div>
            </form>

            {/* Anonymous notice */}
            <div
              className={`mt-6 p-4 rounded-xl ${
                isDark ? "bg-slate-800/50" : "bg-blue-50"
              } border ${isDark ? "border-slate-600" : "border-blue-200"}`}
            >
              <p className="text-sm opacity-90 flex items-start gap-2">
                <span className="text-xl">🔒</span>
                <span>
                  <strong>{t("privacyTitle")}</strong> {t("privacyText")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
</PageGate>
      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const AnonymousStart = () => (
  <ThemeProvider>
    <AnonymousStartContent />
  </ThemeProvider>
);

export default AnonymousStart;
