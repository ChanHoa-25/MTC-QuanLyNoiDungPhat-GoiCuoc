export type ScheduleCategory =
  | "education"
  | "news"
  | "arts"
  | "entertainment"
  | "children"
  | "communication";

export interface DeviceScheduleItem {
  id: string;
  deviceId: string;
  title: string;
  category: ScheduleCategory;
  startTime: string;
  endTime: string;
  date: string;
  priority?: boolean;
  status?: "playing" | "scheduled" | "completed";
}
