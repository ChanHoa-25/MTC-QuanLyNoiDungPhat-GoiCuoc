import type { SourceMediaType } from "../../media/types/sourceMedia.types";

export interface SharedMediaItem {
  id: string;
  title: string;
  detailTitle: string;
  category: string;
  detailCategory: string;
  type: SourceMediaType;
  formatLabel: string;
  attachmentOrLink: string;
  duration: string;
  previewCurrentTime: string;
  previewTotalTime: string;
  approvedBy: string;
  createdBy: string;
  detailCreatedBy: string;
  createdAt: string;
  createdAtDisplay: string;
  detailCreatedAtDisplay: string;
  sharedFacility: string;
  sharedAt: string;
  sharedAtDisplay: string;
  detailSharedAtDisplay: string;
  thumbnail: string;
}
