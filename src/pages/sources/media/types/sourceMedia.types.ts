export type SourceMediaType = "video" | "audio" | "image";

export type SourceMediaApprovalStatus = "approved" | "pending" | "rejected";

export interface MediaResolutionItem {
  label: "4K" | "2K" | "FHD" | "HD";
  state: "processing" | "disabled" | "ready-blue" | "ready-green";
}

export interface SourceMediaItem {
  id: string;
  title: string;
  fileName: string;
  category: string;
  type: SourceMediaType;
  approvalStatus: SourceMediaApprovalStatus;
  duration: string;
  sizeMB: number;
  detailSizeLabel: string;
  thumbnail: string;
  attachmentOrLink: string;
  approvedBy: string;
  createdBy: string;
  createdAt: string;
  sharedArea: string;
  isProcessing?: boolean;
  processingNote?: string;
  resolutions: MediaResolutionItem[];
}

export type BroadcastPriorityType = "priority" | "normal";

export type BroadcastApprovalStatus = "pending" | "approved" | "rejected";

export type BroadcastPlayStatus =
  | "playing"
  | "paused"
  | "waiting"
  | "ended"
  | "not_started"
  | "upcoming"
  | "cancelled";

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

export interface MediaSharedFacilityItem {
  id: string;
  facilityName: string;
  sharedAt: string | null;
  receiveStatus: "received" | "not_received";
}
