import type {
  FacilityReportItem,
  FacilityProviderStatistic,
  FacilityCircleStatistic,
} from "../types/report.types";

export const facilityReportsMock: FacilityReportItem[] = [
  {
    id: "1",
    facilityName: "TP. Hồ Chí Minh",
    totalChildren: 18,
  },
  {
    id: "2",
    facilityName: "Đà Nẵng",
    totalChildren: 8,
  },
  {
    id: "3",
    facilityName: "Hà Nội",
    totalChildren: 24,
  },
];

export const facilityProviderStatisticsMock: FacilityProviderStatistic[] = [
  {
    facilityName: "TP. Hồ Chí Minh",
    provider3: 7,
    provider2: 3,
    provider1: 2,
    viettel: 4,
    mobifone: 5,
  },
  {
    facilityName: "Đà Nẵng",
    provider3: 0,
    provider2: 3,
    provider1: 2,
    viettel: 3,
    mobifone: 4,
  },
  {
    facilityName: "Hà Nội",
    provider3: 10,
    provider2: 3,
    provider1: 2,
    viettel: 4,
    mobifone: 5,
  },
];

export const facilityCircleStatisticsMock: FacilityCircleStatistic[] = [
  {
    id: "hn",
    facilityName: "Hà Nội",
    value: 25,
    color: "#FEB700",
    backgroundColor: "#FFF5E1",
  },
  {
    id: "hcm",
    facilityName: "TP. Hồ Chí Minh",
    value: 20,
    color: "#34CD26",
    backgroundColor: "#E3FFE1",
  },
  {
    id: "dn",
    facilityName: "Đà Nẵng",
    value: 10,
    color: "#5490EB",
    backgroundColor: "#E1EDFF",
  },
];
