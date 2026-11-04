// Loại media
export type MediaType = "video" | "image" | "audio";

// Trạng thái duyệt media
export type MediaStatus = "approved" | "pending";

// Thông tin media thuộc cơ sở
export interface FacilityMediaItem {
  id: string;
  facilityId: string;
  title: string;
  category: string;
  type: MediaType;
  status: MediaStatus;
  sourceStatus: "active" | "inactive";
  createdAt: string;
  createdBy: string;
  sizeMB: number;
  thumbnail: string;
  url?: string;
}
