// utils/auth.ts

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const getUserData = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getUserData();
  return !!(token && userData);
};

export const isAdmin = () => {
  const userData = getUserData();
  return userData?.role === "admin";
};

export const isEditorOrAdmin = () => {
  const userData = getUserData();
  return userData?.role === "admin" || userData?.role === "editor";
};

export const isStudent = () => {
  const userData = getUserData();
  return userData?.role === "student";
};

export const isASYVItems = () => {
  const userData = getUserData();
  return userData?.role === "asyv-items";
};

// Legacy function for backward compatibility
export const isITAdmin = () => {
  return isASYVItems();
};

export const getUserField = () => {
  const userData = getUserData();
  return userData?.field || null;
};

export const canAccessField = (field) => {
  const userData = getUserData();
  if (!userData) return false;
  // Admins can access everything
  if (userData.role === "admin") return true;
  // ASYV Items users cannot access content fields
  if (userData.role === "asyv-items") return false;
  // Students can only access their assigned field
  if (userData.role === "student") {
    return userData.field === field;
  }
  return false;
};

export const canAccessAdminSection = (section) => {
  const userData = getUserData();
  if (!userData) return false;
  // ASYV Items can ONLY access IT Items and Settings sections
  if (userData.role === "asyv-items") {
    return section === "it-items" || section === "settings";
  }
  // Dashboard is accessible to admin and students only
  if (section === "dashboard") {
    return userData.role === "admin" || userData.role === "student";
  }
  // Settings is accessible to all authenticated users (admin, asyv-items, and students)
  if (section === "settings") {
    return (
      userData.role === "admin" ||
      userData.role === "student" ||
      userData.role === "asyv-items"
    );
  }
  // Users section is admin-only
  if (section === "users") {
    return userData.role === "admin";
  }
  // IT Items section - accessible to admin and asyv-items
  if (section === "it-items") {
    return userData.role === "admin" || userData.role === "asyv-items";
  }
  // Content sections - check field access (admin and students only)
  const contentSections = [
    "news",
    "opportunities",
    "events",
    "sports",
    "visitors",
    "did-you-know",
    "projects",
  ];
  if (contentSections.includes(section)) {
    return canAccessField(section);
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  window.location.href = "/";
};
