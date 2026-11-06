export interface BroadcastReportItem {
  id: string;
  facilityName: string;
  deviceCount: number;
  otherDeviceCount: number;
}

export interface BroadcastStatistic {
  facilityName: string;
  playing: number;
  cancelled: number;
  completed: number;
  unscheduled: number;
}

export interface BroadcastCircleStatistic {
  id: string;
  facilityName: string;
  value: number;
  color: string;
  backgroundColor: string;
}
