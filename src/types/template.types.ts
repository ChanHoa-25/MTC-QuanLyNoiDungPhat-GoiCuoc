export type TemplateSourceType = "video" | "audio" | "image";

export interface TemplateSource {
  id: string;
  name: string;
  type: TemplateSourceType;
  thumbnail: string;
  url: string;
}

export interface TemplateLayer {
  id: string;
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export type TemplateFormMode = "create" | "edit" | "view";

export interface TemplateFormData {
  name: string;
  screenHeight: number | null;
  screenWidth: number | null;
  duration: string;
  layers: TemplateLayer[];
}
