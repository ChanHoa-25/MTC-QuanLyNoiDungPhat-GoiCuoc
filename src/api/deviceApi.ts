import axiosInstance from "./axiosInstance";

import type { ApiResponse } from "../types/api.types";
import type {
  DeviceResponse,
  GetDevicesParams,
  CreateDeviceRequest,
  UpdateDeviceRequest,
} from "../types/device.types";

const deviceApi = {
  getAll: async (params?: GetDevicesParams): Promise<DeviceResponse[]> => {
    const response = await axiosInstance.get<ApiResponse<DeviceResponse[]>>(
      "/devices",
      { params },
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể tải danh sách thiết bị",
      );
    }

    return response.data.data;
  },

  getById: async (id: string): Promise<DeviceResponse> => {
    const response = await axiosInstance.get<ApiResponse<DeviceResponse>>(
      `/devices/${id}`,
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể tải thông tin thiết bị",
      );
    }

    return response.data.data;
  },

  create: async (data: CreateDeviceRequest): Promise<DeviceResponse> => {
    const response = await axiosInstance.post<ApiResponse<DeviceResponse>>(
      "/devices",
      data,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể thêm thiết bị");
    }

    return response.data.data;
  },

  update: async (
    id: string,
    data: UpdateDeviceRequest,
  ): Promise<DeviceResponse> => {
    const response = await axiosInstance.put<ApiResponse<DeviceResponse>>(
      `/devices/${id}`,
      data,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể cập nhật thiết bị");
    }

    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete<ApiResponse<unknown>>(
      `/devices/${id}`,
    );

    if (response.data && !response.data.success) {
      throw new Error(response.data.message || "Không thể xóa thiết bị");
    }
  },
};

export default deviceApi;
