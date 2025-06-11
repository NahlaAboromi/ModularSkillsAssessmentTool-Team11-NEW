import React, { useContext } from "react";
import { ThemeContext, ThemeProvider } from "../DarkLightMood/ThemeContext";
import SharedHeader from "./SharedHeader";
import Footer from "../layout/Footer";
import { Link } from "react-router-dom";
import FeatureCards from "./FeatureCards";
import { UserProvider } from "../context/UserContext";

const HomepageContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen w-screen flex flex-col ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
      {/* Header */}
      <div className="px-4 pt-4">
        <SharedHeader />
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center px-4 py-10 text-center">
        <h1 className="text-4xl font-bold mb-10">Welcome to Edu Map</h1>

        {/* Feature Cards */}
        <FeatureCards />

        {/* Role Selection */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-2">Choose Your Learning Journey</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
            Select your role to access personalized SEL assessment tools and AI-powered insights
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Educator */}
            <div className="bg-white text-slate-900 dark:bg-slate-700 dark:text-white rounded-xl p-6 flex flex-col items-center shadow-lg">
              <img src="/educator-icon.png" alt="Educator" className="w-16 h-16 mb-3 rounded-full" />
              <h3 className="text-lg font-bold mb-2">For Educators</h3>
              <p className="text-sm mb-4 text-center">
                Access class management tools, analytics, AI reports, and interventions.
              </p>
              <Link to="/teacher-login">
                <button className="bg-gradient-to-r from-red-400 to-green-300 text-white px-4 py-2 rounded-full shadow">
                  Educator Login
                </button>
              </Link>
            </div>

            {/* Student */}
            <div className="bg-white text-slate-900 dark:bg-slate-700 dark:text-white rounded-xl p-6 flex flex-col items-center shadow-lg">
              <img src="/student-icon.png" alt="Student" className="w-16 h-16 mb-3 rounded-full" />
              <h3 className="text-lg font-bold mb-2">For Students</h3>
              <p className="text-sm mb-4 text-center">
                Engage in SEL simulations, get AI feedback, and develop life skills.
              </p>
              <Link to="/student-login">
                <button className="bg-gradient-to-r from-red-400 to-green-300 text-white px-4 py-2 rounded-full shadow">
                  Student Login
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* AI Credit */}
        <div className="mt-10 bg-white text-slate-900 dark:bg-slate-700 dark:text-white text-sm py-4 px-6 rounded-xl shadow-lg max-w-3xl">
          <p className="text-center">
            <span className="mr-2">🤖</span>Powered by Claude AI – advanced NLP for student response analysis.
          </p>
        </div>
      </main>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const Homepage = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <HomepageContent />
      </UserProvider>
    </ThemeProvider>
  );
};

export default Homepage;
