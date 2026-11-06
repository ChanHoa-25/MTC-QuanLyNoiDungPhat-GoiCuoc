import type {
  SourceReportItem,
  SourceBroadcastStatistic,
  SourceCircleStatistic,
} from "../types/sourceReport.types";

export const sourceReportsMock: SourceReportItem[] = [
  {
    id: "1",
    facilityName: "TP. Hồ Chí Minh",
    deviceCount: 14,
    otherDeviceCount: 2,
  },
  {
    id: "2",
    facilityName: "Đà Nẵng",
    deviceCount: 7,
    otherDeviceCount: 0,
  },
  {
    id: "3",
    facilityName: "Hà Nội",
    deviceCount: 18,
    otherDeviceCount: 1,
  },
];

export const sourceBroadcastStatisticsMock: SourceBroadcastStatistic[] = [
  {
    facilityName: "TP. Hồ Chí Minh",
    playing: 7,
    cancelled: 3,
    completed: 2,
    unscheduled: 4,
  },
  {
    facilityName: "Đà Nẵng",
    playing: 0,
    cancelled: 3,
    completed: 1,
    unscheduled: 3,
  },
  {
    facilityName: "Hà Nội",
    playing: 10,
    cancelled: 3,
    completed: 2,
    unscheduled: 4,
  },
];

export const sourceCircleStatisticsMock: SourceCircleStatistic[] = [
  {
    id: "hn",
    facilityName: "Hà Nội",
    value: 19,
    color: "#FEB700",
    backgroundColor: "#FFF5E1",
  },
  {
    id: "hcm",
    facilityName: "TP. Hồ Chí Minh",
    value: 16,
    color: "#34CD26",
    backgroundColor: "#E3FFE1",
  },
  {
    id: "dn",
    facilityName: "Đà Nẵng",
    value: 7,
    color: "#5490EB",
    backgroundColor: "#E1EDFF",
  },
];
