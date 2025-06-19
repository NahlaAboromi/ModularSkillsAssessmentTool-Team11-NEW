import React, { useContext } from "react";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import HomeHeader from "./HomeHeader";
import Footer from "../layout/Footer";
import { Link } from "react-router-dom";

const HomepageContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    
    <>
      <div className={"flex flex-col min-h-screen w-screen dark:bg-slate-900 !important dark:text-white !important bg-slate-100 text-slate-900"}>

      {/* Header */}
      <div className="px-6 pt-6">
        <HomeHeader />
      </div>

    {/* Hero Section - Compact & Bright */}
<section className="relative w-screen  overflow-hidden bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-slate-900 text-white py-24 px-6">
  {/* Gradient overlay for depth */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>

  {/* Content */}
  <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6 pt-8 pb-16">
    {/* Animated Heading */}
    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
        Empower Social Emotional Learning
      </span>
    </h1>

    {/* Subtitle */}
    <p className="text-lg max-w-2xl mx-auto opacity-90">
      Personalized SEL assessments and insights for students and educators using AI and the CASEL framework.
    </p>

    {/* Buttons */}
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      <Link to="/teacher-login">
        <button className="group relative inline-flex items-center justify-center h-12 px-6 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
          Educator Portal
          <span className="absolute inset-0 rounded-full bg-white/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>
      </Link>
      <Link to="/student-login">
        <button className="group relative inline-flex items-center justify-center h-12 px-6 rounded-full bg-black/30 backdrop-blur-sm text-white border border-white/10 hover:bg-black/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
          Student Portal
          <span className="absolute inset-0 rounded-full bg-white/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>
      </Link>
    </div>
  </div>
</section>
{/* Feature Sections - Full Width Split Timeline with Larger Images */}
<section className="w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-24 space-y-24">
  <div className="max-w-3xl mx-auto text-center mb-12 px-6">
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
    <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
      Discover how our platform empowers students and educators through AI-driven SEL tools.
    </p>
  </div>

  {/* Step 1 */}
  <div className="relative flex flex-col md:flex-row items-center group">
    {/* Left Side - Text */}
    <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-white dark:bg-slate-800 shadow-lg backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border-r border-slate-200 dark:border-slate-700">
      <div className="max-w-md mx-auto md:mx-0">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">AI-Driven Insights</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Analyze student responses using the CASEL 5 framework with real-time feedback and targeted support.
        </p>
      </div>
    </div>

    {/* Center Dot */}
    <div className="z-10 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-md transition-transform duration-500 group-hover:scale-110"></div>

    {/* Right Side - Image */}
    <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex justify-center">
      <img
        src="/engage.jpg"
        alt="AI in education"
        className="rounded-xl shadow-2xl w-full object-cover h-80 md:h-[25rem] transform transition-all duration-500 hover:scale-105"
      />
    </div>
  </div>

  {/* Step 2 */}
  <div className="relative flex  md:flex-row items-center group flex-row-reverse">

    {/* Left Side - Image */}
    <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex justify-center">
      <img
        src="/analyze2.jpg"
        alt="SEL Simulations"
        className="rounded-xl shadow-2xl w-full object-cover h-80 md:h-[25rem] transform transition-all duration-500 hover:scale-105"
      />
    </div>

    {/* Center Dot */}
    <div className="z-10 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-md transition-transform duration-500 group-hover:scale-110"></div>

    {/* Right Side - Text */}
    <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-white dark:bg-slate-800 shadow-lg backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border-l border-slate-200 dark:border-slate-700 flex justify-center">
      <div className="max-w-md">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Engaging Simulations</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Provide immersive, real-world scenarios that build students’ emotional and interpersonal skills.
        </p>
      </div>
    </div>
  </div>

  {/* Step 3 */}
  <div className="relative flex flex-col md:flex-row items-center group">
    {/* Left Side - Text */}
    <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-white dark:bg-slate-800 shadow-lg backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border-r border-slate-200 dark:border-slate-700">
      <div className="max-w-md mx-auto md:mx-0">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Track Progress Over Time</h3>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor student growth with detailed dashboards, trend data, and exportable reports.
        </p>
      </div>
    </div>

    {/* Center Dot */}
    <div className="z-10 w-6 h-6 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-md transition-transform duration-500 group-hover:scale-110"></div>

    {/* Right Side - Image */}
    <div className="md:w-1/2 w-full px-6 md:px-12 py-10 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex justify-center">
      <img
        src="/graph.jpg"
        alt="Progress tracking dashboard"
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
    </>
  );
};

const Homepage = () => {
  return <HomepageContent />;
};

export default Homepage;
