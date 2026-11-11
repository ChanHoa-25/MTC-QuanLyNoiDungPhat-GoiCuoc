import type { Facility } from "../pages/facilities/types/facility.types";
import type { FacilityUser } from "../pages/facilities/types/facilityUser.types";
import type { FacilityDevice } from "../pages/facilities/types/facilityDevice.types";
import type { FacilityMediaItem } from "../pages/facilities/types/facilityMedia.types";
import type { FacilityTemplate } from "../pages/facilities/types/facilityTemplate.types";
import type { FacilityPlaylist } from "../pages/facilities/types/facilityPlaylist.types";
import type { Device } from "../pages/devices/types/device.types";
import type { DeviceScheduleItem } from "../pages/devices/types/deviceSchedule.types";
import type { DeviceActivityHistoryItem } from "../pages/devices/types/deviceActivityHistory.types";
import type { DeviceBroadcastHistoryItem } from "../pages/devices/types/deviceBroadcastHistory.types";
import type { FacilityReportItem } from "../pages/reports/types/report.types";
import type { SourceReportItem } from "../pages/reports/types/sourceReport.types";
import type { DeviceReportItem } from "../pages/reports/types/deviceReport.types";
import type { BroadcastReportItem } from "../pages/reports/types/broadcastReport.types";
import type {
  FacilityCircleStatistic,
  FacilityProviderStatistic,
} from "../pages/reports/types/report.types";
import type {
  SourceBroadcastStatistic,
  SourceCircleStatistic,
} from "../pages/reports/types/sourceReport.types";
import type {
  DeviceBroadcastStatistic,
  DeviceCircleStatistic,
} from "../pages/reports/types/deviceReport.types";
import type {
  BroadcastCircleStatistic,
  BroadcastStatistic,
} from "../pages/reports/types/broadcastReport.types";
import { facilitiesMock as facilitiesTree } from "../pages/facilities/data/facilities.mock";
import { devicesMock as deviceSeeds } from "../pages/devices/data/devices.mock";
import mediaThumbnail from "../app/assets/images/media.png";
import avatarImage from "../app/assets/images/avatar.png";
import { MOCK_ORGANIZATION_ID } from "./organizations.mock";

const createdAt = "2026-11-01T08:00:00.000Z";
const updatedAt = "2026-11-05T05:00:00.000Z";
const organizationId = MOCK_ORGANIZATION_ID;

