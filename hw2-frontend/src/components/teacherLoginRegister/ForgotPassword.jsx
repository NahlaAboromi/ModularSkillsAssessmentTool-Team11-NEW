import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ThemeContext, ThemeProvider } from "../../DarkLightMood/ThemeContext";
import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../../layout/Footer";
/**
 * ForgotPasswordContent
 * 
 * This component renders the "Forgot Password" form for both students and teachers.
 * It handles email input, validation, and sending a password reset code request to the server.
 * The component is styled according to the current theme (dark/light).
 */
const ForgotPasswordContent = () => {
  // Get current theme from context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  // Get role (student/teacher) from URL query parameters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get("role") || "student";
   // Router navigation
  const navigate = useNavigate();
  // Form state
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
   
   // Email validation using regex
  
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  /**
   * Handle form submission
   * - Validates email
   * - Sends POST request to the appropriate endpoint
   * - Navigates to code verification page if successful
   * - Displays error messages otherwise
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    // Validate email input
    if (!email.trim()) {
      setError("Email is required.");
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid email format.");
      setIsLoading(false);
      return;
    }

    try {
       // Choose endpoint based on role
      const response = await fetch(
        role === "teacher"
          ? "/api/teachers/forgot-password"
          : "/api/students/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      // Navigate to code verification page with email and role in query params
      if (response.ok) 
        {
        navigate(`/verify-code?email=${encodeURIComponent(email)}&role=${role}`);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}>
      {/* Header section */}
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      {/* Main content */}
      <main className="flex-1 w-full px-4 py-6 flex justify-center items-center">
        <div className={`max-w-md w-full space-y-8 ${isDark ? 'bg-slate-800' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
          <div className="flex flex-col items-center space-y-2">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>
            Forgot Password
          </h1>
          <p className={`text-xs text-center ${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            Enter your email address and we’ll send you a code to reset your password.
          </p>
            {/* Error and success messages */}
            {error && <Alert type="error" message={error} />}
            {message && <Alert type="success" message={message} />}
          </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormInput
                id="email"
                name="email"
                type="text"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button 
                type="submit" 
                isLoading={isLoading} 
                fullWidth 
                variant="primary"
              >
                Send Reset Code
              </Button>
            </form>

            <div className="text-sm text-center mt-4">
                {/* Link back to login */}
              <Link to={role === "teacher" ? "/login" : "/student-login"} className="text-blue-500 hover:text-blue-600">
                Back to Login
              </Link>
            </div>
          </div>
        
      </main>
      {/* Footer section */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};
/**
 * ForgotPassword
 * 
 * Wraps ForgotPasswordContent with ThemeProvider to provide theme context.
 */
const ForgotPassword = () => (
  <ThemeProvider>
    <ForgotPasswordContent />
  </ThemeProvider>
);

export default ForgotPassword;
