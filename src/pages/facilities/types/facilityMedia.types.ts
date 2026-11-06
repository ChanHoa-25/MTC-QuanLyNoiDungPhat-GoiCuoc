export type MediaType = "video" | "image" | "audio";

export type MediaStatus = "approved" | "pending";

export type MediaContentType = "file" | "live" | "url" | "frequency";

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

  contentType?: MediaContentType;
  contentValue?: string;
  fileName?: string;
  mimeType?: string;
}

export interface FacilityMediaFormValues {
  title: string;
  category: string;
  contentType: MediaContentType;
  contentValue?: string;
  file?: File | null;
}
