import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";

import DashboardPage from "../pages/dashboard/DashboardPage";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

import ProfilePage from "../pages/profile/ProfilePage";
import EditProfile from "../pages/profile/EditProfile";
import RenewalHistoryPage from "../pages/profile/RenewalHistoryPage";

import FacilitiesPage from "../pages/facilities";
import FacilityPlaylistDetail from "../pages/facilities/FacilityPlaylists/FacilityPlaylistDetail";
import DevicesPage from "../pages/devices";

import DeviceDetailPage from "../pages/devices/DeviceDetailPage";
import DeviceForm from "../pages/devices/components/DeviceForm/DeviceForm";

import ForbiddenPage from "../pages/errors/ForbiddenPage";
import NotFoundPage from "../pages/errors/NotFoundPage";

import ComingSoonPage from "../pages/ComingSoonPage";

import { ROUTES } from "../constants/route.constants";
import ReportsPage from "../pages/reports/ReportsPage";
import FacilityTemplateFormPage from "../pages/facilities/FacilityTemplates/FacilityTemplateFormPage";

export const routes: RouteObject[] = [
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

  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },

      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },

      {
        path: ROUTES.FACILITIES,
        element: <FacilitiesPage />,
      },

      // Chi tiết danh sách phát
      {
        path: "facilities/:facilityId/playlists/:playlistId",
        element: <FacilityPlaylistDetail />,
      },

      // Thêm mới bản mẫu
      {
        path: "facilities/:facilityId/templates/create",
        element: <FacilityTemplateFormPage mode="create" />,
      },

      // Chỉnh sửa bản mẫu
      {
        path: "facilities/:facilityId/templates/:templateId/edit",
        element: <FacilityTemplateFormPage mode="edit" />,
      },

      // Chi tiết bản mẫu
      {
        path: "facilities/:facilityId/templates/:templateId",
        element: <FacilityTemplateFormPage mode="view" />,
      },

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

      {
        path: ROUTES.DEVICES,
        element: <DevicesPage />,
      },
      {
        path: "devices/create",
        element: <DeviceForm mode="create" />,
      },
      {
        path: "devices/:id",
        element: <DeviceDetailPage />,
      },
      {
        path: "devices/:id/edit",
        element: <DeviceForm mode="edit" />,
      },

      {
        path: ROUTES.BROADCASTS,
        element: <ComingSoonPage title="Quản lý bản tin" />,
      },

      {
        path: ROUTES.REPORTS,
        element: <ReportsPage />,
      },

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
