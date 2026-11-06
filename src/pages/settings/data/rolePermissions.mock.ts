import type { RolePermissionGroup } from "../types/rolePermissions.types";

export const mockRolePermissionGroups: RolePermissionGroup[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    permissions: [
      { id: "dashboard.view", name: "Xem Dashboard" },
      { id: "dashboard.export", name: "Xuất báo cáo" },
    ],
  },
  {
    id: "sites",
    name: "Quản lý cơ sở",
    permissions: [
      { id: "sites.view", name: "Xem cơ sở" },
      { id: "sites.create", name: "Thêm cơ sở" },
      { id: "sites.update", name: "Cập nhật cơ sở" },
      { id: "sites.delete", name: "Xóa cơ sở" },
    ],
  },
  {
    id: "devices",
    name: "Quản lý thiết bị",
    permissions: [
      { id: "devices.view", name: "Xem thiết bị" },
      { id: "devices.create", name: "Thêm thiết bị" },
      { id: "devices.update", name: "Cập nhật thiết bị" },
      { id: "devices.delete", name: "Xóa thiết bị" },
    ],
  },
  {
    id: "media",
    name: "Quản lý media",
    permissions: [
      { id: "media.view", name: "Xem media" },
      { id: "media.create", name: "Thêm media" },
      { id: "media.update", name: "Cập nhật media" },
      { id: "media.delete", name: "Xóa media" },
    ],
  },
  {
    id: "news",
    name: "Quản lý bản tin",
    permissions: [
      { id: "news.view", name: "Xem bản tin" },
      { id: "news.create", name: "Thêm bản tin" },
      { id: "news.update", name: "Cập nhật bản tin" },
      { id: "news.delete", name: "Xóa bản tin" },
    ],
  },
  {
    id: "reports",
    name: "Báo cáo",
    permissions: [
      { id: "reports.view", name: "Xem báo cáo" },
      { id: "reports.export", name: "Xuất báo cáo" },
    ],
  },
  {
    id: "settings",
    name: "Cài đặt hệ thống",
    permissions: [
      { id: "settings.view", name: "Xem cài đặt" },
      { id: "settings.update", name: "Cập nhật cài đặt" },
    ],
  },
];
