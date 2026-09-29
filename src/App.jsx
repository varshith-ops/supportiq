import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import UserDropdown from "./components/UserDropdown";
import { Menu, Sun, Moon } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Tickets from "./pages/Tickets";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

function MainContent() {
  const { user, logout, sessionMessage, darkMode, toggleDarkMode } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [showRegister, setShowRegister] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // =========================
  // SHOW LOGIN / REGISTER IF NOT LOGGED IN
  // =========================
  if (!user) {
    if (showRegister) {
      return <Register onSwitchToLogin={() => setShowRegister(false)} />;
    }

    return (
      <Login
        onSwitchToRegister={() => setShowRegister(true)}
        sessionMessage={sessionMessage}
      />
    );
  }

  // =========================
  // PAGE RENDER WITH ERROR BOUNDARY
  // =========================
  const renderPage = () => {
    let Component;
    switch (page) {
      case "dashboard":
        Component = <Dashboard setPage={setPage} />;
        break;

      case "analyze":
        Component = <Analyze />;
        break;

      case "tickets":
        Component = <Tickets />;
        break;

      case "analytics":
        Component = <Analytics />;
        break;

      case "settings":
        Component = <Settings />;
        break;

      case "404":
        Component = <NotFound setPage={setPage} />;
        break;

      default:
        Component = <Dashboard setPage={setPage} />;
    }

    return <ErrorBoundary key={page}>{Component}</ErrorBoundary>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Header Bar (< 1024px) */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-bold tracking-normal">
          Support<span className="text-blue-500">IQ</span>
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            aria-label={`Switch to ${darkMode ? "Light" : "Dark"} mode`}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-400 outline-none"
          >
            {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          </button>
          <UserDropdown setPage={setPage} />
        </div>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar
        activePage={page}
        setPage={setPage}
        onLogout={logout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area Offset by Sidebar (lg:ml-64) */}
      <div className="lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Desktop Header Top Bar with User Avatar Dropdown (>= 1024px) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SupportIQ</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{page}</span>
          </div>

          <div className="flex items-center gap-4">
            <UserDropdown setPage={setPage} />
          </div>
        </header>

        <main className="flex-1 min-w-0">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;