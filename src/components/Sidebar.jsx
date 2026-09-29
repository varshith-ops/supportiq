import {
  LayoutDashboard,
  Sparkles,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Sidebar({ activePage, setPage, onLogout, isMobileOpen, setIsMobileOpen }) {
  const { darkMode, toggleDarkMode } = useAuth();

  const handleNavClick = (page) => {
    setPage(page);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analyze", label: "Analyze Query", icon: Sparkles },
    { id: "tickets", label: "Tickets", icon: Ticket },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop (< 1024px) */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Fixed Sidebar Viewport Container */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-[100dvh] h-dvh bg-slate-950 dark:bg-slate-900 text-slate-100 border-r border-slate-800/80 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Main Navigation"
      >
        {/* Top: Logo & Mobile Close (shrink-0) */}
        <div className="shrink-0 p-5 flex items-center justify-between border-b border-slate-800/60">
          <div>
            <h1 className="text-xl font-bold tracking-normal text-white">
              Support<span className="text-blue-500">IQ</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              AI Support Intelligence
            </p>
          </div>

          {setIsMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Middle: Navigation Links (flex-1 overflow-y-auto) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5" role="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                aria-label={`Navigate to ${item.label}`}
                className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-left text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Theme Toggle & Logout (shrink-0 pinned) */}
        <div className="shrink-0 p-4 border-t border-slate-800/80 space-y-2">
          {/* Theme Toggle Button showing action */}
          <button
            onClick={toggleDarkMode}
            aria-label={`Switch to ${darkMode ? "Light" : "Dark"} mode`}
            className="flex items-center justify-between w-full p-2.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            <div className="flex items-center gap-2.5">
              {darkMode ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-slate-400" />
              )}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </div>

            {/* Small Toggle Switch */}
            <div
              className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                darkMode ? "bg-blue-600 justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            aria-label="Log out of account"
            className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-left text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;