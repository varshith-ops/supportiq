import { useState } from "react";
import { Sparkles, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Register({ onSwitchToLogin }) {
  const { darkMode, toggleDarkMode } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const result = await api.post("/api/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      if (!result.success) {
        setError(result.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully! Switching to sign in...");
      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        onSwitchToLogin();
      }, 1200);
    } catch (err) {
      console.error("Register Error:", err);
      setError("Unable to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-200">
      {/* Theme Toggle Floating Button */}
      <button
        onClick={toggleDarkMode}
        aria-label={`Switch to ${darkMode ? "Light" : "Dark"} mode`}
        className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-slate-950 dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-slate-800">
              <Sparkles size={32} className="text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Support<span className="text-blue-600 dark:text-blue-400">IQ</span>
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            AI Support Intelligence Platform
          </p>
        </div>

        {/* REGISTER CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create your SupportIQ agent account
            </p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Name */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                aria-label="Full Name"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@supportiq.com"
                aria-label="Email Address"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                aria-label="Password"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold">
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              aria-label="Create account"
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?
            </p>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md focus-visible:outline-none"
            >
              Sign In
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-medium">
          SupportIQ • AI-Powered Customer Support Intelligence
        </p>
      </div>
    </div>
  );
}

export default Register;