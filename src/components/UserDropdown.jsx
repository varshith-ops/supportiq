import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Settings, LogOut, ChevronDown } from "lucide-react";

function UserDropdown({ setPage }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AG";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-blue-500 outline-none cursor-pointer"
        aria-label="User Account Menu"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {initials}
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
          {user.name}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-1 text-xs">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-slate-400 truncate mt-0.5">{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {user.role || "Agent"}
            </span>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setPage("settings");
                setOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
            >
              <Settings size={15} />
              Profile Settings
            </button>

            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium transition cursor-pointer"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
