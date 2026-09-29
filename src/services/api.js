const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

export const getStoredUser = () => {
  try {
    const data = localStorage.getItem("supportiq_user");
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

export const setStoredUser = (userData) => {
  if (userData) {
    localStorage.setItem("supportiq_user", JSON.stringify(userData));
  } else {
    localStorage.removeItem("supportiq_user");
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem("supportiq_user");
};

// Dispatch custom event for session expiry
export const notifySessionExpired = (message = "Your session has expired. Please login again.") => {
  clearStoredUser();
  window.dispatchEvent(
    new CustomEvent("supportiq:session_expired", {
      detail: { message },
    })
  );
};

// Core fetch wrapper
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const storedUser = getStoredUser();
  if (storedUser?.token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${storedUser.token}`;
  }

  const fetchConfig = {
    ...options,
    headers,
    credentials: "include", // Required for HTTP-Only cookies
  };

  try {
    let response = await fetch(url, fetchConfig);

    // Handle 401 Unauthorized (Access token expired)
    if (response.status === 401) {
      let data = {};
      try {
        data = await response.clone().json();
      } catch (e) {}

      // If token expired, attempt automatic refresh
      const isExpiredToken =
        data.code === "TOKEN_EXPIRED" ||
        (data.message && data.message.toLowerCase().includes("expired"));

      // Do not attempt refresh if calling refresh or login endpoints
      const isAuthEndpoint =
        endpoint.includes("/api/auth/refresh") ||
        endpoint.includes("/api/auth/login") ||
        endpoint.includes("/api/auth/register");

      if (isExpiredToken && !isAuthEndpoint) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });

            const refreshData = await refreshResponse.json();

            if (refreshResponse.ok && refreshData.success) {
              const updatedUser = {
                ...(storedUser || {}),
                ...refreshData.data,
              };
              setStoredUser(updatedUser);

              isRefreshing = false;
              onRefreshed(refreshData.data.token);
            } else {
              isRefreshing = false;
              notifySessionExpired("Your session has expired. Please login again.");
              return {
                success: false,
                status: 401,
                message: "Your session has expired. Please login again.",
              };
            }
          } catch (refreshErr) {
            isRefreshing = false;
            notifySessionExpired("Your session has expired. Please login again.");
            return {
              success: false,
              status: 401,
              message: "Your session has expired. Please login again.",
            };
          }
        }

        // Queue requests while token is being refreshed
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            fetchConfig.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(fetch(url, fetchConfig).then((res) => res.json()));
          });
        });
      } else if (response.status === 401 && !isAuthEndpoint) {
        notifySessionExpired(data.message || "Your session has expired. Please login again.");
        return {
          success: false,
          status: 401,
          message: data.message || "Your session has expired. Please login again.",
        };
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data.message || `Request failed with status ${response.status}`,
        data: data.data || null,
      };
    }

    return data;
  } catch (error) {
    console.error("API Network Error:", error);
    return {
      success: false,
      status: 0,
      message: "Unable to connect to server. Please check your network connection.",
    };
  }
};

export const api = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),
  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),
  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { method: "DELETE", ...options }),
};

export default api;
