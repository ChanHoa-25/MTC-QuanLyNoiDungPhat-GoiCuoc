export type BroadcastType = "priority" | "normal";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type BroadcastStatus =
  | "playing"
  | "paused"
  | "waiting"
  | "finished"
  | "not-playing"
  | "scheduled"
  | "cancelled";

export type RepeatType = "none" | "daily" | "weekly" | "monthly";
export interface BroadcastSource {
  id: string;
  name: string;
  description?: string;
  qualities: Array<"4K" | "2K" | "FHD" | "HD">;
  duration: string;
}

export interface BroadcastFacility {
  id: string;
  name: string;
  active: boolean;
}

export interface BroadcastDevice {
  id: string;
  name: string;
  facility: string;
  address: string;
}

export interface BroadcastTimeSlot {
  startTime: string;
  endTime: string;
  times: number;
}
export interface BroadcastHistoryItem {
  id: string;
  deviceCode: string;
  deviceName: string;
  startTime: string;
  endTime: string;
  facility: string;
}
export interface BroadcastItem {
  id: string;
  code: string;
  title: string;
  type: BroadcastType;
  approvalStatus: ApprovalStatus;
  broadcastStatus: BroadcastStatus;
  repeatType: RepeatType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  facility: string;
  creator: string;
  isChildFacility: boolean;
  category?: string;
  sourceType?: string;
  sourceName?: string;
  rejectReason?: string;

  facilityDisplay?: "tags" | "devices";
  facilities?: BroadcastFacility[];
  devices?: BroadcastDevice[];

  sources?: BroadcastSource[];

  broadcastMode?: string;
  timeSlots?: BroadcastTimeSlot[];
  repeatDays?: string[];

  history?: BroadcastHistoryItem[];
}

export const typeLabels: Record<BroadcastType, string> = {
  priority: "Tin ưu tiên",
  normal: "Tin thường",
};

export const approvalLabels: Record<ApprovalStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối duyệt",
};

export const broadcastLabels: Record<BroadcastStatus, string> = {
  playing: "Đang phát",
  paused: "Tạm ngưng",
  waiting: "Chờ phát",
  finished: "Đã kết thúc",
  "not-playing": "Chưa phát",
  scheduled: "Sắp tới lịch",
  cancelled: "Đã hủy",
};

