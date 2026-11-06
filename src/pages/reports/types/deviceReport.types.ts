export interface DeviceReportItem {
  id: string;
  facilityName: string;
  deviceCount: number;
  otherDeviceCount: number;
}

export interface DeviceBroadcastStatistic {
  facilityName: string;
  playing: number;
  cancelled: number;
  completed: number;
  unscheduled: number;
}

export interface DeviceCircleStatistic {
  id: string;
  facilityName: string;
  value: number;
  color: string;
  backgroundColor: string;
}
