import type {
  DeviceScheduleItem,
  ScheduleCategory,
} from "../types/deviceSchedule.types";

export const scheduleCategories: {
  key: ScheduleCategory;
  label: string;
}[] = [
  { key: "education", label: "Giáo dục" },
  { key: "news", label: "Tin tức" },
  { key: "arts", label: "Văn nghệ" },
  { key: "entertainment", label: "Giải trí" },
  { key: "children", label: "Trẻ em" },
  { key: "communication", label: "Tuyên truyền" },
];

export const deviceScheduleMock: DeviceScheduleItem[] = [
  {
    id: "schedule-01",
    deviceId: "1",
    title: "Thiết bị phát thanh 01",
    category: "education",
    startTime: "06:00",
    endTime: "08:30",
    date: "2026-11-03",
    status: "playing",
  },
  {
    id: "schedule-02",
    deviceId: "1",
    title: "Bản tin giáo dục",
    category: "education",
    startTime: "07:00",
    endTime: "08:00",
    date: "2026-11-03",
    status: "scheduled",
  },
  {
    id: "schedule-03",
    deviceId: "1",
    title: "Thiết bị phát thanh 01",
    category: "news",
    startTime: "08:00",
    endTime: "11:00",
    date: "2026-11-03",
    priority: true,
    status: "scheduled",
  },
  {
    id: "schedule-04",
    deviceId: "1",
    title: "Chương trình văn nghệ",
    category: "arts",
    startTime: "09:00",
    endTime: "10:30",
    date: "2026-11-03",
    status: "scheduled",
  },
];
