import type {
  TemplateSource,
  TemplateSourceType,
  TemplateLayer,
  TemplateFormData,
  TemplateFormMode,
} from "../../../types/template.types";

// Giữ lại tên types cũ để các file Facility
// hiện tại không bị lỗi import.
export type FacilityTemplateSource = TemplateSource;

export type {
  TemplateSourceType,
  TemplateLayer,
  TemplateFormData,
  TemplateFormMode,
};

// Dữ liệu hiển thị trong danh sách bản mẫu của cơ sở
export interface FacilityTemplate {
  id: string;
  facilityId: string;
  name: string;
  aspectRatio: string;
  createdAt: string;
  createdBy: string;
}
