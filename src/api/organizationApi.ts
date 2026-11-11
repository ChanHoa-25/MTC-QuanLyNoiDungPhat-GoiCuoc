import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

export const organizationApi = {
  getAll: async (): Promise<ApiResponse<unknown[]>> => {
    const response =
      await axiosInstance.get<ApiResponse<unknown[]>>("/Organizations");

    return response.data;
  },
};
