import { createContext, useContext, useState, useEffect } from "react";
import { api, getStoredUser, setStoredUser, clearStoredUser } from "../services/api";
import { useTheme } from "./ThemeContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [sessionMessage, setSessionMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { theme, toggleTheme, isDark } = useTheme();
  const darkMode = isDark;
  const toggleDarkMode = toggleTheme;

  // Handle global session expiry events triggered by api.js
  useEffect(() => {
    const handleSessionExpired = (event) => {
      clearStoredUser();
      setUser(null);
      setSessionMessage(
        event.detail?.message || "Your session has expired. Please login again."
      );
    };

    window.addEventListener("supportiq:session_expired", handleSessionExpired);
    return () => {
      window.removeEventListener("supportiq:session_expired", handleSessionExpired);
    };
  }, []);

  // Login handler
  const login = (userData) => {
    setStoredUser(userData);
    setUser(userData);
    setSessionMessage("");
  };

  // Logout handler
  const logout = async () => {
    try {
      setLoading(true);
      await api.post("/api/auth/logout", {});
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      clearStoredUser();
      setUser(null);
      setSessionMessage("");
      setLoading(false);
    }
  };

  // Profile update handler
  const updateUserProfile = (updatedData) => {
    const newUserData = {
      ...(user || {}),
      ...updatedData,
    };
    setStoredUser(newUserData);
    setUser(newUserData);
  };

  // Role check helper
  const hasRole = (role) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        updateUserProfile,
        sessionMessage,
        setSessionMessage,
        hasRole,
        loading,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
