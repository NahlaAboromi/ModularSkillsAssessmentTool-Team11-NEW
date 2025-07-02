import React, { useContext, useEffect } from "react";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import HomeHeader from "./HomeHeader";
import Footer from "../layout/Footer";
import { Link, useLocation } from "react-router-dom";

const HomepageContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const location = useLocation();

  // הדפסות למעקב
  console.log("🚀 HomepageContent loaded");
  console.log("🎨 Current theme:", theme);
  console.log("🌓 isDark mode?", isDark);
  console.log("📍 Current URL:", location.pathname);

  useEffect(() => {
    console.log("🧩 HomepageContent rendered or updated.");
  }, [theme]);

  // אירועים בלחיצה
  const handleEducatorClick = () => {
    console.log("👨‍🏫 Educator Portal clicked → navigating to /teacher-login");
  };

  const handleStudentClick = () => {
    console.log("🎓 Student Portal clicked → navigating to /student-login");
  };

  return (
    <>
      <div className="flex flex-col min-h-screen w-screen dark:bg-slate-900 !important dark:text-white !important bg-slate-100 text-slate-900">

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
                Empower Social Emotional Learning
              </span>
            </h1>

            <p className="text-lg max-w-2xl mx-auto opacity-90">
              Personalized SEL assessments and insights for students and educators using AI and the CASEL framework.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
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

        {/* Footer */}
        <div className="px-6 pb-6 mt-12">
          <Footer />
        </div>
      </div>
    </>
  );
};

const Homepage = () => {
  console.log("📦 Homepage wrapper component loaded");
  return <HomepageContent />;
};

export default Homepage;
