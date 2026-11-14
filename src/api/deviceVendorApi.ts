import axiosInstance from "./axiosInstance";

import type { ApiResponse } from "../types/api.types";
import type {
  DeviceVendor,
  GetDeviceVendorsParams,
} from "../types/deviceVendor.types";

const deviceVendorApi = {
  getAll: async (params?: GetDeviceVendorsParams): Promise<DeviceVendor[]> => {
    const response = await axiosInstance.get<ApiResponse<DeviceVendor[]>>(
      "/device-vendors",
      { params },
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể tải danh sách nhà phân phối",
      );
    }

    return response.data.data;
  },
};

export default deviceVendorApi;
