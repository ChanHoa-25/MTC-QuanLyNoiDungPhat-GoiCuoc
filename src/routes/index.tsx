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
import FacilitiesPage from "../pages/facilities";

// Error Pages
import ForbiddenPage from "../pages/errors/ForbiddenPage";
import NotFoundPage from "../pages/errors/NotFoundPage";

// Common
import ComingSoonPage from "../pages/ComingSoonPage";

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
      // Trang chủ
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
        path: ROUTES.FACILITIES,
        element: <FacilitiesPage />,
      },

      // Nguồn thông tin
      {
        path: ROUTES.SOURCES,
        element: <ComingSoonPage title="Nguồn thông tin" />,
      },
      {
        path: ROUTES.SOURCE_MEDIA,
        element: <ComingSoonPage title="Nguồn media" />,
      },
      {
        path: ROUTES.SOURCE_SHARED,
        element: <ComingSoonPage title="Nguồn được chia sẻ" />,
      },
      {
        path: ROUTES.SOURCE_PLAYLISTS,
        element: <ComingSoonPage title="Danh sách phát" />,
      },
      {
        path: ROUTES.SOURCE_TEMPLATES,
        element: <ComingSoonPage title="Bản mẫu" />,
      },

      // Thiết bị
      {
        path: ROUTES.DEVICES,
        element: <ComingSoonPage title="Quản lý thiết bị" />,
      },

      // Bản tin
      {
        path: ROUTES.BROADCASTS,
        element: <ComingSoonPage title="Quản lý bản tin" />,
      },

      // Báo cáo
      {
        path: ROUTES.REPORTS,
        element: <ComingSoonPage title="Báo cáo" />,
      },

      // Cài đặt hệ thống
      {
        path: ROUTES.SETTINGS,
        element: <ComingSoonPage title="Cài đặt hệ thống" />,
      },
      {
        path: ROUTES.SETTINGS_CATEGORIES,
        element: <ComingSoonPage title="Danh mục lĩnh vực" />,
      },
      {
        path: ROUTES.SETTINGS_ROLES,
        element: <ComingSoonPage title="Quản lý vai trò" />,
      },
      {
        path: ROUTES.SETTINGS_DISTRIBUTORS,
        element: <ComingSoonPage title="Danh mục nhà phân phối thiết bị" />,
      },
      {
        path: ROUTES.SETTINGS_LOGS,
        element: <ComingSoonPage title="Nhật ký người dùng" />,
      },
      {
        path: ROUTES.SETTINGS_NEWS_MODE,
        element: <ComingSoonPage title="Chế độ tạo bản tin" />,
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
