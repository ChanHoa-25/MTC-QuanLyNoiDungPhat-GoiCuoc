import {
  Network,
  CloudDownload,
  Radio,
  FileText,
  Settings,
  ChartLine,
  Command,
  Bell,
  Database,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { ROUTES, SYSTEM_ROUTES } from "../constants/route.constants";

export type UserType = "end-user" | "system-user";

export interface SidebarSubItem {
  key: string;
  label: string;
}

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  children?: SidebarSubItem[];
}

export type SidebarMenuEntry = SidebarMenuItem | "divider";

export const endUserMenu: SidebarMenuEntry[] = [
  {
    key: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: Command,
  },

  "divider",

  {
    key: ROUTES.FACILITIES,
    label: "Cơ sở",
    icon: Network,
  },
  {
    key: ROUTES.SOURCES,
    label: "Nguồn thông tin",
    icon: CloudDownload,
    children: [
      { key: ROUTES.SOURCE_MEDIA, label: "Nguồn media" },
      { key: ROUTES.SOURCE_SHARED, label: "Nguồn được chia sẻ" },
      { key: ROUTES.SOURCE_PLAYLISTS, label: "Danh sách phát" },
      { key: ROUTES.SOURCE_TEMPLATES, label: "Bản mẫu" },
    ],
  },
  {
    key: ROUTES.DEVICES,
    label: "Thiết bị",
    icon: Radio,
  },
  {
    key: ROUTES.BROADCASTS,
    label: "Bản tin",
    icon: FileText,
  },
  {
    key: ROUTES.REPORTS,
    label: "Báo cáo",
    icon: ChartLine,
  },

  "divider",

  {
    key: ROUTES.SETTINGS,
    label: "Cài đặt hệ thống",
    icon: Settings,
    children: [
      {
        key: ROUTES.SETTINGS_CATEGORIES,
        label: "Danh mục lĩnh vực",
      },
      {
        key: ROUTES.SETTINGS_ROLES,
        label: "Quản lý vai trò",
      },
      {
        key: ROUTES.SETTINGS_DISTRIBUTORS,
        label: "Danh mục nhà phân phối thiết bị",
      },
      {
        key: ROUTES.SETTINGS_LOGS,
        label: "Nhật ký người dùng",
      },
      {
        key: ROUTES.SETTINGS_NEWS_MODE,
        label: "Chế độ tạo bản tin",
      },
      {
        key: ROUTES.SETTINGS_SYSTEM,
        label: "Thiết lập hệ thống",
      },
      {
        key: ROUTES.SETTINGS_PERSONAL,
        label: "Cấu hình cá nhân",
      },
    ],
  },
];

export const systemUserMenu: SidebarMenuEntry[] = [
  {
    key: SYSTEM_ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: Command,
  },

  "divider",

  {
    key: SYSTEM_ROUTES.ORGANIZATIONS,
    label: "Tổ chức",
    icon: Network,
  },
  {
    key: SYSTEM_ROUTES.NOTIFICATIONS,
    label: "Thông báo",
    icon: Bell,
  },
  {
    key: SYSTEM_ROUTES.PACKAGES,
    label: "Gói cước",
    icon: Database,
  },
  {
    key: SYSTEM_ROUTES.REPORTS,
    label: "Báo cáo",
    icon: ChartLine,
  },

  "divider",

  {
    key: SYSTEM_ROUTES.SETTINGS,
    label: "Cài đặt hệ thống",
    icon: Settings,
    children: [
      {
        key: SYSTEM_ROUTES.SETTINGS_CATEGORIES,
        label: "Danh mục lĩnh vực",
      },
      {
        key: SYSTEM_ROUTES.SETTINGS_ROLES,
        label: "Quản lý vai trò",
      },
      {
        key: SYSTEM_ROUTES.SETTINGS_DISTRIBUTORS,
        label: "Danh mục nhà phân phối thiết bị",
      },
      {
        key: SYSTEM_ROUTES.SETTINGS_LOGS,
        label: "Nhật ký người dùng",
      },
      {
        key: SYSTEM_ROUTES.SETTINGS_NEWS_MODE,
        label: "Chế độ tạo bản tin",
      },
    ],
  },
];
