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

import DeviceDetailPage from "../pages/devices/DeviceDetail/DeviceDetailPage";
import DeviceForm from "../pages/devices/components/DeviceForm/DeviceForm";

import ForbiddenPage from "../pages/errors/ForbiddenPage";
import NotFoundPage from "../pages/errors/NotFoundPage";

import ComingSoonPage from "../pages/ComingSoonPage";

import { ROUTES } from "../constants/route.constants";
import ReportsPage from "../pages/reports/ReportsPage";
import FacilityTemplateFormPage from "../pages/facilities/FacilityTemplates/FacilityTemplateFormPage";

import SourceMediaPage, { SourceMediaDetailPage } from "../pages/sources/media";
import SourceTemplatesPage, {
  SourceTemplateFormPage,
  SourceTemplateDetailPage,
} from "../pages/sources/templates";

import SourcePlaceholderPage from "../pages/sources/components/SourcePlaceholderPage";
import SystemSettings from "../pages/settings/system/SystemSettings";
import PersonalSettings from "../pages/settings/personal/PersonalSettings";
import UserLogsSettings from "../pages/settings/user-log/UserLogsSettings";
import DeviceDistributorsSettings from "../pages/settings/device-distributors/DeviceDistributorsSettings";
import CategoriesSettings from "../pages/settings/categories/CategoriesSettings";
import CategoryDetailSettings from "../pages/settings/categories/CategoryDetailSettings";
import RolesSettings from "../pages/settings/roles/RolesSettings";
import RoleUpdateSettings from "../pages/settings/roles/role/RoleUpdateSettings";
import RoleDetailSettings from "../pages/settings/roles/role/RoleDetailSettings";

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
        element: <Navigate to={ROUTES.SOURCE_MEDIA} replace />,
      },
      {
        path: ROUTES.SOURCE_MEDIA,
        element: <SourceMediaPage />,
      },
      {
        path: `${ROUTES.SOURCE_MEDIA}/:id`,
        element: <SourceMediaDetailPage />,
      },
      {
        path: ROUTES.SOURCE_SHARED,
        element: <SourcePlaceholderPage title="Media được chia sẻ" />,
      },
      {
        path: ROUTES.SOURCE_PLAYLISTS,
        element: <SourcePlaceholderPage title="Danh sách phát" />,
      },
      {
        path: ROUTES.SOURCE_TEMPLATES,
        element: <SourceTemplatesPage />,
      },
      {
        path: "sources/templates/create",
        element: <SourceTemplateFormPage mode="create" />,
      },
      {
        path: "sources/templates/:id/edit",
        element: <SourceTemplateFormPage mode="edit" />,
      },
      {
        path: "sources/templates/:id",
        element: <SourceTemplateDetailPage />,
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
      //Settings
      {
        path: ROUTES.SETTINGS,
        element: <Navigate to={ROUTES.SETTINGS_SYSTEM} replace />,
      },
      {
        path: ROUTES.SETTINGS_SYSTEM,
        element: <SystemSettings />,
      },
      {
        path: ROUTES.SETTINGS_PERSONAL,
        element: <PersonalSettings />,
      },
      {
        path: ROUTES.SETTINGS_CATEGORIES,
        element: <CategoriesSettings />,
      },
      {
        path: "/settings/categories/:id",
        element: <CategoryDetailSettings />,
      },

      {
        path: ROUTES.SETTINGS_ROLES,
        element: <RolesSettings />,
      },
      {
        path: `${ROUTES.SETTINGS_ROLES}/:id/edit`,
        element: <RoleUpdateSettings />,
      },
      {
        path: `${ROUTES.SETTINGS_ROLES}/:id`,
        element: <RoleDetailSettings />,
      },
      {
        path: ROUTES.SETTINGS_DISTRIBUTORS,
        element: <DeviceDistributorsSettings />,
      },
      {
        path: ROUTES.SETTINGS_LOGS,
        element: <UserLogsSettings />,
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
