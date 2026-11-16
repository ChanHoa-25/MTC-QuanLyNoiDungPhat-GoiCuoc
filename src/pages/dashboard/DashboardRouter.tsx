import { useSearchParams } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import DashboardAdminPage from "../dashboardAdmin";

export default function DashboardRouter() {
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get("role");
  const storedRole =
    typeof window !== "undefined" ? localStorage.getItem("mtc_role") : null;
  const isAdmin = queryRole === "admin" || storedRole === "admin";

  return isAdmin ? <DashboardAdminPage /> : <DashboardPage />;
}