export const repeatLabels: Record<RepeatType, string> = {
  none: "Không lặp",
  daily: "Hằng ngày",
  weekly: "Ngày trong tuần",
  monthly: "Ngày trong tháng",
};
const demoSources: BroadcastSource[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `source-${index + 1}`,
    name: `Nguồn phát mẫu ${index + 1}`,
    description: "Bản mẫu",
    qualities: ["4K", "2K", "FHD", "HD"],
    duration: "00:05:30",
  }),
);
export const broadcastsMock: BroadcastItem[] = [
  {
    id: "1",
    code: "BT001",
    title: "Khám phá Hội An - Việt Nam",
    type: "priority",
    approvalStatus: "pending",
    broadcastStatus: "waiting",
    repeatType: "none",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "TP. Hồ Chí Minh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },

  {
    id: "2",
    code: "BT002",
    title: "Khám phá Hội An - Việt Nam",
    type: "priority",
    approvalStatus: "approved",
    broadcastStatus: "playing",
    repeatType: "weekly",
    startDate: "2022-03-02",
    endDate: "2022-03-02",
    startTime: "12:00",
    endTime: "12:15",
    facility: "TP. Hồ Chí Minh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,

    category: "Tin tức",
    sourceType: "Danh sách phát",
    sourceName: "Danh sách phát mẫu",

    facilityDisplay: "tags",

    facilities: [
      { id: "f1", name: "Quận 1", active: false },
      { id: "f2", name: "Quận 3", active: true },
      { id: "f3", name: "Quận 4", active: false },
      { id: "f4", name: "Quận 5", active: false },
      { id: "f5", name: "Quận 6", active: true },
      { id: "f6", name: "Quận 8", active: false },
    ],

    sources: demoSources,

    broadcastMode: "Phát theo lịch",

    timeSlots: [
      {
        startTime: "12:10:00",
        endTime: "12:30:00",
        times: 1,
      },
      {
        startTime: "12:10:00",
        endTime: "12:30:00",
        times: 1,
      },
      {
        startTime: "12:10:00",
        endTime: "12:30:00",
        times: 1,
      },
    ],

    repeatDays: ["Thứ 3", "Thứ 4", "Thứ 7", "Chủ nhật"],
  },

  {
    id: "3",
    code: "BT003",
    title: "Khám phá Hội An - Việt Nam",
    type: "normal",
    approvalStatus: "rejected",
    broadcastStatus: "waiting",
    repeatType: "weekly",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "Thủ Đức, Bình Thạnh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,

    category: "Tin tức",
    sourceType: "Danh sách phát",
    sourceName: "Danh sách phát mẫu",

    rejectReason: "Bản tin bị sai kích thước thiết bị",

    facilityDisplay: "devices",

    devices: [
      {
        id: "device-1",
        name: "Thiết bị 1",
        facility: "Thủ Đức",
        address: "233 Nguyễn Văn Linh, Phường 3, TP. Hồ Chí Minh",
      },
      {
        id: "device-2",
        name: "Thiết bị 2",
        facility: "Thủ Đức",
        address: "233 Nguyễn Văn Linh, Phường 3, TP. Hồ Chí Minh",
      },
      {
        id: "device-3",
        name: "Thiết bị 3",
        facility: "Thủ Đức",
        address: "233 Nguyễn Văn Linh, Phường 3, TP. Hồ Chí Minh",
      },
      {
        id: "device-4",
        name: "Thiết bị 4",
        facility: "Thủ Đức",
        address: "233 Nguyễn Văn Linh, Phường 3, TP. Hồ Chí Minh",
      },
      {
        id: "device-5",
        name: "Thiết bị 5",
        facility: "Thủ Đức",
        address: "233 Nguyễn Văn Linh, Phường 3, TP. Hồ Chí Minh",
      },
    ],

    sources: demoSources,

    broadcastMode: "Phát theo lịch",

    timeSlots: [
      {
        startTime: "12:10:00",
        endTime: "12:30:00",
        times: 1,
      },
      {
        startTime: "12:10:00",
        endTime: "12:30:00",
        times: 1,
      },
      {
        startTime: "12:10:00",
        endTime: "12:30:00",
        times: 1,
      },
    ],

    repeatDays: ["Thứ 3", "Thứ 4", "Thứ 7", "Chủ nhật"],
  },

  {
    id: "4",
    code: "BT004",
    title: "Khám phá Hội An - Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    broadcastStatus: "paused",
    repeatType: "monthly",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "Thủ Đức, Bình Thạnh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },
  {
    id: "5",
    code: "BT005",
    title: "Khám phá Hội An - Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    broadcastStatus: "waiting",
    repeatType: "daily",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "Thủ Đức, Bình Thạnh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },
  {
    id: "6",
    code: "BT006",
    title: "Khám phá Hội An - Việt Nam",
    type: "priority",
    approvalStatus: "approved",
    broadcastStatus: "finished",
    repeatType: "none",
    startDate: "2022-03-02",
    endDate: "2022-03-02",
    startTime: "12:00",
    endTime: "12:15",
    facility: "TP. Hồ Chí Minh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },
  {
    id: "7",
    code: "BT007",
    title: "Khám phá Hội An - Việt Nam",
    type: "normal",
    approvalStatus: "pending",
    broadcastStatus: "waiting",
    repeatType: "weekly",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "Thủ Đức, Bình Thạnh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },
  {
    id: "8",
    code: "BT008",
    title: "Khám phá Hội An - Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    broadcastStatus: "not-playing",
    repeatType: "monthly",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "Thủ Đức, Bình Thạnh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },
  {
    id: "9",
    code: "BT009",
    title: "Khám phá Hội An - Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    broadcastStatus: "scheduled",
    repeatType: "weekly",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "Thủ Đức, Bình Thạnh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },
  {
    id: "10",
    code: "BT010",
    title: "Khám phá Hội An - Việt Nam",
    type: "normal",
    approvalStatus: "approved",
    broadcastStatus: "cancelled",
    repeatType: "monthly",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "10:00",
    endTime: "15:15",
    facility: "Thủ Đức, Bình Thạnh",
    creator: "Nguyễn Văn A",
    isChildFacility: false,
  },
  {
    id: "11",
    code: "BT011",
    title: "Thông báo từ cơ sở trực thuộc",
    type: "priority",
    approvalStatus: "pending",
    broadcastStatus: "waiting",
    repeatType: "none",
    startDate: "2022-03-01",
    endDate: "2022-03-03",
    startTime: "08:00",
    endTime: "09:00",
    facility: "Cơ sở trực thuộc 01",
    creator: "Nguyễn Văn B",
    isChildFacility: true,
  },
];
export const broadcastHistoryMock: BroadcastHistoryItem[] = Array.from(
  { length: 100 },
  (_, index) => ({
    id: String(index + 1),
    deviceCode: `TB${String(index + 1).padStart(2, "0")}`,
    deviceName: `Thiết bị ${index + 1}`,
    startTime: "25/07/2021 19:00:00",
    endTime: "25/07/2021 20:00:00",
    facility: "TP. Hồ Chí Minh",
  }),
);
