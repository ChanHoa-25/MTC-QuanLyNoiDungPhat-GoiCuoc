export type MediaType = "video" | "image" | "audio";

export type MediaStatus = "approved" | "pending" | "rejected" | "processing";

export type MediaContentType = "file" | "live" | "url" | "frequency";

export interface MediaItem {
  id: string;
  title: string;
  category: string;
  type: MediaType;
  status: MediaStatus;
  createdAt: string;
  createdBy: string;
  sizeMB: number;
  thumbnail: string;
  url?: string;
  sourceUrl?: string | null;
  fileType?: string;
}
