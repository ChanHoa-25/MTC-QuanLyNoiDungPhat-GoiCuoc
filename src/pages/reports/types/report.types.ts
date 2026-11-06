export type ReportTabKey = "facilities" | "sources" | "devices" | "broadcasts";

export interface FacilityReportItem {
  id: string;
  facilityName: string;
  totalChildren: number;
}

export interface FacilityProviderStatistic {
  facilityName: string;
  provider3: number;
  provider2: number;
  provider1: number;
  viettel: number;
  mobifone: number;
}

export interface FacilityCircleStatistic {
  id: string;
  facilityName: string;
  value: number;
  color: string;
  backgroundColor: string;
}

export interface FacilityReportFilters {
  date: string | null;
  time: string | null;
  keyword: string;
}
