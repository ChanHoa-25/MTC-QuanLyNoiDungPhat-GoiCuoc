import type {
  DeviceActivityHistoryItem,
  DeviceActivityType,
} from "../types/deviceActivityHistory.types";

import { devicesMock } from "./devices.mock";

// Danh sách hoạt động mẫu
const activities: {
  type: DeviceActivityType;
  activity: string;
  note: string;
}[] = [
  {
    type: "upload_success",
    activity: "Tải bản tin thành công",
    note: "Bản tin C02",
  },
  {
    type: "upload_failed",
    activity: "Tải bản tin thất bại",
    note: "Bản tin C02",
  },
  {
    type: "broadcast",
    activity: "Phát bản tin",
    note: "Bản tin C02",
  },
  {
    type: "stop_broadcast",
    activity: "Dừng phát bản tin",
    note: "Bản tin C02",
  },
  {
    type: "delete_broadcast",
    activity: "Xóa bản tin",
    note: "Bản tin C02",
  },
  {
    type: "delete_expired",
    activity: "Xóa bản tin hết hạn",
    note: "Bản tin C02",
  },
  {
    type: "reconnected",
    activity: "Kết nối lại",
    note: "Thiết bị đã kết nối lại",
  },
  {
    type: "disconnected",
    activity: "Mất kết nối",
    note: "Thiết bị mất kết nối",
  },
  {
    type: "restart",
    activity: "Khởi động lại thiết bị",
    note: "Thiết bị được khởi động lại",
  },
  {
    type: "volume_changed",
    activity: "Điều chỉnh âm lượng",
    note: "Âm lượng được điều chỉnh lên 50%",
  },
];

// Tạo lịch sử hoạt động cho các thiết bị mock
export const deviceActivityHistoryMock: DeviceActivityHistoryItem[] =
  devicesMock.flatMap((device) =>
    Array.from({ length: 30 }, (_, index) => {
      const activity = activities[index % activities.length];

      const date = new Date(
        2026,
        10,
        3 - (index % 7),
        8 + (index % 10),
        (index * 5) % 60,
        0,
      );

      return {
        id: `${device.id}-activity-${index + 1}`,
        deviceId: device.id,
        time: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(date.getDate()).padStart(2, "0")}T${String(
          date.getHours(),
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`,
        type: activity.type,
        activity: activity.activity,
        note: activity.note,
      };
    }),
  );
