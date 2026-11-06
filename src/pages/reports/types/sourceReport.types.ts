export interface SourceReportItem {
  id: string;
  facilityName: string;
  deviceCount: number;
  otherDeviceCount: number;
}

export interface SourceBroadcastStatistic {
  facilityName: string;
  playing: number;
  cancelled: number;
  completed: number;
  unscheduled: number;
}

export interface SourceCircleStatistic {
  id: string;
  facilityName: string;
  value: number;
  color: string;
  backgroundColor: string;
}
