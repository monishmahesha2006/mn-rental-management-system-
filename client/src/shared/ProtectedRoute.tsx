import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "OWNER" | "TENANT";
}
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === "OWNER") {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/tenant/home" replace />;
    }
  }
  return <>{children}</>;
}