export type TemplateSourceType = "video" | "audio" | "image";

export interface TemplateSource {
  id: string;
  name: string;
  type: TemplateSourceType;
  thumbnail: string;
  url: string;
  resolution?: string[];
  createdBy?: string;
  createdAt?: string;
}

export interface TemplateLayer {
  id: string;
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  hasAudio?: boolean;
}

export interface TemplateFormData {
  name: string;
  screenWidth: number | null;
  screenHeight: number | null;
  duration: string;
  layers: TemplateLayer[];
}

export type TemplateFormMode = "create" | "edit" | "view";

export interface StoredFacilityTemplate extends TemplateFormData {
  id: string;
  facilityId: string;
  name: string;
  screenWidth: number | null;
  screenHeight: number | null;
  aspectRatio: string;
  createdAt: string;
  createdBy: string;
  isUsed?: boolean;
}
