import type {
  MediaItem,
  MediaType,
  MediaContentType,
} from "../../../../types/media.types";

// Loại media dùng chung
export type SourceMediaType = MediaType;

// Trạng thái duyệt media
export type SourceMediaApprovalStatus = "approved" | "pending" | "rejected";

// Loại nội dung media
export type SourceMediaContentType = MediaContentType;

// Độ phân giải media
export interface MediaResolutionItem {
  label: "4K" | "2K" | "FHD" | "HD";
  state: "processing" | "disabled" | "ready-blue" | "ready-green";
}

// Dữ liệu media của nguồn thông tin
export interface SourceMediaItem extends MediaItem {
  fileName: string;
  contentType?: SourceMediaContentType;
  duration: string;
  detailSizeLabel: string;
  attachmentOrLink: string;
  approvedBy: string;
  sharedArea: string;
  sharedFacilityIds?: string[];
  rejectionReason?: string;
  processingNote?: string;
  resolutions: MediaResolutionItem[];
}

// Dữ liệu form thêm / sửa media
export interface SourceMediaFormValues {
  title: string;
  category: string;
  contentType: SourceMediaContentType;
  contentValue?: string;
  file?: File | null;
}

// Mức độ ưu tiên bản tin
export type BroadcastPriorityType = "priority" | "normal";

// Trạng thái duyệt bản tin
export type BroadcastApprovalStatus = "pending" | "approved" | "rejected";

// Trạng thái phát bản tin
export type BroadcastPlayStatus =
  | "playing"
  | "paused"
  | "waiting"
  | "ended"
  | "not_started"
  | "upcoming"
  | "cancelled";

// Thông tin bản tin đang sử dụng media
export interface MediaBroadcastUsageItem {
  id: string;
  mediaId: string;
  title: string;
  broadcastType: BroadcastPriorityType;
  approvalStatus: BroadcastApprovalStatus;
  playStatus?: BroadcastPlayStatus;
  startDate: string | null;
  endDate: string | null;
  playTimeSlots: string[];
  facilitiesText: string;
}

// Thông tin cơ sở được chia sẻ media
export interface MediaSharedFacilityItem {
  id: string;
  facilityName: string;
  sharedAt: string | null;
  receiveStatus: "received" | "not_received";
}
