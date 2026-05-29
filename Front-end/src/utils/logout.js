// utils/logout.ts

// API base URL - adjust according to your backend configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const performLogout = async ({
  navigate,
  redirectTo = "/login",
  showConfirmation = false,
  onLogoutStart,
  onLogoutComplete,
  onLogoutError,
  callBackendLogout = false,
}) => {
  try {
    // Show confirmation dialog if requested (disabled by default now)
    if (showConfirmation) {
      const confirmed = window.confirm("Are you sure you want to logout?");
      if (!confirmed) return;
    }

    // Call onLogoutStart callback (for setting loading state)
    onLogoutStart?.();

    // Call backend logout endpoint if requested
    if (callBackendLogout) {
      await logoutFromBackend();
    }

    // Add a reasonable delay for better UX and to show loading state
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Clear authentication data
    clearAuthData();

    // Navigate to login or specified route
    navigate(redirectTo, { replace: true });
  } catch (error) {
    const logoutError =
      error instanceof Error ? error : new Error("Logout failed");
    console.error("Logout error:", logoutError);
    // Still clear auth data even if backend call fails
    clearAuthData();
    navigate(redirectTo, { replace: true });
    // Call error callback
    onLogoutError?.(logoutError);
  } finally {
    // Always call onLogoutComplete callback to stop loading
    onLogoutComplete?.();
  }
};

/**
 * Simple logout function without loading states
 */
export const simpleLogout = (navigate, redirectTo = "/login") => {
  clearAuthData();
  navigate(redirectTo, { replace: true });
};

/**
 * Call backend logout endpoint
 */
export const logoutFromBackend = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Logout failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Logout failed");
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  // Add any other auth-related data you might be storing
  // localStorage.removeItem('refreshToken');
  // localStorage.removeItem('userPreferences');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");
  return !!(token && userData);
};

/**
 * Get current user data
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Check if current user has admin or editor role
 */
export const hasAdminAccess = () => {
  const user = getCurrentUser();
  return user && (user.role === "admin" || user.role === "editor");
};

/**
 * Auto-logout if token is expired or invalid
 */
export const checkAuthAndLogout = (navigate) => {
  if (!isAuthenticated() || !hasAdminAccess()) {
    simpleLogout(navigate);
  }
};

/**
 * Hook-like logout function for React components
 */
export const createLogoutHandler = (navigate, setLoading, options = {}) => {
  return async () => {
    await performLogout({
      navigate,
      onLogoutStart: () => setLoading(true),
      onLogoutComplete: () => setLoading(false),
      onLogoutError: (error) => {
        setLoading(false);
        console.error("Logout failed:", error);
      },
      ...options,
    });
  };
};

// Default export for convenience
export default {
  performLogout,
  simpleLogout,
  logoutFromBackend,
  clearAuthData,
  isAuthenticated,
  getCurrentUser,
  hasAdminAccess,
  checkAuthAndLogout,
  createLogoutHandler,
};
