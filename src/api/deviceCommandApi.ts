import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

// Kết quả điều khiển một thiết bị
interface DeviceCommandResult {
  deviceId: string;
  commandId: string;
  sentRealtime: boolean;
  volume: number | null;
}

// Kết quả điều khiển nhiều thiết bị
interface DeviceCommandBatchResult {
  count: number;
  results: DeviceCommandResult[];
}

type SingleCommandResponse = ApiResponse<DeviceCommandResult>;
type BatchCommandResponse = ApiResponse<DeviceCommandBatchResult>;

// Kiểm tra kết quả trả về từ Backend
const checkResult = <T>(result: ApiResponse<T>): string => {
  if (!result.success) {
    throw new Error(result.message || "Không thể gửi lệnh thiết bị");
  }

  return result.message;
};

const deviceCommandApi = {
  // Điều chỉnh âm lượng một thiết bị
  setVolume: async (id: string, volume: number): Promise<string> => {
    const response = await axiosInstance.post<SingleCommandResponse>(
      `/devices/${encodeURIComponent(id)}/commands/volume`,
      { volume },
    );

    return checkResult(response.data);
  },

  // Điều chỉnh âm lượng nhiều thiết bị
  setVolumeMany: async (
    deviceIds: string[],
    volume: number,
  ): Promise<string> => {
    const response = await axiosInstance.post<BatchCommandResponse>(
      "/devices/commands/volume",
      { volume, deviceIds },
    );

    return checkResult(response.data);
  },

  // Khởi động lại một thiết bị
  reboot: async (id: string): Promise<string> => {
    const response = await axiosInstance.post<SingleCommandResponse>(
      `/devices/${encodeURIComponent(id)}/commands/reboot`,
    );

    return checkResult(response.data);
  },

  // Khởi động lại nhiều thiết bị
  rebootMany: async (deviceIds: string[]): Promise<string> => {
    const response = await axiosInstance.post<BatchCommandResponse>(
      "/devices/commands/reboot",
      { deviceIds },
    );

    return checkResult(response.data);
  },
};

export default deviceCommandApi;
