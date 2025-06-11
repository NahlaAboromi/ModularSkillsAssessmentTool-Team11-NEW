// ResetPassword.jsx
import React, { useState, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";
import Footer from "../../layout/Footer";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import { ThemeContext, ThemeProvider } from "../../DarkLightMood/ThemeContext";
/**
 * ResetPasswordContent
 * This component renders the password reset form and handles all related logic.
 * It supports both students and teachers, and applies dark/light themes.
 */
const ResetPasswordContent = () => {
   // Get the current theme (dark or light) from context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
   // React Router hooks for navigation and reading URL query parameters
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
   // Extract email and role (student/teacher) from the URL query string
  const email = query.get("email");
  const role = query.get("role");
  // State variables for form fields, messages, and loading state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the password reset form submission.
   * Validates the input and sends a POST request to the relevant API endpoint.
   */
  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
 // Validate that both passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
   // Choose the correct API endpoint based on user role
    try {
      const response = await fetch(
        role === "teacher"
          ? "/api/teachers/reset-password"
          : "/api/students/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
          // Success: show message and redirect to login after a short delay
        setMessage("Password reset successfully! You can now login.");
        const loginPage = role === "teacher" ? "/login" : "/student-login";
        setTimeout(() => navigate(loginPage), 2500);
      } else {
            // Show error from server if available
        setError(data.message || "Reset failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
     
      {/* Main content: reset password form */}
      <main className="flex-1 w-full px-4 py-6 flex justify-center items-center">
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-8 rounded w-full max-w-xl`}>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>
            Reset Your Password
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
            Set a new password for your account.
          </p>
            {/* Card with form and alerts */}
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'}`}>
                {/* Show error or success messages */}
            {error && <Alert type="error" message={error} />}
            {message && <Alert type="success" message={message} />}
           
            {/* Reset password form */}
            <form onSubmit={handleReset} className="space-y-4">
               {/* New password input */}
              <FormInput
                id="newPassword"
                name="newPassword"
                type="password"
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
             {/* Confirm password input */}
              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                Reset Password
              </Button>
            </form>
             {/*Link back to login page  */} 
            <p className="mt-4 text-sm text-center">
              Back to{" "}
              {role === "teacher" ? (
                <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
              ) : (
                <Link to="/student-login" className="text-blue-500 hover:underline">Login</Link>
              )}
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
 * ResetPassword
 * This component wraps ResetPasswordContent with the ThemeProvider,
 * so the theme context is available throughout the page.
 */
const ResetPassword = () => {
  return (
    <ThemeProvider>
      <ResetPasswordContent />
    </ThemeProvider>
  );
};

export default ResetPassword;
