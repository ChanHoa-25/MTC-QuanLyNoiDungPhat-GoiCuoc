export interface BroadcastMedia {
  id: string;
  name: string;
  description: string;
  resolution: string[];
  duration: string;
}

export interface BroadcastDevice {
  id: string;
  name: string;
  facility: string;
  address: string;
}

export interface BroadcastTimeSlot {
  id: string;
  start: string;
  end: string;
}

export type BroadcastMode = "scheduled" | "immediate";
export type BroadcastRepeat = "daily" | "weekly" | "monthly";
export type BroadcastTimeMode = "fixed" | "range";

export interface CreateBroadcastData {
  id: string;
  code: string;
  title: string;
  category: string;
  mode: BroadcastMode;
  startDate: string | null;
  endDate: string | null;
  repeat: BroadcastRepeat;
  weekdays: number[];
  monthDays: number[];
  timeMode: BroadcastTimeMode;
  timeSlots: BroadcastTimeSlot[];
  playCount: number;
  sourceType: string;
  sourceId: string;
  duration: string;
  mediaIds: string[];
  deviceIds: string[];
  createdAt: string;
  monthlyStartDate?: string | null;
  monthlyEndDate?: string | null;
}

export const broadcastCategories = [
  { value: "tourism", label: "Du lịch" },
  { value: "culture", label: "Văn hóa" },
  { value: "education", label: "Giáo dục" },
  { value: "news", label: "Tin tức" },
];

export const broadcastSourceTypes = [
  { value: "media", label: "Media file" },
  { value: "playlist", label: "Danh sách phát" },
];

export const broadcastSources = [
  { value: "image-1", label: "Hình ảnh 1", type: "media" },
  { value: "video-1", label: "Video 1", type: "media" },
  { value: "playlist-1", label: "Danh sách phát 1", type: "playlist" },
];

export const broadcastMediaMock: BroadcastMedia[] = [
  {
    id: "media-1",
    name: "Tên nguồn phát 1",
    description: "Bản mẫu",
    resolution: ["HD", "FHD", "2K"],
    duration: "00:05:30",
  },
  {
    id: "media-2",
    name: "Tên nguồn phát 2",
    description: "Bản mẫu",
    resolution: ["HD", "FHD", "2K"],
    duration: "00:05:30",
  },
  {
    id: "media-3",
    name: "Tên nguồn phát 3",
    description: "Bản mẫu",
    resolution: ["HD", "FHD", "2K"],
    duration: "00:05:30",
  },
  {
    id: "media-4",
    name: "Tên nguồn phát 4",
    description: "Bản mẫu",
    resolution: ["HD", "FHD", "2K"],
    duration: "00:05:30",
  },
  {
    id: "media-5",
    name: "Tên nguồn phát 5",
    description: "Bản mẫu",
    resolution: ["HD", "FHD", "2K"],
    duration: "00:05:30",
  },
];

export const broadcastDevicesMock: BroadcastDevice[] = [
  {
    id: "device-1",
    name: "Thiết bị 1",
    facility: "Thủ Đức",
    address: "233 Nguyễn Văn Linh, Phường Tân Hòa, TP.HCM",
  },
  {
    id: "device-2",
    name: "Thiết bị 2",
    facility: "Thủ Đức",
    address: "233 Nguyễn Văn Linh, Phường Tân Hòa, TP.HCM",
  },
  {
    id: "device-3",
    name: "Thiết bị 3",
    facility: "Thủ Đức",
    address: "233 Nguyễn Văn Linh, Phường Tân Hòa, TP.HCM",
  },
  {
    id: "device-4",
    name: "Thiết bị 4",
    facility: "Thủ Đức",
    address: "233 Nguyễn Văn Linh, Phường Tân Hòa, TP.HCM",
  },
  {
    id: "device-5",
    name: "Thiết bị 5",
    facility: "Thủ Đức",
    address: "233 Nguyễn Văn Linh, Phường Tân Hòa, TP.HCM",
  },
  {
    id: "device-6",
    name: "Thiết bị 6",
    facility: "Thủ Đức",
    address: "233 Nguyễn Văn Linh, Phường Tân Hòa, TP.HCM",
  },
];

export const CREATE_BROADCAST_STORAGE_KEY = "mtc-created-broadcasts";

export function getCreatedBroadcasts(): CreateBroadcastData[] {
  try {
    const raw = localStorage.getItem(CREATE_BROADCAST_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CreateBroadcastData[]) : [];
  } catch {
    return [];
  }
}

export function saveCreatedBroadcast(broadcast: CreateBroadcastData): void {
  const current = getCreatedBroadcasts();

  localStorage.setItem(
    CREATE_BROADCAST_STORAGE_KEY,
    JSON.stringify([broadcast, ...current]),
  );
}