export interface MockOrganization {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive";
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export const mockOrganization: MockOrganization = {
  id: organizationId,
  code: "MTC",
  name: "Tổ chức quản lý MTC",
  status: "active",
  timezone: "Asia/Ho_Chi_Minh",
  createdAt,
  updatedAt,
};

function flattenFacilities(items: Facility[]): Facility[] {
  return items.flatMap((facility) => [
    facility,
    ...flattenFacilities(facility.children ?? []),
  ]);
}

function assignOrganization(
  items: Facility[],
  targetOrganizationId: string,
): Facility[] {
  return items.map((facility) => ({
    ...facility,
    organizationId: targetOrganizationId,
    children: facility.children
      ? assignOrganization(facility.children, targetOrganizationId)
      : undefined,
  }));
}

export const mockFacilitiesTree: Facility[] = assignOrganization(
  facilitiesTree,
  organizationId,
);
export const mockFacilities: Facility[] = flattenFacilities(mockFacilitiesTree);

export interface MockPermission {
  id: string;
  code: string;
  name: string;
  module: string;
}

export interface MockRole {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string;
  permissionIds: string[];
}

export const mockPermissions: MockPermission[] = [
  { id: "perm-facility-read", code: "facility.read", name: "Xem cơ sở", module: "facilities" },
  { id: "perm-facility-write", code: "facility.write", name: "Quản lý cơ sở", module: "facilities" },
  { id: "perm-device-read", code: "device.read", name: "Xem thiết bị", module: "devices" },
  { id: "perm-device-write", code: "device.write", name: "Quản lý thiết bị", module: "devices" },
  { id: "perm-content-read", code: "content.read", name: "Xem nội dung", module: "content" },
  { id: "perm-content-write", code: "content.write", name: "Quản lý nội dung", module: "content" },
  { id: "perm-content-approve", code: "content.approve", name: "Duyệt nội dung", module: "content" },
  { id: "perm-broadcast-control", code: "broadcast.control", name: "Quản lý phát sóng", module: "broadcasts" },
  { id: "perm-report-read", code: "report.read", name: "Xem báo cáo", module: "reports" },
  { id: "perm-system-manage", code: "system.manage", name: "Quản lý hệ thống", module: "settings" },
];

export const mockRoles: MockRole[] = [
  {
    id: "role-organization-admin",
    organizationId,
    code: "organization_admin",
    name: "Quản trị viên tổ chức",
    description: "Quản lý toàn bộ dữ liệu trong tổ chức.",
    permissionIds: mockPermissions.map((permission) => permission.id),
  },
  {
    id: "role-facility-admin",
    organizationId,
    code: "facility_admin",
    name: "Quản trị viên cơ sở",
    description: "Quản lý người dùng, thiết bị và nội dung của cơ sở.",
    permissionIds: [
      "perm-facility-read",
      "perm-device-read",
      "perm-device-write",
      "perm-content-read",
      "perm-content-write",
      "perm-content-approve",
      "perm-broadcast-control",
      "perm-report-read",
    ],
  },
  {
    id: "role-content-editor",
    organizationId,
    code: "content_editor",
    name: "Biên tập nội dung",
    description: "Tạo và cập nhật nội dung, không quản lý tài khoản.",
    permissionIds: ["perm-facility-read", "perm-content-read", "perm-content-write"],
  },
];

export interface MockUser {
  id: string;
  organizationId: string;
  facilityId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  identityNumber: string;
  roleId: string;
  roleName: string;
  status: "active" | "inactive";
  avatar: string;
  timezone: string;
  birthday: string;
  createdAt: string;
  updatedAt: string;
}

export const mockUsers: MockUser[] = [
  {
    id: "user-001",
    organizationId,
    facilityId: "hcm",
    username: "admin.mtc",
    fullName: "Nguyễn Minh Chinh",
    email: "admin@mtc.example",
    phone: "+84 900 000 001",
    identityNumber: "079000000001",
    roleId: "role-organization-admin",
    roleName: "Quản trị viên tổ chức",
    status: "active",
    avatar: avatarImage,
    timezone: "Asia/Ho_Chi_Minh",
    birthday: "1998-02-02",
    createdAt,
    updatedAt,
  },
  {
    id: "user-002",
    organizationId,
    facilityId: "hcm",
    username: "admin.hcm",
    fullName: "Trần Thu Hà",
    email: "ha.tran@mtc.example",
    phone: "+84 900 000 002",
    identityNumber: "079000000002",
    roleId: "role-facility-admin",
    roleName: "Quản trị viên cơ sở",
    status: "active",
    avatar: avatarImage,
    timezone: "Asia/Ho_Chi_Minh",
    birthday: "1992-05-14",
    createdAt,
    updatedAt,
  },
  {
    id: "user-003",
    organizationId,
    facilityId: "hcm",
    username: "editor.hcm",
    fullName: "Lê Quốc Bảo",
    email: "bao.le@mtc.example",
    phone: "+84 900 000 003",
    identityNumber: "079000000003",
    roleId: "role-content-editor",
    roleName: "Biên tập nội dung",
    status: "inactive",
    avatar: avatarImage,
    timezone: "Asia/Ho_Chi_Minh",
    birthday: "1995-09-20",
    createdAt,
    updatedAt,
  },
];

export const mockFacilityUsers: FacilityUser[] = mockUsers.map((user) => ({
  id: user.id,
  facilityId: user.facilityId,
  username: user.username,
  fullName: user.fullName,
  identityNumber: user.identityNumber,
  phone: user.phone,
  email: user.email,
  role: user.roleName,
  status: user.status,
  avatar: user.avatar,
  updatedAt: user.updatedAt,
}));

export interface MockCategory {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

export const mockCategories: MockCategory[] = [
  { id: "category-news", organizationId, code: "NEWS", name: "Tin tức", description: "Tin tức địa phương và thời sự.", status: "active" },
  { id: "category-health", organizationId, code: "HEALTH", name: "Thể dục dưỡng sinh", description: "Nội dung chăm sóc sức khỏe cộng đồng.", status: "active" },
  { id: "category-arts", organizationId, code: "ARTS", name: "Văn nghệ giải trí", description: "Chương trình văn nghệ và giải trí.", status: "active" },
  { id: "category-education", organizationId, code: "EDU", name: "Giáo dục", description: "Nội dung giáo dục và phổ biến kiến thức.", status: "active" },
  { id: "category-communication", organizationId, code: "COMM", name: "Tuyên truyền", description: "Thông tin tuyên truyền và thông báo cộng đồng.", status: "active" },
];

export interface MockDeviceRecord extends Device {
  organizationId: string;
  identifier: string;
  ipAddress: string;
  provider: string;
  address: string;
  activityStatus: "active" | "inactive";
  connectionStatus: "connected" | "disconnected";
  volume: number;
  createdAt: string;
  updatedAt: string;
}

const additionalDeviceSeeds: Device[] = [
  {
    id: "21",
    name: "Thiết bị phát thanh Đà Nẵng",
    code: "MCL-DN-001",
    supplier: "Viettel",
    location: "Quận Hải Châu, Đà Nẵng",
    facilityId: "hai-chau",
    facilityName: "Quận Hải Châu",
    status: "active",
    connection: "online",
    broadcast: "playing",
    longitude: "108.220000",
    latitude: "16.067000",
    simPhone: "096900000021",
    simSerial: "9394403353521",
    supplierPhone: "0999999999",
    description: "Thiết bị demo tại Đà Nẵng",
  },
  {
    id: "22",
    name: "Thiết bị phát thanh Hà Nội",
    code: "MCL-HN-001",
    supplier: "MobiFone",
    location: "Quận Hoàn Kiếm, Hà Nội",
    facilityId: "hoan-kiem",
    facilityName: "Quận Hoàn Kiếm",
    status: "active",
    connection: "offline",
    broadcast: "stopped",
    longitude: "105.850000",
    latitude: "21.030000",
    simPhone: "096900000022",
    simSerial: "9394403353522",
    supplierPhone: "0999999998",
    description: "Thiết bị demo tại Hà Nội",
  },
];

export const mockDevices: MockDeviceRecord[] = [
  ...deviceSeeds,
  ...additionalDeviceSeeds,
].map((device, index) => {
  const number = index + 1;
  const online = device.connection === "online";
  return {
    ...device,
    organizationId,
    identifier: device.code,
    ipAddress: `192.168.10.${number}`,
    provider: number % 2 === 0 ? "Viettel" : "MobiFone",
    address: device.location,
    activityStatus: device.status,
    connectionStatus: online ? "connected" : "disconnected",
    longitude: device.longitude ?? (106.65 + index * 0.001).toFixed(6),
    latitude: device.latitude ?? (10.75 + index * 0.001).toFixed(6),
    volume: 50,
    createdAt,
    updatedAt,
  };
});

export const mockDeviceList: Device[] = mockDevices.map(
  ({
    id,
    name,
    code,
    supplier,
    location,
    facilityId,
    facilityName,
    status,
    connection,
    broadcast,
    longitude,
    latitude,
    simPhone,
    simSerial,
    supplierPhone,
    description,
  }) => ({
    id,
    name,
    code,
    supplier,
    location,
    facilityId,
    facilityName,
    status,
    connection,
    broadcast,
    longitude,
    latitude,
    simPhone,
    simSerial,
    supplierPhone,
    description,
  }),
);

export const mockFacilityDevices: FacilityDevice[] = mockDevices.map((device) => ({
  id: device.id,
  facilityId: device.facilityId,
  identifier: device.identifier,
  name: device.name,
  ipAddress: device.ipAddress,
  facilityName: device.facilityName,
  activityStatus: device.activityStatus,
  connectionStatus: device.connectionStatus,
  provider: device.provider,
  simPhoneNumber: device.simPhone ?? "",
  simSerial: device.simSerial ?? "",
  tag: device.description ?? "",
  address: device.address,
  longitude: device.longitude ?? "",
  latitude: device.latitude ?? "",
}));

export interface MockInformationSource {
  id: string;
  organizationId: string;
  facilityId: string;
  name: string;
  sourceType: "radio" | "url" | "internal";
  url: string;
  categoryId: string;
  status: "active" | "inactive";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const mockInformationSources: MockInformationSource[] = [
  {
    id: "source-001",
    organizationId,
    facilityId: "hcm",
    name: "Kênh phát thanh TP. Hồ Chí Minh",
    sourceType: "radio",
    url: "https://example.com/radio/hcm",
    categoryId: "category-news",
    status: "active",
    createdBy: "user-001",
    createdAt,
    updatedAt,
  },
  {
    id: "source-002",
    organizationId,
    facilityId: "da-nang",
    name: "Cổng thông tin Đà Nẵng",
    sourceType: "url",
    url: "https://example.com/danang",
    categoryId: "category-communication",
    status: "active",
    createdBy: "user-002",
    createdAt,
    updatedAt,
  },
  {
    id: "source-003",
    organizationId,
    facilityId: "hanoi",
    name: "Nguồn nội bộ Hà Nội",
    sourceType: "internal",
      url: "internal://hanoi/local",
    categoryId: "category-news",
    status: "inactive",
    createdBy: "user-001",
    createdAt,
    updatedAt,
  },
];

export const mockMedia: FacilityMediaItem[] = [
  {
    id: "media-001",
    facilityId: "hcm",
    title: "Bản tin cộng đồng buổi sáng",
    category: "Tin tức",
    type: "audio",
    status: "approved",
    sourceStatus: "active",
    createdAt: "2026-11-04T23:00:00.000Z",
    createdBy: "Nguyễn Minh Chinh",
    sizeMB: 18.4,
    thumbnail: mediaThumbnail,
    url: "/sample-media/community-morning.mp3",
  },
  {
    id: "media-002",
    facilityId: "hcm",
    title: "Hướng dẫn thể dục dưỡng sinh",
    category: "Thể dục dưỡng sinh",
    type: "video",
    status: "pending",
    sourceStatus: "active",
    createdAt: "2026-11-04T03:30:00.000Z",
    createdBy: "Lê Quốc Bảo",
    sizeMB: 165,
    thumbnail: mediaThumbnail,
    url: "/sample-media/morning-exercise.mp4",
  },
  {
    id: "media-003",
    facilityId: "da-nang",
    title: "Thông báo sinh hoạt khu dân cư",
    category: "Tuyên truyền",
    type: "image",
    status: "approved",
    sourceStatus: "active",
    createdAt: "2026-11-03T08:15:00.000Z",
    createdBy: "Trần Thu Hà",
    sizeMB: 2.8,
    thumbnail: mediaThumbnail,
    url: "/sample-media/community-notice.png",
  },
  {
    id: "media-004",
    facilityId: "hanoi",
    title: "Chương trình văn nghệ cuối tuần",
    category: "Văn nghệ giải trí",
    type: "audio",
    status: "pending",
    sourceStatus: "inactive",
    createdAt: "2026-11-02T09:00:00.000Z",
    createdBy: "Nguyễn Minh Chinh",
    sizeMB: 42,
    thumbnail: mediaThumbnail,
    url: "/sample-media/weekend-music.mp3",
  },
];

export const mockTemplates: FacilityTemplate[] = [
  { id: "template-001", facilityId: "hcm", name: "Bản tin địa phương 16:9", aspectRatio: "16:9", createdAt, createdBy: "Nguyễn Minh Chinh" },
  { id: "template-002", facilityId: "hcm", name: "Thông báo dọc 9:16", aspectRatio: "9:16", createdAt, createdBy: "Trần Thu Hà" },
  { id: "template-003", facilityId: "da-nang", name: "Thông tin cộng đồng 1920 x 1080", aspectRatio: "1920 x 1080", createdAt, createdBy: "Trần Thu Hà" },
];

export const mockPlaylists: FacilityPlaylist[] = [
  { id: "playlist-001", facilityId: "hcm", name: "Bản tin sáng", duration: "00:25:00", category: "Tin tức", createdBy: "Nguyễn Minh Chinh", createdAt, newsType: "Bản tin phát thanh" },
  { id: "playlist-002", facilityId: "hcm", name: "Thể dục buổi sáng", duration: "00:30:00", category: "Thể dục dưỡng sinh", createdBy: "Lê Quốc Bảo", createdAt, newsType: "Bản tin phát thanh" },
  { id: "playlist-003", facilityId: "da-nang", name: "Thông tin cuối tuần", duration: "00:18:00", category: "Tuyên truyền", createdBy: "Trần Thu Hà", createdAt, newsType: "Bản tin điện tử" },
];

export interface MockPlaylistItem {
  id: string;
  playlistId: string;
  mediaId: string;
  position: number;
  durationSeconds: number;
  createdAt: string;
}

export const mockPlaylistItems: MockPlaylistItem[] = [
  { id: "playlist-item-001", playlistId: "playlist-001", mediaId: "media-001", position: 1, durationSeconds: 900, createdAt },
  { id: "playlist-item-002", playlistId: "playlist-002", mediaId: "media-002", position: 1, durationSeconds: 1800, createdAt },
  { id: "playlist-item-003", playlistId: "playlist-003", mediaId: "media-003", position: 1, durationSeconds: 1080, createdAt },
];

export interface MockBroadcast {
  id: string;
  organizationId: string;
  facilityId: string;
  title: string;
  description: string;
  categoryId: string;
  contentType: "playlist" | "media" | "live";
  contentId: string;
  status: "draft" | "scheduled" | "playing" | "completed" | "cancelled";
  priority: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const mockBroadcasts: MockBroadcast[] = [
  {
    id: "broadcast-001",
    organizationId,
    facilityId: "hcm",
    title: "Phát bản tin sáng",
    description: "Bản tin địa phương và thông báo cộng đồng.",
    categoryId: "category-news",
    contentType: "playlist",
    contentId: "playlist-001",
    status: "playing",
    priority: true,
    createdBy: "user-001",
    createdAt,
    updatedAt,
  },
  {
    id: "broadcast-002",
    organizationId,
    facilityId: "da-nang",
    title: "Thông tin cuối tuần",
    description: "Lịch phát nội dung thông tin cộng đồng.",
    categoryId: "category-communication",
    contentType: "playlist",
    contentId: "playlist-003",
    status: "scheduled",
    priority: false,
    createdBy: "user-002",
    createdAt,
    updatedAt,
  },
  {
    id: "broadcast-003",
    organizationId,
    facilityId: "hanoi",
    title: "Chương trình văn nghệ",
    description: "Chương trình đã phát xong.",
    categoryId: "category-arts",
    contentType: "media",
    contentId: "media-004",
    status: "completed",
    priority: false,
    createdBy: "user-001",
    createdAt,
    updatedAt,
  },
];

export interface MockBroadcastTarget {
  id: string;
  broadcastId: string;
  facilityId: string;
  deviceId: string;
  createdAt: string;
}

export const mockBroadcastTargets: MockBroadcastTarget[] = [
  { id: "broadcast-target-001", broadcastId: "broadcast-001", facilityId: "linh-xuan", deviceId: "1", createdAt },
  { id: "broadcast-target-002", broadcastId: "broadcast-001", facilityId: "binh-chieu", deviceId: "2", createdAt },
  { id: "broadcast-target-003", broadcastId: "broadcast-002", facilityId: "hai-chau", deviceId: "21", createdAt },
];

export const mockDeviceSchedules: DeviceScheduleItem[] = [
  { id: "schedule-001", deviceId: "1", title: "Bản tin sáng", category: "news", startTime: "06:00", endTime: "06:30", date: "2026-11-03", priority: true, status: "playing" },
  { id: "schedule-002", deviceId: "1", title: "Thể dục dưỡng sinh", category: "education", startTime: "07:00", endTime: "07:30", date: "2026-11-03", priority: false, status: "scheduled" },
  { id: "schedule-003", deviceId: "2", title: "Thông báo cộng đồng", category: "communication", startTime: "08:00", endTime: "08:15", date: "2026-11-03", priority: true, status: "scheduled" },
  { id: "schedule-004", deviceId: "20", title: "Chương trình văn nghệ", category: "arts", startTime: "09:00", endTime: "10:00", date: "2026-11-06", priority: false, status: "scheduled" },
];

export const mockDeviceActivityHistory: DeviceActivityHistoryItem[] = [
  { id: "activity-001", deviceId: "1", time: "2026-11-05T00:00:00", activity: "Kết nối lại", type: "reconnected", note: "Thiết bị kết nối thành công." },
  { id: "activity-002", deviceId: "1", time: "2026-11-05T00:05:00", activity: "Phát bản tin", type: "broadcast", note: "Bản tin sáng." },
  { id: "activity-003", deviceId: "2", time: "2026-11-04T23:30:00", activity: "Mất kết nối", type: "disconnected", note: "Không nhận được tín hiệu." },
  { id: "activity-004", deviceId: "3", time: "2026-11-04T08:30:00", activity: "Điều chỉnh âm lượng", type: "volume_changed", note: "Âm lượng được đặt ở mức 50%." },
];

export const mockDeviceBroadcastHistory: DeviceBroadcastHistoryItem[] = [
  { id: "broadcast-history-001", deviceId: "1", title: "Bản tin sáng", duration: "00:30:00", startTime: "2026-11-05T06:00:00", endTime: "2026-11-05T06:30:00" },
  { id: "broadcast-history-002", deviceId: "1", title: "Thông báo cộng đồng", duration: "00:10:00", startTime: "2026-11-04T16:00:00", endTime: "2026-11-04T16:10:00" },
  { id: "broadcast-history-003", deviceId: "2", title: "Tin tức địa phương", duration: "00:20:00", startTime: "2026-11-04T07:00:00", endTime: "2026-11-04T07:20:00" },
];

export interface MockSubscriptionPlan {
  id: string;
  code: string;
  name: string;
  capacityBytes: number;
  periodMonths: number;
  price: number;
  currency: string;
  status: "active" | "inactive";
  description: string;
}

export const mockSubscriptionPlans: MockSubscriptionPlan[] = [
  { id: "plan-5gb-monthly", code: "5GB-MONTHLY", name: "5GB/tháng", capacityBytes: 5368709120, periodMonths: 1, price: 50000, currency: "VND", status: "active", description: "Gói lưu trữ 5 GB theo tháng." },
  { id: "plan-10gb-monthly", code: "10GB-MONTHLY", name: "10GB/tháng", capacityBytes: 10737418240, periodMonths: 1, price: 100000, currency: "VND", status: "active", description: "Gói lưu trữ 10 GB theo tháng." },
  { id: "plan-50gb-yearly", code: "50GB-YEARLY", name: "50GB/năm", capacityBytes: 53687091200, periodMonths: 12, price: 900000, currency: "VND", status: "active", description: "Gói lưu trữ 50 GB theo năm." },
];

export interface MockSubscription {
  id: string;
  organizationId: string;
  planId: string;
  status: "active" | "expired" | "suspended" | "pending";
  startedAt: string;
  expiresAt: string;
  autoRenew: boolean;
  usedBytes: number;
  createdAt: string;
  updatedAt: string;
}

export const mockSubscriptions: MockSubscription[] = [
  {
    id: "subscription-001",
    organizationId,
    planId: "plan-5gb-monthly",
    status: "active",
    startedAt: "2026-11-01T00:00:00.000Z",
    expiresAt: "2026-12-01T00:00:00.000Z",
    autoRenew: false,
    usedBytes: 4294967296,
    createdAt,
    updatedAt,
  },
];

export interface MockRenewal {
  id: string;
  subscriptionId: string;
  planId: string;
  renewedBy: string;
  renewedAt: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: string;
  paymentMethod: "bank_transfer" | "momo" | "international_card";
  status: "pending" | "paid" | "failed" | "refunded";
  transactionReference: string;
}

export const mockRenewals: MockRenewal[] = [
  { id: "renewal-001", subscriptionId: "subscription-001", planId: "plan-5gb-monthly", renewedBy: "user-001", renewedAt: "2026-10-01T10:00:00.000Z", periodStart: "2026-10-01T00:00:00.000Z", periodEnd: "2026-11-01T00:00:00.000Z", amount: 50000, currency: "VND", paymentMethod: "bank_transfer", status: "paid", transactionReference: "MOCK-TXN-0001" },
  { id: "renewal-002", subscriptionId: "subscription-001", planId: "plan-5gb-monthly", renewedBy: "user-001", renewedAt: "2026-09-01T10:00:00.000Z", periodStart: "2026-09-01T00:00:00.000Z", periodEnd: "2026-10-01T00:00:00.000Z", amount: 50000, currency: "VND", paymentMethod: "momo", status: "paid", transactionReference: "MOCK-TXN-0002" },
  { id: "renewal-003", subscriptionId: "subscription-001", planId: "plan-10gb-monthly", renewedBy: "user-001", renewedAt: "2026-08-01T10:00:00.000Z", periodStart: "2026-08-01T00:00:00.000Z", periodEnd: "2026-09-01T00:00:00.000Z", amount: 100000, currency: "VND", paymentMethod: "international_card", status: "paid", transactionReference: "MOCK-TXN-0003" },
];

export interface MockPayment {
  id: string;
  renewalId: string;
  method: MockRenewal["paymentMethod"];
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  transactionReference: string;
  paidAt: string;
  createdAt: string;
}

export const mockPayments: MockPayment[] = mockRenewals.map((renewal) => ({
  id: `payment-${renewal.id}`,
  renewalId: renewal.id,
  method: renewal.paymentMethod,
  amount: renewal.amount,
  currency: renewal.currency,
  status: renewal.status,
  transactionReference: renewal.transactionReference,
  paidAt: renewal.renewedAt,
  createdAt: renewal.renewedAt,
}));

export interface MockDeviceCommand {
  id: string;
  deviceId: string;
  commandType: "restart" | "set_volume" | "sync_content";
  requestedBy: string;
  payload: Record<string, string | number | boolean>;
  status: "pending" | "sent" | "completed" | "failed";
  requestedAt: string;
  completedAt: string | null;
  resultMessage: string;
}

export const mockDeviceCommands: MockDeviceCommand[] = [
  {
    id: "device-command-001",
    deviceId: "1",
    commandType: "set_volume",
    requestedBy: "user-001",
    payload: { volume: 50 },
    status: "completed",
    requestedAt: "2026-11-05T04:55:00.000Z",
    completedAt: updatedAt,
    resultMessage: "Đã cập nhật âm lượng mô phỏng.",
  },
  {
    id: "device-command-002",
    deviceId: "21",
    commandType: "restart",
    requestedBy: "user-002",
    payload: {},
    status: "pending",
    requestedAt: updatedAt,
    completedAt: null,
    resultMessage: "Lệnh mẫu chưa gửi tới thiết bị thật.",
  },
];

export interface MockSystemSetting {
  id: string;
  organizationId: string;
  key: string;
  value: string | number | boolean | Record<string, string | number | boolean>;
  updatedBy: string;
  updatedAt: string;
}

export const mockSystemSettings: MockSystemSetting[] = [
  { id: "setting-001", organizationId, key: "timezone", value: "Asia/Ho_Chi_Minh", updatedBy: "user-001", updatedAt },
  { id: "setting-002", organizationId, key: "broadcast_mode", value: "scheduled", updatedBy: "user-001", updatedAt },
  { id: "setting-003", organizationId, key: "media_upload_limits", value: { maxImageMb: 20, maxAudioMb: 100, maxVideoMb: 500 }, updatedBy: "user-001", updatedAt },
];

export interface MockChannel {
  id: string;
  organizationId: string;
  facilityId: string;
  name: string;
  relayChannel: string;
  fmChannel: string;
  status: "active" | "inactive";
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const mockChannels: MockChannel[] = [
  { id: "channel-001", organizationId, facilityId: "hcm", name: "Kênh phát thanh 1", relayChannel: "Kênh tiếp sóng 1", fmChannel: "FM 99.9 MHz", status: "active", description: "Kênh phát thanh mẫu của TP. Hồ Chí Minh.", createdAt, updatedAt },
  { id: "channel-002", organizationId, facilityId: "da-nang", name: "Kênh thông tin Đà Nẵng", relayChannel: "Kênh tiếp sóng 2", fmChannel: "FM 100.5 MHz", status: "active", description: "Kênh phát thanh mẫu của Đà Nẵng.", createdAt, updatedAt },
];

export interface MockChannelFacilityShare {
  id: string;
  channelId: string;
  facilityId: string;
  sharedBy: string;
  sharedAt: string;
  status: "active" | "revoked";
}

export const mockChannelFacilityShares: MockChannelFacilityShare[] = [
  { id: "channel-share-001", channelId: "channel-001", facilityId: "thu-duc", sharedBy: "user-001", sharedAt: createdAt, status: "active" },
  { id: "channel-share-002", channelId: "channel-001", facilityId: "quan-1", sharedBy: "user-001", sharedAt: createdAt, status: "active" },
];

export interface MockReportExport {
  id: string;
  organizationId: string;
  requestedBy: string;
  reportType: "facilities" | "sources" | "devices" | "broadcasts";
  filters: Record<string, string | number | boolean | null>;
  fileUrl: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  completedAt: string;
}

export const mockReportExports: MockReportExport[] = [
  {
    id: "report-export-001",
    organizationId,
    requestedBy: "user-001",
    reportType: "devices",
    filters: { startDate: "2026-11-01", endDate: "2026-11-05", facilityId: "hcm" },
    fileUrl: "/sample-reports/device-report.xlsx",
    status: "completed",
    createdAt,
    completedAt: updatedAt,
  },
];

export interface MockAuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  occurredAt: string;
  details: Record<string, string | number | boolean | null>;
}

export const mockAuditLogs: MockAuditLog[] = [
  {
    id: "audit-001",
    organizationId,
    userId: "user-001",
    action: "device.update",
    entityType: "device",
    entityId: "1",
    occurredAt: updatedAt,
    details: { field: "volume", oldValue: 40, newValue: 50 },
  },
];

const topLevelFacilities = mockFacilities.filter(
  (facility) => facility.parentId === null,
);

function getDescendantIds(facilityId: string): Set<string> {
  const result = new Set([facilityId]);
  const queue = [facilityId];
  while (queue.length > 0) {
    const parentId = queue.shift();
    for (const facility of mockFacilities) {
      if (facility.parentId === parentId && !result.has(facility.id)) {
        result.add(facility.id);
        queue.push(facility.id);
      }
    }
  }
  return result;
}

export const mockFacilityReports: FacilityReportItem[] = topLevelFacilities.map(
  (facility) => ({
    id: facility.id,
    facilityName: facility.facilityName,
    totalChildren: mockFacilities.filter((item) => item.parentId === facility.id).length,
  }),
);

export const mockDeviceReports: DeviceReportItem[] = topLevelFacilities.map(
  (facility) => {
    const descendants = getDescendantIds(facility.id);
    const devices = mockDevices.filter((device) =>
      descendants.has(device.facilityId),
    );
    return {
      id: facility.id,
      facilityName: facility.facilityName,
      deviceCount: devices.length,
      otherDeviceCount: devices.filter((device) => device.connection === "offline").length,
    };
  },
);

export const mockSourceReports: SourceReportItem[] = topLevelFacilities.map(
  (facility) => {
    const descendants = getDescendantIds(facility.id);
    const devices = mockDevices.filter((device) =>
      descendants.has(device.facilityId),
    );
    return {
      id: facility.id,
      facilityName: facility.facilityName,
      deviceCount: devices.length,
      otherDeviceCount: mockInformationSources.filter(
        (source) => descendants.has(source.facilityId),
      ).length,
    };
  },
);

export const mockBroadcastReports: BroadcastReportItem[] = topLevelFacilities.map(
  (facility) => {
    const descendants = getDescendantIds(facility.id);
    const devices = mockDevices.filter((device) =>
      descendants.has(device.facilityId),
    );
    return {
      id: facility.id,
      facilityName: facility.facilityName,
      deviceCount: mockBroadcastTargets.filter((target) =>
        descendants.has(target.facilityId),
      ).length,
      otherDeviceCount: devices.filter((device) => device.broadcast === "stopped").length,
    };
  },
);

export const mockFacilityProviderStatistics: FacilityProviderStatistic[] =
  topLevelFacilities.map((facility) => {
    const descendants = getDescendantIds(facility.id);
    const devices = mockDevices.filter((device) =>
      descendants.has(device.facilityId),
    );
    return {
      facilityName: facility.facilityName,
      provider3: 0,
      provider2: 0,
      provider1: 0,
      viettel: devices.filter((device) => device.provider === "Viettel").length,
      mobifone: devices.filter((device) => device.provider === "MobiFone").length,
    };
  });

function getBroadcastCounts(facilityId: string) {
  const descendants = getDescendantIds(facilityId);
  const broadcastIds = new Set(
    mockBroadcastTargets
      .filter((target) => descendants.has(target.facilityId))
      .map((target) => target.broadcastId),
  );
  const targetBroadcasts = mockBroadcasts.filter((broadcast) =>
    broadcastIds.has(broadcast.id),
  );
  return {
    playing: targetBroadcasts.filter((item) => item.status === "playing").length,
    cancelled: targetBroadcasts.filter((item) => item.status === "cancelled").length,
    completed: targetBroadcasts.filter((item) => item.status === "completed").length,
    unscheduled: targetBroadcasts.filter((item) => item.status === "scheduled").length,
  };
}

export const mockSourceBroadcastStatistics: SourceBroadcastStatistic[] =
  topLevelFacilities.map((facility) => ({
    facilityName: facility.facilityName,
    ...getBroadcastCounts(facility.id),
  }));

export const mockDeviceBroadcastStatistics: DeviceBroadcastStatistic[] =
  topLevelFacilities.map((facility) => ({
    facilityName: facility.facilityName,
    ...getBroadcastCounts(facility.id),
  }));

export const mockBroadcastStatistics: BroadcastStatistic[] =
  topLevelFacilities.map((facility) => ({
    facilityName: facility.facilityName,
    ...getBroadcastCounts(facility.id),
  }));

export const mockFacilityCircleStatistics: FacilityCircleStatistic[] =
  topLevelFacilities.map((facility, index) => ({
    id: `facility-circle-${facility.id}`,
    facilityName: facility.facilityName,
    value: mockFacilities.filter((item) => item.parentId === facility.id).length,
    color: ["#FEB700", "#34CD26", "#5490EB"][index % 3],
    backgroundColor: ["#FFF5E1", "#E3FFE1", "#E1EDFF"][index % 3],
  }));

export const mockSourceCircleStatistics: SourceCircleStatistic[] =
  topLevelFacilities.map((facility, index) => {
    const descendants = getDescendantIds(facility.id);
    return {
      id: `source-circle-${facility.id}`,
      facilityName: facility.facilityName,
      value: mockInformationSources.filter((source) =>
        descendants.has(source.facilityId),
      ).length,
      color: ["#FEB700", "#34CD26", "#5490EB"][index % 3],
      backgroundColor: ["#FFF5E1", "#E3FFE1", "#E1EDFF"][index % 3],
    };
  });

export const mockDeviceCircleStatistics: DeviceCircleStatistic[] =
  topLevelFacilities.map((facility, index) => {
    const descendants = getDescendantIds(facility.id);
    return {
      id: `device-circle-${facility.id}`,
      facilityName: facility.facilityName,
      value: mockDevices.filter((device) =>
        descendants.has(device.facilityId),
      ).length,
      color: ["#FEB700", "#34CD26", "#5490EB"][index % 3],
      backgroundColor: ["#FFF5E1", "#E3FFE1", "#E1EDFF"][index % 3],
    };
  });

export const mockBroadcastCircleStatistics: BroadcastCircleStatistic[] =
  topLevelFacilities.map((facility, index) => {
    const descendants = getDescendantIds(facility.id);
    return {
      id: `broadcast-circle-${facility.id}`,
      facilityName: facility.facilityName,
      value: mockBroadcastTargets.filter((target) =>
        descendants.has(target.facilityId),
      ).length,
      color: ["#FEB700", "#34CD26", "#5490EB"][index % 3],
      backgroundColor: ["#FFF5E1", "#E3FFE1", "#E1EDFF"][index % 3],
    };
  });

export const mockDashboardDevices = mockDevices.map((device, index) => ({
  id: index + 1,
  deviceId: device.id,
  name: device.name,
  address: device.address,
  latitude: Number(device.latitude),
  longitude: Number(device.longitude),
  status: device.connection === "online" ? "online" as const : "offline" as const,
}));
