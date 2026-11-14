import type { TemplateFormData } from "../../../../types/template.types";

export type TemplateUsageStatus = "in_use" | "unused";

export interface SourceTemplate {
  id: string;
  name: string;
  aspectRatio: string;
  createdAt: string;
  createdBy: string;
  usageStatus: TemplateUsageStatus;
}

export interface StoredSourceTemplate extends TemplateFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usageStatus: TemplateUsageStatus;
}

export type {
  BroadcastType,
  BroadcastApprovalStatus,
  BroadcastPlayStatus,
  BroadcastRepeatType,
} from "../../types/sourceUsedNews.types";

import type { SourceUsedNewsItem } from "../../types/sourceUsedNews.types";

export type TemplateUsedNewsItem = SourceUsedNewsItem;
