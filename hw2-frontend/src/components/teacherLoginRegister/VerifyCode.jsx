// VerifyCode.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";
import Footer from "../../layout/Footer";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import { ThemeContext, ThemeProvider } from "../../DarkLightMood/ThemeContext";
/**
 * VerifyCodeContent
 * This component renders the verification code form and handles the logic for verifying
 * the code sent to the user's email. It supports both students and teachers, and applies dark/light themes.
 */
const VerifyCodeContent = () => {
    // Get URL query parameters (email, role)
  const [searchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  // State variables for form fields and logic
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Determine user role from URL query string (default: student)
  const role = searchParams.get("role") || "student"; 

  // On mount, set email from query params (read-only)
  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [searchParams]);

  /**
   * Handles the verification form submission.
   * Sends the code and email to the correct API endpoint for verification.
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
        // Choose the correct API endpoint based on user role (teacher/student)
      const response = await fetch(
        role === "teacher"
          ? "/api/teachers/verify-code"
          : "/api/students/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await response.json();

      if (response.ok) {
            // If verification is successful, navigate to reset password page
        navigate(`/reset-password?email=${encodeURIComponent(email)}&role=${role}`);
      } else {
        setError(data.message || "Invalid code");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      
      <div className="px-4 mt-4">
            {/* Shared header for students and teachers */}
        <SharedHeader />
      </div>
     
      {/* Main content: verification code form */}
      <main className="flex-1 w-full px-4 py-6 flex justify-center items-center">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-8 rounded w-full max-w-xl`}>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>
            Verify Code
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            Enter the code sent to your email to continue.
          </p>
             {/* Card with form and alerts */}
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
              {/* Show error message if exists */}
            {error && <Alert type="error" message={error} />}
                {/* Verification form */}
            <form onSubmit={handleVerify} className="space-y-4">
                 {/* Email input (read-only, filled from query params) */}
              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={email}
                readOnly 
              />
                {/* Verification code input */}

              <FormInput
                id="code"
                name="code"
                type="text"
                label="Verification Code"
                placeholder="Enter the 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
                 {/* Submit button */}
              <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                Verify
              </Button>
            </form>
          
            {/* Link back to login page */}
            <p className="mt-4 text-sm text-center">
              Back to{" "}
              <Link to={role === "teacher" ? "/login" : "/student-login"} className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

/**
 * VerifyCode
 * This component wraps VerifyCodeContent with the ThemeProvider,
 * so the theme context is available throughout the page.
 */
const VerifyCode = () => {
  return (
    <ThemeProvider>
      <VerifyCodeContent />
    </ThemeProvider>
  );
};

export default VerifyCode;
