export type MediaType = "video" | "image" | "audio";

export type MediaStatus = "approved" | "pending";

export interface SiteMediaItem {
  id: string;
  siteId: string;
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
