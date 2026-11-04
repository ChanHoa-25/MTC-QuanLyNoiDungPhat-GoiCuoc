import type { DeviceBroadcastHistoryItem } from "../types/deviceBroadcastHistory.types";

import { devicesMock } from "./devices.mock";

// Danh sách bản tin mẫu
const broadcasts = [
  "Bản tin thời sự",
  "Bản tin giáo dục",
  "Chương trình văn nghệ",
  "Bản tin tuyên truyền",
  "Chương trình giải trí",
  "Bản tin thiếu nhi",
];

// Tạo lịch sử phát bản tin cho các thiết bị mock
export const deviceBroadcastHistoryMock: DeviceBroadcastHistoryItem[] =
  devicesMock.flatMap((device) =>
    Array.from({ length: 30 }, (_, index) => {
      const number = index + 1;

      const start = new Date(2026, 10, 3 - (index % 7), 6 + (index % 8), 0, 0);

      const end = new Date(start.getTime() + 60 * 60 * 1000);

      // Định dạng thời gian theo giờ địa phương
      const formatDateTime = (date: Date) => {
        const pad = (value: number) => String(value).padStart(2, "0");

        return (
          `${date.getFullYear()}-${pad(date.getMonth() + 1)}-` +
          `${pad(date.getDate())}T${pad(date.getHours())}:` +
          `${pad(date.getMinutes())}:${pad(date.getSeconds())}`
        );
      };

      return {
        id: `${device.id}-broadcast-${number}`,
        deviceId: device.id,
        title: broadcasts[index % broadcasts.length],
        duration: "01:00:00",
        startTime: formatDateTime(start),
        endTime: formatDateTime(end),
      };
    }),
  );
