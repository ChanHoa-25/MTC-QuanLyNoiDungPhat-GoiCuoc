export interface Facility {
  id: string;
  organizationId: string;
  facilityCode: string;
  facilityName: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
  children?: Facility[];
}

export interface FacilityFormValues {
  facilityCode: string;
  facilityName: string;
  isActive: boolean;
}

export type FacilityAction = "create" | "edit" | "delete";

export type FacilityFormMode = "create" | "edit";

export type FacilityTabKey =
  | "info"
  | "users"
  | "devices"
  | "media"
  | "templates"
  | "playlists";

export interface FacilityTab {
  key: FacilityTabKey;
  label: string;
}
