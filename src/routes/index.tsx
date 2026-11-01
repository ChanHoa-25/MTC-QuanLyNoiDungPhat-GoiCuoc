import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";

// Dashboard
import DashboardPage from "../pages/dashboard/DashboardPage";

// Auth
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// Profile
import ProfilePage from "../pages/profile/ProfilePage";
import EditProfile from "../pages/profile/EditProfile";
import RenewalHistoryPage from "../pages/profile/RenewalHistoryPage";

// Sites
import SitesPage from "../pages/sites";

// Error Pages
import ForbiddenPage from "../pages/errors/ForbiddenPage";
import NotFoundPage from "../pages/errors/NotFoundPage";

// Constants
import { ROUTES } from "../constants/route.constants";

export const routes: RouteObject[] = [
  // Auth
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: <ResetPasswordPage />,
      },
    ],
  },

  // Profile
  {
    path: ROUTES.PROFILE,
    children: [
      {
        index: true,
        element: <ProfilePage />,
      },
      {
        path: "edit",
        element: <EditProfile />,
      },
      {
        path: "renewal-history",
        element: <RenewalHistoryPage />,
      },
    ],
  },

  // Main Layout
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Redirect trang chủ về Dashboard
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },

      // Dashboard
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },

      // Quản lý cơ sở
      {
        path: ROUTES.SITES,
        element: <SitesPage />,
      },
    ],
  },

  // Error Pages
  {
    path: ROUTES.FORBIDDEN,
    element: <ForbiddenPage />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
