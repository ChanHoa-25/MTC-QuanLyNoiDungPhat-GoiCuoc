import type { Facility as ApiFacility } from "../../../types/facility.types";

export interface Facility extends ApiFacility {
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
