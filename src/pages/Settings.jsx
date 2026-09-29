import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Toast from "../components/Toast";
import {
  User,
  Mail,
  Shield,
  Bell,
  Sparkles,
  Save,
  Moon,
  Sun,
} from "lucide-react";

function Settings() {
  const { user, updateUserProfile, darkMode, toggleDarkMode } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      setToast({ message: "Name and email are required", type: "error" });
      return;
    }

    try {
      setSavingProfile(true);

      const result = await api.put("/api/auth/profile", {
        name: name,
        email: email,
      });

      if (!result.success) {
        if (result.status !== 401) {
          setError(result.message || "Failed to update profile");
          setToast({ message: result.message || "Failed to update profile", type: "error" });
        }
        return;
      }

      updateUserProfile(result.data);
      setName(result.data.name);
      setEmail(result.data.email);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      console.error("Update Profile Error:", err);
      setError("Unable to connect to server");
      setToast({ message: "Unable to connect to server", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your SupportIQ account and preferences.
        </p>
      </div>

      {/* PROFILE INFO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-950/60 p-3 rounded-xl shrink-0">
            <User size={22} className="text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">Profile Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update your SupportIQ account information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                aria-label="Full Name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email Address"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              Role
            </label>
            <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-950">
              <Shield size={18} className="text-slate-400 shrink-0" />
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {user?.role || "Agent"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Role can only be changed by an administrator.</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            aria-label="Save profile details"
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <Save size={18} />
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* THEME PREFERENCES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 dark:bg-purple-950/60 p-3 rounded-xl shrink-0">
            {darkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-purple-600" />}
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">Appearance Theme</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle dark mode interface styling</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="font-semibold text-sm">Dark Theme Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Switch between Light and Dark interface appearance.</p>
          </div>

          <button
            onClick={toggleDarkMode}
            aria-label={`Toggle dark mode (Currently ${darkMode ? "Dark" : "Light"})`}
            className={`w-11 h-6 rounded-full inline-flex items-center px-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              darkMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                darkMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* NOTIFICATION SETTINGS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-100 dark:bg-amber-950/60 p-3 rounded-xl shrink-0">
            <Bell size={22} className="text-amber-600 dark:text-amber-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">Notification Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Control how SupportIQ notifies you</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="font-semibold text-sm">Email Notifications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive notifications about critical ticket updates.</p>
          </div>

          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            aria-label="Toggle email notifications"
            className={`w-11 h-6 rounded-full inline-flex items-center px-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              emailNotifications ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                emailNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* AI PREFERENCES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 dark:bg-purple-950/60 p-3 rounded-xl shrink-0">
            <Sparkles size={22} className="text-purple-600 dark:text-purple-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">AI Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage AI-powered SupportIQ features</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="font-semibold text-sm">AI Suggested Responses</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allow SupportIQ to auto-suggest customer responses.</p>
          </div>

          <button
            onClick={() => setAiSuggestions(!aiSuggestions)}
            aria-label="Toggle AI suggested responses"
            className={`w-11 h-6 rounded-full inline-flex items-center px-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              aiSuggestions ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                aiSuggestions ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;