// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, isAdmin, canAccessAdminSection } from "@/utils/auth";
import AccessDenied from "./AccessDenied";

export const ProtectedRoute = ({ children, requireAdmin = false, section }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    // User is authenticated but doesn't have admin privileges
    return <Navigate to="/" replace />;
  }

  // Check field-based access for specific sections
  if (section && !canAccessAdminSection(section)) {
    // User doesn't have access to this section - show access denied
    return <AccessDenied />;
  }

  return <>{children}</>;
};

//Specific component for admin routes (legacy - still works for admin-only)
export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requireAdmin={true}>{children}</ProtectedRoute>;
};

// New component for field-based routes
export const FieldBasedRoute = ({ children, section }) => {
  return <ProtectedRoute section={section}>{children}</ProtectedRoute>;
};

// Component for admin panel access (allows both admin and students)
export const AdminPanelRoute = ({ children }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};
