import React, { useContext } from "react";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import HomeHeader from "./HomeHeader";
import Footer from "../layout/Footer";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";   // ✅ במקום translateUI

const HomepageContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";

  // ⬅️ לוקחים מילון לוקאלי ומהיר
  const { t } = useI18n("homepage");

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "dark:bg-slate-900 dark:text-white" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Header */}
      <div className="px-6 pt-6">
        <HomeHeader />
      </div>

      {/* Hero Section */}
      <section className="relative w-screen overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-slate-900 text-white py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6 pt-8 pb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              {t("heroTitle")}
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto opacity-90">{t("heroSubtitle")}</p>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/teacher-login">
              <button className="h-12 px-8 rounded-full text-white font-semibold border border-white/30 bg-blue-500/30 hover:bg-blue-500/50 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                {t("educatorBtn")}
              </button>
            </Link>

            <Link to="/student-login">
              <button className="h-12 px-8 rounded-full text-white font-semibold border border-white/30 bg-blue-700/60 hover:bg-blue-700/80 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                {t("studentBtn")}
              </button>
            </Link>

            <Link to="/experiment/start">
              <button
                className="h-12 px-8 rounded-full text-white font-semibold border border-white/30 bg-emerald-600/80 hover:bg-emerald-700 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                title={t("joinStudyHint")}
              >
                {t("joinStudyBtn")}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-24 space-y-24">
        <div className="max-w-3xl mx-auto text-center mb-12 px-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t("sectionTitle")}
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            {t("sectionDesc")}
          </p>
        </div>

        {/* Step 1 */}
        <div className="relative flex flex-col md:flex-row items-center group">
          <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-white dark:bg-slate-800 shadow-lg backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border-r border-slate-200 dark:border-slate-700">
            <div className="max-w-md mx-auto md:mx-0">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {t("step1Title")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{t("step1Text")}</p>
            </div>
          </div>

          <div className="z-10 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-md transition-transform duration-500 group-hover:scale-110"></div>

          <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex justify-center">
            <img
              src="/engage.jpg"
              alt={isRTL ? "AI בחינוך" : "AI in education"}
              className="rounded-xl shadow-2xl w-full object-cover h-80 md:h-[25rem] transform transition-all duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex md:flex-row items-center group flex-row-reverse">
          <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex justify-center">
            <img
              src="/analyze2.jpg"
              alt={isRTL ? "סימולציות SEL" : "SEL Simulations"}
              className="rounded-xl shadow-2xl w-full object-cover h-80 md:h-[25rem] transform transition-all duration-500 hover:scale-105"
            />
          </div>

          <div className="z-10 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-md transition-transform duration-500 group-hover:scale-110"></div>

          <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-white dark:bg-slate-800 shadow-lg backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border-l border-slate-200 dark:border-slate-700 flex justify-center">
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {t("step2Title")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{t("step2Text")}</p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex flex-col md:flex-row items-center group">
          <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-white dark:bg-slate-800 shadow-lg backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border-r border-slate-200 dark:border-slate-700">
            <div className="max-w-md mx-auto md:mx-0">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {t("step3Title")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{t("step3Text")}</p>
            </div>
          </div>

          <div className="z-10 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-md transition-transform duration-500 group-hover:scale-110"></div>

          <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex justify-center">
            <img
              src="/graph.jpg"
              alt={isRTL ? "דשבורד מעקב התקדמות" : "Progress tracking dashboard"}
              className="rounded-xl shadow-2xl w-full object-cover h-80 md:h-[25rem] transform transition-all duration-500 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="px-6 pb-6 mt-12">
        <Footer />
      </div>
    </div>
  );
};

const Homepage = () => <HomepageContent />;

export default Homepage;
