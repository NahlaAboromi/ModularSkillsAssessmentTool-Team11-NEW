import React, { useContext, useEffect } from "react";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import HomeHeader from "./HomeHeader";
import Footer from "../layout/Footer";
import { Link, useLocation } from "react-router-dom";

const HomepageContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const location = useLocation();

  console.log("🟢 HomepageContent component loaded");
  console.log("🎨 Current theme:", theme);
  console.log("🌙 Dark mode?", isDark);
  console.log("📍 Current URL:", location.pathname);

  useEffect(() => {
    console.log("🔄 HomepageContent rendered or updated");
  }, [theme]);

  const handleEducatorClick = () => {
    console.log("👨‍🏫 Educator Portal clicked → navigating to /teacher-login");
  };

  const handleStudentClick = () => {
    console.log("🎓 Student Portal clicked → navigating to /student-login");
  };

  return (
    <>
      {console.log("📦 Rendering HomepageContent return block")}
      <div className={"flex flex-col min-h-screen w-screen dark:bg-slate-900 !important dark:text-white !important bg-slate-100 text-slate-900"}>
        {console.log("🧩 Container div rendered")}

        {/* Header */}
        <div className="px-6 pt-6">
          {console.log("📌 Rendering HomeHeader")}
          <HomeHeader />
        </div>

        {/* Hero Section */}
        <section className="relative w-screen overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-slate-900 text-white py-24 px-6">
          {console.log("🌈 Hero Section rendered")}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>

          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6 pt-8 pb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Empower Social Emotional Learning
              </span>
            </h1>

            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Personalized SEL assessments and insights for students and educators using AI and the CASEL framework.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {console.log("🔘 Rendering Educator and Student buttons")}
              <Link to="/teacher-login" onClick={handleEducatorClick}>
                <button className="group relative inline-flex items-center justify-center h-12 px-6 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  Educator Portal
                  <span className="absolute inset-0 rounded-full bg-white/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </button>
              </Link>
              <Link to="/student-login" onClick={handleStudentClick}>
                <button className="group relative inline-flex items-center justify-center h-12 px-6 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/10 hover:bg-black/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  Student Portal
                  <span className="absolute inset-0 rounded-full bg-white/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section className="w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-24 space-y-24">
          {console.log("🧠 Feature Section loaded")}

          {/* Header of features */}
          <div className="max-w-3xl mx-auto text-center mb-12 px-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Discover how our platform empowers students and educators through AI-driven SEL tools.
            </p>
          </div>

          {/* Step 1 */}
          {console.log("📘 Step 1 rendered")}
          {/* Step 2 */}
          {console.log("📗 Step 2 rendered")}
          {/* Step 3 */}
          {console.log("📙 Step 3 rendered")}
        </section>

        {/* Footer */}
        <div className="px-6 pb-6 mt-12">
          {console.log("📄 Rendering Footer")}
          <Footer />
        </div>
      </div>
    </>
  );
};

const Homepage = () => {
  console.log("🔵 Homepage wrapper component loaded");
  return <HomepageContent />;
};

export default Homepage;
