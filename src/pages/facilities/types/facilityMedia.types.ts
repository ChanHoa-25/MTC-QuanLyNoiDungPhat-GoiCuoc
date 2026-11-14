import type { MediaItem, MediaContentType } from "../../../types/media.types";

export type {
  MediaType,
  MediaStatus,
  MediaContentType,
} from "../../../types/media.types";

export interface FacilityMediaItem extends MediaItem {
  facilityId: string;
  sourceStatus: "active" | "inactive";

  contentType?: MediaContentType;
  contentValue?: string;
  fileName?: string;
  mimeType?: string;

  categoryId?: string | null;
  organizationId?: string | null;
  rejectionReason?: string | null;
  sourceType?: number;
  durationSeconds?: number | null;
  frequencyHz?: number | null;
  approvalStatus?: string;
}

export interface FacilityMediaFormValues {
  title: string;
  category: string;
  contentType: MediaContentType;
  contentValue?: string;
  file?: File | null;
  fileType?: "Image" | "Audio" | "Video";
}
