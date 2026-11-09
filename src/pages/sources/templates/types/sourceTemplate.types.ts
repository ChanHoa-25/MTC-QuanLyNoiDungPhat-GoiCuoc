export type TemplateUsageStatus = "in_use" | "unused";

export interface TemplateZone {
  id: string;
  name: string;
  x: number; // pixel offset from left
  y: number; // pixel offset from top
  widthPercent: number; // % width
  heightPercent: number; // % height
  zIndex: number;
  mediaId?: string;
  mediaTitle?: string;
  mediaThumbnail?: string;
  mediaType?: "video" | "audio" | "image";
  hasAudio?: boolean;
}

export interface SourceTemplateItem {
  id: string;
  name: string;
  aspectRatio: string; // e.g. "16:9", "1920 x 1080"
  screenWidth: number;
  screenHeight: number;
  createdAt: string;
  createdBy: string;
  usageStatus: TemplateUsageStatus;
  duration?: string;
  presetId?: string;
  zones: TemplateZone[];
}

export interface TemplatePresetLayout {
  id: string;
  category: "1_media" | "2_media" | "3_media" | "4_media";
  categoryLabel: string;
  name: string;
  zones: Omit<TemplateZone, "mediaId" | "mediaTitle" | "mediaThumbnail">[];
}

// Kiểu bản tin sử dụng được dùng chung với Danh sách phát -> chuyển về sources/types
export type {
  BroadcastType,
  BroadcastApprovalStatus,
  BroadcastPlayStatus,
  BroadcastRepeatType,
} from "../../types/sourceUsedNews.types";
import type { SourceUsedNewsItem } from "../../types/sourceUsedNews.types";

export type TemplateUsedNewsItem = SourceUsedNewsItem;

