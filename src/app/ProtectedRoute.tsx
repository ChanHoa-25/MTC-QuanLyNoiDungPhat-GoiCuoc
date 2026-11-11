import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authStorage } from "../utils/authStorage";

function ProtectedRoute() {
  const location = useLocation();

  if (!authStorage.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
