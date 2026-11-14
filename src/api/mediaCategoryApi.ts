import axiosInstance from "./axiosInstance";
import type { ApiResponse } from "../types/api.types";

export interface MediaCategoryApiItem {
  id: string;
  categoryName: string;
  description: string | null;
  isDefault: boolean;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

type MediaCategoryListResponse = ApiResponse<MediaCategoryApiItem[]>;
type MediaCategoryDetailResponse = ApiResponse<MediaCategoryApiItem>;

const checkResult = <T>(result: ApiResponse<T>): T => {
  if (!result.success) {
    throw new Error(result.message || "Không thể tải dữ liệu lĩnh vực Media");
  }

  return result.data;
};

const mediaCategoryApi = {
  // Lấy danh sách lĩnh vực Media
  getAll: async (): Promise<MediaCategoryApiItem[]> => {
    const response =
      await axiosInstance.get<MediaCategoryListResponse>("/media-categories");

    return checkResult(response.data);
  },

  // Lấy chi tiết một lĩnh vực Media
  getById: async (id: string): Promise<MediaCategoryApiItem> => {
    const response = await axiosInstance.get<MediaCategoryDetailResponse>(
      `/media-categories/${encodeURIComponent(id)}`,
    );

    return checkResult(response.data);
  },
};

export default mediaCategoryApi;
