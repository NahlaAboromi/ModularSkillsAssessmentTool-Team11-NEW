import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "../../DarkLightMood/ThemeContext";
import { UserContext } from "../../context/UserContext";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../../layout/Footer";
import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";

/**
 * Teacher Login Page
 * 
 *login form for teachers, authenticates credentials,
 * and navigates to the teacher dashboard upon successful login.
 * Supports dark/light theme and displays error messages.
 */

const LoginContent = () => {
  // Get login method from UserContext
  const { login } = useContext(UserContext);
   // Get current theme from ThemeContext
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  // React Router navigation
  const navigate = useNavigate();
    // Form state: teacher ID and password
  const [form, setForm] = useState({ id: "", password: "" });
  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

   // Handle input changes for both ID and password fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

   // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
      // Validate required fields
    if (!form.id || !form.password) {
      setError("Please fill in both ID and Password.");
      setIsLoading(false);
      return;
    }
     // Send login request to backend
    try {
      const response = await fetch('/api/teachers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
         // On success, update user context and navigate to teacher dashboard
        const data = await response.json();
        login(data.teacher);
        navigate("/teacher/Teacher");
      } else {
          // On failure, show error message from backend
        const errorData = await response.json();
        setError(errorData.message || "Login failed");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Login error. Please try again later.");
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
  
       {/* Main login form content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">   
         <div className={`max-w-md w-full space-y-8 ${isDark ? 'bg-slate-800' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
                {/* Logo and instructions */}
              <div className="flex flex-col items-center space-y-2">
                  <img src="/educator-icon.png" alt="Educator" className="w-16 h-16" />
                <h2 className="text-3xl font-extrabold text-center">Teacher Login</h2>
                <p className="text-xs text-center">
                  Sign in to manage your classes and view student performance.
                </p>
              </div>
                 {/* Error alert */}
            {error && <Alert type="error" message={error} />}
            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
              <FormInput
                id="id"
                name="id"
                label="ID"
                placeholder="Enter your ID"
                value={form.id}
                onChange={handleChange}
              />
              <FormInput
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              </div>
                 {/* Forgot password link */}
              <div className="text-sm mb-2">
                <Link to="/forgot-password?role=teacher" className="text-blue-500 hover:underline">
                  Forgot your password?
                </Link>
              </div>
               {/* Submit button */}
              <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                Sign in
              </Button>
            </form>
                {/* Registration link */}
            <p className="mt-4 text-sm text-center">
              Don't have an account?{" "}
              <Link to="/register?role=teacher" className="text-blue-500 hover:underline">
                Register now
              </Link>
            </p>
          
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
 * Login
 * 
 * Wraps the login content with the ThemeProvider to provide theme context.
 */
const Login = () => {
  return (
    <ThemeProvider>
      <LoginContent />
    </ThemeProvider>
  );
};

export default Login;
